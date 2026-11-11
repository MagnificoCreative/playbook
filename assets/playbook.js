/* Playbook chapter runtime: shared by every chapter page.
   Load order: GSAP, ScrollTrigger, Lenis, motion scenes, the chapter's own script (optional), then this file.
   A chapter script can set window.PlaybookChapter = (P) => { ... } to add its own scroll work;
   it runs after the shared sections are wired and before the scroll spy measures the page. */
(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  const hasGsap = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const barH = () => $(".bar").getBoundingClientRect().height;
  // Where pinned sections stop: a breathing gap below the top bar (40–88px, 9% of the viewport), never flush against it
  const pinTop = () => barH() + Math.round(Math.min(88, Math.max(40, window.innerHeight * 0.09)));

  /* A requestAnimationFrame clock that only runs while the element is on screen. */
  const loop = (target, draw, start = 0, still = start) => {
    let clock = reduce ? still : start, visible = false, last = performance.now();
    draw(clock);
    if (reduce) return;
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { rootMargin: "80px" }).observe(target);
    const tick = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      if (visible) { clock += dt; draw(clock); }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  /* ───── Hero scene ───── */
  const heroSvg = $(".hero-art svg[data-hero]");
  if (heroSvg && window.HeroMount) loop(heroSvg, window.HeroMount(heroSvg, heroSvg.dataset.hero), 2.2, 2.5);

  /* ───── How to apply: step illustrations loop while their card is on screen ───── */
  if (window.HowtoScenes) {
    $$(".illo[data-scene]").forEach((svg) => {
      const key = svg.dataset.scene;
      loop(svg, window.HowtoScenes.mount(svg, key), 0, window.HowtoScenes.STILL[key]);
    });
  }

  /* ───── Toast for links that aren't live yet ───── */
  const toast = $("#toast");
  let toastTimer;
  const say = (msg) => {
    toast.textContent = msg;
    toast.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("is-on"), 2200);
  };
  $$("[data-soon]").forEach((el) => el.addEventListener("click", (e) => {
    e.preventDefault();
    say(el.dataset.soon || "The assessment launches soon");
  }));

  /* ───── Contents menu: collapsible rail on wide screens, a drawer below 1100px ───── */
  const menuBtn = $("#menu-btn");
  const body = document.body;
  const wide = window.matchMedia("(min-width: 1101px)");
  let lenis = null;
  let collapsed = false;
  try { collapsed = localStorage.getItem("playbook-rail") === "collapsed"; } catch (e) { /* storage unavailable */ }
  const syncMenu = () => {
    body.classList.toggle("rail-collapsed", wide.matches && collapsed);
    const open = wide.matches ? !collapsed : body.classList.contains("nav-open");
    body.classList.toggle("menu-is-open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "Hide contents" : "Show contents");
  };
  const setNav = (open) => {
    body.classList.toggle("nav-open", open);
    syncMenu();
    if (lenis) open ? lenis.stop() : lenis.start();
    if (open) $(".rail .toc-item.is-current .toc-link")?.focus({ preventScroll: true });
  };
  const setCollapsed = (v) => {
    collapsed = v;
    try { localStorage.setItem("playbook-rail", v ? "collapsed" : "open"); } catch (e) { /* storage unavailable */ }
    syncMenu();
    // The page reflows as the rail slides away; re-measure pinned sections once it settles.
    setTimeout(() => window.ScrollTrigger && ScrollTrigger.refresh(), 600);
  };
  syncMenu();
  requestAnimationFrame(() => requestAnimationFrame(() => body.classList.add("rail-ready"))); // no slide on first paint
  wide.addEventListener("change", () => { if (wide.matches) body.classList.remove("nav-open"); syncMenu(); });
  menuBtn.addEventListener("click", () => {
    if (wide.matches) setCollapsed(!collapsed);
    else setNav(!body.classList.contains("nav-open"));
  });
  $("#scrim").addEventListener("click", () => setNav(false));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && document.body.classList.contains("nav-open")) { setNav(false); menuBtn.focus(); }
  });

  /* ───── In-page navigation ───── */
  const scrollToEl = (el) => {
    const y = el.getBoundingClientRect().top + window.scrollY - barH();
    if (lenis) lenis.scrollTo(y, { duration: 1.4 });
    else window.scrollTo({ top: y, behavior: reduce ? "auto" : "smooth" });
  };
  $$('a[href^="#"]:not([data-soon])').forEach((a) => {
    const id = a.getAttribute("href").slice(1);
    if (!id) return;
    a.addEventListener("click", (e) => {
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      setNav(false);
      scrollToEl(target);
      if (id === "main") target.focus?.();
    });
  });

  /* ───── Logo: full at the top, reduced mark once the header panel has scrolled away ───── */
  const bar = $(".bar");
  const heroSec = $("#top");
  const updateLogo = () => bar.classList.toggle("is-compact", heroSec.getBoundingClientRect().bottom <= barH() + 1);
  window.addEventListener("scroll", updateLogo, { passive: true });
  window.addEventListener("resize", updateLogo);
  updateLogo();

  /* ───── How to apply: build the meter from the cards ───── */
  const section = $("#how-to-apply");
  const cards = $$(".card");
  const ticksBox = $(".ticks");
  if (ticksBox && !ticksBox.children.length) {
    cards.forEach((c, i) => {
      const b = document.createElement("button");
      b.className = "tick" + (i ? "" : " is-active");
      b.type = "button";
      b.dataset.go = i;
      b.innerHTML = `<span class="tick-label">Step ${i + 1}: ${$(".card-label", c)?.textContent || ""}</span>`;
      ticksBox.appendChild(b);
    });
    const total = $("#meter-total");
    if (total) total.textContent = String(cards.length).padStart(2, "0");
  }

  const P = { $, $$, gsap: window.gsap, ScrollTrigger: window.ScrollTrigger, reduce, barH, pinTop, loop, say, get lenis() { return lenis; } };
  const runChapter = () => { if (typeof window.PlaybookChapter === "function") window.PlaybookChapter(P); };

  if (!hasGsap) { runChapter(); return; } // The page still reads fully without the libraries.

  gsap.registerPlugin(ScrollTrigger);

  /* ───── Smooth scroll ───── */
  /* Lenis drives document.documentElement, which only scrolls in standards mode. */
  if (!reduce && document.compatMode === "CSS1Compat" && typeof window.Lenis !== "undefined") {
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true, wheelMultiplier: 1 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  /* ───── Page progress + scroll spy ───── */
  const progress = $("#page-progress");
  ScrollTrigger.create({ start: 0, end: "max", onUpdate: (s) => { progress.style.transform = `scaleX(${s.progress})`; } });
  const spyLinks = $$("[data-spy]");
  const barSection = $("#bar-section");
  const setActive = (id) => {
    spyLinks.forEach((l) => l.classList.toggle("is-active", l.dataset.spy === id));
    if (barSection) barSection.textContent = spyLinks.find((l) => l.dataset.spy === id)?.textContent || "";  // the hero shows the chapter alone
  };
  const createSpy = () => {
    const secs = $$("[data-section]");
    secs.forEach((sec, i) => {
      const next = secs[i + 1];
      ScrollTrigger.create({
        trigger: sec, start: "top 50%",
        endTrigger: next || sec, end: next ? "top 50%" : "bottom 50%",
        onToggle: (s) => { if (s.isActive) setActive(sec.dataset.section); },
      });
    });
  };
  const finish = () => {
    createSpy(); // last, so it measures sections after the pin spacing exists
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
    window.addEventListener("load", () => ScrollTrigger.refresh());
  };

  /* How to apply: each card's copy reveals as it arrives (each timeline runs 0 → 1). */
  const timelines = cards.map((card) => {
    const tl = gsap.timeline({ paused: true, defaults: { ease: "none" } }).set({}, {}, 1);
    tl.from($$(".card-meta, .card-title, .card-body", card), { y: 28, opacity: 0, duration: 0.3, stagger: 0.06, ease: "power3.out" }, 0);
    return tl;
  });

  if (reduce) {
    timelines.forEach((tl) => tl.progress(1));
    runChapter();
    finish();
    return; // Everything stays in its finished, readable state.
  }

  /* ───── Hero: load sequence + scroll-away ───── */
  const hero = $(".hero");
  gsap.timeline({ defaults: { ease: "expo.out" } })
    .from(".hero .eyebrow", { y: 16, opacity: 0, duration: 1 }, 0.1)
    .from(".display .w > span", { yPercent: 110, duration: 1.2, stagger: 0.08 }, 0.15)
    .from(".hero .lead", { y: 20, opacity: 0, duration: 1.1 }, 0.55)
    .from(".hero-art", { opacity: 0, scale: 0.86, duration: 1.8 }, 0.2)
    .from(".cue", { opacity: 0, duration: 1 }, 0.9);
  gsap.to(".hero-inner", {
    yPercent: -14, opacity: 0.25, ease: "none",
    scrollTrigger: { trigger: hero, start: () => `top top+=${barH()}`, end: "bottom top", scrub: true },
  });
  gsap.to(".hero-art svg", {
    rotate: 12, scale: 1.12, ease: "none",
    scrollTrigger: { trigger: hero, start: () => `top top+=${barH()}`, end: "bottom top", scrub: true },
  });

  /* ───── Lead paragraphs: words come into focus as you read ───── */
  const wrapWords = (node) => {
    Array.from(node.childNodes).forEach((n) => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) frag.appendChild(document.createTextNode(part));
          else { const s = document.createElement("span"); s.className = "word"; s.textContent = part; frag.appendChild(s); }
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1) wrapWords(n);
    });
  };
  $$("[data-words]").forEach((lead) => {
    wrapWords(lead);
    gsap.fromTo($$(".word", lead), { opacity: 0.14 }, {
      opacity: 1, stagger: 0.05, ease: "none",
      scrollTrigger: { trigger: lead, start: "top 82%", end: "bottom 48%", scrub: true },
    });
  });

  $$(".people").forEach((p) => {
    gsap.from($$(".people-head > *, .people-text", p), {
      y: 30, opacity: 0, duration: 1.1, stagger: 0.1, ease: "expo.out",
      scrollTrigger: { trigger: p, start: "top 70%", toggleActions: "play none none reverse" },
    });
  });

  /* ───── Generic reveals: children of [data-reveal] rise in when the block arrives ───── */
  $$("[data-reveal]").forEach((box) => {
    gsap.from(box.children, {
      y: 30, opacity: 0, duration: 1.1, stagger: 0.08, ease: "expo.out",
      scrollTrigger: { trigger: box, start: box.dataset.reveal || "top 75%", toggleActions: "play none none reverse" },
    });
  });

  /* ───── How to apply: pinned horizontal travel ───── */
  if (section && cards.length) {
    const viewport = $(".howto-viewport");
    const track = $(".howto-track");
    const meterCur = $("#meter-cur");
    const ticks = $$(".tick");
    let howtoST = null, lastIdx = 0;
    const setMeter = (i) => {
      if (i === lastIdx) return;
      lastIdx = i;
      meterCur.textContent = String(i + 1).padStart(2, "0");
      ticks.forEach((t, j) => t.classList.toggle("is-active", j === i));
    };
    const pad = () => parseFloat(getComputedStyle(viewport).paddingLeft) || 0;
    const dist = () => Math.max(0, track.scrollWidth - (viewport.clientWidth - 2 * pad()));
    const mm = gsap.matchMedia();
    mm.add("(min-width: 768px)", () => {
      const travel = gsap.to(track, {
        x: () => -dist(), ease: "none",
        scrollTrigger: {
          trigger: section, start: () => `top top+=${pinTop()}`, end: () => `+=${dist()}`,
          pin: true, scrub: true, anticipatePin: 1, invalidateOnRefresh: true,
          onUpdate: (s) => {
            const x = s.progress * dist();
            let idx = 0;
            cards.forEach((c, i) => { if (c.offsetLeft - cards[0].offsetLeft <= x + c.offsetWidth * 0.5) idx = i; });
            setMeter(idx);
          },
        },
      });
      howtoST = travel.scrollTrigger;
      const vp = () => viewport.getBoundingClientRect();
      timelines.forEach((tl, i) => {
        if (i === 0) {
          ScrollTrigger.create({ trigger: section, start: "top 78%", end: () => `top top+=${pinTop() + 4}`, scrub: 0.6, animation: tl });
        } else {
          ScrollTrigger.create({
            trigger: cards[i], containerAnimation: travel,
            start: () => `left ${vp().right - vp().width * 0.08}px`,
            end: () => `left ${vp().left + vp().width * 0.32}px`,
            scrub: 0.6, animation: tl,
          });
        }
      });
      return () => { howtoST = null; gsap.set(track, { clearProps: "transform" }); };
    });
    mm.add("(max-width: 767px)", () => {
      timelines.forEach((tl, i) => ScrollTrigger.create({ trigger: cards[i], start: "top 85%", end: "center 55%", scrub: 0.6, animation: tl }));
    });
    ticks.forEach((t) => t.addEventListener("click", () => {
      if (!howtoST) return;
      const total = Math.max(1, dist());
      const x = Math.min(cards[+t.dataset.go].offsetLeft - cards[0].offsetLeft, total);
      const y = howtoST.start + (x / total) * (howtoST.end - howtoST.start);
      if (lenis) lenis.scrollTo(y, { duration: 1.2 }); else window.scrollTo({ top: y, behavior: "smooth" });
    }));
  }

  /* ───── In the field ───── */
  const field = $("#in-the-field");
  if (field) {
    gsap.from(".field-copy > *", {
      y: 30, opacity: 0, duration: 1.1, stagger: 0.08, ease: "expo.out",
      scrollTrigger: { trigger: field, start: "top 70%", toggleActions: "play none none reverse" },
    });
    gsap.from(".field-quote > *, .field-aside > *", {
      y: 30, opacity: 0, duration: 1.2, stagger: 0.12, ease: "expo.out",
      scrollTrigger: { trigger: field, start: "top 55%", toggleActions: "play none none reverse" },
    });
  }
  $$("[data-count]").forEach((el, i) => {
    const target = +el.dataset.count;
    const pad = el.dataset.pad === "0" ? 0 : 2;
    const fmt = (v) => String(Math.round(v)).padStart(pad, "0");
    const o = { v: 0 };
    el.textContent = fmt(0);
    ScrollTrigger.create({
      trigger: el.closest(".stats") || el, start: "top 85%", once: true,
      onEnter: () => gsap.to(o, { v: target, duration: 1.6, delay: (i % 3) * 0.12, ease: "power3.out", onUpdate: () => { el.textContent = fmt(o.v); } }),
    });
  });

  /* ───── Pink bullets gather from a loose cluster and land beside each item ───── */
  $$("[data-bullets]").forEach((box) => {
    const dots = $$(".dot", box);
    const scatter = dots.map((_, i) => ({ a: (i / dots.length) * Math.PI * 2 + 0.4, r: 26 + (i % 3) * 14 }));
    gsap.from(dots, {
      x: (i, el) => { const g = box.getBoundingClientRect(), d = el.getBoundingClientRect(); return g.left + g.width / 2 + Math.cos(scatter[i].a) * scatter[i].r * 2.2 - (d.left + d.width / 2); },
      y: (i, el) => { const g = box.getBoundingClientRect(), d = el.getBoundingClientRect(); return g.top - 70 + Math.sin(scatter[i].a) * scatter[i].r - (d.top + d.height / 2); },
      ease: "power2.inOut", stagger: 0.03,
      scrollTrigger: { trigger: box, start: "top 92%", end: "top 45%", scrub: 0.8, invalidateOnRefresh: true },
    });
    gsap.from($$("h3, .li-text", box), {
      y: 16, opacity: 0, duration: 0.9, stagger: 0.04, ease: "expo.out",
      scrollTrigger: { trigger: box, start: "top 55%", toggleActions: "play none none reverse" },
    });
  });

  runChapter();
  finish();
})();
