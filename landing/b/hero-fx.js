/* Landing B · full-bleed light hero. Used by landing/b/index.html (scene "shift", lines .5) and by
   landing/b/hero-options.html, which compares all four scenes.
   Full-bleed hero scenes on one canvas. Each scene returns line segments with stable indices every frame; the
   engine keeps the last ten snapshots and draws them underneath as the radar trail (opacity .42 × (1 − j/11)²,
   hidden where a segment hasn't moved more than 1.2px), then the ball on top. The ball follows the pointer on a
   spring; with no pointer (or on touch) it wanders slowly on its own so the hero never sits dead. */
window.HeroFX = {
  /* mount(hero, { canvas, copy, scene: "field" | "agree" | "contours" | "shift", lines: 0..1 }) → { setScene, setLines } */
  mount(hero, opts = {}) {
  const cv = opts.canvas || hero.querySelector("canvas"), ctx = cv.getContext("2d");
  const copyEl = opts.copy || null;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const TEAL = "0,42,50", PINK = "#ff0074";
  let LINES = opts.lines == null ? .8 : opts.lines;   // global line opacity (the options page offers 100 / 80 / 65 / 50%)
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const sm = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const lerp = (a, b, t) => a + (b - a) * t;
  const rng = (s) => () => (s = (s * 16807) % 2147483647, (s - 1) / 2147483646);
  const wrap = (a) => { while (a > Math.PI) a -= 2 * Math.PI; while (a < -Math.PI) a += 2 * Math.PI; return a; };

  let W = 0, H = 0, dpr = 1;
  const resize = () => {
    const r = hero.getBoundingClientRect();
    dpr = Math.min(2, window.devicePixelRatio || 1); W = r.width; H = r.height;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    if (copyEl) {
      const c = copyEl.getBoundingClientRect();
      QX = c.left - r.left + c.width / 2; QY = c.top - r.top + c.height / 2; QA = Math.max(c.width * .62, 220); QB = Math.max(c.height * .7, 160);
      copyBottom = c.bottom - r.top;
    } else { QX = -1e6; QY = -1e6; }
    scene && scene.build && scene.build(); hist.length = 0;
    if (reduce && scene) requestAnimationFrame(frame);
  };

  /* The ball rests low in the hero, and never higher than just under the copy (short windows) */
  const restY = () => Math.min(H - 28, Math.max(H * 0.8, copyBottom + 56));

  /* Pointer and ball */
  const ptr = { x: 0, y: 0, on: false, last: -1e9 };
  const ball = { x: 0, y: 0, vx: 0, vy: 0, speed: 0 };
  const rest = () => scene.rest ? scene.rest() : { x: W / 2, y: H * 0.78 };
  hero.addEventListener("pointermove", (e) => {
    if (e.pointerType === "touch") return;               // touch scrolls; the ball wanders instead
    const r = hero.getBoundingClientRect(); ptr.x = e.clientX - r.left; ptr.y = e.clientY - r.top; ptr.on = true; ptr.last = performance.now();
  });
  hero.addEventListener("pointerleave", () => { ptr.on = false; });

  /* ═════════ 01 · Compass field ═════════ */
  const field = (() => {
    let cells = [];
    const S = {
      lag: 0.035, echoes: 10,
      rest: () => ({ x: W * 0.5, y: restY() }),
      build() {
        const R = rng(7), s = clamp(W / 30, 36, 54);
        cells = [];
        for (let y = s * 0.6; y < H; y += s) for (let x = s * 0.6 + ((Math.round(y / s) % 2) * s) / 2; x < W; x += s) {
          const a0 = R() * Math.PI * 2;
          cells.push({ x: x + (R() - .5) * s * .25, y: y + (R() - .5) * s * .25, a0, a: a0, v: 0, w: .3 + R() * .6, ph: R() * 6.28, L: s * (.32 + R() * .12) });
        }
      },
      update(t, dt, out) {
        const Rr = Math.min(W, H) * 0.46;
        let n = 0;
        for (const c of cells) {
          const dx = ball.x - c.x, dy = ball.y - c.y, d = Math.hypot(dx, dy);
          const f = sm(Rr, Rr * 0.22, d);
          const idle = c.a0 + 0.35 * Math.sin(t * c.w + c.ph);
          const toward = Math.atan2(dy, dx);
          const target = idle + wrap(toward - idle) * f;
          c.v += (60 * wrap(target - c.a) - 8 * c.v) * dt; c.a += c.v * dt;      // a spring: needles overshoot and settle
          const L = c.L * (1 + 0.7 * f) * sm(18, 46, d);
          const ca = Math.cos(c.a) * L / 2, sa = Math.sin(c.a) * L / 2;
          out[n++] = c.x - ca; out[n++] = c.y - sa; out[n++] = c.x + ca; out[n++] = c.y + sa; out[n++] = 0.16 + 0.42 * f;
        }
        return n;
      },
    };
    return S;
  })();

  /* ═════════ 02 · Agreement, full bleed ═════════ */
  const agree = (() => {
    let L = [];
    const S = {
      lag: 0.045, echoes: 10, follow: 0.12,            // the ball stays home and only leans toward the pointer
      rest: () => ({ x: W * 0.5, y: restY() }),
      rings: [140, 300, 500, 760, 1080],
      build() {
        const R = rng(11), N = 16;
        L = Array.from({ length: N }, (_, i) => ({ off: (i / (N - 1) - .5) * 3.1 + (R() - .5) * .3, w: .4 + R() * .6, ph: R() * 6.28, amp: .08 + R() * .12, len: .55 + R() * .45, d: R() * .25 }));
      },
      update(t, dt, out) {
        // The shared direction points at the pointer (or straight up, at the copy, when there's none)
        const tx = ptr.on ? ptr.x : W * .5 + Math.sin(t * .2) * W * .2, ty = ptr.on ? ptr.y : H * .3;
        const theta = Math.atan2(ty - ball.y, tx - ball.x);
        const near = ptr.on ? sm(Math.min(W, H) * .55, Math.min(W, H) * .12, Math.hypot(ptr.x - ball.x, ptr.y - ball.y)) : 0;
        const c = ((t % 12) + 12) % 12;
        const cyc = sm(4, 5.6, c) * (1 - sm(8.4, 10.6, c));                     // the original's slow agree-and-drift cycle
        const reach = Math.hypot(W, H);
        let n = 0;
        L.forEach((l) => {
          const k = clamp(Math.max(near, cyc * .85) + (l.d - .12) * near, 0, 1.05);
          const a = theta + (1 - k) * (l.off + l.amp * Math.sin(t * l.w + l.ph));
          const len = lerp(l.len * reach * .55, reach * .62, clamp(k, 0, 1));
          const cs = Math.cos(a), sn = Math.sin(a);
          out[n++] = ball.x + 34 * cs; out[n++] = ball.y + 34 * sn; out[n++] = ball.x + len * cs; out[n++] = ball.y + len * sn; out[n++] = lerp(.22, .4, clamp(k, 0, 1));
        });
        S.k = near;
        return n;
      },
      under() { // guide rings around the ball, hairline
        ctx.strokeStyle = `rgba(${TEAL},${(.07 * LINES * (S.ringA == null ? 1 : S.ringA)).toFixed(3)})`; ctx.lineWidth = 1;
        S.rings.forEach((r) => { ctx.beginPath(); ctx.arc(ball.x, ball.y, r, 0, Math.PI * 2); ctx.stroke(); });
      },
    };
    return S;
  })();

  /* ═════════ 03 · Contours ═════════ */
  const contours = (() => {
    let rows = 0, step = 14, ripples = [], lastRip = 0;
    const S = {
      lag: 0.04, echoes: 6,
      rest: () => ({ x: W * 0.5, y: restY() }),
      build() { rows = Math.round(H / clamp(H / 26, 22, 34)); step = clamp(W / 110, 12, 18); ripples = []; },
      update(t, dt, out) {
        if (ball.speed > 900 && t - lastRip > .12) { ripples.push({ x: ball.x, y: ball.y, t0: t }); lastRip = t; }
        ripples = ripples.filter((r) => t - r.t0 < 2.4);
        const gap = H / rows, sig = Math.min(W, H) * .15, G = gap * 3.6;
        let n = 0;
        for (let i = 0; i <= rows; i++) {
          const y0 = i * gap;
          let px = 0, py = 0;
          for (let x = -step, j = 0; x <= W + step; x += step, j++) {
            let y = y0 + 3.2 * Math.sin(x * .006 + t * .5 + i * .7) + 2 * Math.sin(x * .013 - t * .35 + i * 1.9);
            const dx = x - ball.x, dy = y0 - ball.y, d2 = dx * dx + dy * dy;
            y += Math.sign(dy || 1) * G * Math.exp(-d2 / (2 * sig * sig)) * (1 - Math.exp(-Math.abs(dy) / (gap * .9)));  // a lens: lines part around the ball
            for (const r of ripples) {
              const age = t - r.t0, d = Math.hypot(x - r.x, y0 - r.y), front = age * 420;
              y += 7 * Math.sin((d - front) * .045) * Math.exp(-Math.pow((d - front) / 70, 2)) * (1 - age / 2.4);
            }
            if (j) {
              const prox = Math.exp(-d2 / (2 * (sig * 1.4) ** 2));
              out[n++] = px; out[n++] = py; out[n++] = x; out[n++] = y; out[n++] = .14 + .3 * prox;
            }
            px = x; py = y;
          }
        }
        return n;
      },
    };
    return S;
  })();

  /* ═════════ 04 · Agreement → contours ═════════
     Both scenes run together. Over a 24s loop the blend m goes 0 → 1 → 0: the agreement needles lie down toward
     horizontal and stretch to the edges as they fade, while the contour lines appear on a front that spreads out
     from the ball. The ball goes from leaning toward the pointer (agreement) to following it (contours). */
  const shift = (() => {
    let a = new Float32Array(400), c = new Float32Array(200000), nA = 0;
    const P = 24;
    const S = {
      lag: 0.045, echoes: 8, follow: .12,
      rest: () => ({ x: W * 0.5, y: restY() }),
      m: 0,
      build() { agree.build(); contours.build(); },
      update(t, dt, out) {
        const p = ((t % P) + P) % P;
        const io = (x) => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
        const m = p < 6 ? 0 : p < 11 ? io((p - 6) / 5) : p < 18 ? 1 : p < 23 ? 1 - io((p - 18) / 5) : 0;
        S.m = m; S.follow = lerp(.12, 1, m);
        nA = agree.update(t, dt, a);
        const nC = contours.update(t, dt, c);
        let n = 0;
        const reach = Math.hypot(W, H), front = m * (reach + 240);
        for (let i = 0; i < nA; i += 5) {
          let x1 = a[i], y1 = a[i + 1], x2 = a[i + 2], y2 = a[i + 3];
          const ang = Math.atan2(y2 - y1, x2 - x1), flat = Math.cos(ang) >= 0 ? 0 : Math.PI;
          const na = ang + wrap(flat - ang) * m;                                   // lie down toward horizontal
          const len = lerp(Math.hypot(x2 - x1, y2 - y1), reach * .7, m);
          const cs = Math.cos(na), sn = Math.sin(na), y0 = ball.y + (y1 - ball.y) * (1 - m);
          out[n++] = ball.x + 34 * cs; out[n++] = y0 + 34 * sn; out[n++] = ball.x + len * cs; out[n++] = y0 + len * sn;
          out[n++] = a[i + 4] * Math.pow(1 - m, 1.3);
        }
        for (let i = 0; i < nC; i += 5) {
          const mx = (c[i] + c[i + 2]) / 2, my = (c[i + 1] + c[i + 3]) / 2, r = Math.hypot(mx - ball.x, my - ball.y);
          const vis = 1 - sm(front - 220, front, r);                              // contours spread out from the ball
          out[n++] = c[i]; out[n++] = c[i + 1]; out[n++] = c[i + 2]; out[n++] = c[i + 3]; out[n++] = c[i + 4] * vis;
        }
        S.k = (agree.k || 0) * (1 - m);
        return n;
      },
      under() { agree.ringA = 1 - S.m; agree.under(); agree.ringA = 1; },
    };
    return S;
  })();

  const SCENES = { field, agree, contours, shift };
  let scene = null;

  /* ═════════ Engine ═════════ */
  const hist = [];                 // snapshots for the trail: { buf, n }
  let buf = new Float32Array(200000), lastSnap = 0;
  const BUCKETS = 24;
  // A soft hollow behind the copy: lines keep about a fifth of their strength there and full strength elsewhere
  let QX = 0, QY = 0, QA = 1, QB = 1, copyBottom = 0;
  const quiet = (x, y) => { const u = (x - QX) / QA, v = (y - QY) / QB; return 1 - .8 * Math.exp(-(u * u + v * v)); };
  const strokeSegs = (b, n, alphaMul, cur) => {
    // Group segments by quantised opacity so the canvas strokes ~24 paths instead of thousands
    const paths = Array.from({ length: BUCKETS }, () => null);
    for (let i = 0; i < n; i += 5) {
      if (cur) { const dx1 = b[i] - cur[i], dy1 = b[i + 1] - cur[i + 1], dx2 = b[i + 2] - cur[i + 2], dy2 = b[i + 3] - cur[i + 3];
        if (Math.max(Math.abs(dx1), Math.abs(dy1), Math.abs(dx2), Math.abs(dy2)) < 1.2) continue; }   // still things get no echo
      const a = b[i + 4] * alphaMul * LINES * quiet((b[i] + b[i + 2]) / 2, (b[i + 1] + b[i + 3]) / 2); if (a < .004) continue;
      const k = Math.min(BUCKETS - 1, Math.round(a * (BUCKETS - 1) / .6));
      const p = paths[k] || (paths[k] = new Path2D());
      p.moveTo(b[i], b[i + 1]); p.lineTo(b[i + 2], b[i + 3]);
    }
    paths.forEach((p, k) => { if (!p) return; ctx.strokeStyle = `rgba(${TEAL},${(k * .6 / (BUCKETS - 1)).toFixed(3)})`; ctx.stroke(p); });
  };

  let t = 0, last = performance.now(), vis = true, wander = 0;
  const frame = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (!reduce) t += dt;
    // Where the ball wants to be: the pointer, or a slow wander around its rest point
    const idle = !ptr.on || now - ptr.last > 4000;
    const r = rest();
    wander += dt * (idle ? 1 : 0);
    const f = scene.follow || 1, roam = scene.follow ? Math.max(.25, scene.follow) : 1;
    const tx = idle ? r.x + (Math.sin(wander * .23) * W * .22 + Math.sin(wander * .61) * W * .05) * roam : r.x + (ptr.x - r.x) * f;
    const ty = idle ? r.y + Math.sin(wander * .31 + 1) * H * .08 * roam : r.y + (ptr.y - r.y) * f;
    if (reduce) { ball.x = r.x; ball.y = r.y; }
    else {
      const k = idle ? 6 : 26, damp = idle ? 5 : 9;                 // looser when wandering, snappier when following
      ball.vx += (k * (tx - ball.x) - damp * ball.vx) * dt; ball.vy += (k * (ty - ball.y) - damp * ball.vy) * dt;
      ball.x += ball.vx * dt; ball.y += ball.vy * dt; ball.speed = Math.hypot(ball.vx, ball.vy);
    }

    const n = scene.update(t, dt, buf);
    if (t - lastSnap >= scene.lag || !hist.length) { hist.unshift({ b: buf.slice(0, n), n }); lastSnap = t; if (hist.length > scene.echoes) hist.pop(); }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.lineCap = "round"; ctx.lineWidth = 1.5;
    scene.under && scene.under();
    if (!reduce) for (let j = hist.length - 1; j >= 1; j--) {
      const h = hist[j]; if (h.n !== n) continue;
      strokeSegs(h.b, h.n, .42 * Math.pow(1 - j / (scene.echoes + 1), 2), buf);
    }
    ctx.lineWidth = 1.5;
    strokeSegs(buf, n, 1, null);

    // The ball: breathes while it moves or when the needles agree; a soft glow only then
    const recv = clamp(ball.speed / 1400, 0, 1) * .6 + (scene.k || 0) * .4;
    const br = 16 * (1 + .16 * recv);
    if (recv > .02) {
      const g = ctx.createRadialGradient(ball.x, ball.y, 0, ball.x, ball.y, 64);
      g.addColorStop(0, `rgba(255,0,116,${(.4 * recv).toFixed(3)})`); g.addColorStop(.4, `rgba(255,0,116,${(.16 * recv).toFixed(3)})`); g.addColorStop(1, "rgba(255,0,116,0)");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(ball.x, ball.y, 64, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = PINK; ctx.beginPath(); ctx.arc(ball.x, ball.y, br, 0, Math.PI * 2); ctx.fill();

    if (vis && !reduce) requestAnimationFrame(frame);
  };

  const setScene = (key) => {
    scene = SCENES[key] || shift; hero.dataset.scene = key;
    if (key === "shift") t = 0;      // start the loop on agreement, so the change is the first thing you see
    scene.build(); hist.length = 0;
    if (reduce) requestAnimationFrame(frame);
  };
  const setLines = (v) => { LINES = v; if (reduce) requestAnimationFrame(frame); };

  setScene(opts.scene || "shift");
  new ResizeObserver(resize).observe(hero);
  resize();
  const r0 = rest(); ball.x = r0.x; ball.y = r0.y;
  new IntersectionObserver(([e]) => { const was = vis; vis = e.isIntersecting; if (vis && !was && !reduce) { last = performance.now(); requestAnimationFrame(frame); } }).observe(hero);
  requestAnimationFrame(frame);
  return { setScene, setLines };
  },
};
