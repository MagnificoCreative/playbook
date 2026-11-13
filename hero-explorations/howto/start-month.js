/* Where to start · Start this month, cards 2 and 3. Four options each, in the card-scene language (light card, dark teal lines).
   Card 2 "Trace one metric your leadership relies on, from where it's born to where it's used": t1–t4.
   Card 3 "Sketch one decision flow, from the first signal to the action that resolves it": s1–s4.
   Like the Ask bubble on card 1, each scene is drawn in the 600 space and shown through a 260 crop (CROP), so it reads at 120px.
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
  const home = q => q * q * (1.6 - .6 * q);                 // eases in and speeds up as it reaches the ball
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
  /* Catmull-Rom through the points, sampled */
  const curve = (P, n = 14) => {
    const out = [P[0]];
    for (let i = 0; i < P.length - 1; i++) {
      const p0 = P[Math.max(i - 1, 0)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(i + 2, P.length - 1)];
      for (let k = 1; k <= n; k++) {
        const t = k / n, t2 = t * t, t3 = t2 * t;
        out.push([0, 1].map(j => .5 * (2 * p1[j] + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3)));
      }
    }
    return out;
  };
  const dash = (e, s0, s1) => { s0 = clamp(s0, 0, 1); s1 = clamp(s1, 0, 1); set(e, { "stroke-dasharray": `${f4(Math.max(s1 - s0, 0))} 3`, "stroke-dashoffset": f4(-s0), visibility: s1 - s0 < .002 ? "hidden" : "visible" }); };
  const path = (svg, d, o) => el("path", { d, class: "ln", pathLength: 1, "stroke-opacity": o, visibility: "hidden" }, svg);
  const dot = (svg, o) => el("circle", { cx: C, cy: C, r: 0, class: "dot", opacity: o == null ? .85 : o }, svg);
  const put = (e, xy, r, o) => set(e, { cx: f2(xy[0]), cy: f2(xy[1]), r: f2(Math.max(r, 0)), opacity: f2(o) });
  const ring = (svg, x, y, r, o) => el("circle", { cx: x, cy: y, r, class: "ln", pathLength: 1, "stroke-opacity": o, visibility: "hidden", transform: `rotate(-90 ${x} ${y})` }, svg);
  const op = (e, o) => set(e, { "stroke-opacity": f2(o) });
  let uid = 0;
  const glow = svg => {
    const id = "sm" + (uid++), g = el("radialGradient", { id }, el("defs", {}, svg));
    [[0, .55], [.35, .22], [1, 0]].forEach(([o, a]) => el("stop", { offset: o, "stop-color": "#ff0074", "stop-opacity": a }, g));
    return el("circle", { cx: C, cy: C, r: 42, fill: `url(#${id})`, opacity: 0, class: "glow" }, svg);
  };
  const breathe = (b, g, p) => { p = clamp(p, 0, 1); set(b, { r: f2(B * (1 + .16 * p)) }); set(g, { opacity: f2(.4 * p), r: f2(B * (2.6 + .8 * p)) }); };
  const land = s => s > 0 ? Math.exp(-s * 2.9) : sm(-.5, 0, s);   // breath around an arrival, s in seconds
  const ball = svg => el("circle", { cx: C, cy: C, r: B, class: "ball" }, svg);
  const frac = (t, P) => ((t / P) % 1 + 1) % 1;
  const S = window.HeroScenes;

  /* ── Card 2 · Trace one metric ─────────────────────────────── */

  /* t1 · Born to used: the metric pops up, travels through two hand-offs and lands on the ball; the line it drew clears from the tail */
  S.t1 = svg => {
    const P = 6.4, pts = curve([[152, 372], [192, 350], [208, 268], [250, 236], [282, 262], [300, 300]], 18);
    const g = glow(svg), line = path(svg, poly(pts), .5);
    const origin = ring(svg, 152, 372, 7, .5);
    const hands = [.38, .7].map(s => ({ s, xy: along(pts, s), e: el("circle", { r: 0, class: "ln", "stroke-opacity": .45 }, svg) }));
    const d = dot(svg), b = ball(svg);
    return t => {
      const p = frac(t, P), q = clamp((p - .12) / .42, 0, 1), s = home(q), tail = io(clamp((p - .62) / .2, 0, 1));
      dash(line, tail, s);
      dash(origin, 0, io(clamp((p - .02) / .08, 0, 1)));
      op(origin, .5 * (1 - sm(.6, .74, p)));
      hands.forEach(h => {
        const pass = q > 0 ? Math.exp(-Math.pow((s - h.s) / .05, 2)) : 0;
        set(h.e, { cx: h.xy[0], cy: h.xy[1], r: f2(5 * backOut(clamp((p - .06 - h.s * .06) / .07, 0, 1)) * (1 + .5 * pass)), "stroke-opacity": f2(.45 * (1 - sm(.66, .8, p)) + .2 * pass) });
      });
      put(d, along(pts, s), 4.2 * backOut(clamp((p - .05) / .06, 0, 1)), s >= 1 ? 0 : .85);
      breathe(b, g, land((p - .54) * P));
    };
  };

  /* t2 · Trace it back: a baton leaves the ball and picks its way upstream through the branches to where the number is born,
     then the metric comes home along the one true route */
  S.t2 = svg => {
    const P = 7, route = [[300, 300], [244, 300], [196, 252], [140, 252]];
    const dead = [[[244, 300], [198, 346], [146, 346]], [[196, 252], [170, 208]], [[198, 346], [176, 384]]];
    const g = glow(svg);
    const branches = dead.map(p => ({ p, e: path(svg, poly(p), .18) }));
    const tips = dead.map(p => el("circle", { cx: p[p.length - 1][0], cy: p[p.length - 1][1], r: 0, class: "dot", opacity: .3 }, svg));
    const ghost = path(svg, poly(route), .18), lit = path(svg, poly(route), .55), baton = path(svg, poly(route), .55);
    const origin = ring(svg, 140, 252, 8, .55), d = dot(svg), b = ball(svg);
    return t => {
      const p = frac(t, P), grow = io(clamp((p - .02) / .12, 0, 1)), fade = 1 - sm(.82, .95, p);
      branches.forEach((x, i) => { dash(x.e, 0, io(clamp((p - .04 - i * .02) / .12, 0, 1))); op(x.e, .18 * fade); });
      tips.forEach((x, i) => set(x, { r: f2(2.6 * backOut(clamp((p - .12 - i * .02) / .05, 0, 1))), opacity: f2(.3 * fade) }));
      dash(ghost, 0, grow); op(ghost, .18 * fade);
      const head = io(clamp((p - .14) / .26, 0, 1)), tail = io(clamp((p - .19) / .26, 0, 1));
      dash(baton, tail, head);
      dash(origin, 0, io(clamp((p - .4) / .08, 0, 1))); op(origin, .55 * fade);
      const q = clamp((p - .5) / .28, 0, 1), s = home(q);
      dash(lit, 1 - s, 1); op(lit, .55 * fade);
      put(d, along(route, 1 - s), 4.2 * backOut(clamp((p - .44) / .06, 0, 1)), q >= 1 ? 0 : .85);
      breathe(b, g, Math.max(land((p - .78) * P), .5 * land((p - .14) * P)));
    };
  };

  /* t3 · One thread: a quiet tangle of lines, and one of them is followed, crossing by crossing, from its start to the ball */
  S.t3 = svg => {
    const P = 6.8;
    const noise = [
      [[160, 246], [215, 282], [268, 238], [330, 262], [420, 232]],
      [[162, 304], [206, 262], [254, 322], [312, 350], [362, 302], [420, 322]],
      [[166, 396], [222, 372], [272, 392], [332, 364], [420, 384]],
      [[178, 208], [222, 240], [242, 300], [224, 360], [252, 418]],
      [[332, 208], [344, 258], [376, 300], [352, 352], [384, 418]],
    ].map(c => curve(c, 12));
    const trace = curve([[164, 352], [202, 316], [232, 340], [262, 288], [300, 300]], 16);
    const g = glow(svg);
    const tangle = noise.map(p => path(svg, poly(p), .16));
    const start = el("circle", { cx: 164, cy: 352, r: 0, class: "dot", opacity: .85 }, svg);
    const line = path(svg, poly(trace), .6), d = dot(svg), b = ball(svg);
    return t => {
      const p = frac(t, P), fade = 1 - sm(.82, .95, p);
      tangle.forEach((e, i) => { dash(e, 0, io(clamp((p - .02 - i * .025) / .16, 0, 1))); op(e, .16 * fade); });
      set(start, { r: f2(4 * backOut(clamp((p - .16) / .06, 0, 1))), opacity: f2(.85 * fade) });
      const q = clamp((p - .24) / .4, 0, 1), s = io(q);
      dash(line, 0, s); op(line, .6 * fade);
      put(d, along(trace, s), q > 0 && q < 1 ? 3.6 : 0, .85);
      breathe(b, g, land((p - .64) * P));
    };
  };

  /* t4 · Up through the layers: born at the floor, the metric rises through each layer of the organisation,
     nudging each one as it passes, until it reaches the ball at the top */
  S.t4 = svg => {
    const P = 6.6, pts = curve([[300, 494], [318, 452], [284, 402], [314, 352], [300, 300]], 16);
    const g = glow(svg), Y = [450, 400, 350];
    const layers = Y.map(y => ({ y, e: el("path", { d: `M222 ${y}L378 ${y}`, class: "ln", "stroke-opacity": .22 }, svg) }));
    const line = path(svg, poly(pts), .5), origin = ring(svg, 300, 494, 7, .5), d = dot(svg), b = ball(svg);
    return t => {
      const p = frac(t, P), q = clamp((p - .1) / .48, 0, 1), s = home(q), head = along(pts, s);
      dash(line, io(clamp((p - .64) / .2, 0, 1)), s);
      dash(origin, 0, io(clamp((p - .02) / .07, 0, 1))); op(origin, .5 * (1 - sm(.62, .76, p)));
      layers.forEach(L => {
        const k = q > 0 && q < 1 ? Math.exp(-Math.pow((head[1] - L.y) / 16, 2)) : 0;
        const ptsL = []; for (let x = 222; x <= 378; x += 6) ptsL.push([x, L.y - 8 * k * Math.exp(-Math.pow((x - head[0]) / 18, 2))]);
        set(L.e, { d: poly(ptsL), "stroke-opacity": f2(.22 + .2 * k) });
      });
      put(d, head, 4.2 * backOut(clamp((p - .05) / .06, 0, 1)), q >= 1 ? 0 : .85);
      breathe(b, g, land((p - .58) * P));
    };
  };

  /* ── Card 3 · Sketch one decision flow ─────────────────────── */

  /* s1 · Signal, decision, action: a small wave travels in along a quiet line, the ball takes it,
     and one straight line goes out to a ring that closes */
  S.s1 = svg => {
    const P = 6.4, x0 = 164;
    const g = glow(svg), base = path(svg, `M${x0} 300L284 300`, .2);
    const wave = el("path", { class: "ln", "stroke-opacity": .6, d: "" }, svg);
    const act = path(svg, "M316 300L386 300", .55), end = ring(svg, 396, 300, 9, .55), fill = dot(svg);
    const b = ball(svg);
    return t => {
      const p = frac(t, P), fade = 1 - sm(.82, .95, p);
      dash(base, 0, io(clamp((p - .02) / .12, 0, 1))); op(base, .2 * fade);
      const q = clamp((p - .1) / .32, 0, 1), xc = lerp(x0 + 6, 300, io(q)), amp = 11 * sm(0, .12, q) * (1 - sm(.82, 1, q));
      const w = []; for (let x = Math.max(x0, xc - 34); x <= Math.min(284, xc + 34); x += 2) w.push([x, 300 - amp * Math.exp(-Math.pow((x - xc) / 15, 2)) * Math.sin((x - xc) / 4.2)]);
      set(wave, { d: w.length > 1 ? poly(w) : "", visibility: amp > .3 && w.length > 1 ? "visible" : "hidden" });
      dash(act, 0, io(clamp((p - .48) / .12, 0, 1))); op(act, .55 * fade);
      dash(end, 0, io(clamp((p - .58) / .1, 0, 1))); op(end, .55 * fade);
      set(fill, { cx: 396, cy: 300, r: f2(3.4 * backOut(clamp((p - .68) / .06, 0, 1))), opacity: f2(.85 * fade) });
      breathe(b, g, land((p - .42) * P));
    };
  };

  /* s2 · The fork: a signal reaches the ball, both ways out are sketched, then one is chosen and drawn through to the action
     while the other is rubbed out. It takes the other way next time. */
  S.s2 = svg => {
    const P = 6.8, inP = [[170, 300], [284, 300]];
    const up = curve([[316, 300], [346, 296], [368, 250], [400, 244]], 14), dn = curve([[316, 300], [346, 304], [368, 350], [400, 356]], 14);
    const g = glow(svg), start = ring(svg, 170, 300, 7, .5), inL = path(svg, poly(inP), .5);
    const ways = [up, dn].map(p => ({ p, e: path(svg, poly(p), .45), end: dot(svg) }));
    const d = dot(svg), b = ball(svg);
    return t => {
      const p = frac(t, P), k = Math.floor(t / P) % 2, fade = 1 - sm(.82, .95, p);
      dash(start, 0, io(clamp((p - .02) / .08, 0, 1))); op(start, .5 * fade);
      const q = clamp((p - .1) / .22, 0, 1), s = home(q);
      dash(inL, 0, s); op(inL, .5 * fade);
      put(d, along(inP, s), q > 0 && q < 1 ? 4 : 0, .85);
      const sketch = .42 * io(clamp((p - .38) / .1, 0, 1));
      ways.forEach((w, i) => {
        const chosen = i === ((k % 2) + 2) % 2, z = io(clamp((p - .52) / .12, 0, 1));
        dash(w.e, 0, chosen ? lerp(sketch, 1, z) : sketch * (1 - z));
        op(w.e, (chosen ? lerp(.3, .55, z) : .3) * fade);
        const e = w.p[w.p.length - 1];
        set(w.end, { cx: e[0], cy: e[1], r: f2(chosen ? 4.4 * backOut(clamp((p - .64) / .06, 0, 1)) : 0), opacity: f2(.85 * fade) });
      });
      breathe(b, g, land((p - .32) * P));
    };
  };

  /* s3 · Close the loop: something sends out ripples, they reach the ball, and the ball answers with one line back to the source.
     When it arrives the ripples stop and the source is ringed: resolved. */
  S.s3 = svg => {
    const P = 7.2, src = [204, 212], D = Math.hypot(C - src[0], C - src[1]);
    const g = glow(svg);
    const waves = [0, 1, 2, 3].map(() => el("circle", { cx: src[0], cy: src[1], r: 0, class: "ln", "stroke-opacity": 0 }, svg));
    const ang = Math.atan2(src[1] - C, src[0] - C), a0 = [C + 22 * Math.cos(ang), C + 22 * Math.sin(ang)], a1 = [src[0] - 14 * Math.cos(ang), src[1] - 14 * Math.sin(ang)];
    const act = path(svg, poly([a0, a1]), .55), seal = ring(svg, src[0], src[1], 10, .55);
    const s0 = el("circle", { cx: src[0], cy: src[1], r: 0, class: "dot", opacity: .85 }, svg), b = ball(svg);
    return t => {
      const p = frac(t, P), T = p * P, fade = 1 - sm(.82, .95, p); let hit = 0;
      waves.forEach((w, i) => {
        const r = (T - .3 - i * .75) * 78, o = r > 0 && r < 160 ? .34 * (1 - r / 160) * sm(0, 10, r) : 0;
        set(w, { r: f2(Math.max(r, 0)), "stroke-opacity": f2(o), visibility: o > .004 ? "visible" : "hidden" });
        if (r > 0) hit = Math.max(hit, (i ? .5 : 1) * Math.exp(-Math.pow((r - D + B) / 22, 2)));
      });
      set(s0, { r: f2(3.6 * backOut(clamp((p - .02) / .05, 0, 1))), opacity: f2(.85 * fade) });
      const q = clamp((p - .5) / .12, 0, 1);
      dash(act, 0, io(q)); op(act, .55 * fade);
      dash(seal, 0, io(clamp((p - .6) / .1, 0, 1))); op(seal, .55 * fade);
      breathe(b, g, hit);
    };
  };

  /* s4 · Flowchart: the sketch itself. A start ring, a line down to the ball inside a decision diamond,
     a tentative "no" that is rubbed out, then "yes" out to the action square.
     Refined: every line at one weight and one opacity (O), smaller start ring and square, connectors that meet each shape exactly. */
  S.s4 = svg => {
    const P = 7, O = .42;
    const g = glow(svg), start = ring(svg, 300, 200, 7, O), down = path(svg, "M300 207L300 266", O);
    const dia = path(svg, "M300 266L334 300L300 334L266 300Z", O), no = path(svg, "M300 334L300 372", O);
    const yes = path(svg, "M334 300L378 300", O), box = path(svg, "M378 290L398 290L398 310L378 310Z", O);
    const fill = el("path", { d: "", class: "dot", opacity: .85 }, svg);
    const d = dot(svg), b = ball(svg);
    return t => {
      const p = frac(t, P), fade = 1 - sm(.82, .95, p);
      dash(start, 0, io(clamp((p - .02) / .08, 0, 1))); op(start, O * fade);
      const q = clamp((p - .1) / .14, 0, 1);
      dash(down, 0, home(q)); op(down, O * fade);
      put(d, [300, lerp(207, 266, home(q))], q > 0 && q < 1 ? 3.4 : 0, .85);
      dash(dia, 0, io(clamp((p - .22) / .12, 0, 1))); op(dia, O * fade);
      dash(no, 0, .7 * env(p, .36, .42, .46, .54)); op(no, O * .6);
      dash(yes, 0, io(clamp((p - .5) / .1, 0, 1))); op(yes, O * fade);
      dash(box, 0, io(clamp((p - .58) / .1, 0, 1))); op(box, O * fade);
      const h = Math.max(0, 8 * backOut(clamp((p - .68) / .06, 0, 1))) / 2;
      set(fill, { d: h > .05 ? poly([[388 - h, 300 - h], [388 + h, 300 - h], [388 + h, 300 + h], [388 - h, 300 + h]]) + "Z" : "", opacity: f2(.85 * fade) });
      breathe(b, g, land((p - .3) * P));
    };
  };


  /* ── Card 2 · Every layer, lighter ─────────────────────────
     Map · Every layer (m3, retired from Step 1) with fewer people on the outer rings, scaled to the 260 crop so the ball
     is the same size as on the other two cards. Same rings, same timing, same spokes. */
  const rng = s => () => (s = (s * 16807) % 2147483647, (s - 1) / 2147483646);
  const polar = (a, r) => [C + r * Math.cos(a), C + r * Math.sin(a)];
  const circleD = r => `M${C} ${C - r}A${r} ${r} 0 1 1 ${C} ${C + r}A${r} ${r} 0 1 1 ${C} ${C - r}`;
  const seg2 = (e, a, b, o) => set(e, { x1: f2(a[0]), y1: f2(a[1]), x2: f2(b[0]), y2: f2(b[1]), "stroke-opacity": f2(o) });
  const everyLayer = (counts, radii = [50, 86, 122]) => svg => {
    const R = rng(9), P = 10, g = glow(svg);
    const L = [[.1, .42, 4.4], [-.07, .3, 3.8], [.045, .2, 3.2]].map(([w, o, dr], k) => {
      const r = radii[k], n = counts[k], ring = path(svg, circleD(r), .16), a0 = R() * TAU;
      return { r, w, o, dr, ring, t0: .04 + k * .2,
        people: Array.from({ length: n }, (_, i) => ({ a: a0 + i / n * TAU + (R() - .5) * .3, d: .012 * i + R() * .01, spoke: el("line", { class: "ln", "stroke-opacity": 0 }, svg), dot: el("circle", { r: 0, class: "dot" }, svg) })) };
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
  S.l0 = everyLayer([3, 5, 8]);   // the original count, for comparison
  S.l1 = everyLayer([3, 5, 6]);   // outer ring 8 → 6
  S.l2 = everyLayer([3, 4, 6]);   // 16 → 13 people, about 20% fewer
  S.l3 = everyLayer([2, 4, 5]);   // 16 → 11, the lightest
  S.l4 = everyLayer([3, 4, 6], [56, 92, 118]); // as l2, the two outer rings drawn closer together

  /* The 260 crop each scene is shown through on the card (like the Ask bubble's "250 130 260 260") */
  window.StartMonthCrop = {
    a1: "250 130 260 260",
    t1: "110 170 260 260", t2: "100 170 260 260", t3: "160 180 260 260", t4: "170 262 260 260",
    s1: "155 170 260 260", s2: "155 170 260 260", s3: "122 128 260 260", s4: "170 170 260 260",
    l0: "170 170 260 260", l1: "170 170 260 260", l2: "170 170 260 260", l3: "170 170 260 260", l4: "170 170 260 260",
  };
})();
