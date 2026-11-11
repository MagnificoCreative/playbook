// ==== intro ====
/* Introduction: one piece of information travels Source → Act and loses trust at every stage. */
window.PlaybookChapter = (P) => {
  /* One screen isn't one truth: a dashboard of dots empties along a spectrum, from a single pane of glass
     to a single source of truth, where every point ends up threaded to one pink source. Pinned on wide screens.
     Phones get a stacked layout: the screen on top, the ring below, and the spectrum running down the side. */
  (() => {
    const svg = P.$("#truth svg");
    if (!svg) return;
    const NS = "http://www.w3.org/2000/svg", TEAL = "#002a32", THIN = "stroke-width: 1"; // every outline is 1px
    const el = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); parent.appendChild(e); return e; };
    const set = (e, attrs) => { for (const k in attrs) e.setAttribute(k, attrs[k]); };
    const cl = (x) => Math.min(1, Math.max(0, x));
    const sm = (a, b, x) => { const t = cl((x - a) / (b - a)); return t * t * (3 - 2 * t); };
    const lerp = (a, b, t) => a + (b - a) * t;
    const ease = (t) => (t < .5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
    const f1 = (n) => n.toFixed(1);

    // Two layouts share one drawing. Spectrum runs from `a` (pane of glass) to `b` (source of truth).
    const WIDE = { vb: "69 39 896 353", // cropped to the drawing
      S: { x: 70, y: 40, w: 260, h: 170 }, ball: { x: 820, y: 125 },
      a: { x: 200, y: 300 }, b: { x: 820, y: 300 },
      pane: { x: 200, y: 344 }, truth: { x: 820, y: 344 } };
    const STACKED = { vb: "14 23 330 564", S: { x: 70, y: 24, w: 260, h: 170 }, ball: { x: 200, y: 404 },
      a: { x: 22, y: 109 }, b: { x: 22, y: 404 },
      pane: { x: 200, y: 246 }, truth: { x: 200, y: 540 } };

    const build = (G) => {
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      svg.setAttribute("viewBox", G.vb);
      let seed = 7; // seeded, so the arcs and departure order are the same on every visit
      const R = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
      const text = (cls, x, y, s) => { const t = el("text", { class: cls, x, y, "text-anchor": "middle" }, svg); t.textContent = s; };
      const N = 36, S = G.S, BALL = G.ball, RING = 82;
      el("rect", { class: "ln", x: S.x, y: S.y, width: S.w, height: S.h, rx: 8, "stroke-opacity": .45, style: THIN }, svg);
      el("line", { class: "ln", x1: S.x + S.w / 2 - 34, x2: S.x + S.w / 2 + 34, y1: S.y + S.h + 14, y2: S.y + S.h + 14, "stroke-opacity": .3, style: THIN }, svg);
      // The dashboard, in dots: KPI grid, line chart, bar chart, table
      const pad = 14, gap = 12, w = (S.w - 2 * pad - gap) / 2, h = (S.h - 2 * pad - gap) / 2;
      const W = [[S.x + pad, S.y + pad], [S.x + pad + w + gap, S.y + pad], [S.x + pad, S.y + pad + h + gap], [S.x + pad + w + gap, S.y + pad + h + gap]];
      W.forEach(([x, y]) => el("rect", { class: "hl", x, y, width: w, height: h, rx: 4, "stroke-opacity": .14 }, svg));
      const pts = [];
      for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) pts.push([W[0][0] + 16 + c * 26, W[0][1] + 15 + r * 17]);
      [12, 24, 18, 32, 27, 41, 35, 46].forEach((v, i) => pts.push([W[1][0] + 12 + i * 12.3, W[1][1] + h - 8 - v * .95]));
      [1, 3, 2, 3, 1].forEach((n, c) => { for (let k = 0; k < n; k++) pts.push([W[2][0] + 18 + c * 19, W[2][1] + h - 12 - k * 13]); });
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 2; c++) pts.push([W[3][0] + 14 + c * 52, W[3][1] + 15 + r * 17]);
      }
      // The spectrum, darkening toward the truth end, with ticks across it
      const defs = el("defs", {}, svg);
      const gr = el("linearGradient", { id: "truth-spectrum", gradientUnits: "userSpaceOnUse", x1: G.a.x, y1: G.a.y, x2: G.b.x, y2: G.b.y }, defs);
      el("stop", { offset: 0, "stop-color": TEAL, "stop-opacity": .2 }, gr);
      el("stop", { offset: 1, "stop-color": TEAL, "stop-opacity": .6 }, gr);
      el("line", { x1: G.a.x, y1: G.a.y, x2: G.b.x, y2: G.b.y, stroke: "url(#truth-spectrum)", "stroke-width": 1 }, svg);
      const len = Math.hypot(G.b.x - G.a.x, G.b.y - G.a.y), nx = -(G.b.y - G.a.y) / len, ny = (G.b.x - G.a.x) / len;
      for (let i = 0; i <= 10; i++) {
        const x = lerp(G.a.x, G.b.x, i / 10), y = lerp(G.a.y, G.b.y, i / 10);
        el("line", { class: "hl", x1: f1(x - nx * 4), y1: f1(y - ny * 4), x2: f1(x + nx * 4), y2: f1(y + ny * 4), "stroke-opacity": .18 }, svg);
      }
      el("circle", { class: "node", cx: G.a.x, cy: G.a.y, r: 5, style: THIN }, svg);
      el("circle", { class: "node", cx: G.b.x, cy: G.b.y, r: 5, style: THIN }, svg);
      const marker = el("circle", { class: "ball", r: 7, cx: G.a.x, cy: G.a.y }, svg);
      text("lbl", G.pane.x, G.pane.y, "A single pane of glass");
      text("lbl-s", G.pane.x, G.pane.y + 25, "Puts all your data on one screen.");
      text("lbl", G.truth.x, G.truth.y, "A single source of truth");
      text("lbl-s", G.truth.x, G.truth.y + 25, "Everyone agrees what each number means,");
      text("lbl-s", G.truth.x, G.truth.y + 43, "where it comes from and who owns it.");

      const threads = el("g", {}, svg), dotsG = el("g", {}, svg);
      const order = Array.from({ length: N }, (_, i) => i).sort(() => R() - .5);
      const dots = pts.map(([sx, sy], i) => {
        const a = (i / N) * Math.PI * 2 - Math.PI / 2;
        return { sx, sy, ex: BALL.x + Math.cos(a) * RING, ey: BALL.y + Math.sin(a) * RING, lift: 30 + R() * 70, start: 0.08 + (order[i] / N) * 0.6 + R() * 0.05,
          th: el("line", { class: "hl", x1: BALL.x, y1: BALL.y, x2: BALL.x, y2: BALL.y, "stroke-opacity": 0 }, threads),
          c: el("circle", { r: 3.5, fill: TEAL, "fill-opacity": .6 }, dotsG) };
      });
      // Stacked, the dots fall down to the ring, so the arc bows sideways instead of up.
      const bowX = G === STACKED;
      const ball = el("circle", { class: "ball", cx: BALL.x, cy: BALL.y, r: 6 }, svg);
      return (p) => {
        const m = ease(cl(p / 0.92));
        set(marker, { cx: f1(lerp(G.a.x, G.b.x, m)), cy: f1(lerp(G.a.y, G.b.y, m)) });
        let arrived = 0;
        dots.forEach((d, i) => {
          const t = ease(cl((p - d.start) / 0.26)), bow = Math.sin(Math.PI * t) * d.lift;
          const x = lerp(d.sx, d.ex, t) + (bowX ? (i % 2 ? bow : -bow) * .6 : 0), y = lerp(d.sy, d.ey, t) - (bowX ? 0 : bow);
          set(d.c, { cx: f1(x), cy: f1(y) });
          const land = sm(0.85, 1, t); arrived += land;
          set(d.th, { x2: f1(d.ex), y2: f1(d.ey), "stroke-opacity": (0.22 * land).toFixed(3) });
        });
        set(ball, { r: f1(lerp(6, 12, arrived / N)) });
      };
    };

    // Same breakpoint as the stylesheet's phone rules
    const phone = matchMedia("(max-width: 767px)");
    const o = { p: 0 };
    let draw = build(phone.matches ? STACKED : WIDE);
    phone.addEventListener("change", () => { draw = build(phone.matches ? STACKED : WIDE); draw(o.p); });

    if (!P.gsap || P.reduce) { o.p = 1; draw(1); return; }
    draw(0);
    const mm = P.gsap.matchMedia();
    mm.add("(min-width: 1101px) and (min-height: 620px)", () => {
      P.gsap.to(o, { p: 1, ease: "none", onUpdate: () => draw(o.p),
        scrollTrigger: { trigger: "#one-truth", start: () => `top top+=${P.pinTop()}`, end: "+=120%", pin: true, scrub: 0.6, anticipatePin: 1, invalidateOnRefresh: true, refreshPriority: 1 } });
    });
    mm.add("(max-width: 1100px), (max-height: 619px)", () => {
      P.gsap.to(o, { p: 1, ease: "none", onUpdate: () => draw(o.p), scrollTrigger: { trigger: "#truth", start: "top 70%", end: "bottom 45%", scrub: 0.8 } });
    });
  })();
  /* CLEAR staircase: the base draws, each step rises in turn, then its contents settle in */
  if (P.$("#clear") && P.gsap && !P.reduce) {
    const g = P.gsap, stairs = P.$$("#clear .stair");
    const tl = g.timeline({ scrollTrigger: { trigger: "#clear", start: "top 80%", toggleActions: "play none none reverse" } });
    tl.from("#clear .stairs-base", { scaleX: 0, duration: 0.9, ease: "expo.inOut" })
      .from(stairs, { scaleY: 0, duration: 0.9, stagger: 0.12, ease: "expo.out" }, 0.35)
      .from(stairs.map((s) => s.querySelectorAll(".stair-in > *")), { y: 14, opacity: 0, duration: 0.7, stagger: 0.03, ease: "power3.out" }, 0.75)
      .from("#clear .clear-next", { opacity: 0, x: -12, duration: 0.8, ease: "power3.out" }, ">-0.3");
  }
  /* Roots: drawn downward as you scroll, the pink tip leading the main root */
  const roots = P.$$("#roots .root"), tip = P.$("#roots .root-tip");
  if (roots.length) {
    const lens = roots.map((r) => r.getTotalLength());
    roots.forEach((r, i) => { r.style.strokeDasharray = lens[i]; });
    const drawRoots = (p) => {
      roots.forEach((r, i) => {
        const at = +r.dataset.at, k = Math.min(1, Math.max(0, (p - at) / (1 - at) * (i ? 1.6 : 1)));
        r.style.strokeDashoffset = lens[i] * (1 - k);
      });
      const pt = roots[0].getPointAtLength(lens[0] * Math.min(1, p));
      tip.setAttribute("cx", pt.x.toFixed(1)); tip.setAttribute("cy", pt.y.toFixed(1));
      tip.setAttribute("opacity", (0.9 * Math.min(1, p * 8)).toFixed(3));
    };
    if (!P.gsap || P.reduce) drawRoots(1);
    else { const ro = { p: 0 }; drawRoots(0); P.gsap.to(ro, { p: 1, ease: "none", onUpdate: () => drawRoots(ro.p), scrollTrigger: { trigger: "#roots", start: "top 80%", end: "bottom 45%", scrub: 0.8 } }); }
  }
  /* Where trust is lost: the ball moves down Source → Act and the line steps toward less trust.
     Each stage's sub-copy rises in word by word as the ball reaches it. Pinned on wide screens. */
  const svg = P.$("#flow svg");
  if (!svg) return;
  const NS = "http://www.w3.org/2000/svg";
  const cl = (x) => Math.min(1, Math.max(0, x));
  const sm = (a, b, x) => { const t = cl((x - a) / (b - a)); return t * t * (3 - 2 * t); };
  const YS = [82, 170, 258, 346, 434], T = [100, 80, 60, 40, 20], SPAN = 4.4;
  const xv = (v) => 260 + 270 * (v - 10) / 95;
  const value = (y) => { let v = T[0]; for (let k = 1; k < 5; k++) v -= (T[k - 1] - T[k]) * sm(YS[k] - 62, YS[k] - 22, y); return v; };
  const travel = (p) => { const u = Math.min(4, Math.max(0, p * SPAN)); if (u >= 4) return 4; const k = Math.floor(u); return k + sm(0.12, 0.88, u - k); };
  const arriveP = (k) => (k ? (k - 0.12) / SPAN : 0.035);
  const line = P.$("#flow-line", svg), ball = P.$("#flow-ball", svg);
  const guides = P.$$(".flow-guides line", svg);
  const subs = P.$$(".flow-sub", svg).map((t) => {
    const words = t.textContent.split(" ");
    t.textContent = "";
    return { t, words: words.map((w, j) => { const s = document.createElementNS(NS, "tspan"); s.textContent = (j ? " " : "") + w; t.appendChild(s); return s; }) };
  });
  const draw = (p) => {
    const by = YS[0] + (YS[4] - YS[0]) * travel(p) / 4;
    let d = "";
    for (let y = YS[0]; y < by; y += 4) d += (d ? "L" : "M") + xv(value(y)).toFixed(1) + " " + y;
    d += (d ? "L" : "M") + xv(value(by)).toFixed(1) + " " + by.toFixed(1);
    line.setAttribute("d", d);
    ball.setAttribute("cx", xv(value(by)).toFixed(1));
    ball.setAttribute("cy", by.toFixed(1));
    guides.forEach((g, k) => g.setAttribute("y2", (40 + 440 * (k ? sm(YS[k] - 30, YS[k] + 30, by) : 1)).toFixed(1)));
    subs.forEach(({ t, words }, i) => {
      const a = arriveP(i), r = sm(a - 0.03, a + 0.05, p);
      t.setAttribute("transform", `translate(0 ${(10 * (1 - r) ** 2).toFixed(1)})`);
      words.forEach((w, j) => { const lo = a - 0.03 + j * 0.012; w.setAttribute("fill-opacity", sm(lo, lo + 0.04, p).toFixed(3)); });
    });
  };
  if (!P.gsap || P.reduce) { draw(1); return; }
  const o = { p: 0 };
  draw(0);
  const mm = P.gsap.matchMedia();
  mm.add("(min-width: 1101px) and (min-height: 620px)", () => {
    P.gsap.to(o, { p: 1, ease: "none", onUpdate: () => draw(o.p),
      scrollTrigger: { trigger: "#where-trust-is-lost", start: () => `top top+=${P.pinTop()}`, end: "+=120%", pin: true, scrub: 0.6, anticipatePin: 1, invalidateOnRefresh: true, refreshPriority: 2 } });  // earlier on the page than #one-truth, so it is measured first
  });
  mm.add("(max-width: 1100px), (max-height: 619px)", () => {
    P.gsap.to(o, { p: 1, ease: "none", onUpdate: () => draw(o.p),
      scrollTrigger: { trigger: "#flow", start: "top 70%", end: "bottom 55%", scrub: 0.8 } });
  });
};

