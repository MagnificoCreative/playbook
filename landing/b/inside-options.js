/* What's inside card options: each chapter scene runs on its own clock while it's on screen. */
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.querySelectorAll("[data-scene]").forEach((svg, i) => {
    const key = svg.dataset.scene;
    if (!window.HeroMount || !window.HeroScenes || !window.HeroScenes[key]) return;
    const draw = window.HeroMount(svg, key, {});
    let t = 0.6 * (i % 6), vis = false, last = 0;
    if (reduce) { draw(5.5); return; }
    draw(t);
    const tick = (now) => { if (!vis) return; t += Math.min(0.05, (now - last) / 1000); last = now; draw(t); requestAnimationFrame(tick); };
    new IntersectionObserver(([e]) => { const was = vis; vis = e.isIntersecting; if (vis && !was) { last = performance.now(); requestAnimationFrame(tick); } }).observe(svg);
  });
})();
