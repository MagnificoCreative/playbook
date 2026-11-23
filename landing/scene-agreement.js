/* Landing hero scene "Agreement", registered as HeroScenes.LP. Used by the problem section's image.
   Needs assets/motion/hero-scenes.js first. */
(() => {
  /* ═════════ Hero scene · "Agreement" ═════════
     Seven needles (versions of the same number) point their own way around the ball and waver. Every ten seconds
     they swing into one direction, overshoot, settle and lie on top of each other, so the line brightens: one truth.
     The ball breathes as each one arrives. Then they drift apart again. Pure draw(t), seamless loop. */
  const K = window.HeroKit;
  if (K && window.HeroScenes) {
    window.HeroScenes.LP = (svg) => {
      const { C, B, TAU, el, set, f2, sm, lerp, clamp, rng, io, backOut } = K;
      const R = rng(11), N = 7, RL = 236, P = 10;
      el("circle", { cx: C, cy: C, r: RL, class: "gd" }, svg);
      el("circle", { cx: C, cy: C, r: 128, class: "gd" }, svg);
      const glow = el("circle", { cx: C, cy: C, r: 48, fill: K.glowDef(svg), opacity: 0, class: "glow" }, svg);
      const L = Array.from({ length: N }, (_, i) => ({
        off: (i / (N - 1) - 0.5) * 2.6 + (R() - 0.5) * 0.35,   // where this version points when nobody agrees
        w: 0.45 + R() * 0.7, ph: R() * TAU, amp: 0.1 + R() * 0.14,
        len: 120 + R() * 110, lw: 0.6 + R() * 0.6,
        d: R() * 0.75,                                         // its own arrival delay
        line: el("line", { class: "ln", "stroke-opacity": 0.4 }, svg),
        dot: el("circle", { class: "dot", r: 3 }, svg),
      }));
      const b = K.ball(svg);
      return (t) => {
        const c = ((t % P) + P) % P;
        const theta = -0.62 + 0.32 * Math.sin(t * 0.11);         // the shared direction drifts slowly
        let pulse = 0;
        L.forEach((l) => {
          const s = c - l.d;
          const k = s < 7.1 ? backOut(clamp((s - 3.4) / 1.9, 0, 1)) : 1 - io(clamp((s - 7.1) / 2, 0, 1));
          const kc = clamp(k, 0, 1);
          const a = theta + (1 - k) * (l.off + l.amp * Math.sin(t * l.w + l.ph));
          const len = lerp(l.len + 12 * Math.sin(t * l.lw + l.ph), RL, kc);
          const cos = Math.cos(a), sin = Math.sin(a);
          set(l.line, { x1: f2(C + 30 * cos), y1: f2(C + 30 * sin), x2: f2(C + len * cos), y2: f2(C + len * sin), "stroke-opacity": f2(lerp(0.36, 0.52, kc)) });
          set(l.dot, { cx: f2(C + len * cos), cy: f2(C + len * sin), opacity: f2(lerp(0.7, 0.35, kc)) });
          const arr = 3.4 + l.d + 1.05;                            // roughly when this needle reaches the line
          pulse += Math.max(0, 1 - Math.abs(c - arr) / 0.45);
        });
        pulse = sm(0, 1, clamp(pulse / 2.2, 0, 1));
        set(b, { r: f2(B * (1 + 0.16 * pulse)) });
        set(glow, { opacity: f2(0.4 * pulse) });
      };
    };
  }

})();