// ==== trace ====
/* Step 3: one metric splits into conflicting copies and only rejoins where a definition is agreed. */
window.PlaybookChapter = (P) => {
  const svg = P.$("#trace svg");
  if (!svg) return;
  const src = P.$(".t-src", svg), copies = P.$$(".t-copy", svg), out = P.$(".t-out", svg);
  const vals = P.$$(".t-vals > g", svg), agree = P.$(".t-agree", svg);
  if (!P.gsap || P.reduce) { [src, out, ...copies].forEach((p) => p.setAttribute("stroke-dashoffset", 0)); return; }
  const g = P.gsap;
  g.set(vals, { opacity: 0, y: 8 });
  g.set(agree, { opacity: 0, scale: 0.6, svgOrigin: "830 165" });
  g.timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: "#trace", start: "top 85%", end: "bottom 85%", scrub: 0.8 } })
    .to(src, { attr: { "stroke-dashoffset": 0 }, duration: 0.15 })
    .to(copies, { attr: { "stroke-dashoffset": 0 }, duration: 0.5, stagger: 0.06 }, 0.15)
    .to(vals, { opacity: 1, y: 0, duration: 0.12, stagger: 0.05, ease: "power2.out" }, 0.25)
    .to(agree, { opacity: 1, scale: 1, duration: 0.15, ease: "back.out(2)" }, 0.72)
    .to(out, { attr: { "stroke-dashoffset": 0 }, duration: 0.12 }, 0.84);
};

