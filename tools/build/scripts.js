// ==== intro ====
/* Introduction: one piece of information travels Source → Act and loses trust at every stage. */
window.PlaybookChapter = (P) => {
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
      scrollTrigger: { trigger: "#where-trust-is-lost", start: () => `top top+=${P.barH()}`, end: "+=120%", pin: true, scrub: 0.6, anticipatePin: 1, invalidateOnRefresh: true, refreshPriority: 1 } });
  });
  mm.add("(max-width: 1100px), (max-height: 619px)", () => {
    P.gsap.to(o, { p: 1, ease: "none", onUpdate: () => draw(o.p),
      scrollTrigger: { trigger: "#flow", start: "top 70%", end: "bottom 55%", scrub: 0.8 } });
  });
};

// ==== roles ====
/* Step 2: choose a role; the same sample view reshapes to that role's level of detail. */
window.PlaybookChapter = (P) => {
  const L = {
    exec:        [[0,0,32,40],[34,0,32,40],[68,0,32,40],[0,44,100,56]],
    reliability: [[0,0,100,18],[0,22,32,37],[34,22,32,37],[68,22,32,37],[0,63,32,37],[34,63,32,37],[68,63,32,37]],
    maintenance: [[0,0,34,30],[0,34,34,30],[0,68,34,32],[38,0,62,60],[38,64,30,36],[70,64,30,36]],
    project:     [[0,0,64,21],[16,26,58,21],[36,52,64,21],[8,78,48,22],[76,0,24,21]],
    engineering: [[0,0,49,40],[51,0,49,40],[0,44,24,26],[25.3,44,24,26],[50.6,44,24,26],[76,44,24,26],[0,74,32,26],[34,74,32,26],[68,74,32,26]],
  };
  const DEPTH = {
    exec: "Seconds: are operations healthy, and where aren’t they?",
    reliability: "Asset by asset",
    maintenance: "The signal, then the detail behind it",
    project: "Progress, risks and dependencies",
    engineering: "Down to a single asset’s detail",
  };
  const tabs = P.$$(".role-tab"), tiles = P.$$("#board .tile");
  if (!tabs.length) return;
  const name = P.$("#role-name"), depth = P.$("#role-depth");
  const show = (key) => {
    tabs.forEach((t) => { const on = t.dataset.role === key; t.setAttribute("aria-selected", on); t.tabIndex = on ? 0 : -1; });
    const lay = L[key];
    tiles.forEach((tile, i) => {
      const r = lay[i];
      tile.classList.toggle("is-off", !r);
      if (r) Object.assign(tile.style, { left: r[0] + "%", top: r[1] + "%", width: r[2] + "%", height: r[3] + "%" });
    });
    name.textContent = P.$(`.role-tab[data-role="${key}"] .r-name`).textContent;
    depth.textContent = DEPTH[key];
  };
  tabs.forEach((t, i) => {
    t.addEventListener("click", () => show(t.dataset.role));
    t.addEventListener("keydown", (e) => {
      const d = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 0;
      if (!d) return;
      e.preventDefault();
      const n = tabs[(i + d + tabs.length) % tabs.length];
      n.focus(); show(n.dataset.role);
    });
  });
  show("exec");
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
/* Step 4: a cloud of measures filters through five questions and settles into five categories. */
window.PlaybookChapter = (P) => {
  const host = P.$("#sieve-dots");
  if (!host) return;
  const NS = "http://www.w3.org/2000/svg", N = 48, GATES = [300, 405, 510, 615, 720];
  let s = 11;
  const rnd = () => (s = (s * 16807) % 2147483647, (s - 1) / 2147483646);
  const sm = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  const survivors = new Set([3, 9, 14, 20, 25, 31, 36, 40, 44, 47]);
  let k = 0;
  const dots = Array.from({ length: N }, (_, i) => {
    const a = rnd() * Math.PI * 2, r = Math.sqrt(rnd()) * 105;
    const d = { sx: 140 + Math.cos(a) * r * 0.85, sy: 245 + Math.sin(a) * r, delay: rnd() * 0.18 };
    if (survivors.has(i)) { const c = Math.floor(k / 2); d.fx = 868 + (k % 2) * 18; d.fy = 120 + c * 62; d.keep = true; k++; }
    else { d.gate = Math.floor(rnd() * 5); d.gy = 110 + rnd() * 290; }
    d.el = document.createElementNS(NS, "circle");
    d.el.setAttribute("r", 5);
    host.appendChild(d.el);
    return d;
  });
  const draw = (p) => {
    dots.forEach((d) => {
      const q = Math.min(1, Math.max(0, (p - d.delay) / 0.78));
      let x, y, op = 0.55, fill = "#002a32";
      if (d.keep) {
        const e = q < 0.5 ? 2 * q * q : 1 - Math.pow(-2 * q + 2, 2) / 2;
        x = d.sx + (d.fx - d.sx) * e; y = d.sy + (d.fy - d.sy) * e;
        if (q > 0.92) { fill = "#ff0074"; op = 1; }
      } else {
        const reach = (d.gate + 1) / 5;              // how far along the sieve this one gets
        const t = Math.min(1, q / reach);
        const gx = GATES[d.gate] - 14;
        x = d.sx + (gx - d.sx) * (1 - Math.pow(1 - t, 2));
        y = d.sy + (d.gy - d.sy) * t;
        const fall = sm(0.85, 1, t) * (q >= reach ? 1 : 0);
        y += 40 * fall; op = 0.55 * (1 - fall);
      }
      d.el.setAttribute("cx", x.toFixed(1)); d.el.setAttribute("cy", y.toFixed(1));
      d.el.setAttribute("fill", fill); d.el.setAttribute("opacity", op.toFixed(3));
    });
  };
  if (!P.gsap || P.reduce) { draw(1); return; }
  const o = { p: 0 };
  draw(0);
  P.gsap.to(o, { p: 1, ease: "none", onUpdate: () => draw(o.p),
    scrollTrigger: { trigger: "#sieve", start: "top 85%", end: "bottom 85%", scrub: 0.8 } });
};

// ==== path ====
/* Step 5: tap through one alert, from signal to action. */
window.PlaybookChapter = (P) => {
  const STEPS = [
    ["Signal", "Tells someone that something needs attention.", "Gas compression availability on one platform drops below its target."],
    ["Context", "Tells them what it means.", "One compressor has tripped twice in 24 hours, and the other two trains are running near capacity."],
    ["Investigation", "Lets them dig into the cause.", "The trip log points to high discharge temperature, and the cooler was due for cleaning last week."],
    ["Action", "Closes the loop.", "The maintenance lead schedules the cleaning, and production adjusts the plan for the next shift."],
  ];
  const btns = P.$$(".path-step");
  if (!btns.length) return;
  const label = P.$("#pc-label"), title = P.$("#pc-title"), prev = P.$("#path-prev"), next = P.$("#path-next");
  const fill = P.$("#path-fill"), groups = P.$$("#path-art [data-s]");
  groups.forEach((g) => { g.style.transition = "opacity .5s cubic-bezier(.22,1,.36,1)"; });
  let cur = 0;
  const show = (i) => {
    cur = i;
    btns.forEach((b, j) => { b.setAttribute("aria-selected", j === i); b.classList.toggle("is-reached", j <= i); b.tabIndex = j === i ? 0 : -1; });
    fill.style.width = `${i * 25}%`;  // from the first dot to the current one
    label.textContent = `${STEPS[i][0]} · ${STEPS[i][1]}`;
    title.textContent = STEPS[i][2];
    groups.forEach((g) => { g.style.opacity = +g.dataset.s <= i ? 1 : 0.08; });
    prev.disabled = i === 0;
    next.textContent = i < STEPS.length - 1 ? `Next: ${STEPS[i + 1][0]}` : "Start over";
    if (P.gsap && !P.reduce) P.gsap.fromTo([label, title], { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.05, ease: "expo.out" });
  };
  btns.forEach((b, i) => b.addEventListener("click", () => show(i)));
  prev.addEventListener("click", () => show(Math.max(0, cur - 1)));
  next.addEventListener("click", () => show(cur < STEPS.length - 1 ? cur + 1 : 0));
  show(0);
  if (P.gsap && !P.reduce) {
    P.gsap.from("#pyramid .tier", { y: 24, opacity: 0, duration: 1, stagger: 0.12, ease: "expo.out",
      scrollTrigger: { trigger: "#pyramid", start: "top 80%", toggleActions: "play none none reverse" } });
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
