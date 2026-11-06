/* Chapter heroes: the final scene for each chapter, in the shared hero language.
   Source and alternatives: hero-explorations/chapters/scenes.js and chapters.html. Rules: hero-explorations/ANIMATION-RULES.md.
   API: window.HeroMount(svg, key) returns draw(t) with the trail built in. Keys: 00 (placeholder), 01–07. */
(() => {
  const NS = "http://www.w3.org/2000/svg", C = 300, B = 16, TAU = Math.PI * 2;
  const set = (e, a) => { for (const k in a) e.setAttribute(k, a[k]); return e; };
  const el = (tag, a, p) => { const e = set(document.createElementNS(NS, tag), a || {}); if (p) p.appendChild(e); return e; };
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const sm = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const env = (p, a, b, c, d) => sm(a, b, p) * (1 - sm(c, d, p));
  const io = p => p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
  const out = p => 1 - Math.pow(1 - p, 3);
  const backOut = p => { const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2); };
  const rng = s => () => (s = (s * 16807) % 2147483647, (s - 1) / 2147483646);
  const hash = n => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  const f2 = n => Math.round(n * 100) / 100;
  const arcD = (cx, cy, r, a0, a1) =>
    `M${f2(cx + r * Math.cos(a0))} ${f2(cy + r * Math.sin(a0))}A${r} ${r} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${f2(cx + r * Math.cos(a1))} ${f2(cy + r * Math.sin(a1))}`;
  const along = (pts, s) => {
    const seg = []; let L = 0;
    for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(d); L += d; }
    let r = clamp(s, 0, 1) * L;
    for (let i = 0; i < seg.length; i++) {
      if (r <= seg[i] || i === seg.length - 1) { const k = seg[i] ? clamp(r / seg[i], 0, 1) : 0; return [lerp(pts[i][0], pts[i + 1][0], k), lerp(pts[i][1], pts[i + 1][1], k)]; }
      r -= seg[i];
    }
    return pts[pts.length - 1];
  };
  const ball = (svg, extra) => el("circle", Object.assign({ cx: C, cy: C, r: B, class: "ball" }, extra || {}), svg);
  const ln = (svg, a, op) => el("line", Object.assign({ class: "ln", "stroke-opacity": op == null ? .45 : op }, a), svg);
  /* A path that can be drawn on: drawTo(path, 0..1) */
  const pathOn = (svg, d, op, extra) => el("path", Object.assign({ d, class: "ln", pathLength: 1, "stroke-dasharray": "1 1", "stroke-dashoffset": 1, "stroke-opacity": op == null ? .45 : op }, extra || {}), svg);
  const drawTo = (e, f) => set(e, { "stroke-dashoffset": 1 - f, visibility: f < .002 ? "hidden" : "visible" });
  const poly = pts => pts.map((p, i) => (i ? "L" : "M") + f2(p[0]) + " " + f2(p[1])).join("");
  let uid = 0;
  const radialMask = (svg, inner, outer) => {
    const id = "hx" + (uid++);
    const defs = el("defs", {}, svg);
    const g = el("radialGradient", { id: id + "g", cx: C, cy: C, r: outer, gradientUnits: "userSpaceOnUse" }, defs);
    el("stop", { offset: 0, "stop-color": "#fff" }, g);
    el("stop", { offset: inner / outer, "stop-color": "#fff" }, g);
    el("stop", { offset: 1, "stop-color": "#000" }, g);
    const m = el("mask", { id, maskUnits: "userSpaceOnUse", x: -200, y: -200, width: 1000, height: 1000 }, defs);
    el("rect", { x: -200, y: -200, width: 1000, height: 1000, fill: `url(#${id}g)` }, m);
    return `url(#${id})`;
  };
  const glowDef = svg => {
    const id = "hx" + (uid++);
    const g = el("radialGradient", { id }, el("defs", {}, svg));
    [[0, .55], [.35, .22], [1, 0]].forEach(([o, a]) => el("stop", { offset: o, "stop-color": "#ff0074", "stop-opacity": a }, g));
    return `url(#${id})`;
  };

  const S = {};

  /* ═════════ 00 · Introduction (placeholder until its hero is designed): rings breathe around the ball ═════════ */
  S["00"] = svg => {
    const rings = [70, 120, 175, 235, 292].map((r, i) => el("circle", { cx: C, cy: C, r, class: "ln", "stroke-opacity": 0 }, svg));
    const b = ball(svg);
    return t => {
      rings.forEach((c, i) => {
        const p = ((t * .16 + i / rings.length) % 1 + 1) % 1;            // each ring drifts outward and fades
        set(c, { r: f2(40 + 260 * out(p)), "stroke-opacity": f2(.4 * env(p, 0, .15, .55, 1)) });
      });
      set(b, { r: f2(B * (1 + .08 * (.5 + .5 * Math.sin(t * 1.6)))) });
    };
  };
  /* ═════════ 01 · Listen (shipped, for reference) ═════════ */
  S["01"] = svg => {
    const R = rng(7), N = 13, guides = el("g", {}, svg);
    const glow = el("circle", { cx: C, cy: C, r: 42, fill: glowDef(svg), opacity: 0, class: "glow" }, svg);
    const v = Array.from({ length: N }, (_, i) => {
      const a = (i / N) * TAU + (R() - .5) * .35, cos = Math.cos(a), sin = Math.sin(a);
      el("line", { x1: C + 40 * cos, y1: C + 40 * sin, x2: C + 296 * cos, y2: C + 296 * sin, class: "gd" }, guides);
      return { cos, sin, D: 2.6 + R() * 1.8, gap: 1.2 + R() * 3.4, off: R() * 8, len: 36 + R() * 60, node: ln(svg, {}, 0) };
    });
    const b = ball(svg);
    return t => {
      let pulse = 0;
      v.forEach(x => {
        const local = (t + x.off) % (x.D + x.gap);
        if (local < x.D) {
          const p = local / x.D, head = B + 2 + (288 - B) * (1 - p * p), tail = head + x.len * (1 - sm(.7, 1, p));
          set(x.node, { x1: C + head * x.cos, y1: C + head * x.sin, x2: C + tail * x.cos, y2: C + tail * x.sin, "stroke-opacity": .5 * sm(0, .25, p) });
          pulse = Math.max(pulse, sm(x.D - .6, x.D, local));
        } else { set(x.node, { "stroke-opacity": 0 }); pulse = Math.max(pulse, Math.exp(-(local - x.D) * 2.9)); }
      });
      set(b, { r: B * (1 + .16 * pulse) });
      set(glow, { opacity: .4 * pulse, r: B * (2.6 + .8 * pulse) });
    };
  };

  S["02c"] = svg => { // Passing the baton
    const N = 7, ring = Array.from({ length: N }, (_, i) => { const a = i / N * TAU - Math.PI / 2; return [C + 180 * Math.cos(a), C + 180 * Math.sin(a)]; });
    const trails = Array.from({ length: 5 }, () => ln(svg, {}, 0));
    const nodes = ring.map(([x, y]) => el("circle", { cx: x, cy: y, r: 7, class: "ln", "stroke-opacity": .4, fill: "#d5def0", "fill-opacity": 0 }, svg));
    const dash = ln(svg, {}, .6);
    const b = ball(svg), P = 7.2, HOP = 1.2, MOVE = .9;
    return t => {
      const n = Math.floor(t / P), ls = t % P;
      const order = [...Array(N).keys()].sort((a, c) => hash(n * 13 + a) - hash(n * 13 + c)).slice(0, 5);
      const pts = order.map(i => ring[i]).concat([[C, C]]);
      const h = Math.min(4, Math.floor(ls / HOP)), q = clamp((ls - h * HOP) / MOVE, 0, 1);
      const A = pts[h], Z = pts[h + 1], hd = io(q), tl = io(clamp(q * 1.25 - .25, 0, 1));
      const end = h === 4 ? 1 - B / 180 : 1;
      set(dash, { x1: lerp(A[0], Z[0], tl * end), y1: lerp(A[1], Z[1], tl * end), x2: lerp(A[0], Z[0], hd * end), y2: lerp(A[1], Z[1], hd * end), "stroke-opacity": q < 1 && ls < 5 * HOP ? .6 : 0 });
      const clear = 1 - sm(.88, 1, ls / P);
      trails.forEach((tr, k) => {
        const done = k < h || (k === h && q >= 1);
        set(tr, { x1: pts[k][0], y1: pts[k][1], x2: pts[k + 1][0], y2: pts[k + 1][1], "stroke-opacity": done ? .12 * clear : 0 });
      });
      nodes.forEach((c, i) => {
        const k = order.indexOf(i), arr = k < 0 ? Infinity : (k === 0 ? 0 : (k - 1) * HOP + MOVE);
        const lit = ls >= arr ? Math.exp(-(ls - arr) * 2) : 0;
        set(c, { "fill-opacity": .85 * lit, "stroke-opacity": .4 + .4 * lit });
      });
      const land = 4 * HOP + MOVE, since = ls - land;
      set(b, { r: B * (1 + .18 * (since > 0 ? Math.exp(-since * 2.4) : sm(-.4, 0, since))) });
    };
  };

  S["03b"] = svg => { // Roots: lines run out to every tip and back, like the baton
    const R = rng(5), segs = [], leaves = [], P = 9;
    const grow = (x, y, a, len, d, chain) => {
      const x2 = x + len * Math.cos(a), y2 = y + len * Math.sin(a);
      const seg = { len, p: pathOn(svg, `M${f2(x)} ${f2(y)}L${f2(x2)} ${f2(y2)}`, .16), f: 0 };
      segs.push(seg);
      const ch = chain.concat([{ seg, x: x2, y: y2 }]);
      if (d === 2) { leaves.push({ ch }); return; }
      grow(x2, y2, a - .3 - R() * .3, len * .68, d + 1, ch);
      grow(x2, y2, a + .3 + R() * .3, len * .68, d + 1, ch);
    };
    for (let i = 0; i < 5; i++) {
      const a = i / 5 * TAU + (R() - .5) * .5 - Math.PI / 2, sx = C + (B + 4) * Math.cos(a), sy = C + (B + 4) * Math.sin(a);
      grow(sx, sy, a, 82, 0, [{ seg: null, x: sx, y: sy }]);
    }
    const sub = (pts, cum, d0, d1) => {
      const at = d => { for (let i = 1; i < pts.length; i++) if (d <= cum[i] || i === pts.length - 1) { const k = clamp((d - cum[i - 1]) / (cum[i] - cum[i - 1]), 0, 1); return [lerp(pts[i - 1][0], pts[i][0], k), lerp(pts[i - 1][1], pts[i][1], k)]; } };
      const r = [at(d0)];
      for (let i = 1; i < pts.length - 1; i++) if (cum[i] > d0 && cum[i] < d1) r.push(pts[i]);
      r.push(at(d1));
      return poly(r);
    };
    leaves.forEach(l => {
      l.pts = l.ch.map(c => [c.x, c.y]);
      l.cum = [0]; l.ch.slice(1).forEach(c => l.cum.push(l.cum[l.cum.length - 1] + c.seg.len));
      l.L = l.cum[l.cum.length - 1];
      l.segs = l.ch.slice(1).map((c, k) => ({ seg: c.seg, start: l.cum[k] }));
      // each tip keeps its own pace, out and back
      l.o0 = .02 + R() * .2; l.od = .18 + R() * .14;
      l.i0 = .5 + R() * .18; l.id = .1 + R() * .12;
      l.out = el("path", { class: "ln", "stroke-opacity": .6 }, svg);
      l.back = el("path", { class: "ln", "stroke-opacity": .6 }, svg);
      l.dot = el("circle", { cx: l.pts[l.pts.length - 1][0], cy: l.pts[l.pts.length - 1][1], r: 3, class: "dot", opacity: 0 }, svg);
    });
    const b = ball(svg);
    return t => {
      const p = (t / P) % 1, fade = 1 - sm(.88, .97, p);
      let pulse = 0;
      segs.forEach(s => { s.f = 0; });
      leaves.forEach(l => {
        // out: the head leads, the tail catches up and the dash lands on the tip
        const qo = clamp((p - l.o0) / l.od, 0, 1), head = out(qo) * l.L, tail = out(clamp(qo * 1.35 - .35, 0, 1)) * l.L;
        l.segs.forEach(s => { s.seg.f = Math.max(s.seg.f, clamp((head - s.start) / s.seg.len, 0, 1)); });
        set(l.out, { d: qo > 0 && qo < 1 ? sub(l.pts, l.cum, tail, head) : "M0 0" , visibility: qo > 0 && qo < 1 ? "visible" : "hidden" });
        set(l.dot, { opacity: .75 * sm(0, .02, p - l.o0 - l.od) * fade });
        // back: a shorter dash that speeds up as it nears the ball
        const qi = clamp((p - l.i0) / l.id, 0, 1), hb = l.L * (1 - qi * qi), tb = l.L * (1 - Math.pow(clamp(qi * 1.35 - .35, 0, 1), 2));
        set(l.back, { d: qi > 0 && qi < 1 ? sub(l.pts, l.cum, hb, tb) : "M0 0", visibility: qi > 0 && qi < 1 ? "visible" : "hidden" });
        const since = (p - l.i0 - l.id) * P;
        pulse = Math.max(pulse, since > 0 ? Math.exp(-since * 2.9) : sm(-.5, 0, since));
      });
      segs.forEach(s => { drawTo(s.p, s.f); set(s.p, { "stroke-opacity": .16 * fade }); });
      set(b, { r: B * (1 + .16 * pulse) });
    };
  };

  S["04b"] = svg => { // Overlap
    const cs = [-Math.PI / 2, Math.PI / 6, Math.PI * 5 / 6].map(a => ({ a, c: el("circle", { r: 108, class: "ln", "stroke-opacity": .4 }, svg) }));
    const b = ball(svg);
    return t => {
      const p = (t / 7) % 1, k = io(env(p, .08, .42, .74, .96)), d = lerp(178, 60, k);
      cs.forEach(o => set(o.c, { cx: C + d * Math.cos(o.a + t * .05), cy: C + d * Math.sin(o.a + t * .05) }));
      set(b, { r: B * (.55 + .45 * sm(.3, .45, p) * (1 - sm(.74, .9, p)) + .14 * env(p, .4, .46, .5, .7)) });
    };
  };

  S["05d"] = svg => { // Built around it
    const sq = [44, 76, 110, 146, 184].map((h, i) => ({ i, p: pathOn(svg, `M${C} ${C - h}H${C + h - 8}Q${C + h} ${C - h} ${C + h} ${C - h + 8}V${C + h - 8}Q${C + h} ${C + h} ${C + h - 8} ${C + h}H${C - h + 8}Q${C - h} ${C + h} ${C - h} ${C + h - 8}V${C - h + 8}Q${C - h} ${C - h} ${C - h + 8} ${C - h}Z`, .5 - i * .07) }));
    const b = ball(svg);
    return t => {
      const p = (t / 7) % 1;
      sq.forEach(o => {
        const f = out(sm(.12 + o.i * .07, .34 + o.i * .07, p)) * (1 - sm(.74 + (4 - o.i) * .03, .86 + (4 - o.i) * .03, p));
        drawTo(o.p, f);
        set(o.p, { transform: `rotate(${f2(45 * (1 - f))} ${C} ${C})` });
      });
      set(b, { r: B * (1 + .16 * env(p, .02, .08, .1, .25)) });
    };
  };

  S["06c"] = svg => { // Wind tunnel
    const g = el("g", { mask: radialMask(svg, 150, 280) }, svg), A = 34;
    const ys = [-150, -120, -92, -66, -44, -24, 24, 44, 66, 92, 120, 150];
    const st = ys.map(y0 => {
      const pts = [];
      for (let x = 20; x <= 580; x += 8) {
        const dx = x - C; let y = y0 + Math.sign(y0) * A;
        for (let k = 0; k < 12; k++) y = y0 + A * A * y / (dx * dx + y * y);
        pts.push([x, C + y]);
      }
      el("path", { d: poly(pts), class: "gd", style: "stroke-opacity:.08" }, g);
      return el("path", { d: poly(pts), class: "ln", "stroke-opacity": .5, "stroke-dasharray": "10 26" }, g);
    });
    const b = ball(svg);
    return t => {
      const gust = 1 + .5 * Math.max(0, Math.sin(t * .9));
      st.forEach((s, i) => set(s, { "stroke-dashoffset": -(t * 70 + i * 13) }));
      set(b, { cx: C + .8 * Math.sin(t * 31) * (gust - 1), r: B });
    };
  };

  S["07h"] = svg => { // True north: a compass rose with a needle and a heading
    const RING = 118, toXY = (a, r) => [C + r * Math.cos(a), C + r * Math.sin(a)];
    // eight bearings reaching out past the rose, cardinals longer
    for (let i = 0; i < 8; i++) {
      const a = i * Math.PI / 4 - Math.PI / 2, [x1, y1] = toXY(a, RING + 22), [x2, y2] = toXY(a, i % 2 ? 210 : 290);
      ln(svg, { x1, y1, x2, y2 }, i % 2 ? .07 : .12);
    }
    el("circle", { cx: C, cy: C, r: RING, class: "ln", "stroke-opacity": .28 }, svg);
    el("circle", { cx: C, cy: C, r: 92, class: "ln", "stroke-opacity": .08 }, svg);
    const ticks = Array.from({ length: 72 }, (_, i) => {
      const a = i / 72 * TAU - Math.PI / 2, len = i % 18 === 0 ? 16 : i % 6 === 0 ? 9 : 5;
      const [x1, y1] = toXY(a, RING + 3), [x2, y2] = toXY(a, RING + 3 + len);
      return { a, n: ln(svg, { x1, y1, x2, y2 }, .2), base: i % 18 === 0 ? .45 : .2 };
    });
    const route = pathOn(svg, "M0 0", .5);
    const tail = ln(svg, {}, .3), needle = ln(svg, {}, .6);   // the same simple needle as Find your bearing
    const b = ball(svg);
    return t => {
      const P = 7, n = Math.floor(t / P), p = (t / P) % 1;
      const target = Math.floor(hash(n + 11) * 8) * Math.PI / 4 - Math.PI / 2;
      const settle = out(sm(0, .42, p));
      const w = p > .36 ? .28 * Math.exp(-(p - .36) * 15) * Math.sin((p - .36) * 70) : 0;
      const a = target - (1 - settle) * TAU * 2.4 + w;
      set(needle, { x1: C, y1: C, x2: C + 104 * Math.cos(a), y2: C + 104 * Math.sin(a) });
      set(tail, { x1: C, y1: C, x2: C - 28 * Math.cos(a), y2: C - 28 * Math.sin(a) });
      ticks.forEach(k => {
        const d = Math.abs(((k.a - a) % TAU + TAU * 1.5) % TAU - Math.PI);
        set(k.n, { "stroke-opacity": f2(k.base + .6 * Math.exp(-Math.pow(d / .14, 2))) });
      });
      // once settled, the heading reaches out and pulses
      const [rx1, ry1] = toXY(target, RING + 24), [rx2, ry2] = toXY(target, 292);
      set(route, { d: `M${f2(rx1)} ${f2(ry1)}L${f2(rx2)} ${f2(ry2)}` });
      drawTo(route, out(sm(.5, .64, p)));
      const beat = .5 + .5 * Math.cos(TAU * Math.max(0, p - .64) * P / 1.1);   // a slow heartbeat once it's drawn
      set(route, { "stroke-opacity": f2((.2 + .45 * beat) * (1 - sm(.88, .98, p))) });
      set(b, { r: B * (1 + .16 * env(p, .46, .52, .56, .72)) });
    };
  };

  /* ═════════ Trail: the radar echo, as a brand motif ═════════
     Each option is drawn again a few times, slightly in the past, underneath itself.
     Echo copies of anything that isn't moving are hidden, so still lines don't get brighter. */
  const LAG = { "01": .035, "02c": .035, "03b": .04, "03d": .06, "04b": .06, "05d": .035, "06a": .04, "06c": .03, "07d": .03, "07e": .028, "07f": .035, "07g": .03, "07h": .028 };
  const GEO = ["d", "x1", "y1", "x2", "y2", "cx", "cy", "r", "rx", "ry", "x", "y", "width", "height", "points", "transform", "stroke-dashoffset"];
  const NUM = /-?\d*\.?\d+(?:e-?\d+)?/g;
  const nums = e => { let s = ""; for (const a of GEO) { const v = e.getAttribute(a); if (v != null) s += v + " "; } return s ? (s.match(NUM) || []).map(Number) : null; };
  const geoEls = g => [...g.querySelectorAll("*")].filter(x => !x.closest("defs") && !(x instanceof SVGGElement && !x.hasAttribute("transform")));
  window.HeroMount = (svg, key, o = {}) => {
    const n = o.n || 10, lag = o.lag || LAG[key] || .04, base = o.base || .42;
    const echoes = [];
    for (let j = n; j >= 1; j--) {
      const g = el("g", { class: "echo", opacity: f2(base * Math.pow(1 - j / (n + 1), 2)) }, svg);
      echoes.push({ j, g, draw: S[key](g) });
    }
    const main = el("g", { class: "main" }, svg), draw = S[key](main), mainEls = geoEls(main);
    echoes.forEach(e => { e.els = geoEls(e.g); });
    return t => {
      draw(t);
      if (svg.closest(".no-trail")) return;
      echoes.forEach(e => {
        e.draw(t - e.j * lag);
        e.els.forEach((x, i) => {
          const m = mainEls[i]; if (!m) return;
          const a = nums(x), b = nums(m); if (!a || !b) return;
          let d = a.length === b.length ? 0 : 99;
          if (!d) for (let k = 0; k < a.length; k++) d = Math.max(d, Math.abs(a[k] - b[k]));
          x.style.visibility = d < 1.2 ? "hidden" : "";
        });
      });
    };
  };

  /* Final picks, by chapter number */
  Object.assign(S, { "02": S["02c"], "03": S["03b"], "04": S["04b"], "05": S["05d"], "06": S["06c"], "07": S["07h"] });
  Object.assign(LAG, { "02": LAG["02c"], "03": LAG["03b"], "04": LAG["04b"], "05": LAG["05d"], "06": LAG["06c"], "07": LAG["07h"], "00": .05 });
  window.HeroScenes = S;
  /* Shared helpers, so other scene sets (e.g. How to apply) speak the same language */
  window.HeroKit = { NS, C, B, TAU, set, el, clamp, lerp, sm, env, io, out, backOut, rng, hash, f2, arcD, along, ball, ln, pathOn, drawTo, poly, radialMask, glowDef };
})();