// ==== sieve ====
/* Step 4: measures fall through five tests, one at a time. The ones that pass turn pink; the ones that fail are let go.
   The few that pass all five settle into Safety, Quality, Delivery, Cost and People. Pinned on wide screens. */
window.PlaybookChapter = (P) => {
  const svg = P.$("#sieve svg");
  if (!svg) return;
  const NS = "http://www.w3.org/2000/svg", PINK = "#ff0074", TEAL = "#002a32";
  const el = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); parent.appendChild(e); return e; };
  const set = (e, attrs) => { for (const k in attrs) e.setAttribute(k, attrs[k]); };
  const text = (cls, x, y, str, anchor = "middle", extra = {}) => { const t = el("text", { class: cls, x, y, "text-anchor": anchor, ...extra }, svg); t.textContent = str; return t; };
  const cl = (x) => Math.min(1, Math.max(0, x));
  const sm = (a, b, x) => { const t = cl((x - a) / (b - a)); return t * t * (3 - 2 * t); };
  const lerp = (a, b, t) => a + (b - a) * t;
  const f1 = (n) => n.toFixed(1), f3 = (n) => n.toFixed(3);
  let seed = 7; // seeded, so the measures fall the same way on every visit
  const R = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };

  const TESTS = [["Decision", ["Would anyone", "act on it?"]], ["Shared", ["Do several", "roles use it?"]], ["Available", ["Can we measure", "it today?"]], ["Trusted", ["Is the source", "reliable?"]], ["Important", ["Does it move", "the business?"]]];
  const CATS = ["Safety", "Quality", "Delivery", "Cost", "People"];
  // Dark gray at the start, pink once a measure has passed every test
  const GRAY = [74, 84, 88], PK = [255, 0, 116];
  const tint = (t) => `rgb(${GRAY.map((c, i) => Math.round(lerp(c, PK[i], t))).join(",")})`;
  const AT = (i) => .14 + i * .15, FINAL = [.8, .93]; // when each test is applied; when the survivors settle

  // One set of margins for the tests, the hairline and the categories; 40 between tests
  const FX0 = 380, FX1 = 940, TOP = 20, CLOUD = 32, SP = 40; // the viewBox is cropped to exactly this content
  const BAR = Array.from({ length: 5 }, (_, i) => TOP + CLOUD + 34 + i * SP);
  const HL = BAR[4] + 64;
  const binX = (c) => FX0 + (FX1 - FX0) * (c + .5) / 5;
  // Each test's number, with a hairline ring while it's the one being applied (centred: central baseline, no letter-spacing)
  const nums = BAR.map((y, i) => ({
    ring: el("circle", { cx: FX0 - 18, cy: y, r: 9, fill: "none", stroke: PINK, "stroke-width": .5, "stroke-opacity": 0 }, svg),
    t: text("axis", FX0 - 18, y, String(i + 1), "middle", { "fill-opacity": .4, "dominant-baseline": "central", style: "letter-spacing: 0" }),
  }));
  const bars = BAR.map((y) => el("line", { class: "ln", x1: FX0, x2: FX1, y1: y, y2: y, "stroke-dasharray": "3 5", "stroke-opacity": .18 }, svg));
  // One hairline across every category, a delicate tick above each name
  el("line", { class: "ln", x1: FX0, x2: FX1, y1: HL, y2: HL, "stroke-opacity": .25 }, svg);
  CATS.forEach((c, i) => { el("line", { class: "ln", x1: binX(i), x2: binX(i), y1: HL + 4, y2: HL + 9, "stroke-opacity": .35 }, svg); text("cat", binX(i), HL + 30, c); });
  // The caption: only the test being applied
  const mid = (BAR[0] + BAR[4]) / 2;
  const cap = { k: text("axis", 60, mid - 28, "", "start", { "fill-opacity": .6 }), q1: text("big", 60, mid + 6, "", "start"), q2: text("big", 60, mid + 38, "", "start"), cur: null };

  // 60 measures: most fail the first test, fewer each test after, ten survive (two per category)
  const fails = [];
  [22, 12, 8, 5, 3, 10].forEach((n, f) => { for (let i = 0; i < n; i++) fails.push(f); });
  fails.sort(() => R() - .5);
  let kept = 0;
  const g = el("g", {}, svg);
  const M = fails.map((f) => {
    const m = { f, u: R(), v: R(), d: R() * .05 };
    if (f === 5) { m.cat = kept % 5; m.row = Math.floor(kept++ / 5); }
    m.sx = FX0 + 12 + m.u * (FX1 - FX0 - 24); m.sy = TOP + m.v * CLOUD;
    m.c = el("circle", { r: 4.5, "stroke-width": 1 }, g);
    return m;
  });

  const draw = (p) => {
    M.forEach((m) => {
      // how many tests this measure has reached (it rests on each line before going through)
      let s = 0; for (let i = 0; i <= Math.min(m.f, 4); i++) s += sm(AT(i) - .11 + m.d, AT(i) + m.d, p);
      if (m.f === 5) s += sm(FINAL[0] + m.d, FINAL[1] + m.d, p);
      const k = Math.floor(s), fr = s - k, k2 = fr > 0 ? Math.min(k + 1, 6) : k;
      const Y = (n) => (n === 0 ? m.sy : n <= 5 ? BAR[n - 1] - 5.5 : HL - 7 - m.row * 11);
      const X = (n) => (n <= 5 ? m.sx : binX(m.cat));
      let x = lerp(X(k), X(k2), fr);
      const y = lerp(Y(k), Y(k2), fr);
      const passed = cl(Math.max(0, s - 1) / 5), col = tint(passed ** .9);
      let fillO = lerp(.7, 1, passed), strokeO = 0, base = 1;
      if (m.f < 5) { // let go: turns hollow and slides off to the right
        const t = AT(m.f) + m.d, r = sm(t + .02, t + .1, p);
        x = lerp(x, FX1 + 8 + m.u * 20, r); base = 1 - sm(.35, .9, r);
        fillO *= 1 - r; strokeO = .5 * r;
      }
      set(m.c, { cx: f1(x), cy: f1(y), fill: col, stroke: col, "fill-opacity": f3(fillO * base), "stroke-opacity": f3(strokeO * base) });
    });
    // The test being applied: pink line, pink number, ring
    const active = TESTS.findIndex((_, i) => p < AT(i) + .07);
    bars.forEach((b, i) => {
      const on = i === active && p > AT(0) - .12;
      set(b, { style: `stroke: ${on ? PINK : TEAL}`, "stroke-opacity": on ? .9 : .18 }); // inline, so it beats .viz .ln
      set(nums[i].ring, { "stroke-opacity": on ? 1 : 0 });
      set(nums[i].t, { style: `letter-spacing: 0; fill: ${on ? PINK : TEAL}`, "fill-opacity": on ? 1 : .4 });
    });
    const key = p < AT(0) - .12 ? "intro" : active === -1 ? "end" : active;
    if (key !== cap.cur) {
      cap.cur = key;
      const [a, b, c] = key === "intro" ? ["Five tests", "Every measure", "must pass all five."]
        : key === "end" ? ["What’s left", "A few measures,", "each with one owner."]
        : [`Test ${key + 1} of 5 · ${TESTS[key][0]}`, ...TESTS[key][1]];
      cap.k.textContent = a; cap.q1.textContent = b; cap.q2.textContent = c;
    }
  };

  if (!P.gsap || P.reduce) { draw(1); return; }
  const o = { p: 0 };
  draw(0);
  const mm = P.gsap.matchMedia();
  mm.add("(min-width: 1101px) and (min-height: 620px)", () => {
    P.gsap.to(o, { p: 1, ease: "none", onUpdate: () => draw(o.p),
      scrollTrigger: { trigger: "#few-measures", start: () => `top top+=${P.pinTop()}`, end: "+=140%", pin: true, scrub: 0.6, anticipatePin: 1, invalidateOnRefresh: true } });
  });
  mm.add("(max-width: 1100px), (max-height: 619px)", () => {
    P.gsap.to(o, { p: 1, ease: "none", onUpdate: () => draw(o.p), scrollTrigger: { trigger: "#sieve", start: "top 75%", end: "bottom 35%", scrub: 0.8 } });
  });
};

