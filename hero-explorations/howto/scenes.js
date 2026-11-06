/* How to apply it: spot animations for the four steps (Map, Ask, Evidence, Patterns).
   Same language as the chapter heroes (ball, hairlines, trail), drawn for a light card.
   Loads after ../chapters/scenes.js and registers into window.HeroScenes, so HeroMount adds the trail. */
(() => {
  const { el, set, ln, pathOn, drawTo, ball, glowDef, rng, hash, sm, env, io, out, backOut, clamp, lerp, poly, along, arcD, f2, radialMask, C, B, TAU } = window.HeroKit;
  const S = window.HeroScenes;

  /* ── helpers ── */
  const f4 = n => Math.round(n * 1e4) / 1e4;
  const glow = svg => el("circle", { cx: C, cy: C, r: 42, fill: glowDef(svg), opacity: 0, class: "glow" }, svg);
  const breathe = (b, g, p) => { p = clamp(p, 0, 1); set(b, { r: f2(B * (1 + .16 * p)) }); set(g, { opacity: f2(.4 * p), r: f2(B * (2.6 + .8 * p)) }); };
  const land = s => s > 0 ? Math.exp(-s * 2.9) : sm(-.5, 0, s);            // breath around an arrival, s in seconds
  const polar = (a, r) => [C + r * Math.cos(a), C + r * Math.sin(a)];
  const op = (e, o) => set(e, { "stroke-opacity": f2(o) });
  const show = (e, on) => set(e, { visibility: on ? "visible" : "hidden" });
  const seg2 = (e, a, b, o) => set(e, { x1: f2(a[0]), y1: f2(a[1]), x2: f2(b[0]), y2: f2(b[1]), "stroke-opacity": f2(o) });
  const dash = (e, s0, s1) => { s0 = clamp(s0, 0, 1); s1 = clamp(s1, 0, 1); set(e, { "stroke-dasharray": `${f4(Math.max(s1 - s0, 0))} 3`, "stroke-dashoffset": f4(-s0), visibility: s1 - s0 < .002 ? "hidden" : "visible" }); };
  const track = pts => { const cm = [0]; for (let i = 1; i < pts.length; i++) cm.push(cm[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])); return { pts, cm, L: cm[cm.length - 1] }; };
  const at = (T, d) => {
    d = clamp(d, 0, T.L); let i = 1;
    while (i < T.pts.length - 1 && T.cm[i] < d) i++;
    const k = (d - T.cm[i - 1]) / ((T.cm[i] - T.cm[i - 1]) || 1);
    return [lerp(T.pts[i - 1][0], T.pts[i][0], k), lerp(T.pts[i - 1][1], T.pts[i][1], k)];
  };
  /* a moving piece of a track, as real geometry so the trail can echo it */
  const piece = (e, T, d0, d1) => {
    if (d1 - d0 < .6) return show(e, false);
    const r = [at(T, d0)];
    for (let i = 1; i < T.pts.length - 1; i++) if (T.cm[i] > d0 && T.cm[i] < d1) r.push(T.pts[i]);
    r.push(at(T, d1));
    set(e, { d: poly(r), visibility: "visible" });
  };
  const curve = (cp, n = 16) => {
    const r = [];
    for (let i = 0; i < cp.length - 1; i++) {
      const p0 = cp[Math.max(0, i - 1)], p1 = cp[i], p2 = cp[i + 1], p3 = cp[Math.min(cp.length - 1, i + 2)];
      for (let k = 0; k < n; k++) {
        const t = k / n, t2 = t * t, t3 = t2 * t;
        r.push([0, 1].map(j => .5 * (2 * p1[j] + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3)));
      }
    }
    r.push(cp[cp.length - 1]);
    return r;
  };
  const circleD = r => `M${C} ${C - r}A${r} ${r} 0 1 1 ${C} ${C + r}A${r} ${r} 0 1 1 ${C} ${C - r}`;
  /* a radial baton running inward from r0 to the ball's edge, speeding up as it lands */
  const inward = (e, a, r0, k, o = .6) => {
    if (k <= 0 || k >= 1) return set(e, { "stroke-opacity": 0 });
    const head = lerp(r0, B + 5, k * k), tail = lerp(r0, B + 5, Math.pow(clamp(k * 1.4 - .4, 0, 1), 2));
    seg2(e, polar(a, tail), polar(a, head), o * sm(0, .15, k));
  };

  /* ═════════ 01 · MAP: map who to talk to ═════════ */

  S.m1 = svg => { // Seven functions, each linked in
    const R = rng(21), P = 8, g = glow(svg);
    const nodes = Array.from({ length: 7 }, (_, i) => {
      const a = i / 7 * TAU - Math.PI / 2 + (R() - .5) * .45, r = 150 + R() * 95, [x, y] = polar(a, r), [xa, ya] = polar(a, r - 12), [xb, yb] = polar(a, B + 5);
      el("line", { x1: f2(xb), y1: f2(yb), x2: f2(xa), y2: f2(ya), class: "gd" }, svg);
      return { a, r, t0: .05 + i * .08 + R() * .03,
        link: pathOn(svg, `M${f2(xa)} ${f2(ya)}L${f2(xb)} ${f2(yb)}`, .2),
        c: el("circle", { cx: f2(x), cy: f2(y), r: 0, class: "ln", "stroke-opacity": .6 }, svg),
        bat: ln(svg, {}, 0) };
    });
    const b = ball(svg);
    return t => {
      const p = (t / P) % 1, fade = 1 - sm(.84, .96, p); let pulse = 0;
      nodes.forEach(o => {
        const q = p - o.t0, k = clamp((q - .07) / .13, 0, 1);
        set(o.c, { r: f2(8 * backOut(clamp(q / .07, 0, 1))), "stroke-opacity": f2(.6 * fade) });
        drawTo(o.link, k * k); op(o.link, .2 * fade);
        inward(o.bat, o.a, o.r - 12, k);
        pulse = Math.max(pulse, land((q - .2) * P));
      });
      breathe(b, g, pulse);
    };
  };

  S.m2 = svg => { // Radar sweep: whoever it passes answers back
    const R = rng(4), REV = 6, g = glow(svg);
    [110, 190, 262].forEach(r => el("circle", { cx: C, cy: C, r, class: "gd" }, svg));
    const pts = Array.from({ length: 6 }, (_, i) => {
      const a = i / 6 * TAU + R() * .6, r = 95 + R() * 160, [x, y] = polar(a, r);
      return { a, r, D: .5 + r / 380, d: el("circle", { cx: f2(x), cy: f2(y), r: 3, class: "dot", opacity: .2 }, svg), bat: ln(svg, {}, 0) };
    });
    const sweep = ln(svg, {}, .5);
    const b = ball(svg);
    return t => {
      const a = t * TAU / REV - Math.PI / 2; let pulse = 0;
      seg2(sweep, polar(a, B + 8), polar(a, 272), .5);
      pts.forEach(o => {
        const since = ((((a - o.a) % TAU) + TAU) % TAU) / TAU * REV;
        set(o.d, { opacity: f2(.2 + .7 * Math.exp(-since * 1.3)) });
        inward(o.bat, o.a, o.r - 6, since / o.D, .55);
        pulse = Math.max(pulse, land(since - o.D));
      });
      breathe(b, g, pulse);
    };
  };

  S.m3 = svg => { // Every layer: leadership, managers, the front line
    const R = rng(9), P = 10, g = glow(svg);
    const L = [[95, 3, .1, .42, 4.4], [165, 5, -.07, .3, 3.8], [235, 8, .045, .2, 3.2]].map(([r, n, w, o, dr], k) => {
      const ring = pathOn(svg, circleD(r), .16), a0 = R() * TAU;
      return { r, w, o, dr, ring, t0: .04 + k * .2,
        people: Array.from({ length: n }, (_, i) => ({ a: a0 + i / n * TAU + (R() - .5) * .3, d: .012 * i + R() * .01, spoke: ln(svg, {}, 0), dot: el("circle", { r: 0, class: "dot" }, svg) })) };
    });
    const b = ball(svg);
    return t => {
      const p = (t / P) % 1, fade = 1 - sm(.85, .96, p); let pulse = 0;
      L.forEach(l => {
        drawTo(l.ring, io(clamp((p - l.t0) / .14, 0, 1))); op(l.ring, .16 * fade);
        l.people.forEach(o => {
          const a = o.a + l.w * t, xy = polar(a, l.r), q = p - l.t0 - .1 - o.d, k = clamp((q - .03) / .1, 0, 1);
          set(o.dot, { cx: f2(xy[0]), cy: f2(xy[1]), r: f2(l.dr * backOut(clamp(q / .05, 0, 1))), opacity: f2(.85 * fade) });
          const tip = polar(a, B + 5), f = k * k;
          seg2(o.spoke, xy, [lerp(xy[0], tip[0], f), lerp(xy[1], tip[1], f)], k > 0 ? l.o * fade : 0);
          pulse = Math.max(pulse, land((q - .13) * P));
        });
      });
      breathe(b, g, pulse);
    };
  };

  S.m4 = svg => { // Make the rounds: one route that visits everyone and comes home
    const R = rng(33), P = 11, N = 7, g = glow(svg);
    const ds = Array.from({ length: N }, (_, i) => polar(i / N * TAU - Math.PI / 2 + (R() - .5) * .5, 125 + R() * 115));
    const pts = [[C, C], ...ds, [C, C]], T = track(pts), fr = T.cm.map(c => c / T.L);
    const route = pathOn(svg, poly(pts), .2);
    const marks = ds.map(([x, y]) => ({ dot: el("circle", { cx: f2(x), cy: f2(y), r: 2.6, class: "dot", opacity: .3 }, svg), ring: el("circle", { cx: f2(x), cy: f2(y), r: 0, class: "ln" }, svg) }));
    const bat = el("path", { class: "ln", "stroke-opacity": .6 }, svg);
    const b = ball(svg), U0 = .04, UD = .72;
    const pos = u => { const h = Math.min(Math.floor(u * (N + 1)), N); return lerp(fr[h], fr[h + 1], io(clamp(u * (N + 1) - h, 0, 1))); };
    return t => {
      const p = (t / P) % 1, fade = 1 - sm(.85, .96, p), u = clamp((p - U0) / UD, 0, 1);
      const s = pos(u), s0 = pos(clamp(u - .02, 0, 1));
      drawTo(route, s); op(route, .2 * fade);
      piece(bat, T, s0 * T.L, s * T.L);
      marks.forEach((m, i) => {
        const since = (p - U0 - UD * (i + 1) / (N + 1)) * P;
        set(m.ring, { r: f2(7 * backOut(clamp(since / .45, 0, 1))), "stroke-opacity": f2(.55 * fade) });
        set(m.dot, { opacity: f2(.3 + .5 * sm(0, .3, since) * fade) });
      });
      breathe(b, g, land((p - U0 - UD) * P));
    };
  };

  S.m5 = svg => { // Ripple out: a call goes out, people turn up and answer
    const R = rng(17), P = 7, g = glow(svg);
    const ring = el("circle", { cx: C, cy: C, r: B, class: "ln", "stroke-opacity": 0 }, svg);
    const nodes = Array.from({ length: 7 }, (_, i) => {
      const a = i / 7 * TAU + R() * .6, r = 105 + R() * 140, [x, y] = polar(a, r), [xa, ya] = polar(a, r - 10), [xb, yb] = polar(a, B + 5);
      return { a, r, ph: .03 + .5 * (1 - Math.cbrt(1 - (r - B - 4) / 276)), D: .5 + r / 520,
        c: el("circle", { cx: f2(x), cy: f2(y), r: 0, class: "ln" }, svg),
        link: pathOn(svg, `M${f2(xa)} ${f2(ya)}L${f2(xb)} ${f2(yb)}`, .16), bat: ln(svg, {}, 0) };
    });
    const b = ball(svg);
    return t => {
      const p = (t / P) % 1, fade = 1 - sm(.86, .97, p), q = clamp((p - .03) / .5, 0, 1); let pulse = 0;
      set(ring, { r: f2(lerp(B + 4, 280, out(q))), "stroke-opacity": f2(q > 0 && q < 1 ? .4 * Math.pow(1 - q, 1.5) : 0) });
      nodes.forEach(o => {
        const since = (p - o.ph) * P, k = clamp((since - .15) / o.D, 0, 1);
        set(o.c, { r: f2(7 * backOut(clamp(since / .4, 0, 1))), "stroke-opacity": f2(.55 * fade) });
        drawTo(o.link, k * k); op(o.link, .16 * fade);
        inward(o.bat, o.a, o.r - 10, k);
        pulse = Math.max(pulse, land(since - .15 - o.D));
      });
      breathe(b, g, pulse);
    };
  };

  S.m6 = svg => { // Branch out: functions first, then the people in them
    const R = rng(12), P = 10, g = glow(svg), prim = [];
    for (let i = 0; i < 7; i++) {
      const a = i / 7 * TAU - Math.PI / 2 + (R() - .5) * .35, r = 108 + R() * 26, t0 = .04 + i * .045 + R() * .03;
      const o = { a, r, t0, ln: ln(svg, {}, .4), node: el("circle", { r: 0, class: "ln", "stroke-opacity": .55 }, svg), tw: [] };
      const n = 2 + Math.floor(R() * 2);
      for (let j = 0; j < n; j++) {
        const ta = a + (j - (n - 1) / 2) * (.34 + R() * .12), tr = 205 + R() * 45, root = polar(a, r + 6), tip = polar(ta, tr);
        o.tw.push({ root, tip, t0: t0 + .14 + R() * .08, tr: .64 + R() * .08, ln: ln(svg, {}, .24), dot: el("circle", { r: 2.8, class: "dot" }, svg) });
      }
      o.tp = Math.max(...o.tw.map(w => w.tr)) + .1;
      prim.push(o);
    }
    const b = ball(svg);
    return t => {
      const p = (t / P) % 1; let pulse = 0;
      prim.forEach(o => {
        const qr = clamp((p - o.tp) / .08, 0, 1), f = out(clamp((p - o.t0) / .1, 0, 1)) * (1 - qr * qr);
        const base = polar(o.a, B + 5), tip = polar(o.a, lerp(B + 5, o.r, f));
        seg2(o.ln, base, tip, f > .002 ? .4 : 0);
        set(o.node, { cx: f2(tip[0]), cy: f2(tip[1]), r: f2(6 * backOut(clamp((p - o.t0 - .08) / .05, 0, 1)) * sm(0, .3, f)) });
        o.tw.forEach(w => {
          const qq = clamp((p - w.tr) / .08, 0, 1), k = out(clamp((p - w.t0) / .1, 0, 1)) * (1 - qq * qq);
          const e = [lerp(w.root[0], w.tip[0], k), lerp(w.root[1], w.tip[1], k)];
          seg2(w.ln, w.root, e, k > .002 ? .24 : 0);
          set(w.dot, { cx: f2(e[0]), cy: f2(e[1]), opacity: f2(.8 * sm(.05, .3, k)) });
        });
        pulse = Math.max(pulse, land((p - o.tp - .08) * P));
      });
      breathe(b, g, pulse);
    };
  };

  /* ═════════ 02 · ASK: ask about work, not wish lists ═════════ */

  S.a1 = svg => { // The bubble: they talk, it comes home
    const P = 7.5, g = glow(svg), cx = 408, cy = 196, rx = 76, ry = 52, tip = [334, 266], th1 = 2.02, th2 = 2.5;
    const E = th => [cx + rx * Math.cos(th), cy + ry * Math.sin(th)];
    const pts = [tip, E(th1)];
    for (let i = 1; i <= 64; i++) pts.push(E(th1 - i / 64 * (TAU - (th2 - th1))));
    pts.push(tip);
    const bubble = pathOn(svg, poly(pts), .5), mouth = E((th1 + th2) / 2);
    const dots = [384, 408, 432].map(x => ({ x, e: el("circle", { cx: x, cy: cy, r: 0, class: "dot" }, svg) }));
    const b = ball(svg);
    return t => {
      const p = (t / P) % 1; let pulse = 0;
      dash(bubble, io(clamp((p - .8) / .12, 0, 1)), io(clamp((p - .02) / .16, 0, 1)));
      const bw = env(p, .22, .25, .44, .48);
      dots.forEach((d, i) => {
        const si = .5 + i * .07, q = clamp((p - si) / .13, 0, 1);
        const y = cy - 9 * bw * Math.pow(Math.max(0, Math.sin(TAU * t / .8 - i * .9)), 2);
        const xy = q > 0 ? along([[d.x, cy], mouth, tip, [C, C]], q * q) : [d.x, y];
        set(d.e, { cx: f2(xy[0]), cy: f2(xy[1]), r: f2(4.5 * backOut(clamp((p - .17 - i * .025) / .05, 0, 1)) * (1 - .3 * q)), opacity: q >= 1 ? 0 : .85 });
        pulse = Math.max(pulse, land((p - si - .13) * P));
      });
      breathe(b, g, pulse);
    };
  };

  S.a2 = svg => { // Short question, long answer
    const E = 3.6, g = glow(svg), RN = 232, angs = [-.5, 1.75, 3.6];
    const nodes = angs.map(a => {
      const [x, y] = polar(a, RN), [x1, y1] = polar(a, B + 6), [x2, y2] = polar(a, RN - 10);
      el("line", { x1: f2(x1), y1: f2(y1), x2: f2(x2), y2: f2(y2), class: "gd" }, svg);
      return el("circle", { cx: f2(x), cy: f2(y), r: 7, class: "ln", "stroke-opacity": .3 }, svg);
    });
    const qn = ln(svg, {}, 0), ans = el("path", { class: "ln", "stroke-opacity": .55 }, svg);
    const b = ball(svg);
    const wave = (a, s0, s1) => {
      const c = Math.cos(a), s = Math.sin(a), pts = [];
      for (let i = 0; i <= 40; i++) {
        const u = lerp(s0, s1, i / 40), r = lerp(RN - 10, B + 4, u), v = 10 * Math.sin(u * TAU * 4.5) * (1 - .8 * u);
        pts.push([C + r * c - v * s, C + r * s + v * c]);
      }
      return poly(pts);
    };
    return t => {
      const n = Math.floor(t / E), pe = (t / E) % 1, k = (n * 2) % 3, a = angs[k];
      const q1 = clamp((pe - .03) / .18, 0, 1);
      const hr = lerp(B + 6, RN - 10, out(q1)), tr = lerp(B + 6, RN - 10, out(clamp(q1 * 1.25 - .25, 0, 1)));
      seg2(qn, polar(a, tr), polar(a, hr), q1 > 0 && q1 < 1 ? .55 : 0);
      nodes.forEach((c, i) => op(c, .3 + (i === k ? .45 * sm(.19, .23, pe) * (1 - sm(.3, .75, pe)) : 0)));
      const q2 = clamp((pe - .3) / .42, 0, 1), h = q2 * q2, tl = Math.pow(clamp(q2 * 1.7 - .7, 0, 1), 2);
      if (q2 > 0 && q2 < 1) set(ans, { d: wave(a, tl, h), visibility: "visible" }); else show(ans, false);
      breathe(b, g, Math.max(land((pe - .72) * E), land((pe + 1 - .72) * E)));
    };
  };

  S.a3 = svg => { // Walk me through it: stop by stop, to the decision
    const P = 10, g = glow(svg);
    const cp = [[96, 440], [180, 452], [216, 384], [150, 320], [170, 232], [256, 196], [346, 226], [340, 290], [300, 300]];
    const pts = curve(cp), T = track(pts), stops = [0, 2, 4, 6].map(i => T.cm[i * 16] / T.L).concat([1]);
    el("circle", { cx: cp[0][0], cy: cp[0][1], r: 5, class: "ln", "stroke-opacity": .35 }, svg);
    const route = pathOn(svg, poly(pts), .3);
    const rings = [2, 4, 6].map(i => el("circle", { cx: cp[i][0], cy: cp[i][1], r: 0, class: "ln" }, svg));
    const walker = el("circle", { r: 4, class: "dot" }, svg);
    const b = ball(svg), L0 = .04, LS = .16, LD = .11;
    return t => {
      const p = (t / P) % 1, fade = 1 - sm(.84, .96, p);
      let s = 0;
      for (let j = 0; j < 4; j++) { const st = L0 + j * LS; if (p >= st) s = lerp(stops[j], stops[j + 1], io(clamp((p - st) / LD, 0, 1))); }
      drawTo(route, s); op(route, .3 * fade);
      const xy = at(T, s * T.L);
      set(walker, { cx: f2(xy[0]), cy: f2(xy[1]), opacity: f2(.85 * sm(0, .03, p) * (1 - sm(.64, .67, p))) });
      rings.forEach((r, j) => { const since = (p - L0 - j * LS - LD) * P; set(r, { r: f2(7 * backOut(clamp(since / .4, 0, 1))), "stroke-opacity": f2(.55 * fade) }); });
      breathe(b, g, land((p - L0 - 3 * LS - LD) * P));
    };
  };

  S.a4 = svg => { // Five whys: each answer goes a little deeper
    const P = 10, g = glow(svg), depths = [78, 118, 160, 204, 250];
    const probes = depths.map((r, k) => {
      const a = .95 + (k - 2) * .17;
      el("circle", { cx: C, cy: C, r, class: "gd" }, svg);
      return { r, a, s: .03 + k * .15, mark: pathOn(svg, arcD(C, C, r, a - .17, a + .17), .35), bat: ln(svg, {}, 0) };
    });
    const b = ball(svg);
    return t => {
      const p = (t / P) % 1, fade = 1 - sm(.85, .96, p); let pulse = 0;
      probes.forEach(o => {
        const q = clamp((p - o.s) / .13, 0, 1);
        if (q > 0 && q < .45) {
          const k = q / .45;
          seg2(o.bat, polar(o.a, lerp(B + 5, o.r, out(clamp(k * 1.3 - .3, 0, 1)))), polar(o.a, lerp(B + 5, o.r, out(k))), .6);
        } else if (q > .5 && q < 1) {
          const k = (q - .5) / .5;
          seg2(o.bat, polar(o.a, lerp(o.r, B + 5, Math.pow(clamp(k * 1.35 - .35, 0, 1), 2))), polar(o.a, lerp(o.r, B + 5, k * k)), .6);
        } else op(o.bat, 0);
        drawTo(o.mark, io(clamp((q - .4) / .2, 0, 1))); op(o.mark, .35 * fade);
        pulse = Math.max(pulse, land((p - o.s - .13) * P));
      });
      breathe(b, g, pulse);
    };
  };

  S.a5 = svg => { // From wish list to the work: the list folds into one timeline
    const P = 8, g = glow(svg), W = [190, 150, 220, 120, 170], X0 = 96, SW = 81.6;
    const rows = W.map((w, i) => ({ i, y: C + (i - 2) * 34, x1: C - w / 2, x2: C + w / 2, s1: X0 + i * SW + 6, s2: X0 + (i + 1) * SW - 6, n: ln(svg, {}, 0) }));
    const ticks = Array.from({ length: 6 }, (_, k) => ({ x: X0 + k * SW, n: ln(svg, {}, 0) }));
    const walker = el("circle", { r: 4, class: "dot", cy: C }, svg);
    const b = ball(svg);
    return t => {
      const p = (t / P) % 1, fade = 1 - sm(.86, .97, p);
      rows.forEach(o => {
        const gr = out(clamp((p - .03 - o.i * .02) / .1, 0, 1)), m = io(clamp((p - .3 - Math.abs(o.i - 2) * .03) / .16, 0, 1));
        const xa = lerp(o.x1, o.s1, m), xb = lerp(lerp(o.x1, o.x2, gr), o.s2, m), y = lerp(o.y, C, m);
        seg2(o.n, [xa, y], [xb, y], gr > .002 ? lerp(.3, .45, m) * fade : 0);
      });
      ticks.forEach((k, j) => { const h = 7 * backOut(clamp((p - .5 - j * .012) / .05, 0, 1)); seg2(k.n, [k.x, C - h], [k.x, C + h], h > .05 ? .35 * fade : 0); });
      const q = clamp((p - .56) / .16, 0, 1);
      set(walker, { cx: f2(lerp(X0, C, q * q)), opacity: q > 0 && q < 1 ? .85 : 0 });
      breathe(b, g, land((p - .72) * P));
    };
  };

  S.a6 = svg => { // Listen more than you talk: two small waves out, many back
    const P = 7, g = glow(svg);
    const qs = [0, 1].map(() => el("path", { class: "ln", "stroke-opacity": 0 }, svg));
    const as = Array.from({ length: 5 }, () => el("path", { class: "ln", "stroke-opacity": 0 }, svg));
    const b = ball(svg);
    return t => {
      const n = Math.floor(t / P), p = (t / P) % 1, side = n % 2 ? Math.PI : 0; let pulse = 0;
      qs.forEach((e, i) => {
        const q = clamp((p - .02 - i * .05) / .16, 0, 1), r = lerp(B + 8, 92, out(q));
        set(e, { d: arcD(C, C, f2(r), side - .45, side + .45), "stroke-opacity": f2(q > 0 && q < 1 ? .5 * (1 - q) : 0) });
      });
      as.forEach((e, i) => {
        const s = .3 + i * .07, q = clamp((p - s) / .28, 0, 1), r = lerp(256, B + 8, q * q), w = .5 + .25 * (1 - q);
        set(e, { d: arcD(C, C, f2(r), side - w, side + w), "stroke-opacity": f2(q > 0 && q < 1 ? .5 * sm(0, .2, q) : 0) });
        pulse = Math.max(pulse, land((p - s - .28) * P));
      });
      breathe(b, g, pulse);
    };
  };

  /* ═════════ 03 · EVIDENCE: treat workarounds as evidence ═════════ */

  S.e1 = svg => { // The lens: looking closely until it finds the ball
    const P = 9, g = glow(svg), grid = [];
    for (let gy = -3; gy <= 3; gy++) for (let gx = -3; gx <= 3; gx++) if (gx || gy) grid.push({ x: C + gx * 50, y: C + gy * 50, e: null });
    grid.forEach(d => { d.e = el("circle", { cx: d.x, cy: d.y, r: 2.4, class: "dot", opacity: .35 }, svg); });
    const lens = el("circle", { cx: C, cy: C, r: 56, class: "ln", "stroke-opacity": 0 }, svg);
    const b = ball(svg), W = [[.08, .2], [.27, .39], [.46, .6]];
    const outer = grid.filter(d => Math.max(Math.abs(d.x - C), Math.abs(d.y - C)) >= 100);
    return t => {
      const n = Math.floor(t / P), p = (t / P) % 1;
      const wp = [0, 1, 2].map(j => outer[Math.floor(hash(n * 7 + j * 13) * outer.length)]).map(d => [d.x, d.y]).concat([[C, C]]);
      let L = wp[0];
      W.forEach(([a, z], j) => { if (p >= a) { const k = io(clamp((p - a) / (z - a), 0, 1)); L = [lerp(wp[j][0], wp[j + 1][0], k), lerp(wp[j][1], wp[j + 1][1], k)]; } });
      const qq = out(clamp((p - .62) / .2, 0, 1)), on = sm(0, .05, p) * (1 - qq);
      set(lens, { cx: f2(L[0]), cy: f2(L[1]), r: f2(56 + 80 * qq), "stroke-opacity": f2(.55 * sm(0, .05, p) * (1 - qq)) });
      grid.forEach(d => {
        const m = Math.exp(-Math.pow(Math.hypot(d.x - L[0], d.y - L[1]) / 46, 2)) * on;
        set(d.e, { cx: f2(L[0] + (d.x - L[0]) * (1 + .35 * m)), cy: f2(L[1] + (d.y - L[1]) * (1 + .35 * m)), r: f2(2.4 * (1 + 1.1 * m)), opacity: f2(.35 + .4 * m) });
      });
      breathe(b, g, land((p - .6) * P));
    };
  };

  S.e2 = svg => { // Desire path: the official route versus the one people wear in
    const R = rng(8), P = 12, g = glow(svg), A = [140, 460], K = [140, 140], Z = [460, 140];
    el("path", { d: poly([A, K, Z]), class: "ln", "stroke-opacity": .16 }, svg);
    const worn = ln(svg, { x1: A[0], y1: A[1], x2: Z[0], y2: Z[1] }, 0);
    [A, Z].forEach(([x, y]) => el("circle", { cx: x, cy: y, r: 6, class: "ln", "stroke-opacity": .4 }, svg));
    const T0 = track([A, Z]), T1 = track([A, K, Z]);
    const tr = Array.from({ length: 6 }, (_, k) => {
      const official = k === 2;
      return { T: official ? T1 : T0, official, s: .03 + k * .13 + (R() - .5) * .03, d: official ? .22 : .14, e: el("path", { class: "ln", "stroke-opacity": .6 }, svg) };
    });
    const b = ball(svg);
    return t => {
      const p = (t / P) % 1, fade = 1 - sm(.88, .97, p); let pulse = 0, count = 0;
      tr.forEach(o => {
        const q = clamp((p - o.s) / o.d, 0, 1);
        if (q > 0 && q < 1) piece(o.e, o.T, io(clamp(q - .07, 0, 1)) * o.T.L, io(q) * o.T.L); else show(o.e, false);
        if (!o.official) { count += sm(.3, .7, q); pulse = Math.max(pulse, land((p - o.s - o.d * .5) * P)); }
      });
      op(worn, (.04 + .09 * count) * fade);
      breathe(b, g, pulse);
    };
  };

  S.e3 = svg => { // The spreadsheet: a grid fills in, one cell gets circled
    const R = rng(14), P = 10, g = glow(svg), XS = [-160, -96, -32, 32, 96, 160].map(v => C + v), YS = [-140, -100, -60, -20, 20, 60, 100, 140].map(v => C + v);
    const hs = YS.map((y, i) => ({ e: pathOn(svg, `M${XS[0]} ${y}H${XS[5]}`, .14), s: .02 + i * .02 }));
    const vs = XS.map((x, i) => ({ e: pathOn(svg, `M${x} ${YS[0]}V${YS[7]}`, .14), s: .06 + i * .02 }));
    const cells = [];
    for (let r = 0; r < 7; r++) for (let c = 0; c < 5; c++) {
      if (r === 3 && c === 2) continue;
      const x = XS[c] + 12, y = (YS[r] + YS[r + 1]) / 2;
      cells.push({ x, y, w: 12 + R() * 30, s: .28 + (r * 5 + c) * .008, e: ln(svg, { x1: x, y1: y, x2: x, y2: y }, 0) });
    }
    const rp = [];
    for (let i = 0; i <= 80; i++) { const th = -2.3 + i / 80 * TAU * 1.12; rp.push([C + 50 * (1 + .05 * Math.sin(3 * th)) * Math.cos(th), C + 31 * (1 + .06 * Math.cos(2 * th)) * Math.sin(th)]); }
    const ring = pathOn(svg, poly(rp), .6);
    const b = ball(svg);
    return t => {
      const p = (t / P) % 1, fade = 1 - sm(.86, .97, p);
      hs.forEach(h => { drawTo(h.e, io(clamp((p - h.s) / .12, 0, 1))); op(h.e, .14 * fade); });
      vs.forEach(v => { drawTo(v.e, io(clamp((p - v.s) / .14, 0, 1))); op(v.e, .14 * fade); });
      cells.forEach(c => { const k = out(clamp((p - c.s) / .03, 0, 1)); set(c.e, { x2: f2(c.x + c.w * k), "stroke-opacity": f2(k > .01 ? .3 * fade : 0) }); });
      drawTo(ring, io(clamp((p - .6) / .12, 0, 1))); op(ring, .6 * fade);
      breathe(b, g, land((p - .72) * P));
    };
  };

  S.e4 = svg => { // The detour: where the official line breaks, people route around it
    const R = rng(19), g = glow(svg);
    const arms = [[Math.PI, 1], [-.95, -1], [.95, 1]].map(([a, side]) => {
      const c = Math.cos(a), s = Math.sin(a), W = (u, v) => [C + u * c - v * s, C + u * s + v * c], pts = [], bump = [];
      for (let u = 282; u >= B + 3; u -= 3) {
        const v = u > 128 && u < 208 ? side * 34 * Math.sin(Math.PI * (208 - u) / 80) : 0;
        pts.push(W(u, v)); if (u >= 126 && u <= 210) bump.push(W(u, v));
      }
      ln(svg, Object.fromEntries([["x1", f2(W(282, 0)[0])], ["y1", f2(W(282, 0)[1])], ["x2", f2(W(212, 0)[0])], ["y2", f2(W(212, 0)[1])]]), .22);
      ln(svg, { x1: f2(W(124, 0)[0]), y1: f2(W(124, 0)[1]), x2: f2(W(B + 8, 0)[0]), y2: f2(W(B + 8, 0)[1]) }, .22);
      el("path", { d: poly(bump), class: "ln", "stroke-opacity": .1 }, svg);
      return { T: track(pts), runs: [0, 1].map(() => ({ D: 2.2 + R(), gap: .8 + R() * 1.8, off: R() * 8, len: 30 + R() * 30, e: el("path", { class: "ln", "stroke-opacity": .55 }, svg) })) };
    });
    const b = ball(svg);
    return t => {
      let pulse = 0;
      arms.forEach(a => a.runs.forEach(x => {
        const local = (t + x.off) % (x.D + x.gap);
        if (local < x.D) {
          const q = local / x.D, head = a.T.L * q * q, tail = Math.max(0, head - x.len * (1 - sm(.7, 1, q)));
          piece(x.e, a.T, tail, head); op(x.e, .55 * sm(0, .25, q));
          pulse = Math.max(pulse, sm(x.D - .6, x.D, local));
        } else { show(x.e, false); pulse = Math.max(pulse, Math.exp(-(local - x.D) * 2.9)); }
      }));
      breathe(b, g, pulse);
    };
  };

  S.e5 = svg => { // The scan: sweep the floor, mark every workaround, bring them in
    const R = rng(23), P = 8, g = glow(svg), dots = [];
    while (dots.length < 36) {
      const x = C + (R() * 2 - 1) * 225, y = C + (R() * 2 - 1) * 225, r = Math.hypot(x - C, y - C);
      if (r < 225 && r > 50) dots.push({ x, y, r, a: Math.atan2(y - C, x - C) });
    }
    dots.forEach(d => { d.e = el("circle", { cx: f2(d.x), cy: f2(d.y), r: 2.6, class: "dot", opacity: .18 }, svg); d.ring = el("circle", { cx: f2(d.x), cy: f2(d.y), r: 0, class: "ln" }, svg); d.bat = ln(svg, {}, 0); });
    const scan = ln(svg, {}, 0);
    const b = ball(svg), Y0 = 80, Y1 = 520, at0 = .04, dur = .5;
    return t => {
      const n = Math.floor(t / P), p = (t / P) % 1, fade = 1 - sm(.86, .97, p), q = clamp((p - at0) / dur, 0, 1), y = lerp(Y0, Y1, io(q));
      const hw = Math.sqrt(Math.max(0, 240 * 240 - (y - C) * (y - C)));
      seg2(scan, [C - hw, y], [C + hw, y], q > 0 && q < 1 ? .5 * sm(0, .05, q) * (1 - sm(.95, 1, q)) : 0);
      const marked = dots.map((d, i) => [hash(i * 3.1 + n * 37), i]).sort((a, b) => a[0] - b[0]).slice(0, 5).map(x => x[1]);
      let pulse = 0;
      dots.forEach((d, i) => {
        // when did the scan pass this dot? invert the eased sweep numerically (cheap: it's monotonic)
        let lo = 0, hi = 1; const target = (d.y - Y0) / (Y1 - Y0);
        for (let k = 0; k < 14; k++) { const mid = (lo + hi) / 2; if (io(mid) < target) lo = mid; else hi = mid; }
        const since = (p - at0 - lo * dur) * P, mk = marked.indexOf(i);
        set(d.e, { opacity: f2(.18 + (since > 0 ? .65 * Math.exp(-since * 2.2) : 0)) });
        if (mk < 0) { set(d.ring, { r: 0 }); op(d.bat, 0); return; }
        set(d.ring, { r: f2(9 * backOut(clamp(since / .4, 0, 1))), "stroke-opacity": f2(.55 * fade) });
        const k = clamp((p - .58 - mk * .035) / .11, 0, 1);
        inward(d.bat, d.a, d.r - 9, k);
        pulse = Math.max(pulse, land((p - .69 - mk * .035) * P));
      });
      breathe(b, g, pulse);
    };
  };

  S.e6 = svg => { // Note every one: each find comes home as a tally mark
    const P = 12, N = 12, g = glow(svg);
    el("circle", { cx: C, cy: C, r: 65, class: "gd" }, svg);
    const items = Array.from({ length: N }, () => ({ ring: el("circle", { r: 0, class: "ln", "stroke-opacity": 0 }, svg), bat: ln(svg, {}, 0), tick: ln(svg, {}, 0) }));
    const b = ball(svg);
    return t => {
      const n = Math.floor(t / P), p = (t / P) % 1, fade = 1 - sm(.86, .96, p); let pulse = 0;
      items.forEach((o, k) => {
        const tk = .03 + k * .06 + (hash(n * 31 + k) - .5) * .02, a = hash(n * 17 + k * 3.7) * TAU, rf = 175 + hash(n * 5 + k * 1.9) * 75;
        const since = (p - tk) * P, [x, y] = polar(a, rf), fl = clamp(since / .6, 0, 1);
        set(o.ring, { cx: f2(x), cy: f2(y), r: f2(4 + 10 * out(fl)), "stroke-opacity": f2(since > 0 ? .55 * (1 - fl) : 0) });
        const D = .5 + rf / 900, q = clamp((since - .2) / D, 0, 1);
        if (q > 0 && q < 1) seg2(o.bat, polar(a, lerp(rf, 72, Math.pow(clamp(q * 1.4 - .4, 0, 1), 2))), polar(a, lerp(rf, 72, q * q)), .55 * sm(0, .15, q));
        else op(o.bat, 0);
        const sa = since - .2 - D, grow = backOut(clamp(sa / .3, 0, 1));
        seg2(o.tick, polar(a, 72), polar(a, 72 - 14 * grow), sa > 0 ? .5 * fade : 0);
        pulse = Math.max(pulse, .7 * land(sa));
      });
      breathe(b, g, pulse);
    };
  };

  /* ═════════ 04 · PATTERNS: the pattern behind the symptoms ═════════ */

  S.p1 = svg => { // Orbits fall into step
    const P = 9, g = glow(svg), RR = 128, w = [.5, -.32, .78], a0 = [0, 2.2, 4.1];
    el("circle", { cx: C, cy: C, r: RR, class: "ln", "stroke-opacity": .16 }, svg);
    el("circle", { cx: C, cy: C, r: RR / 2, class: "gd" }, svg);
    const tri = [0, 1, 2].map(() => ln(svg, {}, 0));
    const sats = [0, 1, 2].map(() => el("circle", { r: 9, class: "ln", "stroke-opacity": .6 }, svg));
    const b = ball(svg);
    const free = (i, t) => a0[i] + w[i] * t, slot = (i, t) => .22 * t + i * TAU / 3 - Math.PI / 2;
    const wrap = x => x - TAU * Math.round(x / TAU);
    return t => {
      const n = Math.floor(t / P), p = (t / P) % 1, tA = (n + .25) * P, k = io(env(p, .25, .45, .74, .92));
      const xy = sats.map((s, i) => {
        const d0 = slot(i, tA) - free(i, tA), m = wrap(d0) - d0, fa = free(i, t);
        const pt = polar(fa + k * (slot(i, t) - fa + m), RR);
        set(s, { cx: f2(pt[0]), cy: f2(pt[1]) });
        return pt;
      });
      tri.forEach((l, i) => seg2(l, xy[i], xy[(i + 1) % 3], .38 * sm(.85, 1, k)));
      breathe(b, g, land((p - .45) * P));
    };
  };

  S.p2 = svg => { // Connect the symptoms: restless dots, one shared root
    const P = 9, N = 8, g = glow(svg);
    const items = Array.from({ length: N }, () => ({ flare: el("circle", { r: 0, class: "ln", "stroke-opacity": 0 }, svg), link: ln(svg, {}, 0), dot: el("circle", { r: 0, class: "dot" }, svg) }));
    const b = ball(svg);
    return t => {
      const n = Math.floor(t / P), p = (t / P) % 1, fade = 1 - sm(.86, .97, p), amp = 5 * (1 - sm(.5, .6, p)); let pulse = 0;
      items.forEach((o, i) => {
        const a = i / N * TAU + (hash(n * 11 + i) - .5) * .6, r = 110 + hash(n * 5 + i * 1.3) * 130, ti = .04 + ((i * 3) % N) * .05;
        const [bx, by] = polar(a, r), x = bx + amp * Math.sin(t * 9 + i * 2.1), y = by + amp * Math.cos(t * 7.3 + i * 1.3);
        const since = (p - ti) * P, fl = clamp(since / .5, 0, 1);
        set(o.dot, { cx: f2(x), cy: f2(y), r: f2(3.6 * backOut(clamp(since / .3, 0, 1))), opacity: f2(.85 * fade) });
        set(o.flare, { cx: f2(x), cy: f2(y), r: f2(4 + 12 * out(fl)), "stroke-opacity": f2(since > 0 ? .5 * (1 - fl) : 0) });
        const q = clamp((p - .5 - i * .018) / .11, 0, 1), e = polar(a, B + 5), f = q * q;
        seg2(o.link, [x, y], [lerp(x, e[0], f), lerp(y, e[1], f)], q > 0 ? .32 * fade : 0);
        pulse = Math.max(pulse, land((p - .61 - i * .018) * P));
      });
      breathe(b, g, pulse);
    };
  };

  S.p3 = svg => { // Signal from noise: jitter settles into one shared rhythm
    const P = 9, g = glow(svg), grp = el("g", { mask: radialMask(svg, 150, 270) }, svg);
    const rows = Array.from({ length: 9 }, (_, i) => ({ i, y: C + (i - 4) * 30, e: el("path", { class: "ln", "stroke-opacity": .35 }, grp) }));
    const b = ball(svg);
    return t => {
      const p = (t / P) % 1, k = io(env(p, .2, .42, .74, .94));
      rows.forEach(o => {
        const pts = [];
        for (let x = 50; x <= 550; x += 6) {
          const nz = Math.sin(x * .21 + t * 3.1 + o.i * 1.7) * .5 + Math.sin(x * .53 - t * 4.3 + o.i * 2.9) * .3 + Math.sin(x * 1.13 + t * 5.7 + o.i * .7) * .2;
          pts.push([x, o.y + 9 * (1 - k) * nz + 16 * k * Math.sin(x * .03 - t * 1.4)]);
        }
        set(o.e, { d: poly(pts) });
      });
      breathe(b, g, land((p - .42) * P));
    };
  };

  S.p4 = svg => { // Below the surface: what shows up top, and what feeds it
    const R = rng(29), P = 9, g = glow(svg), SY = 196;
    ln(svg, { x1: 110, y1: SY, x2: 490, y2: SY }, .28);
    const xs = [150, 222, 296, 372, 446].map(x => x + (R() - .5) * 20), ord = [2, 0, 4, 1, 3];
    const items = xs.map((x, i) => {
      const c2 = [C + (x - C) * .25, C - 70], ang = Math.atan2(c2[1] - C, c2[0] - C), end = polar(ang, B + 5), pts = [];
      for (let k = 0; k <= 32; k++) {
        const u = k / 32, v = 1 - u;
        pts.push([0, 1].map(j => v * v * v * [x, SY + 4][j] + 3 * v * v * u * [x, 262][j] + 3 * v * u * u * c2[j] + u * u * u * end[j]));
      }
      const T = track(pts);
      return { x, i, o: ord.indexOf(i), T, root: pathOn(svg, poly(pts), .22), bat: el("path", { class: "ln", "stroke-opacity": .6 }, svg), dot: el("circle", { r: 0, class: "dot" }, svg) };
    });
    const b = ball(svg);
    return t => {
      const p = (t / P) % 1, fade = 1 - sm(.86, .97, p); let pulse = 0;
      items.forEach(it => {
        const since = (p - .05 - it.o * .06) * P;
        set(it.dot, { cx: f2(it.x), cy: f2(SY - 16 - 4 * Math.sin(t * 2.2 + it.i)), r: f2(3.6 * backOut(clamp(since / .3, 0, 1))), opacity: f2(.85 * fade) });
        const q = clamp((p - .42 - it.o * .045) / .15, 0, 1), h = q * q * it.T.L;
        drawTo(it.root, q * q); op(it.root, .22 * fade);
        if (q > 0 && q < 1) piece(it.bat, it.T, Math.max(0, h - 44), h); else show(it.bat, false);
        pulse = Math.max(pulse, land((p - .57 - it.o * .045) * P));
      });
      breathe(b, g, pulse);
    };
  };

  S.p5 = svg => { // The same loop, again and again: a rosette, petal by petal
    const P = 10, g = glow(svg), pts = [];
    const rad = th => 24 + 200 * Math.pow(Math.abs(Math.sin(3 * (th + Math.PI / 2))), 1.15);
    for (let i = 0; i <= 720; i++) { const th = -Math.PI / 2 + i / 720 * TAU, r = rad(th); pts.push([C + r * Math.cos(th), C + r * Math.sin(th)]); }
    const T = track(pts), full = pathOn(svg, poly(pts), .3), pen = el("path", { class: "ln", "stroke-opacity": .6 }, svg), head = el("circle", { r: 3, class: "dot" }, svg);
    const b = ball(svg);
    return t => {
      const p = (t / P) % 1, hd = io(clamp((p - .04) / .58, 0, 1)), tl = io(clamp((p - .6) / .3, 0, 1));
      dash(full, tl, hd);
      const live = hd > 0 && hd < 1;
      if (live) piece(pen, T, Math.max(0, hd - .035) * T.L, hd * T.L); else show(pen, false);
      const xy = at(T, hd * T.L);
      set(head, { cx: f2(xy[0]), cy: f2(xy[1]), opacity: live ? .85 : 0 });
      const r = Math.hypot(xy[0] - C, xy[1] - C);
      breathe(b, g, live ? sm(70, 26, r) * sm(0, .01, hd) : 0);
    };
  };

  S.p6 = svg => { // Field lines: scattered habits line up around one center
    const R = rng(41), P = 10, g = glow(svg), bits = [];
    while (bits.length < 130) {
      const r = Math.sqrt(lerp(50 * 50, 258 * 258, R())), a = R() * TAU;
      bits.push({ x: C + r * Math.cos(a), y: C + r * Math.sin(a), r, tan: a + Math.PI / 2, f0: R() * Math.PI, w: (R() - .5) * .5, e: null });
    }
    bits.forEach(o => { o.e = ln(svg, {}, f2(.34 * (1 - sm(210, 262, o.r)))); });
    const b = ball(svg), wrapPi = x => x - Math.PI * Math.round(x / Math.PI);
    return t => {
      const n = Math.floor(t / P), p = (t / P) % 1, tA = (n + .15) * P, k = io(env(p, .15, .45, .72, .95));
      bits.forEach(o => {
        const fa = o.f0 + o.w * t, d0 = o.tan - (o.f0 + o.w * tA), m = wrapPi(d0) - d0, a = fa + k * (o.tan - fa + m);
        const dx = 7 * Math.cos(a), dy = 7 * Math.sin(a);
        set(o.e, { x1: f2(o.x - dx), y1: f2(o.y - dy), x2: f2(o.x + dx), y2: f2(o.y + dy) });
      });
      breathe(b, g, land((p - .45) * P));
    };
  };
})();
