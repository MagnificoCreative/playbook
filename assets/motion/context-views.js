/* Step 5 · Context views.
   Five tall strips, each a zoomed-in hero shot of one animation. Click a strip and it opens out, then its animation fades in
   from the start while the other strips narrow to slivers and the caption opens underneath. The open animation can grow into a
   full view with previous / next. Each animation is its own page in assets/context-views/, embedded with ?embed: it loads still
   on a poster frame and plays only when it's sent { seek, play } by postMessage.
   Markup: <div data-context-views="../assets/context-views/"> holding .cvs-row and .cvs-info. */
(() => {
  const root = document.querySelector("[data-context-views]");
  if (!root) return;
  const base = root.dataset.contextViews;
  const row = root.querySelector(".cvs-row"), info = root.querySelector(".cvs-info"), inner = root.querySelector(".cvs-in");

  // focus = the point of the hero an idle strip centres on, span = how much of the hero fits across it.
  // A hero is the animation held on its poster frame (the 1728 × 1117 stage), or a photograph (img, nw × nh, centred on open once opened)
  const VIEWS = [
    { file: "storm-context.html", label: "Hurricane map view for severe-weather planning", short: "Hurricane map", poster: 4.6, focus: [860, 590], span: 330,
      body: "A map view for severe-weather planning. When a storm enters the Gulf, the team sees its forecast track against every platform, and how ready each one is." },
    { file: "cost-context.html", label: "Price per barrel for market context", short: "Price per barrel", poster: 7.8, focus: [78, 402], span: 150,
      body: "Market context for cost decisions: what each platform’s barrels cost, set against budget and the day’s WTI and Brent prices." },
    { file: "flare-context.html", label: "Flaring by platform, how much and for how long", short: "Flaring", poster: 3.8, img: "flare/hero.jpg", nw: 3200, nh: 1800, focus: [1135, 430], span: 240, open: [1560, 760],
      body: "How much each platform flares, and for how long. The moment one starts, its duration, volume and monthly quota are one click away." },
    { file: "compressor-context.html", label: "A 3D model of a booster gas compressor, with metrics on the equipment", short: "Booster compressor", poster: 4.3, focus: [640, 470], span: 330,
      body: "A 3D model of the booster gas compressor skid, with live readings on each numbered section and the performance monitor behind them." },
    { file: "subsea-context.html", label: "Underwater views of pipelines and the wells they tap into", short: "Subsea", poster: 9.3, focus: [600, 470], span: 330,
      body: "Underwater views of the pipelines and the wells they tap into: from the platform down to its flow lines and sensors, out to a drill center and the manifold on the seabed." },
  ];
  const pad = (n) => String(n + 1).padStart(2, "0");
  const h = (html) => { const d = document.createElement("div"); d.innerHTML = html.trim(); return d.firstChild; };

  // One embedded animation. It loads still on its poster frame; play() runs it from a given time, still() puts the poster back
  function frame(v, poster) {
    const el = h(`<div class="cvs-frame"><iframe src="${base}${v.file}?embed&t=${poster}" title="${v.label}" loading="lazy" tabindex="-1"></iframe></div>`);
    const f = el.firstChild; let ready = false, want = null, on = false;
    const send = (m) => { if (ready) f.contentWindow.postMessage(m, "*"); else want = m; };
    f.addEventListener("load", () => { ready = true; if (want) f.contentWindow.postMessage(want, "*"); });
    return { el, play(from = 0) { if (!on) { on = true; send({ seek: from, play: true }); } }, still() { if (on || !ready) { on = false; send({ play: false, seek: poster }); } } };
  }

  const expandIcon = '<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8.5 1.5h4v4M12.5 1.5L8 6M5.5 12.5h-4v-4M1.5 12.5L6 8"/></svg>';
  const items = VIEWS.map((v, i) => {
    const hero = v.img ? h(`<div><img src="${base}${v.img}" alt=""></div>`) : frame(v, v.poster).el;
    hero.classList.add("cvs-hero");
    const b = h(`<button class="cvs-strip" type="button" aria-expanded="false" aria-label="${v.label}"><i class="cvs-tint"></i><i class="cvs-shade"></i><span class="cvs-name" aria-hidden="true">${v.short}</span><span class="cvs-vert" aria-hidden="true">${v.short}</span><span class="cvs-full" role="button" aria-label="Expand to full view">${expandIcon}</span><span class="cvs-close" role="button" aria-label="Back to all five">✕</span></button>`);
    b.prepend(hero); row.append(b);
    b.addEventListener("click", (e) => {
      if (e.target.closest(".cvs-full")) expand(i);
      else if (e.target.classList.contains("cvs-close")) open(-1);
      else if (i !== cur) open(i);
    });
    return { b, hero, v, nw: v.nw || 1728, nh: v.nh || 1117, live: null };
  });

  let cur = -1;
  // Size and offset a hero so its focus sits in the middle of a w × hh window, without showing past its edges
  const place = (el, w, hh, sc, f, nw, nh) => {
    const L = Math.min(0, Math.max(w - nw * sc, w / 2 - f[0] * sc)), T = Math.min(0, Math.max(hh - nh * sc, hh / 2 - f[1] * sc));
    Object.assign(el.style, { left: L.toFixed(1) + "px", top: T.toFixed(1) + "px", width: (nw * sc).toFixed(1) + "px", height: (nh * sc).toFixed(1) + "px" });
  };
  function layout() {
    const W = row.clientWidth, narrow = W < 640, gap = narrow && cur >= 0 ? 0 : narrow ? 8 : 12;
    const thin = narrow ? 0 : W < 900 ? 44 : 72;                 // on a phone the open view takes the whole row
    const we = W - 4 * thin - 4 * gap, he = we * 1117 / 1728;      // the opened strip
    const wi = Math.min(200, (W - 4 * gap) / 5), hi = narrow ? Math.max(wi * 2, 176) : wi * 2;   // an idle strip (never too short for its name on a phone)
    row.style.gap = gap + "px";
    row.style.height = (cur < 0 ? hi : he) + "px"; row.classList.toggle("has-on", cur >= 0); row.classList.toggle("is-narrow", narrow);
    items.forEach((x, i) => {
      const on = i === cur, w = cur < 0 ? wi : on ? we : thin, hh = cur < 0 ? hi : he;
      x.b.style.width = w + "px"; x.b.style.height = hh + "px"; x.b.classList.toggle("is-on", on);
      x.b.setAttribute("aria-expanded", on); x.b.tabIndex = w === 0 ? -1 : 0;
      if (on) place(x.hero, we, he, Math.max(we / x.nw, he / x.nh), x.v.open || [x.nw / 2, x.nh / 2], x.nw, x.nh);
      else place(x.hero, w, hh, Math.max(wi / x.v.span, hh / x.nh), x.v.focus, x.nw, x.nh);
      if (x.live && !x.live.el.classList.contains("is-full")) Object.assign(x.live.el.style, { width: we + "px", height: he + "px" });
    });
  }

  // The live animation sits over the hero and fades in once the strip has opened; it fades away again when the strip closes
  function drop(x) { const l = x.live; if (!l) return; x.live = null; x.b.classList.remove("is-live"); l.still(); l.el.classList.remove("is-in"); setTimeout(() => l.el.remove(), 950); }
  // fixed = a window rect when the animation should appear straight into full view
  function startLive(i, fixed) {
    const x = items[i], live = frame(x.v, 0);
    live.el.classList.add("cvs-live"); x.live = live; x.b.insertBefore(live.el, x.hero.nextSibling);
    if (fixed) { live.el.classList.add("is-full", "is-moving"); live.el.style.zIndex = 62; box(live.el, fixed); } else layout();
    let n = 0; const go = () => { if (++n === 2 && x.live === live) { live.el.classList.add("is-in"); x.b.classList.add("is-live"); live.play(0); } };
    live.el.firstChild.addEventListener("load", go, { once: true }); setTimeout(go, fixed ? 0 : 820);
  }
  function open(i, fixed) {
    items.forEach((x, k) => { if (k !== i) drop(x); });
    cur = i; layout(); caption(i);
    if (i >= 0) startLive(i, fixed);
  }

  // Caption below the strips: the number and short headline on the left, the explanation on the right
  function caption(i) {
    if (i < 0) { info.classList.remove("is-open"); return; }
    const v = VIEWS[i], html = `<div class="cvs-lab"><span class="cvs-no"><b>${pad(i)}</b></span><h4>${v.short}</h4></div><p>${v.body}</p>`;
    if (!info.classList.contains("is-open")) { inner.innerHTML = html; inner.style.opacity = 1; info.classList.add("is-open"); return; }
    inner.style.opacity = 0; setTimeout(() => { if (cur === i) { inner.innerHTML = html; inner.style.opacity = 1; } }, 270);
  }

  // Full view: lift the live animation out of its strip (position: fixed, so the iframe never reloads) and grow it to fill the window
  let full = null;
  const box = (el, r) => Object.assign(el.style, { left: r.left + "px", top: r.top + "px", width: r.width + "px", height: r.height + "px" });
  function fullRect() {
    const capH = 96, w = Math.min(1480, innerWidth * .92, (innerHeight * .92 - capH) * 1728 / 1117), hh = w * 1117 / 1728;
    return { left: (innerWidth - w) / 2, top: Math.max(16, (innerHeight - hh - capH) / 2), width: w, height: hh };
  }
  const fullCap = (i) => `<span class="cvs-fno">${pad(i)}</span><div><h4>${VIEWS[i].short}</h4><p>${VIEWS[i].body}</p></div>`;
  function placeExtras(r) {
    Object.assign(full.cap.style, { left: r.left + "px", top: r.top + r.height + 22 + "px", width: r.width - 128 + "px" });
    Object.assign(full.nav.style, { left: r.left + r.width - 96 + "px", top: r.top + r.height + 18 + "px" });
    Object.assign(full.xb.style, { left: r.left + r.width - 54 + "px", top: r.top + 14 + "px" });
  }
  function expand(i) {
    const x = items[i]; if (!x.live || full) return;
    const el = x.live.el;
    full = {
      x, el,
      back: h('<div class="cvs-back"></div>'),
      cap: h(`<div class="cvs-fcap">${fullCap(i)}</div>`),
      nav: h('<div class="cvs-fnav"><button type="button" aria-label="Previous view">←</button><button type="button" aria-label="Next view">→</button></div>'),
      xb: h('<button class="cvs-fx" type="button" aria-label="Close full view">✕</button>'),
      onResize: () => { const r = fullRect(); box(full.el, r); placeExtras(r); },
    };
    const parts = [full.back, full.cap, full.nav, full.xb];
    document.body.append(...parts);
    box(el, el.getBoundingClientRect()); el.classList.add("is-full"); el.getBoundingClientRect(); el.classList.add("is-moving");
    document.documentElement.classList.add("cvs-locked");
    requestAnimationFrame(() => { full.onResize(); parts.forEach((k) => k.classList.add("is-in")); full.xb.focus({ preventScroll: true }); });
    addEventListener("resize", full.onResize);
    full.back.onclick = full.xb.onclick = collapse;
    full.nav.children[0].onclick = () => step(-1); full.nav.children[1].onclick = () => step(1);
  }
  // Previous / next without leaving full view: the new animation fades in over the old one, and the strips follow behind the backdrop
  function step(dir) {
    if (!full) return;
    const j = (cur + dir + VIEWS.length) % VIEWS.length;
    full.el.style.zIndex = "";
    open(j, fullRect());
    full.x = items[j]; full.el = items[j].live.el;
    full.cap.classList.remove("is-in");
    setTimeout(() => { if (full && cur === j) { full.cap.innerHTML = fullCap(j); full.cap.classList.add("is-in"); } }, 280);
  }
  function collapse() {
    if (!full) return; const f = full; full = null;
    removeEventListener("resize", f.onResize);
    const parts = [f.back, f.cap, f.nav, f.xb];
    parts.forEach((k) => k.classList.remove("is-in"));
    f.el.classList.add("is-moving"); f.el.getBoundingClientRect();
    box(f.el, f.x.b.getBoundingClientRect());
    setTimeout(() => {
      f.el.classList.remove("is-full", "is-moving"); f.el.style.left = f.el.style.top = f.el.style.zIndex = "";
      document.documentElement.classList.remove("cvs-locked"); layout(); parts.forEach((k) => k.remove());
      const btn = f.x.b.querySelector(".cvs-full"); if (btn) btn.focus({ preventScroll: true });
    }, 680);
  }

  addEventListener("keydown", (e) => {
    if (full) { if (e.key === "Escape") collapse(); if (e.key === "ArrowLeft") step(-1); if (e.key === "ArrowRight") step(1); return; }
    if (e.key === "Escape" && cur >= 0 && root.contains(document.activeElement)) open(-1);
  });
  let W0 = -1;
  new ResizeObserver(() => { if (row.clientWidth !== W0) { W0 = row.clientWidth; layout(); } }).observe(row);
  layout();
})();