// ==== path ====
/* Step 5: one alert, from signal to action. The steps run down a rail beside the section intro; scrolling moves
   through them (pinned on wide screens) and the current step opens to show what it does and an example.
   With reduced motion, or without GSAP, each step is a button instead. */
window.PlaybookChapter = (P) => {
  const rail = P.$(".path-rail");
  if (!rail) return;
  const rows = P.$$(".path-step", rail), heads = P.$$(".p-head", rail), fill = P.$(".path-fill", rail), box = P.$(".pathway");
  // The line joins the first dot to the last; the open step changes the spacing, so measure the dots every time
  const centre = (li) => { const d = P.$(".p-dot", li); return li.offsetTop + d.offsetTop + d.offsetHeight / 2; };
  let cur = -1, f = 0;
  const layout = () => {
    const Y = rows.map(centre), k = Math.min(rows.length - 2, Math.floor(f));
    rail.style.setProperty("--y0", `${Y[0]}px`);
    rail.style.setProperty("--y1", `${Y[Y.length - 1]}px`);
    fill.style.height = `${Y[k] + (Y[k + 1] - Y[k]) * (f - k) - Y[0]}px`;
  };
  const show = (i) => {
    rows.forEach((li, j) => { li.classList.toggle("is-reached", j <= i); li.classList.toggle("is-current", j === i); });
    if (i === cur) return;
    cur = i;
    heads.forEach((h, j) => h.setAttribute("aria-expanded", j === i));
  };
  new ResizeObserver(layout).observe(rail); // follows the steps as they open and close

  if (!P.gsap || P.reduce) {
    heads.forEach((h, i) => h.addEventListener("click", () => { f = i; show(i); layout(); }));
    show(0); layout();
  } else {
    box.classList.add("is-scrubbed"); // the steps follow the scroll, so they aren't clickable
    heads.forEach((h) => { h.tabIndex = -1; });
    const draw = (p) => {
      f = 3 * Math.min(1, Math.max(0, p / 0.92));
      show(Math.min(3, Math.floor(f + 0.02)));
      layout();
    };
    draw(0);
    const o = { p: 0 };
    const mm = P.gsap.matchMedia();
    mm.add("(min-width: 1101px) and (min-height: 620px)", () => {
      // Holds where it stops until all four steps have opened (Signal → Action), then the page scrolls on to How to apply it.
      // refreshPriority: lay this pin out before the how-to-apply pin further down, so that one starts after it
      P.gsap.to(o, { p: 1, ease: "none", onUpdate: () => draw(o.p),
        scrollTrigger: { trigger: "#signal-to-action", start: () => `top top+=${P.pinTop()}`, end: "+=90%", pin: true, scrub: 0.6, anticipatePin: 1, invalidateOnRefresh: true, refreshPriority: 1 } });
    });
    mm.add("(max-width: 1100px), (max-height: 619px)", () => {
      P.gsap.to(o, { p: 1, ease: "none", onUpdate: () => draw(o.p),
        scrollTrigger: { trigger: ".pathway", start: "top 75%", end: "+=600", scrub: 0.6 } });
    });
  }

  // What goes where: three layers, outlined, fill in turn as you scroll, then draw together into one stack.
  // The first tier is fully opaque (it's always there); the two below are slightly see-through.
  const lsvg = P.$("#layers");
  if (lsvg) {
    const NS = "http://www.w3.org/2000/svg";
    const cl = (x) => Math.min(1, Math.max(0, x));
    const sm = (a, b, x) => { const t = cl((x - a) / (b - a)); return t * t * (3 - 2 * t); };
    const lerp = (a, b, t) => a + (b - a) * t;
    const L = [
      { fill: "#ff0074", line: "#ff0074", lo: .9, w: 96, alpha: 1 },
      { fill: "#00424f", line: "#002a32", lo: .5, w: 200, alpha: .72 },
      { fill: "#d5def0", line: "#002a32", lo: .28, w: 300, alpha: .8 },
    ];
    const ON = [.08, .3, .52], TIGHT = [.76, .94];               // when each tier fills; when they draw together
    const SPREAD = [64, 150, 236], CLOSE = [116, 150, 188];      // layer centres, apart and drawn together
    const plane = (w) => `M${-w / 2} 0 L0 ${-w / 4} L${w / 2} 0 L0 ${w / 4}Z`;
    // drawn bottom first, so the smaller layers sit on top
    const planes = [2, 1, 0].map((i) => { const e = document.createElementNS(NS, "path"); e.setAttribute("d", plane(L[i].w)); e.setAttribute("stroke-width", "1"); e.setAttribute("stroke-linejoin", "round"); lsvg.appendChild(e); return { i, e }; });
    const rows = P.$$(".tier-list li"), marks = rows.map((li) => P.$(".t-key path", li));
    const drawLayers = (p) => {
      const tight = sm(TIGHT[0], TIGHT[1], p);
      planes.forEach(({ i, e }) => {
        const s = sm(ON[i], ON[i] + 0.08, p), a = (s * L[i].alpha).toFixed(3);
        const y = lerp(lerp(150, SPREAD[i], sm(0, 0.08, p)), CLOSE[i], tight);
        e.setAttribute("transform", `translate(160 ${y.toFixed(1)})`);
        e.setAttribute("fill", L[i].fill); e.setAttribute("fill-opacity", a);
        e.setAttribute("stroke", L[i].line); e.setAttribute("stroke-opacity", (i === 2 ? lerp(L[i].lo, .35, s) : L[i].lo).toFixed(3));
        e.setAttribute("stroke-dasharray", i === 2 && s < 0.5 ? "2 4" : "none");
        marks[i].setAttribute("fill", L[i].fill); marks[i].setAttribute("fill-opacity", a);
        rows[i].classList.toggle("is-dim", p < ON[i] - 0.02);
      });
    };
    if (!P.gsap || P.reduce) drawLayers(1);
    else {
      const lo = { p: 0 };
      drawLayers(0);
      P.gsap.to(lo, { p: 1, ease: "none", onUpdate: () => drawLayers(lo.p),
        // done while the top of the stack is still well inside the screen
        scrollTrigger: { trigger: ".tiers", start: "top 85%", end: "top 30%", scrub: 0.8 } });
    }
  }
};

