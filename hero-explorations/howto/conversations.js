/* Where to start · Start this month, card 1: "Have a handful of honest conversations across functions."
   The Ask bubble (a1) kept exactly as it was, plus a second bubble mirrored to the left at the same spacing.
   The two take turns: the left one runs half a loop behind the right one, so they come in and go out at different times.
   Loads after ../chapters/scenes.js; HeroMount adds the trail. */
(() => {
  const NS = "http://www.w3.org/2000/svg", C = 300, B = 16, TAU = Math.PI * 2;
  const set = (e, a) => { for (const k in a) e.setAttribute(k, a[k]); return e; };
  const el = (tag, a, p) => { const e = set(document.createElementNS(NS, tag), a || {}); if (p) p.appendChild(e); return e; };
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const sm = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const env = (p, a, b, c, d) => sm(a, b, p) * (1 - sm(c, d, p));
  const io = p => p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
  const backOut = p => { const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2); };
  const f2 = n => Math.round(n * 100) / 100, f4 = n => Math.round(n * 1e4) / 1e4;
  const poly = pts => pts.map((p, i) => (i ? "L" : "M") + f2(p[0]) + " " + f2(p[1])).join("");
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
  const dash = (e, s0, s1) => { s0 = clamp(s0, 0, 1); s1 = clamp(s1, 0, 1); set(e, { "stroke-dasharray": `${f4(Math.max(s1 - s0, 0))} 3`, "stroke-dashoffset": f4(-s0), visibility: s1 - s0 < .002 ? "hidden" : "visible" }); };
  let uid = 0;
  const glow = svg => {
    const id = "cv" + (uid++), g = el("radialGradient", { id }, el("defs", {}, svg));
    [[0, .55], [.35, .22], [1, 0]].forEach(([o, a]) => el("stop", { offset: o, "stop-color": "#ff0074", "stop-opacity": a }, g));
    return el("circle", { cx: C, cy: C, r: 42, fill: `url(#${id})`, opacity: 0, class: "glow" }, svg);
  };
  const breathe = (b, g, p) => { p = clamp(p, 0, 1); set(b, { r: f2(B * (1 + .16 * p)) }); set(g, { opacity: f2(.4 * p), r: f2(B * (2.6 + .8 * p)) }); };
  const land = s => s > 0 ? Math.exp(-s * 2.9) : sm(-.5, 0, s);

  const P = 7.5; // the Ask bubble's loop, unchanged

  /* One Ask bubble, exactly as in a1. mirror: flipped to the left of the ball. off: how far into the loop it starts.
     Returns draw(t) → the ball's pulse from its dots arriving. */
  const voice = (svg, mirror, off) => {
    const X = x => mirror ? 2 * C - x : x;
    const cx = 408, cy = 196, rx = 76, ry = 52, tip = [334, 266], th1 = 2.02, th2 = 2.5;
    const E = th => [cx + rx * Math.cos(th), cy + ry * Math.sin(th)];
    const pts = [tip, E(th1)];
    for (let i = 1; i <= 64; i++) pts.push(E(th1 - i / 64 * (TAU - (th2 - th1))));
    pts.push(tip);
    const M = p => [X(p[0]), p[1]];
    const bubble = el("path", { d: poly(pts.map(M)), class: "ln", pathLength: 1, "stroke-opacity": .5 }, svg);
    const mouth = M(E((th1 + th2) / 2)), tipM = M(tip);
    const dots = [384, 408, 432].map(x => ({ x: X(x), e: el("circle", { cx: X(x), cy, r: 0, class: "dot" }, svg) }));
    return t => {
      const tt = t - off * P, p = ((tt / P) % 1 + 1) % 1; let pulse = 0;
      dash(bubble, io(clamp((p - .8) / .12, 0, 1)), io(clamp((p - .02) / .16, 0, 1)));
      const bw = env(p, .22, .25, .44, .48);
      dots.forEach((d, i) => {
        const si = .5 + i * .07, q = clamp((p - si) / .13, 0, 1);
        const y = cy - 9 * bw * Math.pow(Math.max(0, Math.sin(TAU * tt / .8 - i * .9)), 2);
        const xy = q > 0 ? along([[d.x, cy], mouth, tipM, [C, C]], q * q) : [d.x, y];
        set(d.e, { cx: f2(xy[0]), cy: f2(xy[1]), r: f2(4.5 * backOut(clamp((p - .17 - i * .025) / .05, 0, 1)) * (1 - .3 * q)), opacity: q >= 1 ? 0 : .85 });
        pulse = Math.max(pulse, land((p - si - .13) * P));
      });
      return pulse;
    };
  };

  /* c1 · Two voices: the original on the right, its mirror on the left half a loop behind */
  window.HeroScenes.c1 = svg => {
    const g = glow(svg), right = voice(svg, false, 0), left = voice(svg, true, .5);
    const b = el("circle", { cx: C, cy: C, r: B, class: "ball" }, svg);
    return t => breathe(b, g, Math.max(right(t), left(t)));
  };
})();
