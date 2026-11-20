/* Landing page runtime: hero scene, chapter scenes, the pane-vs-truth demo, reveals, and the HubSpot form.
   Depends on GSAP + ScrollTrigger + Lenis (optional) and assets/motion/hero-scenes.js (HeroMount, HeroKit). */
(() => {
  /* HubSpot settings live in landing/hubspot-config.js (shared with landing/b/) */
  const HUBSPOT = Object.assign({ portalId: "", formId: "", region: "na1", submitText: "Send me the playbook" }, window.LP_HUBSPOT || {});

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const gsap = window.gsap, ST = window.ScrollTrigger;
  if (gsap && ST) gsap.registerPlugin(ST);
  const yr = $("#yr"); if (yr) yr.textContent = new Date().getFullYear();

  /* ───────── Smooth scroll ───────── */
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1 });
    if (gsap && ST) { lenis.on("scroll", ST.update); gsap.ticker.add((t) => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0); }
    else { const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); }; requestAnimationFrame(raf); }
  }
  const scrollToEl = (el, done) => {
    const off = -(parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--bar")) || 56);
    if (lenis) lenis.scrollTo(el, { offset: off, duration: 1.4, onComplete: done });
    else { el.scrollIntoView({ behavior: reduce ? "auto" : "smooth" }); setTimeout(done, reduce ? 0 : 700); }
  };

  /* The hero scene "Agreement" (key LP) lives in landing/scene-agreement.js, shared with landing/b/ */

  /* Run a scene on its own clock while it's on screen; a still frame under reduced motion */
  const runScene = (svg, key, opts = {}) => {
    if (!svg || !window.HeroMount || !window.HeroScenes || !window.HeroScenes[key]) return;
    const draw = window.HeroMount(svg, key, opts);
    let t = opts.t0 || 0, vis = false, last = 0;
    if (reduce) { draw(opts.still != null ? opts.still : 5.5); return; }
    draw(t);
    const tick = (now) => {
      if (!vis) return;
      t += Math.min(0.05, (now - last) / 1000) * (opts.speed || 1); last = now;
      draw(t); requestAnimationFrame(tick);
    };
    new IntersectionObserver(([e]) => {
      const was = vis; vis = e.isIntersecting;
      if (vis && !was) { last = performance.now(); requestAnimationFrame(tick); }
    }).observe(svg);
  };
  runScene($("#hero-scene"), "LP", { lag: 0.045, t0: 1.2, still: 6.2 });
  $$("[data-scene]").forEach((svg, i) => runScene(svg, svg.dataset.scene, { t0: 0.6 * i }));

  /* ═════════ Reveals ═════════ */
  // Split [data-words] into words (keeping <strong>) so they can light up as you read
  const splitWords = (node) => {
    [...node.childNodes].forEach((n) => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach((w) => {
          if (!w) return;
          if (/^\s+$/.test(w)) frag.appendChild(document.createTextNode(w));
          else { const s = document.createElement("span"); s.className = "word"; s.textContent = w; frag.appendChild(s); }
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1) splitWords(n);
    });
  };
  $$("[data-words]").forEach(splitWords);

  if (gsap && ST && !reduce) {
    // Hero intro: the headline rises word by word, then the lead, the form and the scene
    const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
    tl.from(".lp-display .w > span", { yPercent: 110, duration: 1.3, stagger: 0.07 }, 0.1)
      .from(".lp-kicker", { opacity: 0, y: 10, duration: 0.9 }, 0)
      .from(".lp-lead", { opacity: 0, y: 16, duration: 1.1 }, 0.55)
      .from("#hero-form-card", { opacity: 0, y: 24, duration: 1.2 }, 0.7)
      .from(".lp-hero-art", { opacity: 0, scale: 0.94, duration: 2.2, ease: "power2.out" }, 0.2)
      .from(".lp-cue", { opacity: 0, duration: 1 }, 1.2);

    gsap.set("[data-reveal]", { opacity: 0, y: 28 });
    ST.batch("[data-reveal]", {
      start: "top 90%", once: true,
      onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 1, stagger: 0.08, ease: "power3.out", overwrite: true }),
    });

    $$("[data-words]").forEach((el) => {
      gsap.fromTo($$(".word", el), { opacity: 0.14 }, { opacity: 1, stagger: 0.06, ease: "none",
        scrollTrigger: { trigger: el, start: "top 82%", end: "bottom 50%", scrub: 0.6 } });
    });

    // The hero scene drifts up a little slower than the page
    gsap.to(".lp-hero-art", { yPercent: -12, ease: "none", scrollTrigger: { trigger: ".lp-hero", start: "top top", end: "bottom top", scrub: true } });
  }

  /* ═════════ Bar, dock and anchors ═════════ */
  const bar = $("#bar"), dock = $(".lp-dock");
  const flags = { heroGone: false, heroForm: true, cta: false, done: false };
  const syncDock = () => {
    const on = flags.heroGone && !flags.heroForm && !flags.cta && !flags.done;
    if (dock) { dock.classList.toggle("is-on", on); dock.setAttribute("aria-hidden", on ? "false" : "true"); dock.tabIndex = on ? 0 : -1; }
  };
  new IntersectionObserver(([e]) => {
    flags.heroGone = !e.isIntersecting && e.boundingClientRect.top < 0;
    bar.classList.toggle("is-compact", flags.heroGone); syncDock();
  }).observe($(".lp-display"));
  new IntersectionObserver(([e]) => { flags.heroForm = e.isIntersecting; syncDock(); }).observe($("#hero-form-card"));
  new IntersectionObserver(([e]) => { flags.cta = e.isIntersecting; bar.classList.toggle("is-at-form", flags.cta); syncDock(); }, { threshold: 0.2 }).observe($("#get"));

  document.addEventListener("click", (e) => {
    const a = e.target.closest("[data-goto-form]");
    if (!a) return;
    e.preventDefault();
    const card = $("#cta-form-card");
    scrollToEl($("#get"), () => {
      const input = $('.lp-form-state:not([hidden]) input:not([type="hidden"]):not([type="submit"])', card);
      if (input) input.focus({ preventScroll: true });
    });
  });
  $(".lp-cue")?.addEventListener("click", (e) => { e.preventDefault(); scrollToEl($("#the-meeting")); });

  /* ═════════ One screen isn't one truth ═════════
     Three tiles answer the same question. As a pane of glass, their needles point three ways and keep wavering;
     as a source of truth, they swing (on a spring, so they overshoot and settle) to one answer, and the three
     feeds join a single source below. It flips by itself the first time you see it, then it's yours. */
  (() => {
    const demo = $("#demo");
    if (!demo) return;
    const needles = $$(".g-needle", demo);
    const PANE = [-54, 36, -12], TRUTH = 20;
    const st = needles.map((n, i) => ({ a: PANE[i], v: 0, w: 0.7 + i * 0.37, ph: i * 2.1 }));
    let mode = "pane", touched = false, vis = false, last = 0, t = 0;
    const paint = () => needles.forEach((n, i) => n.setAttribute("transform", `rotate(${st[i].a.toFixed(2)} 100 100)`));
    const target = (i) => (mode === "pane" ? PANE[i] + 4 * Math.sin(t * st[i].w + st[i].ph) + 2 * Math.sin(t * 2.3 * st[i].w) : TRUTH);
    const step = (now) => {
      if (!vis) return;
      const dt = Math.min(0.033, (now - last) / 1000); last = now; t += dt;
      st.forEach((s, i) => {
        const k = mode === "pane" ? 40 : 70, damp = mode === "pane" ? 7 : 7.5;
        const acc = k * (target(i) - s.a) - damp * s.v;
        s.v += acc * dt; s.a += s.v * dt;
      });
      paint(); requestAnimationFrame(step);
    };
    const setMode = (m, user) => {
      if (user) touched = true;
      if (m === mode) return;
      mode = m; demo.dataset.mode = m;
      $$("[data-mode-btn]", demo).forEach((b) => b.setAttribute("aria-pressed", b.dataset.modeBtn === m ? "true" : "false"));
      $$("dd[data-pane]", demo).forEach((dd, i) => {
        dd.classList.add("is-swapping");
        setTimeout(() => { dd.textContent = dd.dataset[m]; dd.classList.remove("is-swapping"); }, 180 + (i >> 1) * 90);
      });
      if (reduce) { st.forEach((s, i) => { s.a = m === "pane" ? PANE[i] : TRUTH; }); paint(); }
    };
    $$("[data-mode-btn]", demo).forEach((b) => b.addEventListener("click", () => setMode(b.dataset.modeBtn, true)));
    paint();
    if (reduce) return;
    let auto = null;
    new IntersectionObserver(([e]) => {
      const was = vis; vis = e.isIntersecting;
      if (vis && !was) { last = performance.now(); requestAnimationFrame(step); }
      if (vis && !touched && !auto) auto = setTimeout(() => { if (!touched) setMode("truth"); }, 2200);
    }, { threshold: 0.55 }).observe(demo);
  })();

  /* ═════════ The form ═════════
     Live: the native HubSpot embed (v2), rendered into each [data-hs-target] with HubSpot's own CSS switched off so
     the page styles it. Submissions go straight to HubSpot. Preview: same markup, validates, submits nowhere.
     The page never contains the playbook's address: the HubSpot form's own redirect (or its follow-up email)
     delivers it after signup. */
  const targets = $$("[data-hs-target]");
  const live = !!(HUBSPOT.portalId && HUBSPOT.formId);
  const FREE = /@(gmail|googlemail|yahoo|ymail|hotmail|outlook|live|msn|icloud|me|mac|aol|proton|protonmail|gmx|mail|zoho|yandex)\.[a-z.]+$/i;

  const loading = (t) => { t.innerHTML = '<div class="lp-form-loading" aria-hidden="true"><i></i><i></i><i></i><i></i></div>'; };
  targets.forEach(loading);

  const done = (name, redirecting) => {
    flags.done = true; syncDock(); bar.classList.add("is-done");
    $$(".lp-formcard").forEach((card) => {
      const form = $('[data-state="form"]', card), ok = $('[data-state="done"]', card);
      $("[data-done-name]", ok).textContent = name ? `, ${name}` : "";
      $("[data-done-msg]", ok).textContent = redirecting
        ? "Opening the playbook now. We’ve also sent a copy to your inbox."
        : "The playbook is on its way to your inbox. It should arrive in the next minute or two.";
      form.hidden = true; ok.hidden = false;
      if (gsap && !reduce) gsap.from(ok.children, { opacity: 0, y: 14, duration: 0.8, stagger: 0.08, ease: "power3.out" });
    });
    const active = document.activeElement && document.activeElement.closest(".lp-formcard");
    if (active) $('[data-state="done"]', active).focus({ preventScroll: true });
  };

  const field = (name, label, type, auto, ph) =>
    `<fieldset class="form-columns-1"><div class="hs_${name} hs-${name} hs-fieldtype-text field hs-form-field">` +
    `<label for="${name}-{id}">${label}<span class="hs-form-required">*</span></label>` +
    `<div class="input"><input id="${name}-{id}" name="${name}" type="${type}" class="hs-input" autocomplete="${auto}" placeholder="${ph}" required></div></div></fieldset>`;

  const preview = (t) => {
    t.innerHTML = (`<form class="hs-form" novalidate>` +
      field("firstname", "First name", "text", "given-name", "Alex") +
      field("email", "Work email", "email", "email", "alex@company.com") +
      field("company", "Company", "text", "organization", "Company name") +
      `<div class="hs_submit hs-submit"><div class="actions"><input type="submit" class="hs-button primary large" value="${HUBSPOT.submitText}"></div></div>` +
      `<span class="lp-preview-tag" title="Set HUBSPOT.portalId and formId in landing/landing.js">Preview form · not connected to HubSpot</span>` +
      `</form>`).replaceAll("{id}", t.id);
    const form = $("form", t);
    const err = (input, msg) => {
      const wrap = input.closest(".hs-form-field");
      wrap.querySelector(".hs-error-msgs")?.remove();
      input.classList.toggle("invalid", !!msg); input.classList.toggle("error", !!msg);
      input.setAttribute("aria-invalid", msg ? "true" : "false");
      if (msg) wrap.insertAdjacentHTML("beforeend", `<ul class="hs-error-msgs inputs-list" role="alert"><li><label class="hs-error-msg">${msg}</label></li></ul>`);
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
      const inputs = $$(".hs-input", form), bad = inputs.filter((i) => !check(i));
      if (bad.length) { bad[0].focus(); return; }
      const btn = $(".hs-button", form); btn.disabled = true; btn.value = "Sending…";
      setTimeout(() => done(form.firstname.value.trim(), false), 700);
    });
  };

  const mountHubSpot = () => {
    targets.forEach((t) => {
      t.innerHTML = "";
      window.hbspt.forms.create({
        region: HUBSPOT.region, portalId: HUBSPOT.portalId, formId: HUBSPOT.formId,
        target: "#" + t.id, css: "", cssRequired: "", submitText: HUBSPOT.submitText,
        onFormReady: () => {
          // HubSpot fields have no placeholders unless set in the form editor; add friendly ones
          const ph = { firstname: "Alex", email: "alex@company.com", company: "Company name" };
          $$(".hs-input", t).forEach((i) => { if (!i.placeholder && ph[i.name]) i.placeholder = ph[i.name]; });
        },
        onFormSubmitted: (form, data) => {
          const vals = (data && data.submissionValues) || {};
          const name = vals.firstname || ($('[name="firstname"]', t) || {}).value || "";
          done(String(name).trim(), !!(data && data.redirectUrl));
        },
      });
    });
  };

  if (!live) { targets.forEach(preview); return; }
  const s = document.createElement("script");
  s.src = "https://js.hsforms.net/forms/embed/v2.js"; s.charset = "utf-8"; s.async = true;
  s.onload = () => (window.hbspt ? mountHubSpot() : s.onerror());
  s.onerror = () => targets.forEach((t) => {
    t.innerHTML = '<p class="lp-form-sub" role="alert">The form couldn’t load. A content blocker may be stopping it: allow this page and reload.</p>';
  });
  document.head.appendChild(s);
})();