// ==== loop ====
/* Step 6: prototype, test, refine (twice round), then hand off to blueprint, platform and the predictive layer. */
window.PlaybookChapter = (P) => {
  const svg = P.$("#loop svg");
  if (!svg) return;
  const ring = P.$(".l-ring", svg), out = P.$(".l-out", svg), out2 = P.$(".l-out2", svg);
  const ball = P.$("#loop-ball", svg), hand = P.$(".l-hand", svg);
  const blue = P.$(".l-blue", svg), plat = P.$(".l-plat", svg), pred = P.$(".l-pred", svg);
  const sm = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  const draw = (p) => {
    const r = sm(0, 0.5, p);
    ring.setAttribute("stroke-dashoffset", (1 - Math.min(1, r * 2)).toFixed(3));
    const a = -Math.PI / 2 + r * Math.PI * 4;                 // twice round the loop
    let x = 210 + 120 * Math.cos(a), y = 170 + 120 * Math.sin(a);
    const leave = sm(0.5, 0.62, p);
    if (leave > 0) { x = 330 + (520 - 330) * leave; y = 170; }
    if (p >= 0.5 && leave === 0) { x = 330; y = 170; }
    ball.setAttribute("cx", x.toFixed(1)); ball.setAttribute("cy", y.toFixed(1));
    ball.setAttribute("opacity", (1 - sm(0.6, 0.66, p)).toFixed(3));
    out.setAttribute("stroke-dashoffset", (1 - leave).toFixed(3));
    hand.setAttribute("opacity", leave.toFixed(3));
    blue.setAttribute("opacity", sm(0.58, 0.68, p).toFixed(3));
    out2.setAttribute("stroke-dashoffset", (1 - sm(0.68, 0.74, p)).toFixed(3));
    plat.setAttribute("opacity", sm(0.72, 0.82, p).toFixed(3));
    pred.setAttribute("opacity", sm(0.84, 0.96, p).toFixed(3));
    pred.setAttribute("transform", `translate(0 ${(12 * (1 - sm(0.84, 0.96, p))).toFixed(1)})`);
  };
  if (!P.gsap || P.reduce) { draw(1); return; }
  const o = { p: 0 };
  draw(0);
  P.gsap.to(o, { p: 1, ease: "none", onUpdate: () => draw(o.p),
    scrollTrigger: { trigger: "#loop", start: "top 85%", end: "bottom 85%", scrub: 0.8 } });
};

// ==== start ====
/* Where to start: rings breathe behind the assessment call to action. */
window.PlaybookChapter = (P) => {
  const svg = P.$("#cta-art");
  if (svg && window.HeroMount) P.loop(svg, window.HeroMount(svg, "00"), 1.5, 2.5);
};
