# Landing page · The Dashboard Isn’t the Problem

The gated front door to the playbook. It turns traffic into HubSpot contacts by offering the playbook for a name, work email and company. Copy: `assets/references/Playbook Landing Page Copy.pdf`.

Files:

- `index.html`, `landing.css`, `landing.js`: the page, its styles and its runtime (scenes, nav, reveals, form).
- `hero-fx.js`: the full-bleed hero, running the contours (wave) scene behind the copy.
- `scene-agreement.js`: the "Agreement" animation in the problem section.
- `hubspot-config.js`: the HubSpot form IDs.
- The chapter animations come from `assets/motion/hero-scenes.js`, shared with the playbook. All motion follows `hero-explorations/ANIMATION-RULES.md`.

The page is a white layout set in Magnifico's type (Syne, Inter, IBM Plex Sans) and colour (teal ink, magenta accent, teal media stages). Sections use 100px top and bottom spacing and 60px from a heading to its content, except the two split sections (The problem, In the field), where each half is edge to edge and the copy half has 60px padding all round.

Design comparison pages, not linked from the page: `hero-options.html`, `inside-options.html`, `problem-options.html`.

## Going live: three things to set up

### 1. Connect the HubSpot form (done)

The form is connected to the HubSpot form whose IDs are in `landing/hubspot-config.js`. It has three required fields, **First name** (`firstname`), **Email** (`email`) and **Company** (`company`), with *Block free email providers* turned on.

That form was made in HubSpot's new forms editor, whose embed is an iframe the page can't style and which doesn't work with HubSpot's classic `hbspt.forms.create` embed. So the page keeps its own form and posts each submission to HubSpot's Forms Submission API (`api.hsforms.com/submissions/v3/integration/submit/{portalId}/{formId}`), which needs no key. HubSpot creates or updates the contact, runs the form's notifications and follow-up email, and returns the form's redirect, which the page then opens. HubSpot's errors are shown under the fields (for example, a free email address).

If you change the form in HubSpot, keep the same three fields with the same internal names: a field the page doesn't send, or one it sends that the form doesn't have, can make HubSpot reject the submission. If you add a field, add it to the page too.

Clear `portalId` or `formId` to go back to the **preview form**, which looks the same but only validates and sends nothing.

### 2. Route contacts into “Magnifico Business Development”

A form submission creates or updates a **contact**. Contacts don’t sit in pipelines themselves, so add a HubSpot workflow: *Trigger: form submission on this form → Create a lead (or deal) in the “Magnifico Business Development” pipeline, associated with the contact.* Set the lead source to this landing page while you’re there.

### 3. Deliver the playbook, keep it gated

On Netlify, `playbook.wearemagnifico.com` opens on this landing page (`netlify.toml`), and the playbook's pages (`/intro/`, the steps, *Where to start*) only open for someone with the access cookie. Anyone else who goes straight to a chapter lands back here. The gate is `netlify/edge-functions/playbook-gate.ts`.

The cookie comes from the **access link**, which only HubSpot hands out:

```
https://playbook.wearemagnifico.com/intro/?access=<key>
```

`<key>` is the value of the Netlify environment variable `PLAYBOOK_ACCESS_KEY` (Site configuration › Environment variables): any long random string. Opening the link sets the cookie for a year and shows the Introduction at its plain address. Until the variable is set, every chapter goes back to the landing page. Changing the key locks out everyone holding the old link or cookie, so update HubSpot at the same time.

Put the access link in two places in HubSpot:

- **Instant access:** the form’s *After submit → Redirect to another page*. HubSpot returns the link with the submission; the page shows “Opening the playbook now” and opens it.
- **Inbox:** a follow-up email from the form (or the workflow above), so they can come back from any device. If no redirect is set, the page tells the reader to check their inbox.

The page never contains the key. It is a soft gate: someone who passes the link on lets the next person in, which is fine for a lead magnet. The team gets in the same way, by opening the access link once in each browser.

## Other links

- Secondary CTA: the readiness assessment on ScoreApp (the same link the playbook’s rail uses).
- Chapter tiles and every “Get the playbook” button scroll to the form. None of them link into the playbook.
