/* How to apply it: spot animations for the step cards, in the hero language on a light card.
   Self-contained (no GSAP): window.HowtoScenes.mount(svg, key) returns draw(t), with the trail built in.
   Explorations and alternatives live in hero-explorations/howto.html; these are the picks for Chapter 01.
     m3  Map       · Every layer
     a1  Ask       · The bubble
     e1  Evidence  · The lens
     p1  Patterns  · Orbits fall into step
   Rules: hero-explorations/ANIMATION-RULES.md */
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
  const rng = s => () => (s = (s * 16807) % 2147483647, (s - 1) / 2147483646);
  const hash = n => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  const f2 = n => Math.round(n * 100) / 100;
  const f4 = n => Math.round(n * 1e4) / 1e4;
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
  const ball = svg => el("circle", { cx: C, cy: C, r: B, class: "ball" }, svg);
  const ln = (svg, a, op) => el("line", Object.assign({ class: "ln", "stroke-opacity": op == null ? .45 : op }, a), svg);
  const pathOn = (svg, d, op) => el("path", { d, class: "ln", pathLength: 1, "stroke-dasharray": "1 1", "stroke-dashoffset": 1, "stroke-opacity": op == null ? .45 : op }, svg);
  const drawTo = (e, f) => set(e, { "stroke-dashoffset": 1 - f, visibility: f < .002 ? "hidden" : "visible" });
  const dash = (e, s0, s1) => { s0 = clamp(s0, 0, 1); s1 = clamp(s1, 0, 1); set(e, { "stroke-dasharray": `${f4(Math.max(s1 - s0, 0))} 3`, "stroke-dashoffset": f4(-s0), visibility: s1 - s0 < .002 ? "hidden" : "visible" }); };
  const op = (e, o) => set(e, { "stroke-opacity": f2(o) });
  const seg2 = (e, a, b, o) => set(e, { x1: f2(a[0]), y1: f2(a[1]), x2: f2(b[0]), y2: f2(b[1]), "stroke-opacity": f2(o) });
  const polar = (a, r) => [C + r * Math.cos(a), C + r * Math.sin(a)];
  const circleD = r => `M${C} ${C - r}A${r} ${r} 0 1 1 ${C} ${C + r}A${r} ${r} 0 1 1 ${C} ${C - r}`;
  let uid = 0;
  const glow = svg => {
    const id = "hw" + (uid++), g = el("radialGradient", { id }, el("defs", {}, svg));
    [[0, .55], [.35, .22], [1, 0]].forEach(([o, a]) => el("stop", { offset: o, "stop-color": "#ff0074", "stop-opacity": a }, g));
    return el("circle", { cx: C, cy: C, r: 42, fill: `url(#${id})`, opacity: 0, class: "glow" }, svg);
  };
  const breathe = (b, g, p) => { p = clamp(p, 0, 1); set(b, { r: f2(B * (1 + .16 * p)) }); set(g, { opacity: f2(.4 * p), r: f2(B * (2.6 + .8 * p)) }); };
  const land = s => s > 0 ? Math.exp(-s * 2.9) : sm(-.5, 0, s);   // breath around an arrival, s in seconds

  const S = {};

  S.m3 = svg => { // Map · Every layer: leadership, managers, the front line
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

  S.a1 = svg => { // Ask · The bubble: they talk, it comes home
    const P = 7.5, g = glow(svg), cx = 408, cy = 196, rx = 76, ry = 52, tip = [334, 266], th1 = 2.02, th2 = 2.5;
    const E = th => [cx + rx * Math.cos(th), cy + ry * Math.sin(th)];
    const pts = [tip, E(th1)];
    for (let i = 1; i <= 64; i++) pts.push(E(th1 - i / 64 * (TAU - (th2 - th1))));
    pts.push(tip);
    const bubble = pathOn(svg, poly(pts), .5), mouth = E((th1 + th2) / 2);
    const dots = [384, 408, 432].map(x => ({ x, e: el("circle", { cx: x, cy, r: 0, class: "dot" }, svg) }));
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

  S.e1 = svg => { // Evidence · The lens: looking closely until it finds the ball
    const P = 9, g = glow(svg), grid = [];
    for (let gy = -3; gy <= 3; gy++) for (let gx = -3; gx <= 3; gx++) if (gx || gy) grid.push({ x: C + gx * 50, y: C + gy * 50 });
    grid.forEach(d => { d.e = el("circle", { cx: d.x, cy: d.y, r: 2.4, class: "dot", opacity: .35 }, svg); });
    const lens = el("circle", { cx: C, cy: C, r: 56, class: "ln", "stroke-opacity": 0 }, svg);
    const b = ball(svg), W = [[.08, .2], [.27, .39], [.46, .6]];
    const outer = grid.filter(d => Math.max(Math.abs(d.x - C), Math.abs(d.y - C)) >= 100);
    return t => {
      const n = Math.floor(t / P), p = (t / P) % 1;
      const wp = [0, 1, 2].map(j => outer[Math.floor(hash(n * 7 + j * 13) * outer.length)]).map(d => [d.x, d.y]).concat([[C, C]]);
      let L = wp[0];
      W.forEach(([a, z], j) => { if (p >= a) { const k = io(clamp((p - a) / (z - a), 0, 1)); L = [lerp(wp[j][0], wp[j + 1][0], k), lerp(wp[j][1], wp[j + 1][1], k)]; } });
      const qq = 1 - Math.pow(1 - clamp((p - .62) / .2, 0, 1), 3), on = sm(0, .05, p) * (1 - qq);
      set(lens, { cx: f2(L[0]), cy: f2(L[1]), r: f2(56 + 80 * qq), "stroke-opacity": f2(.55 * on) });
      grid.forEach(d => {
        const m = Math.exp(-Math.pow(Math.hypot(d.x - L[0], d.y - L[1]) / 46, 2)) * on;
        set(d.e, { cx: f2(L[0] + (d.x - L[0]) * (1 + .35 * m)), cy: f2(L[1] + (d.y - L[1]) * (1 + .35 * m)), r: f2(2.4 * (1 + 1.1 * m)), opacity: f2(.35 + .4 * m) });
      });
      breathe(b, g, land((p - .6) * P));
    };
  };

  S.p1 = svg => { // Patterns · Orbits fall into step
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


  /* ── Where to start · Start this month ── */
  const frac = (t, P) => ((t / P) % 1 + 1) % 1;
  const home = q => q * q * (1.6 - .6 * q);   // eases in and speeds up as it reaches the ball
  const path = (svg, d, o) => el("path", { d, class: "ln", pathLength: 1, "stroke-opacity": o, visibility: "hidden" }, svg);
  const ring = (svg, x, y, r, o) => el("circle", { cx: x, cy: y, r, class: "ln", pathLength: 1, "stroke-opacity": o, visibility: "hidden", transform: `rotate(-90 ${x} ${y})` }, svg);

  S.l2 = svg => { // Card 2 · Every layer, lighter: m3 with 3 · 4 · 6 people, scaled to the 260 crop
    const R = rng(9), P = 10, g = glow(svg), counts = [3, 4, 6], radii = [50, 86, 122];
    const L = [[.1, .42, 4.4], [-.07, .3, 3.8], [.045, .2, 3.2]].map(([w, o, dr], k) => {
      const r = radii[k], n = counts[k], ring = path(svg, circleD(r), .16), a0 = R() * TAU;
      return { r, w, o, dr, ring, t0: .04 + k * .2,
        people: Array.from({ length: n }, (_, i) => ({ a: a0 + i / n * TAU + (R() - .5) * .3, d: .012 * i + R() * .01, spoke: ln(svg, {}, 0), dot: el("circle", { r: 0, class: "dot" }, svg) })) };
    });
    const b = ball(svg);
    return t => {
      const p = frac(t, P), fade = 1 - sm(.85, .96, p); let pulse = 0;
      L.forEach(l => {
        dash(l.ring, 0, io(clamp((p - l.t0) / .14, 0, 1))); op(l.ring, .16 * fade);
        l.people.forEach(o => {
          const a = o.a + l.w * t, xy = polar(a, l.r), q = p - l.t0 - .1 - o.d, k = clamp((q - .03) / .1, 0, 1);
          set(o.dot, { cx: f2(xy[0]), cy: f2(xy[1]), r: f2(Math.max(0, l.dr * backOut(clamp(q / .05, 0, 1)))), opacity: f2(.85 * fade) });
          const tip = polar(a, B + 5), f = k * k;
          seg2(o.spoke, xy, [lerp(xy[0], tip[0], f), lerp(xy[1], tip[1], f)], k > 0 ? l.o * fade : 0);
          pulse = Math.max(pulse, land((q - .13) * P));
        });
      });
      breathe(b, g, pulse);
    };
  };

  S.s4 = svg => { // Card 3 · Flowchart: start ring, down into the decision diamond, a "no" rubbed out, "yes" out to the action
    const P = 7, O = .42;
    const g = glow(svg), start = ring(svg, 300, 200, 7, O), down = path(svg, "M300 207L300 266", O);
    const dia = path(svg, "M300 266L334 300L300 334L266 300Z", O), no = path(svg, "M300 334L300 372", O);
    const yes = path(svg, "M334 300L378 300", O), box = path(svg, "M378 290L398 290L398 310L378 310Z", O);
    const fill = el("path", { d: "", class: "dot", opacity: .85 }, svg);
    const d = el("circle", { cx: C, cy: C, r: 0, class: "dot", opacity: .85 }, svg), b = ball(svg);
    return t => {
      const p = frac(t, P), fade = 1 - sm(.82, .95, p);
      dash(start, 0, io(clamp((p - .02) / .08, 0, 1))); op(start, O * fade);
      const q = clamp((p - .1) / .14, 0, 1);
      dash(down, 0, home(q)); op(down, O * fade);
      set(d, { cy: f2(lerp(207, 266, home(q))), r: q > 0 && q < 1 ? 3.4 : 0 });
      dash(dia, 0, io(clamp((p - .22) / .12, 0, 1))); op(dia, O * fade);
      dash(no, 0, .7 * env(p, .36, .42, .46, .54)); op(no, O * .6);
      dash(yes, 0, io(clamp((p - .5) / .1, 0, 1))); op(yes, O * fade);
      dash(box, 0, io(clamp((p - .58) / .1, 0, 1))); op(box, O * fade);
      const h = Math.max(0, 8 * backOut(clamp((p - .68) / .06, 0, 1))) / 2;
      set(fill, { d: h > .05 ? poly([[388 - h, 300 - h], [388 + h, 300 - h], [388 + h, 300 + h], [388 - h, 300 + h]]) + "Z" : "", opacity: f2(.85 * fade) });
      breathe(b, g, land((p - .3) * P));
    };
  };

  /* A frame that shows each piece whole, for prefers-reduced-motion */
  const STILL = { m3: 8, a1: 3, e1: 5.4, p1: 5.4, l2: 8, s4: 5.4 };

  /* The trail: the scene drawn 10 more times underneath itself, each slightly in the past.
     Echo copies of anything that isn't moving are hidden, so still lines don't get brighter. */
  const GEO = ["d", "x1", "y1", "x2", "y2", "cx", "cy", "r", "points", "transform", "stroke-dashoffset"];
  const NUM = /-?\d*\.?\d+(?:e-?\d+)?/g;
  const nums = e => { let s = ""; for (const a of GEO) { const v = e.getAttribute(a); if (v != null) s += v + " "; } return s ? (s.match(NUM) || []).map(Number) : null; };
  const geoEls = g => [...g.querySelectorAll("*")].filter(x => !x.closest("defs") && !(x instanceof SVGGElement && !x.hasAttribute("transform")));
  const mount = (svg, key, o = {}) => {
    const n = o.n || 10, lag = o.lag || .04, echoes = [];
    for (let j = n; j >= 1; j--) {
      const g = el("g", { class: "echo", opacity: f2(.42 * Math.pow(1 - j / (n + 1), 2)) }, svg);
      echoes.push({ j, g, draw: S[key](g) });
    }
    const main = el("g", { class: "main" }, svg), draw = S[key](main), mainEls = geoEls(main);
    echoes.forEach(e => { e.els = geoEls(e.g); });
    return t => {
      draw(t);
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

  window.HowtoScenes = { mount, STILL, keys: Object.keys(S) };
})();
