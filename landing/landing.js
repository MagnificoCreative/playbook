/* Landing page runtime: hero, chapter scenes, nav, reveals, and the form (sent to HubSpot).
   Needs assets/motion/hero-scenes.js, hero-fx.js and hubspot-config.js first; GSAP is optional (without it, everything simply shows). */
(() => {
  const HUBSPOT = Object.assign({ portalId: "", formId: "", region: "na1", submitText: "Send me the playbook" }, window.LP_HUBSPOT || {});
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const gsap = window.gsap;
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
  /* The hero: the contours (wave) scene only, at 50% line opacity, full bleed behind the copy */
  const heroEl = $(".hero-fx");
  if (heroEl && window.HeroFX) window.HeroFX.mount(heroEl, { canvas: $("#hero-canvas"), copy: $(".hero-fx .hero-text"), scene: "contours", lines: 0.5 });
  $$("[data-scene]").forEach((svg, i) => runScene(svg, svg.dataset.scene, { t0: 0.6 * i }));

  /* ═════════ Nav: section spy, form shortcuts ═════════ */
  const pnav = $("#pnav");
  const links = $$('.pnav-links a[href^="#"]'); // in-page links only; the assessment link leaves the page
  const secs = links.map((a) => $(a.getAttribute("href")));
  const spy = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) { const i = secs.indexOf(e.target); links.forEach((a, k) => a.classList.toggle("is-on", k === i)); }
  }), { rootMargin: "-45% 0px -50% 0px" });
  secs.forEach((s) => s && spy.observe(s));
  new IntersectionObserver(([e]) => pnav.classList.toggle("is-at-form", e.isIntersecting), { threshold: 0.25 }).observe($("#get"));

  let focusT = 0;
  document.addEventListener("click", (e) => {
    const a = e.target.closest("[data-goto-form]"); if (!a) return;
    e.preventDefault();
    const get = $("#get");
    get.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    /* Focus the first field once the scroll lands. Not on touch screens: the keyboard would jump the page.
       One pending focus at a time, dropped after 1.5s, so a scroll that never ends can't fire it later. */
    if (matchMedia("(hover: none)").matches) return;
    const focus = () => { clearTimeout(focusT); window.removeEventListener("scrollend", focus); const i = $('#cta-form-card .fstate:not([hidden]) input:not([type="hidden"]):not([type="submit"])'); if (i) i.focus({ preventScroll: true }); };
    clearTimeout(focusT);
    if ("onscrollend" in window && !reduce) { window.addEventListener("scrollend", focus, { once: true }); focusT = setTimeout(() => window.removeEventListener("scrollend", focus), 1500); }
    else focusT = setTimeout(focus, reduce ? 0 : 800);
  });

  /* ═════════ Type: the playbook's effects (assets/playbook.js) ═════════
     Headline: each word rises out of a mask (yPercent 110 → 0, expo.out 1.2s, 0.08s apart).
     Headings and text: rise 30px and fade in (expo.out 1.1s, 0.08s apart), once, as each block comes up the screen.
     Lead paragraphs [data-words]: the words come into focus as you read, tied to scroll (opacity .14 → 1).
     The page head hides all of this before first paint (html.rv-wait); the chapter cards and the form card only fade. */
  const root = document.documentElement;
  const TEXT = ".split-copy > :not([data-words]), .editorial-head > :not([data-words]), .who > :not([data-words]), .get > :not(.card)";
  const up = TEXT + ", .ch, .get > .card";
  const wrapWords = (node, make) => {
    Array.from(node.childNodes).forEach((n) => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          frag.appendChild(/^\s+$/.test(part) ? document.createTextNode(part) : make(part));
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1 && n.tagName !== "BR") wrapWords(n, make);
    });
  };
  if (gsap && !reduce && root.classList.contains("rv-wait")) {
    window.LP_REVEALS = true;
    const h1 = $(".hero-title");
    if (h1) wrapWords(h1, (w) => { const o = document.createElement("span"); o.className = "w"; o.innerHTML = "<span></span>"; o.firstChild.textContent = w; return o; });
    gsap.set(".hero-title .w > span", { yPercent: 110 });
    gsap.set(".hero-text > :not(.hero-title)", { opacity: 0, y: 20 });
    gsap.set("#hero-canvas", { opacity: 0 });
    gsap.set(up, { opacity: 0 });
    gsap.set(TEXT, { y: 30 });
    const leads = $$("[data-words]");
    leads.forEach((el) => wrapWords(el, (w) => { const sp = document.createElement("span"); sp.className = "word"; sp.textContent = w; return sp; }));
    root.classList.remove("rv-wait");                       // GSAP's inline styles hold the hidden state from here
    gsap.timeline({ defaults: { ease: "expo.out" } })
      .to(".hero-text .kicker", { opacity: 1, y: 0, duration: 1 }, 0.1)
      .to(".hero-title .w > span", { yPercent: 0, duration: 1.2, stagger: 0.08 }, 0.15)
      .to(".hero-text > :not(.hero-title):not(.kicker)", { opacity: 1, y: 0, duration: 1.1, stagger: 0.08 }, 0.55)
      .to("#hero-canvas", { opacity: 1, duration: 1.8 }, 0.2);

    /* Leads: word i lights over its own stretch of the read, from the lead's top at 82% of the screen to its bottom at 48% */
    const focus = () => leads.forEach((el) => {
      const r = el.getBoundingClientRect(), words = el._w || (el._w = $$(".word", el));
      const start = innerHeight * 0.82 - r.top, span = Math.max(1, r.height + innerHeight * 0.34);
      const T = 1 + 0.05 * (words.length - 1), p = Math.min(1, Math.max(0, start / span)) * T;
      words.forEach((w, i) => { w.style.opacity = (0.14 + 0.86 * Math.min(1, Math.max(0, p - i * 0.05))).toFixed(3); });
    });

    /* Reveals are measured live on every scroll frame, so a jump past a section or a late layout shift can't leave
       anything hidden: whatever has reached 75% down the screen, or is already above it, shows (at the very bottom, anything on screen). */
    let waiting = $$(up), pending = 0;
    const check = () => {
      pending = 0;
      focus();
      if (!waiting.length) return;
      const atEnd = scrollY + innerHeight >= root.scrollHeight - 2;   // at the bottom, whatever is on screen shows (the last lines never reach 75%)
      const line = atEnd ? innerHeight : innerHeight * 0.75, now = [];
      waiting = waiting.filter((el) => (el.getBoundingClientRect().top < line ? (now.push(el), false) : true));
      if (!now.length) return;
      const past = now.filter((el) => el.getBoundingClientRect().bottom <= 0);
      if (past.length) gsap.set(past, { opacity: 1, y: 0, overwrite: true });
      const inView = now.filter((el) => !past.includes(el));
      if (inView.length) gsap.to(inView, { opacity: 1, y: 0, duration: 1.1, stagger: 0.08, ease: "expo.out", overwrite: true });
    };
    const queue = () => { if (!pending) pending = requestAnimationFrame(check); };
    ["scroll", "resize", "load"].forEach((ev) => window.addEventListener(ev, queue, { passive: true }));
    check();
  } else root.classList.remove("rv-wait");

  /* ═════════ The form ═════════
     The page's own form, in HubSpot's markup so the page styles it. Live (portalId and formId set): a valid
     submission is posted to HubSpot's Forms Submission API, which works with forms from HubSpot's new forms
     editor and creates or updates the contact. Preview (IDs not set): the same form, validated, sending nowhere.
     The playbook's address is never on this page: HubSpot returns the form's redirect after a submission,
     or its follow-up email delivers it. */
  const targets = $$("[data-hs-target]");
  const live = !!(HUBSPOT.portalId && HUBSPOT.formId);
  const ENDPOINT = `https://api.hsforms.com/submissions/v3/integration/submit/${encodeURIComponent(HUBSPOT.portalId)}/${encodeURIComponent(HUBSPOT.formId)}`;
  const FIELDS = ["firstname", "email", "company"];
  const FREE = /@(gmail|googlemail|yahoo|ymail|hotmail|outlook|live|msn|icloud|me|mac|aol|proton|protonmail|gmx|mail|zoho|yandex)\.[a-z.]+$/i;

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

  /* Sends the three fields to HubSpot, with the visitor's HubSpot cookie (set by the tracking code, if the page
     has it) so the submission joins their page views. Resolves with HubSpot's reply ({ redirectUri } or
     { inlineMessage }); rejects with HubSpot's error body, or with a network error. */
  const cookie = (n) => { const m = document.cookie.match(new RegExp("(?:^|; )" + n + "=([^;]*)")); return m ? decodeURIComponent(m[1]) : ""; };
  const send = async (form) => {
    const context = { pageUri: location.href, pageName: document.title };
    const hutk = cookie("hubspotutk"); if (hutk) context.hutk = hutk;
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fields: FIELDS.map((name) => ({ objectTypeId: "0-1", name, value: form.elements[name].value.trim() })), context }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw body;
    return body;
  };

  const field = (id, name, label, type, auto, ph) =>
    `<fieldset class="form-columns-1"><div class="hs_${name} hs-${name} field hs-form-field"><label for="${name}-${id}">${label}<span class="hs-form-required">*</span></label>` +
    `<div class="input"><input id="${name}-${id}" name="${name}" type="${type}" class="hs-input" autocomplete="${auto}" placeholder="${ph}" required></div></div></fieldset>`;

  const mount = (t) => {
    const row = t.classList.contains("form-row");
    t.innerHTML = `<form class="hs-form" novalidate>` +
      field(t.id, "firstname", "First name", "text", "given-name", row ? "First name" : "Alex") +
      field(t.id, "email", "Work email", "email", "email", row ? "Work email" : "alex@company.com") +
      field(t.id, "company", "Company", "text", "organization", row ? "Company" : "Company name") +
      `<div class="hs_submit"><div class="actions"><input type="submit" class="hs-button primary" value="${HUBSPOT.submitText}"></div></div>` +
      `</form>`;
    const form = $("form", t);
    const err = (input, msg) => {
      const wrap = input.closest(".hs-form-field");
      wrap.querySelector(".hs-error-msgs")?.remove();
      input.classList.toggle("invalid", !!msg); input.classList.toggle("error", !!msg); input.setAttribute("aria-invalid", msg ? "true" : "false");
      if (msg) wrap.insertAdjacentHTML("beforeend", `<ul class="hs-error-msgs" role="alert"><li><label class="hs-error-msg">${msg}</label></li></ul>`);
    };
    const formErr = (msg) => {
      form.querySelector(".hs_error_rollup")?.remove();
      if (msg) form.insertAdjacentHTML("beforeend", `<div class="hs_error_rollup"><ul class="hs-error-msgs" role="alert"><li><label class="hs-error-msg">${msg}</label></li></ul></div>`);
    };
    const check = (i) => {
      const v = i.value.trim();
      if (!v) return err(i, "Please complete this required field."), false;
      if (i.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return err(i, "Email must be formatted correctly."), false;
      if (i.type === "email" && FREE.test(v)) return err(i, "Please enter your work email address."), false;
      return err(i, ""), true;
    };
    /* HubSpot names the field in each error ("Error in 'fields.email'. …") and gives a type such as BLOCKED_EMAIL
       (a free email provider) or INVALID_EMAIL. Field errors go under their field; anything else goes under the button. */
    const showErrors = (body) => {
      const errs = (body && Array.isArray(body.errors)) ? body.errors : [];
      let first = null;
      errs.forEach((x) => {
        const m = /fields\.([\w-]+)/.exec(x.message || ""), input = m && FIELDS.includes(m[1]) ? form.elements[m[1]] : null;
        if (!input) return;
        err(input, x.errorType === "BLOCKED_EMAIL" ? "Please enter your work email address." :
          x.errorType === "INVALID_EMAIL" ? "Email must be formatted correctly." :
          x.errorType === "REQUIRED_FIELD" ? "Please complete this required field." : "Please check this field.");
        first = first || input;
      });
      if (first) first.focus();
      else formErr("Something went wrong sending the form. Please try again in a moment.");
      if (errs.length) console.warn("HubSpot form submission:", errs);
    };
    $$(".hs-input", form).forEach((i) => i.addEventListener("blur", () => { if (i.value) check(i); }));
    let sending = false;
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (sending) return;
      formErr("");
      const bad = $$(".hs-input", form).filter((i) => !check(i));
      if (bad.length) { bad[0].focus(); return; }
      const btn = $(".hs-button", form), name = form.elements.firstname.value.trim();
      sending = true; btn.disabled = true; btn.value = "Sending…";
      if (!live) { setTimeout(() => done(name, false), 700); return; }
      try {
        const reply = await send(form);
        done(name, !!reply.redirectUri);
        if (reply.redirectUri) setTimeout(() => { location.href = reply.redirectUri; }, 1500);
      } catch (body) {
        sending = false; btn.disabled = false; btn.value = HUBSPOT.submitText;
        showErrors(body);
      }
    });
  };

  targets.forEach(mount);
})();
