/* Hero motion explorations: one draw(t) function per option.
   Shared language: viewBox 600×600, the pink ball at the center (r 16), slate hairlines, nothing loud. */
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

  /* ═════════ 00 · The dashboard isn't the problem ═════════ */
  S["00a"] = svg => { // Lift the lid
    const b = ball(svg);
    const W = 250, H = 170, x0 = C - W / 2, y0 = C - H / 2, x1 = x0 + W, y1 = y0 + H, r = 8;
    const top = el("g", {}, svg), bot = el("g", {}, svg);
    el("path", { d: `M${x0} ${C}V${y0 + r}Q${x0} ${y0} ${x0 + r} ${y0}H${x1 - r}Q${x1} ${y0} ${x1} ${y0 + r}V${C}Z`, class: "pnl" }, top);
    el("path", { d: `M${x0} ${C}V${y1 - r}Q${x0} ${y1} ${x0 + r} ${y1}H${x1 - r}Q${x1} ${y1} ${x1} ${y1 - r}V${C}Z`, class: "pnl" }, bot);
    const vals = [.55, .35, .62, .3, .48, .18, .4, .12];
    el("polyline", { points: vals.map((v, i) => `${x0 + 28 + i * (W - 56) / 7},${y0 + 24 + v * (H / 2 - 40)}`).join(" "), class: "ln", "stroke-opacity": .5 }, top);
    [30, 50, 22, 56, 40, 46].forEach((h, i) => { const x = x0 + 40 + i * 34; ln(bot, { x1: x, y1: y1 - 20, x2: x, y2: y1 - 20 - h, "stroke-width": 3, "stroke-linecap": "butt" }, .4); });
    return t => {
      const p = (t / 6.5) % 1, o = io(env(p, .18, .36, .78, .94));
      set(top, { transform: `translate(0 ${-o * 118})` });
      set(bot, { transform: `translate(0 ${o * 118})` });
      set(b, { r: B * (1 + .18 * env(p, .26, .36, .42, .62)) });
    };
  };

  S["00b"] = svg => { // Open the blinds
    const b = ball(svg), N = 9, G = 24, W = 230;
    const sl = Array.from({ length: N }, (_, i) => {
      const y = C + (i - (N - 1) / 2) * G;
      const r = el("rect", { x: C - W / 2, y: -G / 2, width: W, height: G + .6, class: "fill" }, svg);
      ln(svg, { x1: C - W / 2, x2: C + W / 2, y1: y, y2: y }, .4);
      return { y, r };
    });
    return t => {
      const p = (t / 6) % 1; let open = 0;
      sl.forEach((s, i) => {
        const d = i * .025, o = io(env(p, .15 + d, .35 + d, .72 + d, .9 + d));
        open += o / N;
        set(s.r, { transform: `translate(0 ${s.y}) scale(1 ${Math.max(.02, 1 - o)})` });
      });
      set(b, { r: B * (1 + .14 * sm(.7, 1, open)) });
    };
  };

  S["00c"] = svg => { // The equalizer of vanity
    const R = rng(3);
    const bars = [];
    for (let i = 0; i <= 16; i++) { if (i === 8) continue; bars.push({ x: C + (i - 8) * 20, f: 3 + R() * 5, g: 1 + R() * 2, a: R() * TAU, c: R() * TAU, n: ln(svg, {}, .42) }); }
    const b = ball(svg);
    return t => {
      const k = io(.5 + .5 * Math.cos(TAU * t / 9));
      bars.forEach(o => {
        const h = 4 + k * 70 * (.5 + .5 * Math.sin(t * o.f + o.a)) * (.55 + .45 * Math.sin(t * o.g + o.c));
        set(o.n, { x1: o.x, x2: o.x, y1: C - h, y2: C + h });
      });
      set(b, { r: B * (1 + .2 * (1 - k)) });
    };
  };

  S["00d"] = svg => { // Rearranging the furniture
    const L = [
      [[150, 150, 120, 110], [330, 150, 120, 110], [150, 340, 120, 110], [330, 340, 120, 110]],
      [[110, 180, 150, 90], [300, 110, 120, 160], [130, 320, 140, 150], [330, 330, 160, 80]],
      [[200, 120, 200, 64], [120, 200, 64, 200], [416, 200, 64, 200], [200, 416, 200, 64]],
      [[120, 140, 140, 140], [360, 120, 100, 180], [160, 350, 100, 110], [300, 340, 170, 120]],
      [[150, 120, 300, 60], [150, 210, 100, 240], [350, 210, 100, 100], [350, 340, 100, 110]],
    ];
    const panels = L[0].map(() => ({ r: el("rect", { rx: 6, class: "ln", "stroke-opacity": .4 }, svg), l: ln(svg, {}, .3) }));
    ball(svg);
    return t => {
      const H = 2.2, n = Math.floor(t / H), p = (t / H) % 1, k = io(sm(.45, 1, p));
      const A = L[n % L.length], Z = L[(n + 1) % L.length];
      panels.forEach((o, i) => {
        const [x, y, w, h] = A[i].map((v, j) => lerp(v, Z[i][j], k));
        set(o.r, { x, y, width: w, height: h });
        set(o.l, { x1: x + 12, y1: y + 14, x2: x + 12 + Math.min(60, w * .4), y2: y + 14 });
      });
    };
  };

  /* ═════════ 02 · Know who decides what ═════════ */
  S["02a"] = svg => { // Constellation
    const R = rng(11);
    const nodes = [90, 130, 165, 200, 235, 150].map((r, i) => {
      el("circle", { cx: C, cy: C, r, class: "gd" }, svg);
      return { r, w: (.12 + R() * .18) * (i % 2 ? -1 : 1), a: R() * TAU };
    });
    const link = ln(svg, {}, .55);
    nodes.forEach(o => { o.c = el("circle", { r: 7, class: "ln", "stroke-opacity": .55, fill: "#d5def0", "fill-opacity": 0 }, svg); });
    const b = ball(svg), seq = [2, 5, 0, 3, 1, 4];
    return t => {
      const P = 2.6, n = Math.floor(t / P), p = (t / P) % 1, k = seq[n % seq.length];
      nodes.forEach((o, i) => {
        const a = o.a + o.w * t, x = C + o.r * Math.cos(a), y = C + o.r * Math.sin(a);
        o.x = x; o.y = y; set(o.c, { cx: x, cy: y, "fill-opacity": 0 });
      });
      const o = nodes[k], d = out(sm(0, .3, p)), fade = 1 - sm(.75, 1, p);
      set(link, { x1: C, y1: C, x2: lerp(C, o.x, d), y2: lerp(C, o.y, d), "stroke-opacity": .55 * fade });
      set(o.c, { "fill-opacity": .9 * sm(.25, .32, p) * fade });
      set(b, { r: B * (1 + .14 * env(p, .26, .32, .4, .7)) });
    };
  };

  S["02b"] = svg => { // Follow the org chart
    const RY = 200, X1 = [180, 300, 420];
    const e1 = X1.map(x => pathOn(svg, `M${C} ${RY + B}V260H${x}V313`));
    const e2 = X1.map(x => [x - 40, x + 40].map(cx => pathOn(svg, `M${x} 327V375H${cx}V423`)));
    const n1 = X1.map(x => el("circle", { cx: x, cy: 320, r: 7, class: "ln", "stroke-opacity": 0 }, svg));
    const n2 = X1.map(x => [x - 40, x + 40].map(cx => el("circle", { cx, cy: 430, r: 7, class: "ln", "stroke-opacity": 0 }, svg)));
    const b = ball(svg, { cy: RY });
    return t => {
      const P = 8, n = Math.floor(t / P), p = (t / P) % 1;
      const i1 = Math.floor(hash(n) * 3), i2 = Math.floor(hash(n + 50) * 2);
      const dim = sm(.32, .42, p), all = 1 - sm(.84, .95, p);
      X1.forEach((x, i) => {
        const on = i === i1;
        drawTo(e1[i], out(sm(.02, .14, p))); set(e1[i], { "stroke-opacity": (on ? .55 : lerp(.45, .08, dim)) * all });
        set(n1[i], { "stroke-opacity": sm(.1, .16, p) * (on ? .55 : lerp(.45, .08, dim)) * all });
        [0, 1].forEach(j => {
          const on2 = on && j === i2;
          drawTo(e2[i][j], out(sm(.12, .26, p))); set(e2[i][j], { "stroke-opacity": (on2 ? .55 : lerp(.45, .08, dim)) * all });
          set(n2[i][j], { "stroke-opacity": sm(.24, .3, p) * (on2 ? .55 : lerp(.45, .08, dim)) * all });
        });
      });
      const x1 = X1[i1], x2 = x1 + (i2 ? 40 : -40);
      const pts = [[C, RY], [C, 260], [x1, 260], [x1, 320], [x1, 375], [x2, 375], [x2, 430]];
      const s = io(sm(.36, .62, p)) * (1 - io(sm(.84, .97, p)));
      const [x, y] = along(pts, s);
      set(b, { cx: x, cy: y, r: B * (1 + .16 * env(p, .6, .64, .66, .8)) });
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

  S["02d"] = svg => { // Radar
    [100, 180, 260].forEach(r => el("circle", { cx: C, cy: C, r, class: "gd" }, svg));
    const R = rng(23);
    const nodes = Array.from({ length: 9 }, () => { const a = R() * TAU, r = 90 + R() * 165; return { a, x: C + r * Math.cos(a), y: C + r * Math.sin(a) }; });
    const link = ln(svg, {}, 0);
    const trail = Array.from({ length: 16 }, () => ln(svg, {}, 0));
    nodes.forEach((o, i) => { o.c = el("circle", { cx: o.x, cy: o.y, r: 6, class: "ln", fill: "#d5def0", "fill-opacity": 0 }, svg); });
    const b = ball(svg);
    return t => {
      const a = t * TAU / 5;
      trail.forEach((l, j) => {
        const aa = a - j * .035;
        set(l, { x1: C + 24 * Math.cos(aa), y1: C + 24 * Math.sin(aa), x2: C + 270 * Math.cos(aa), y2: C + 270 * Math.sin(aa), "stroke-opacity": (j ? .22 : .55) * Math.pow(1 - j / 16, 2) });
      });
      let decider = 0;
      nodes.forEach((o, i) => {
        const diff = ((a - o.a) % TAU + TAU) % TAU, lit = Math.exp(-diff * 1.4);
        set(o.c, { "stroke-opacity": .18 + .6 * lit, "fill-opacity": i === 0 ? .9 * lit : 0 });
        if (i === 0) decider = lit;
      });
      const o = nodes[0];
      set(link, { x1: C, y1: C, x2: o.x, y2: o.y, "stroke-opacity": .5 * decider });
      set(b, { r: B * (1 + .14 * decider) });
    };
  };

  /* ═════════ 03 · Follow the data to its source ═════════ */
  S["03a"] = svg => { // Upstream
    const streams = [-2.6, -.5, 1.5].map((al, i) => {
      const pts = [];
      for (let k = 0; k <= 60; k++) { const s = k / 60, r = lerp(300, B + 2, s), a = al + .9 * Math.sin(s * 3.6 + i * 2) * (1 - s); pts.push([C + r * Math.cos(a), C + r * Math.sin(a)]); }
      const d = poly(pts);
      el("path", { d, class: "gd", style: "stroke-opacity:.13" }, svg);
      const [bx, by] = pts[24], ba = Math.atan2(by - C, bx - C) + .7, tr = [];
      for (let k = 0; k <= 20; k++) { const s = k / 20; tr.push([bx + s * 110 * Math.cos(ba + .4 * Math.sin(s * 3)), by + s * 110 * Math.sin(ba + .4 * Math.sin(s * 3))]); }
      el("path", { d: poly(tr), class: "gd" }, svg);
      return el("path", { d, class: "ln", pathLength: 1, "stroke-dasharray": ".1 3", "stroke-opacity": 0 }, svg);
    });
    const b = ball(svg);
    return t => {
      let pulse = 0;
      streams.forEach((s, i) => {
        const q = ((t + i * 1.5) / 4.5) % 1, start = lerp(-.1, 1, Math.pow(sm(0, .8, q), 1.2));
        set(s, { "stroke-dashoffset": -start, "stroke-opacity": .6 * sm(0, .08, q) });
        pulse = Math.max(pulse, env(q, .7, .8, .82, .96));
      });
      set(b, { r: B * (1 + .16 * pulse) });
    };
  };

  S["03b"] = svg => { // Roots
    const R = rng(5), segs = [], leaves = [];
    const grow = (x, y, a, len, d, chain) => {
      const x2 = x + len * Math.cos(a), y2 = y + len * Math.sin(a);
      segs.push({ p: pathOn(svg, `M${f2(x)} ${f2(y)}L${f2(x2)} ${f2(y2)}`, .5 - d * .1), d });
      const ch = [[x2, y2]].concat(chain);
      if (d === 2) { leaves.push({ pts: ch }); return; }
      grow(x2, y2, a - .3 - R() * .3, len * .68, d + 1, ch);
      grow(x2, y2, a + .3 + R() * .3, len * .68, d + 1, ch);
    };
    for (let i = 0; i < 5; i++) { const a = i / 5 * TAU + (R() - .5) * .5 - Math.PI / 2, sx = C + (B + 4) * Math.cos(a), sy = C + (B + 4) * Math.sin(a); grow(sx, sy, a, 82, 0, [[sx, sy], [C, C]]); }
    leaves.forEach((l, i) => { l.dot = el("circle", { cx: l.pts[0][0], cy: l.pts[0][1], r: 3, class: "dot", opacity: 0 }, svg); l.pulse = el("circle", { r: 2.5, class: "dot", opacity: 0 }, svg); l.k = i; });
    const b = ball(svg);
    return t => {
      const p = (t / 8) % 1;
      segs.forEach(s => drawTo(s.p, out(sm(.04 + s.d * .12, .16 + s.d * .12, p)) * (1 - sm(.8 + (2 - s.d) * .04, .88 + (2 - s.d) * .04, p))));
      leaves.forEach(l => {
        set(l.dot, { opacity: .7 * sm(.4, .45, p) * (1 - sm(.78, .82, p)) });
        const a = .48 + l.k * .008, q = sm(a, a + .2, p), [x, y] = along(l.pts, q);
        set(l.pulse, { cx: x, cy: y, opacity: q > 0 && q < 1 ? .8 : 0 });
      });
      set(b, { r: B * (1 + .18 * env(p, .62, .7, .72, .86)) });
    };
  };

  S["03c"] = svg => { // Pull the thread
    const strands = [{ x0: 20, sg: 1, w: 38, ph: .4, w2: 23 }, { x0: 580, sg: -1, w: 33, ph: 2.1, w2: 19 }].map(s => Object.assign(s, { n: el("path", { class: "ln", "stroke-opacity": .45 }, svg) }));
    const b = ball(svg);
    return t => {
      const p = (t / 7) % 1, k = 1 - io(env(p, .25, .5, .82, 1));
      strands.forEach(s => {
        const pts = [], end = C - s.sg * (B + 2);
        for (let i = 0; i <= 200; i++) {
          const u = i / 200, R = 46 * Math.pow(Math.sin(Math.PI * Math.min(1, u * 1.15)), .7) * k;
          const ang = s.w * u + s.ph + t * .25;
          const x = lerp(s.x0, end, u) + s.sg * R * (Math.cos(ang) - Math.cos(s.ph + t * .25));
          const y = C + R * Math.sin(ang) + R * .5 * Math.sin(s.w2 * u + t * .4);
          pts.push([x, y]);
        }
        set(s.n, { d: poly(pts) });
      });
      set(b, { r: B * (1 + .16 * env(p, .45, .52, .6, .8)) });
    };
  };

  S["03d"] = svg => { // Breadcrumbs
    const N = 28, dots = Array.from({ length: N }, (_, j) => {
      const s = j / (N - 1), r = lerp(272, 34, s), a = -2.2 + s * TAU * 1.25;
      return { s, c: el("circle", { cx: C + r * Math.cos(a), cy: C + r * Math.sin(a), r: 3.2, class: "dot", opacity: 0 }, svg) };
    });
    const b = ball(svg);
    return t => {
      const p = (t / 6) % 1, h = lerp(-.05, 1.3, p);
      dots.forEach(d => set(d.c, { opacity: d.s <= h ? .75 * Math.exp(-(h - d.s) * 3.2) : 0 }));
      set(b, { r: B * (1 + .16 * env(h, .98, 1.03, 1.06, 1.25)) });
    };
  };

  /* ═════════ 04 · Agree on what matters ═════════ */
  S["04a"] = svg => { // Iron filings
    const R = rng(17), ns = [];
    for (let gx = -6; gx <= 6; gx++) for (let gy = -6; gy <= 6; gy++) {
      const x = C + gx * 44 + (gy % 2 ? 22 : 0), y = C + gy * 40, d = Math.hypot(x - C, y - C);
      if (d < 54 || d > 272) continue;
      ns.push({ x, y, d, a0: R() * Math.PI, a1: Math.atan2(y - C, x - C), n: ln(svg, {}, .4) });
    }
    const b = ball(svg);
    return t => {
      const p = (t / 7) % 1;
      ns.forEach(o => {
        const st = .1 + o.d / 272 * .22, k = io(env(p, st, st + .2, .74 + o.d / 272 * .1, .9 + o.d / 272 * .08));
        let da = ((o.a1 - o.a0) % Math.PI + Math.PI * 1.5) % Math.PI - Math.PI / 2;
        const a = o.a0 + da * k + .06 * Math.sin(t * 2 + o.x) * (1 - k);
        set(o.n, { x1: o.x - 8 * Math.cos(a), y1: o.y - 8 * Math.sin(a), x2: o.x + 8 * Math.cos(a), y2: o.y + 8 * Math.sin(a), "stroke-opacity": .3 + .2 * k });
      });
      set(b, { r: B * (1 + .16 * env(p, .5, .58, .66, .82)) });
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

  S["04c"] = svg => { // Pendulums in sync
    const R = rng(29), top = 70, L = 230;
    ln(svg, { x1: 110, x2: 490, y1: top, y2: top }, .2);
    const pend = Array.from({ length: 7 }, (_, i) => {
      const x = C + (i - 3) * 56;
      return { x, ph: (i - 3) * 1.1 + R() * 1.5, s: ln(svg, {}, .28), bob: i === 3 ? ball(svg) : el("circle", { r: 7, class: "dot", opacity: .7 }, svg), me: i === 3 };
    });
    return t => {
      const p = (t / 12) % 1, k = io(env(p, .08, .45, .75, .97));
      pend.forEach(o => {
        const th = .22 * Math.sin(t * 2.2 + o.ph * (1 - k)), bx = o.x + L * Math.sin(th), by = top + L * Math.cos(th);
        set(o.s, { x1: o.x, y1: top, x2: bx, y2: by });
        set(o.bob, { cx: bx, cy: by });
      });
    };
  };

  S["04d"] = svg => { // The scales
    const beam = ln(svg, {}, .5);
    el("path", { d: `M${C} 334L${C - 22} 372H${C + 22}Z`, class: "ln", "stroke-opacity": .35 }, svg);
    const sL = [ln(svg, {}, .3), ln(svg, {}, .3)], sR = [ln(svg, {}, .3), ln(svg, {}, .3)];
    const pL = ln(svg, {}, .5), pR = ln(svg, {}, .5);
    const ROWS = [[-21, -7, 7, 21], [-14, 0, 14], [-7, 7]].flatMap((r, row) => r.map(ox => ({ ox, row })));
    const dots = ROWS.map((d, j) => Object.assign(d, { j, c: el("circle", { r: 6, class: "dot", opacity: 0 }, svg) }));
    const b = ball(svg);
    return t => {
      const p = (t / 10) % 1;
      let n = 0;
      dots.forEach(d => { d.arr = .14 + d.j * .065; d.q = sm(d.arr - .1, d.arr, p); n += sm(d.arr - .02, d.arr + .06, p); });
      const th = .2 * (10 - n) / 10, c = Math.cos(th), s = Math.sin(th);
      const lx = C - 170 * c, ly = 330 + 170 * s, rx = C + 170 * c, ry = 330 - 170 * s;
      set(beam, { x1: lx, y1: ly, x2: rx, y2: ry });
      const pyL = ly + 64, pyR = ry + 64;
      set(sL[0], { x1: lx, y1: ly, x2: lx - 30, y2: pyL }); set(sL[1], { x1: lx, y1: ly, x2: lx + 30, y2: pyL });
      set(sR[0], { x1: rx, y1: ry, x2: rx - 34, y2: pyR }); set(sR[1], { x1: rx, y1: ry, x2: rx + 34, y2: pyR });
      set(pL, { x1: lx - 36, x2: lx + 36, y1: pyL, y2: pyL }); set(pR, { x1: rx - 40, x2: rx + 40, y1: pyR, y2: pyR });
      const fade = 1 - sm(.86, .95, p);
      dots.forEach(d => { const ty = pyR - 7 - d.row * 12; set(d.c, { cx: rx + d.ox, cy: ty - 220 * Math.pow(1 - d.q, 2), opacity: d.q > 0 ? .75 * fade : 0 }); });
      set(b, { cx: lx, cy: pyL - B - 1 });
    };
  };

  /* ═════════ 05 · Design around decisions ═════════ */
  S["05a"] = svg => { // Snap into place
    const R = rng(41);
    const fin = [[230, 150, 140, 80], [230, 370, 140, 80], [120, 230, 90, 140], [390, 230, 90, 140], [120, 140, 90, 70], [390, 390, 90, 70]];
    const ps = fin.map(f => ({ f, s: [40 + R() * 420, 40 + R() * 420, f[2] * (.7 + R() * .5), f[3] * (.7 + R() * .5)], rot: (R() - .5) * 70,
      g: el("g", {}, svg) }));
    ps.forEach(o => { o.r = el("rect", { rx: 6, class: "ln", "stroke-opacity": .42 }, o.g); o.l = ln(o.g, {}, .3); });
    const b = ball(svg);
    return t => {
      const p = (t / 7) % 1;
      ps.forEach((o, i) => {
        const k = io(env(p, .12 + i * .03, .36 + i * .03, .76, .96));
        const w = lerp(o.s[2], o.f[2], k), h = lerp(o.s[3], o.f[3], k);
        const cx = lerp(o.s[0] + o.s[2] / 2, o.f[0] + o.f[2] / 2, k) + (1 - k) * 8 * Math.sin(t * .7 + i);
        const cy = lerp(o.s[1] + o.s[3] / 2, o.f[1] + o.f[3] / 2, k) + (1 - k) * 8 * Math.cos(t * .6 + i);
        set(o.g, { transform: `translate(${f2(cx)} ${f2(cy)}) rotate(${f2(o.rot * (1 - k))})` });
        set(o.r, { x: -w / 2, y: -h / 2, width: w, height: h });
        set(o.l, { x1: -w / 2 + 12, y1: -h / 2 + 14, x2: -w / 2 + 12 + Math.min(50, w * .4), y2: -h / 2 + 14 });
      });
      set(b, { r: B * (1 + .16 * env(p, .5, .56, .6, .76)) });
    };
  };

  S["05b"] = svg => { // The fork
    const inc = pathOn(svg, `M40 ${C}H${C - B - 2}`, .5);
    const ys = [150, 300, 450];
    const br = ys.map(y => pathOn(svg, `M${C + B + 2} ${C}C400 ${C} 430 ${y} 560 ${y}`, .45));
    const b = ball(svg);
    return t => {
      const P = 7, n = Math.floor(t / P), p = (t / P) % 1, pick = Math.floor(hash(n + 7) * 3), all = 1 - sm(.86, .97, p);
      drawTo(inc, io(sm(0, .22, p))); set(inc, { "stroke-opacity": .5 * all });
      br.forEach((e, i) => {
        drawTo(e, out(sm(.3, .5, p)));
        set(e, { "stroke-opacity": (i === pick ? .6 : lerp(.45, .06, sm(.55, .68, p))) * all });
      });
      set(b, { r: B * (1 + .16 * env(p, .2, .25, .3, .45) + .12 * env(p, .55, .62, .66, .8)) });
    };
  };

  S["05c"] = svg => { // Gravity well
    const g = el("g", { mask: radialMask(svg, 120, 270) }, svg);
    const lines = [];
    for (let v = 60; v <= 540; v += 40) { lines.push({ v, h: true, n: el("path", { class: "ln", "stroke-opacity": .28 }, g) }); lines.push({ v, h: false, n: el("path", { class: "ln", "stroke-opacity": .28 }, g) }); }
    const b = ball(svg);
    return t => {
      const S0 = .55 + .35 * (.5 + .5 * Math.sin(t * TAU / 6));
      lines.forEach(o => {
        const pts = [];
        for (let u = 40; u <= 560; u += 10) {
          const x = o.h ? u : o.v, y = o.h ? o.v : u, dx = x - C, dy = y - C, r = Math.hypot(dx, dy);
          const pull = S0 * .55 * Math.exp(-Math.pow(r / 150, 2));
          pts.push([x - dx * pull, y - dy * pull]);
        }
        set(o.n, { d: poly(pts) });
      });
      set(b, { r: B * (.9 + .25 * S0) });
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

  /* ═════════ 06 · Test before you build ═════════ */
  S["06a"] = svg => { // Blueprint first
    ln(svg, { x1: C - 70, x2: C + 70, y1: C, y2: C, "stroke-dasharray": "3 5" }, .2);
    ln(svg, { x1: C, x2: C, y1: C - 70, y2: C + 70, "stroke-dasharray": "3 5" }, .2);
    const dim = ln(svg, {}, .4), tL = ln(svg, {}, .4), tR = ln(svg, {}, .4);
    const b = ball(svg);
    const ghost = el("circle", { class: "ghost" }, svg);
    const K = [[0, 300, 300, 46], [.14, 322, 286, 26], [.28, 290, 310, 11], [.42, 300, 300, 16]];
    return t => {
      const p = (t / 7) % 1;
      let st = K[0];
      for (let i = 1; i < K.length; i++) if (p >= K[i - 1][0]) { const k = io(sm(K[i - 1][0], K[i][0], p)); st = [0, ...[1, 2, 3].map(j => lerp(K[i - 1][j], K[i][j], k))]; }
      const [, cx, cy, r] = st, ghostOp = 1 - sm(.66, .74, p);
      set(ghost, { cx, cy, r, opacity: ghostOp * sm(0, .05, p) });
      const dy = cy + r + 16;
      set(dim, { x1: cx - r, x2: cx + r, y1: dy, y2: dy, "stroke-opacity": .4 * ghostOp });
      set(tL, { x1: cx - r, x2: cx - r, y1: dy - 5, y2: dy + 5, "stroke-opacity": .4 * ghostOp });
      set(tR, { x1: cx + r, x2: cx + r, y1: dy - 5, y2: dy + 5, "stroke-opacity": .4 * ghostOp });
      const fill = backOut(sm(.5, .64, p)) * (1 - sm(.9, .98, p));
      set(b, { r: Math.max(0, B * fill) });
    };
  };

  S["06b"] = svg => { // The bounce test
    const plank = el("path", { class: "ln", "stroke-opacity": .5 }, svg);
    const b = el("ellipse", { cx: C, rx: B, ry: B, class: "ball" }, svg);
    const G = 2400, Y0 = 150, REST = 400 - B, e = .55;
    return t => {
      const P = 5.5, ls = t % P - .3;
      let y = Y0, impactAge = 99, strength = 0, op = 1 - sm(P - .9, P - .5, ls + .3);
      if (ls > 0) {
        const t0 = Math.sqrt(2 * (REST - Y0) / G);
        if (ls < t0) y = Y0 + .5 * G * ls * ls;
        else {
          let v = G * t0 * e, tt = ls - t0, s = 1;
          impactAge = tt; strength = 1; y = REST;
          while (v > 40) {
            const dur = 2 * v / G;
            if (tt < dur) { y = REST - (v * tt - .5 * G * tt * tt); break; }
            tt -= dur; v *= e; s *= e; impactAge = tt; strength = s;
          }
        }
      } else op *= sm(-.3, 0, ls);
      const flex = 16 * strength * Math.exp(-impactAge * 7) * Math.cos(impactAge * 28);
      set(plank, { d: `M180 400Q${C} ${f2(400 + flex * 2)} 420 400` });
      const sq = strength * Math.exp(-impactAge * 22) * .3;
      set(b, { cy: y + B * sq + Math.max(0, flex) * (y >= REST - 1 ? 1 : 0), rx: B * (1 + sq), ry: B * (1 - sq), opacity: op });
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

  S["06d"] = svg => { // Stress test
    const pl = ln(svg, {}, .5), pr = ln(svg, {}, .5);
    const b = el("ellipse", { cx: C, cy: C, rx: B, ry: B, class: "ball" }, svg);
    const tick = pathOn(svg, `M${C + 36} ${C - 34}l9 9l18 -20`, .6);
    return t => {
      const p = (t / 6) % 1, q = Math.max(io(env(p, .08, .2, .24, .34)), io(env(p, .38, .5, .54, .64)));
      const hd = lerp(B + 64, B * .62, q), rx = Math.min(B, hd), ry = B * B / rx;
      set(pl, { x1: C - hd - 1, x2: C - hd - 1, y1: C - 44, y2: C + 44, "stroke-opacity": .5 * (1 - sm(.7, .78, p)) * sm(0, .06, p) });
      set(pr, { x1: C + hd + 1, x2: C + hd + 1, y1: C - 44, y2: C + 44, "stroke-opacity": .5 * (1 - sm(.7, .78, p)) * sm(0, .06, p) });
      set(b, { rx, ry });
      drawTo(tick, out(sm(.72, .82, p)) * (1 - sm(.92, .99, p)));
    };
  };

  /* ═════════ 07 · Where to start ═════════ */
  S["07a"] = svg => { // You are here
    const dots = [];
    for (let x = 30; x <= 570; x += 30) for (let y = 30; y <= 570; y += 30) { const d = Math.hypot(x - C, y - C); if (d > 20 && d < 280) dots.push({ d, c: el("circle", { cx: x, cy: y, r: 1.6, class: "dot", opacity: .12 }, svg) }); }
    const h = ln(svg, {}, 0), v = ln(svg, {}, 0);
    const ring = el("circle", { cx: C, cy: C, class: "ln", "stroke-opacity": 0 }, svg);
    const b = ball(svg);
    return t => {
      const p = (t / 6) % 1, q = sm(0, .16, p), all = 1 - sm(.86, .97, p);
      const s = lerp(3, 1, out(q));
      set(b, { r: B * s * (1 + .12 * env(p, .15, .18, .2, .32)), opacity: q * all });
      const rr = lerp(B, 300, out(sm(.16, .6, p)));
      set(ring, { r: rr, "stroke-opacity": .4 * (1 - sm(.16, .6, p)) * sm(.15, .17, p) });
      dots.forEach(o => set(o.c, { opacity: (.12 + .55 * Math.exp(-Math.pow((o.d - rr) / 16, 2)) * sm(.15, .17, p) * (1 - sm(.5, .6, p))) * lerp(.4, 1, all) }));
      const L = 270 * out(sm(.2, .45, p));
      set(h, { x1: C - L, x2: C + L, y1: C, y2: C, "stroke-opacity": .2 * all, "stroke-dasharray": "2 6" });
      set(v, { x1: C, x2: C, y1: C - L, y2: C + L, "stroke-opacity": .2 * all, "stroke-dasharray": "2 6" });
    };
  };

  S["07b"] = svg => { // One step at a time
    const g = el("g", { mask: radialMask(svg, 90, 280) }, svg);
    const past = ln(g, {}, .4);
    const dashes = Array.from({ length: 14 }, () => ln(g, {}, 0));
    const b = el("ellipse", { cx: C, rx: B, ry: B, class: "ball" }, svg);
    const STEP = 30, GY = C + B, HOP = .85;
    return t => {
      const n = Math.floor(t / HOP), h = (t / HOP) % 1, mv = io(sm(.1, .8, h)), off = (n + mv) * STEP;
      set(past, { x1: 20, x2: C, y1: GY, y2: GY });
      dashes.forEach((d, i) => {
        const k = i + Math.floor(off / STEP), x = C + k * STEP - off + 8;
        const ahead = (x - C) / STEP;
        set(d, { x1: x, x2: x + 12, y1: GY, y2: GY, "stroke-opacity": .5 * clamp(1.4 - ahead * .28, 0, 1) * sm(-.2, .6, ahead) });
      });
      const hop = Math.sin(Math.PI * sm(.1, .8, h)), land = env(h, .78, .84, .86, .98);
      set(b, { cy: C - 26 * hop + B * .14 * land, rx: B * (1 + .14 * land), ry: B * (1 - .14 * land) });
    };
  };

  S["07c"] = svg => { // Ready, set
    const startLine = ln(svg, { x1: C + B + 8, x2: C + B + 8, y1: C - 54, y2: C + 54 }, .4);
    const ticks = [-20, 0, 20].map(dx => ln(svg, { x1: C + dx, x2: C + dx, y1: C - 64, y2: C - 50 }, 0));
    const trail = ln(svg, {}, 0);
    const b = ball(svg);
    return t => {
      const p = (t / 6) % 1;
      ticks.forEach((tk, i) => set(tk, { "stroke-opacity": .6 * env(p, .08 + i * .1, .1 + i * .1, .38, .44) }));
      const go = Math.pow(sm(.42, .56, p), 2.2), back = out(sm(.6, .86, p));
      let x = C;
      if (p >= .42 && p < .58) x = lerp(C, 720, go);
      else if (p >= .58) x = lerp(-120, C, back);
      const crouch = env(p, .32, .4, .41, .44);
      set(b, { cx: x - 6 * crouch });
      set(trail, { x1: p < .58 ? C : -120, x2: x - B, y1: C, y2: C, "stroke-opacity": (p > .42 && p < .58 ? .45 : .45 * (1 - sm(.6, .8, p))) * (p > .42 ? 1 : 0) });
      set(startLine, { "stroke-opacity": .4 * (1 - .6 * env(p, .44, .5, .8, .9)) });
    };
  };

  S["07d"] = svg => { // First domino
    const GY = C + B;
    ln(svg, { x1: 60, x2: 560, y1: GY, y2: GY }, .15);
    const dom = Array.from({ length: 8 }, (_, j) => { const x = C + B + 3 + j * 26; return { x, j, n: ln(svg, { x1: x, x2: x, y1: GY, y2: GY - 66 }, .5) }; });
    const b = ball(svg);
    return t => {
      const p = (t / 6.5) % 1, all = 1 - sm(.86, .95, p), back = sm(.95, 1, p);
      dom.forEach(d => {
        const t0 = .3 + d.j * .045, last = d.j === dom.length - 1, a = (last ? 90 : 68) * io(sm(t0, t0 + .07, p)) * (p < .95 ? 1 : 0);
        set(d.n, { transform: `rotate(${f2(a)} ${d.x} ${GY})`, "stroke-opacity": .5 * (p < .95 ? all : back) });
      });
      const x = lerp(60, C, out(sm(.04, .3, p)));
      set(b, { cx: x, opacity: sm(0, .05, p) * all });
    };
  };

  /* ═════════ 07 · Where to start, round two ═════════ */
  S["07e"] = svg => { // Find your bearing
    const tail = ln(svg, {}, .3), needle = ln(svg, {}, .6);
    const route = pathOn(svg, `M0 0`, .45);
    const b = ball(svg);
    return t => {
      const P = 6, n = Math.floor(t / P), p = (t / P) % 1, target = hash(n + 3) * TAU;
      const settle = out(sm(0, .42, p));
      const w = p > .36 ? .3 * Math.exp(-(p - .36) * 16) * Math.sin((p - .36) * 70) : 0;
      const a = target - (1 - settle) * TAU * 2.2 + w, c = Math.cos(a), s = Math.sin(a);
      set(needle, { x1: C, y1: C, x2: C + 110 * c, y2: C + 110 * s });
      set(tail, { x1: C, y1: C, x2: C - 28 * c, y2: C - 28 * s });
      const tc = Math.cos(target), ts = Math.sin(target);
      set(route, { d: `M${f2(C + 122 * tc)} ${f2(C + 122 * ts)}L${f2(C + 292 * tc)} ${f2(C + 292 * ts)}` });
      drawTo(route, out(sm(.56, .74, p)) * (1 - sm(.88, .98, p)));
      set(b, { r: B * (1 + .16 * env(p, .5, .56, .6, .76)) });
    };
  };

  S["07f"] = svg => { // Making waves
    const g = el("g", { mask: radialMask(svg, 170, 290) }, svg);
    const rows = Array.from({ length: 9 }, (_, i) => ({ y: C + (i - 4) * 30, n: el("path", { class: "ln", "stroke-opacity": .35 }, g) }));
    const b = ball(svg);
    return t => {
      const P = 4.5, p = (t / P) % 1, q = sm(.1, .92, p), R = lerp(B, 340, out(q)), A = 24 * (1 - q);
      rows.forEach(o => {
        const pts = [], dy = o.y - C;
        for (let x = 20; x <= 580; x += 8) {
          const dx = x - C, r = Math.hypot(dx, dy), w = A * Math.exp(-Math.pow((r - R) / 28, 2));
          pts.push([x, o.y + (dy ? Math.sign(dy) * w : w * Math.sin(dx / 9))]);
        }
        set(o.n, { d: poly(pts) });
      });
      set(b, { r: B * (1 - .14 * env(p, 0, .05, .08, .14) + .16 * env(p, .08, .12, .14, .3)) });
    };
  };

  S["07g"] = svg => { // Spiral out
    const pts = [];
    for (let i = 0; i <= 360; i++) { const s = i / 360, th = s * 3.2 * TAU - Math.PI / 2, r = B + 8 + 262 * s; pts.push([C + r * Math.cos(th), C + r * Math.sin(th)]); }
    const sp = pathOn(svg, poly(pts), .45);
    const head = el("circle", { r: 3.2, class: "dot", opacity: 0 }, svg);
    const b = ball(svg);
    return t => {
      const p = (t / 7) % 1, f = io(sm(.06, .76, p)), fade = 1 - sm(.82, .97, p);
      drawTo(sp, f); set(sp, { "stroke-opacity": .45 * fade });
      const [x, y] = along(pts, f);
      set(head, { cx: x, cy: y, opacity: f > 0 && f < 1 ? .85 : 0 });
      set(b, { r: B * (1 + .16 * env(p, 0, .05, .07, .2)) });
    };
  };

  /* ═════════ Trail: the radar echo, as a brand motif ═════════
     Each option is drawn again a few times, slightly in the past, underneath itself.
     Echo copies of anything that isn't moving are hidden, so still lines don't get brighter. */
  const LAG = { "01": .035, "02c": .035, "03b": .04, "03d": .06, "04b": .06, "05d": .035, "06a": .04, "06c": .03, "07d": .03, "07e": .028, "07f": .035, "07g": .03 };
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

  window.HeroScenes = S;
})();
