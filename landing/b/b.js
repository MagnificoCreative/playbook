/* Landing page · version B runtime: hero, chapter scenes, the pinned problem travel, nav, reveals, and the HubSpot form.
   Needs assets/motion/hero-scenes.js, hero-fx.js and ../hubspot-config.js first; GSAP is optional. */
(() => {
  const HUBSPOT = Object.assign({ portalId: "", formId: "", region: "na1", submitText: "Send me the playbook" }, window.LP_HUBSPOT || {});
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const gsap = window.gsap, ST = window.ScrollTrigger;
  if (gsap && ST) gsap.registerPlugin(ST);
  const yr = $("#yr"); if (yr) yr.textContent = new Date().getFullYear();

  /* ═════════ Scenes: each runs on its own clock while on screen ═════════ */
  const runScene = (svg, key, opts = {}) => {
    if (!svg || !window.HeroMount || !window.HeroScenes || !window.HeroScenes[key]) return;
    const draw = window.HeroMount(svg, key, opts);
    let t = opts.t0 || 0, vis = false, last = 0;
    if (reduce) { draw(opts.still != null ? opts.still : 5.5); return; }
    draw(t);
    const tick = (now) => { if (!vis) return; t += Math.min(0.05, (now - last) / 1000); last = now; draw(t); requestAnimationFrame(tick); };
    new IntersectionObserver(([e]) => { const was = vis; vis = e.isIntersecting; if (vis && !was) { last = performance.now(); requestAnimationFrame(tick); } }).observe(svg);
  };
  /* The hero: option 04 "Agreement → contours" at 50% line opacity, full bleed behind the copy */
  const heroEl = $(".hero-fx");
  if (heroEl && window.HeroFX) window.HeroFX.mount(heroEl, { canvas: $("#hero-canvas"), copy: $(".hero-fx .hero-text"), scene: "shift", lines: 0.5 });
  $$("[data-scene]").forEach((svg, i) => runScene(svg, svg.dataset.scene, { t0: 0.6 * i }));

  /* ═════════ The problem: pinned horizontal travel (the playbook's "How to apply it") ═════════
     Wide screens: the panel pins under the nav and vertical scroll moves the track sideways by exactly its overflow;
     the counter and ticks follow the card in view, and ticks jump to a card. Each card's copy rises in as it
     arrives. Phones: the cards stack and reveal as they scroll up. Reduced motion: no pin, a snapping row. */
  (() => {
    const section = $("#highlights"); if (!section) return;
    const viewport = $(".travel-viewport", section), track = $(".travel-track", section);
    const cards = $$(".tcard", track), ticks = $$(".tick", section), cur = $("#meter-cur");
    const navH = () => $("#pnav").offsetHeight || 64;
    let st = null, last = 0;
    const setMeter = (i) => {
      if (i === last) return; last = i;
      cur.textContent = String(i + 1).padStart(2, "0");
      ticks.forEach((t, j) => t.classList.toggle("is-active", j === i));
    };
    const pad = () => parseFloat(getComputedStyle(viewport).paddingLeft) || 0;
    const dist = () => Math.max(0, track.scrollWidth - (viewport.clientWidth - 2 * pad()));
    const go = (i) => {
      if (st) {
        const total = Math.max(1, dist()), x = Math.min(cards[i].offsetLeft - cards[0].offsetLeft, total);
        window.scrollTo({ top: st.start + (x / total) * (st.end - st.start), behavior: reduce ? "auto" : "smooth" });
      } else if (viewport.scrollWidth > viewport.clientWidth) {
        viewport.scrollTo({ left: cards[i].offsetLeft - pad(), behavior: reduce ? "auto" : "smooth" });
      } else cards[i].scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
    };
    ticks.forEach((t) => t.addEventListener("click", () => go(+t.dataset.go)));
    if (!gsap || !ST || reduce) {
      viewport.addEventListener("scroll", () => {   // the snapping row still moves the counter
        let idx = 0; cards.forEach((c, i) => { if (c.offsetLeft - pad() <= viewport.scrollLeft + c.offsetWidth * .5) idx = i; }); setMeter(idx);
      }, { passive: true });
      return;
    }
    /* Each card's copy plays in once when the card arrives and always runs to the end: never tied to the scroll
       position, so stopping mid-scroll can't leave it half faded. */
    const reveal = cards.map((c) => gsap.timeline({ paused: true })
      .from($$(".tcard-label, .tcard-title, .tcard-body", c), { y: 28, opacity: 0, duration: .9, stagger: .08, ease: "power3.out" }));
    const play = (tl) => () => tl.play();
    const mm = gsap.matchMedia();
    mm.add("(min-width: 768px)", () => {
      const travel = gsap.to(track, {
        x: () => -dist(), ease: "none",
        scrollTrigger: {
          trigger: section, start: () => `top top+=${navH()}`, end: () => `+=${Math.max(dist(), innerHeight * .6)}`,
          pin: true, scrub: true, anticipatePin: 1, invalidateOnRefresh: true,
          onUpdate: (s) => {
            const x = s.progress * dist(); let idx = 0;
            cards.forEach((c, i) => { if (c.offsetLeft - cards[0].offsetLeft <= x + c.offsetWidth * .5) idx = i; });
            setMeter(s.progress > .985 ? cards.length - 1 : idx);
          },
        },
      });
      st = travel.scrollTrigger;
      const vp = () => viewport.getBoundingClientRect();
      reveal.forEach((tl, i) => {
        const fully = cards[i].offsetLeft - cards[0].offsetLeft < viewport.clientWidth * .92 - pad();   // already showing when the section arrives: plays in with the first card
        if (fully) ST.create({ trigger: section, start: "clamp(top 78%)", once: true, onEnter: play(tl) });
        else ST.create({ trigger: cards[i], containerAnimation: travel, start: () => `left ${vp().right - vp().width * .08}px`, once: true, onEnter: play(tl) });
      });
      return () => { st = null; gsap.set(track, { clearProps: "transform" }); reveal.forEach((tl) => tl.progress(1)); };
    });
    mm.add("(max-width: 767px)", () => {
      reveal.forEach((tl, i) => ST.create({ trigger: cards[i], start: "clamp(top 85%)", once: true, onEnter: play(tl) }));
    });
  })();

  /* ═════════ Nav: section spy, form shortcuts ═════════ */
  const pnav = $("#pnav");
  const links = $$('.pnav-links a[href^="#"]'); // in-page links only; the assessment link leaves the page
  const secs = links.map((a) => $(a.getAttribute("href")));
  const spy = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) { const i = secs.indexOf(e.target); links.forEach((a, k) => a.classList.toggle("is-on", k === i)); }
  }), { rootMargin: "-45% 0px -50% 0px" });
  secs.forEach((s) => s && spy.observe(s));
  new IntersectionObserver(([e]) => pnav.classList.toggle("is-at-form", e.isIntersecting), { threshold: 0.25 }).observe($("#get"));

  document.addEventListener("click", (e) => {
    const a = e.target.closest("[data-goto-form]"); if (!a) return;
    e.preventDefault();
    const get = $("#get");
    get.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    const focus = () => { const i = $('#cta-form-card .fstate:not([hidden]) input:not([type="hidden"]):not([type="submit"])'); if (i) i.focus({ preventScroll: true }); };
    if (reduce || !("onscrollend" in window)) setTimeout(focus, reduce ? 0 : 800);
    else window.addEventListener("scrollend", focus, { once: true });
  });

  /* ═════════ Reveals: quiet fades; the editorial render enters from the side ═════════ */
  if (gsap && ST && !reduce) {
    gsap.from(".hero-text > *", { opacity: 0, y: 18, duration: 1.1, stagger: 0.08, ease: "power3.out" });
    gsap.from("#hero-canvas", { opacity: 0, duration: 1.6, ease: "power2.out" });
    const up = ".travel-head, .editorial-head, .ch, .editorial-copy, .who > *, .get > *";
    gsap.set(up, { opacity: 0, y: 30 });
    ST.batch(up, { start: "top 90%", once: true, onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 1, stagger: 0.07, ease: "power3.out", overwrite: true }) });
    // The render slides in once and always finishes (it used to follow the scroll, so stopping mid-way left it half faded)
    gsap.fromTo(".editorial-stage", { xPercent: 12, opacity: 0 }, { xPercent: 0, opacity: 1, duration: 1.4, ease: "power3.out", scrollTrigger: { trigger: ".editorial-stage", start: "clamp(top 92%)", once: true } });
  }

  /* ═════════ The form ═════════
     Live: HubSpot's native embed (v2) with its CSS off, rendered into each [data-hs-target]; submissions go
     straight to HubSpot. Preview: the same markup, validated, submitting nowhere. The playbook's address is never
     on this page: HubSpot's redirect or follow-up email delivers it. */
  const targets = $$("[data-hs-target]");
  const live = !!(HUBSPOT.portalId && HUBSPOT.formId);
  const FREE = /@(gmail|googlemail|yahoo|ymail|hotmail|outlook|live|msn|icloud|me|mac|aol|proton|protonmail|gmx|mail|zoho|yandex)\.[a-z.]+$/i;
  targets.forEach((t) => { t.innerHTML = '<div class="form-loading" aria-hidden="true"><i></i><i></i><i></i><i></i></div>'; });

  const done = (name, redirecting) => {
    pnav.classList.add("is-done");
    $$(".formcard").forEach((card) => {
      const form = $('[data-state="form"]', card), ok = $('[data-state="done"]', card);
      $("[data-done-name]", ok).textContent = name ? `, ${name}` : "";
      $("[data-done-msg]", ok).textContent = redirecting ? "Opening the playbook now. We’ve also sent a copy to your inbox." : "The playbook is on its way to your inbox. It should arrive in the next minute or two.";
      form.hidden = true; ok.hidden = false;
      if (gsap && !reduce) gsap.from(ok, { opacity: 0, y: 10, duration: 0.7, ease: "power3.out" });
    });
    const active = document.activeElement && document.activeElement.closest(".formcard");
    if (active) $('[data-state="done"]', active).focus({ preventScroll: true });
  };

  const field = (id, name, label, type, auto, ph) =>
    `<fieldset class="form-columns-1"><div class="hs_${name} hs-${name} field hs-form-field"><label for="${name}-${id}">${label}<span class="hs-form-required">*</span></label>` +
    `<div class="input"><input id="${name}-${id}" name="${name}" type="${type}" class="hs-input" autocomplete="${auto}" placeholder="${ph}" required></div></div></fieldset>`;

  const preview = (t) => {
    const row = t.classList.contains("form-row");
    t.innerHTML = `<form class="hs-form" novalidate>` +
      field(t.id, "firstname", "First name", "text", "given-name", row ? "First name" : "Alex") +
      field(t.id, "email", "Work email", "email", "email", row ? "Work email" : "alex@company.com") +
      field(t.id, "company", "Company", "text", "organization", row ? "Company" : "Company name") +
      `<div class="hs_submit"><div class="actions"><input type="submit" class="hs-button primary" value="${HUBSPOT.submitText}"></div></div>` +
      `<span class="preview-tag" title="Set portalId and formId in landing/hubspot-config.js">Preview form · not connected to HubSpot</span></form>`;
    const form = $("form", t);
    const err = (input, msg) => {
      const wrap = input.closest(".hs-form-field");
      wrap.querySelector(".hs-error-msgs")?.remove();
      input.classList.toggle("invalid", !!msg); input.classList.toggle("error", !!msg); input.setAttribute("aria-invalid", msg ? "true" : "false");
      if (msg) wrap.insertAdjacentHTML("beforeend", `<ul class="hs-error-msgs" role="alert"><li><label class="hs-error-msg">${msg}</label></li></ul>`);
    };
    const check = (i) => {
      const v = i.value.trim();
      if (!v) return err(i, "Please complete this required field."), false;
      if (i.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return err(i, "Email must be formatted correctly."), false;
      if (i.type === "email" && FREE.test(v)) return err(i, "Please enter your work email address."), false;
      return err(i, ""), true;
    };
    $$(".hs-input", form).forEach((i) => i.addEventListener("blur", () => { if (i.value) check(i); }));
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const bad = $$(".hs-input", form).filter((i) => !check(i));
      if (bad.length) { bad[0].focus(); return; }
      const btn = $(".hs-button", form); btn.disabled = true; btn.value = "Sending…";
      setTimeout(() => done(form.firstname.value.trim(), false), 700);
    });
  };

  const mountHubSpot = () => targets.forEach((t) => {
    t.innerHTML = "";
    const row = t.classList.contains("form-row");
    window.hbspt.forms.create({
      region: HUBSPOT.region, portalId: HUBSPOT.portalId, formId: HUBSPOT.formId, target: "#" + t.id,
      css: "", cssRequired: "", submitText: HUBSPOT.submitText,
      onFormReady: () => {
        const ph = row ? { firstname: "First name", email: "Work email", company: "Company" } : { firstname: "Alex", email: "alex@company.com", company: "Company name" };
        $$(".hs-input", t).forEach((i) => { if (!i.placeholder && ph[i.name]) i.placeholder = ph[i.name]; });
      },
      onFormSubmitted: (form, data) => {
        const vals = (data && data.submissionValues) || {};
        done(String(vals.firstname || ($('[name="firstname"]', t) || {}).value || "").trim(), !!(data && data.redirectUrl));
      },
    });
  });

  if (!live) { targets.forEach(preview); return; }
  const s = document.createElement("script");
  s.src = "https://js.hsforms.net/forms/embed/v2.js"; s.charset = "utf-8"; s.async = true;
  s.onload = () => (window.hbspt ? mountHubSpot() : s.onerror());
  s.onerror = () => targets.forEach((t) => { t.innerHTML = '<p class="fine" role="alert">The form couldn’t load. A content blocker may be stopping it: allow this page and reload.</p>'; });
  document.head.appendChild(s);
})();
