# Landing page · The Dashboard Isn’t the Problem

The gated front door to the playbook. It turns traffic into HubSpot contacts by offering the playbook for a name, work email and company. Copy: `assets/references/Playbook Landing Page Copy.pdf`.

Files: `index.html`, `landing.css` (page styles, on top of `assets/playbook.css`), `landing.js` (scenes, demo, form). The hero scene “Agreement” lives in `landing.js` and follows `hero-explorations/ANIMATION-RULES.md`; the chapter tiles reuse the shipped chapter heroes from `assets/motion/hero-scenes.js`.

## Two versions

- **A · `landing/`**: the playbook's own look. A deep teal hero with the form on it, then full-height sections.
- **B · `landing/b/`**: a white product-gallery layout taken from a Refero style reference (Apple's iPhone page), set in Magnifico's type (Syne, Inter, IBM Plex Sans) and colour (teal ink, magenta accent, teal media stages). It has a centred hero with a pill-shaped form capsule, a sticky product nav, a highlights carousel with the gauge demo, 28px shadowless cards, and 90px section rhythm.

Both versions share `hubspot-config.js` (form IDs) and `scene-agreement.js` (the hero animation).

## Going live: three things to set up

### 1. Connect the HubSpot form

In HubSpot, create (or pick) a form with three fields: **First name**, **Email** and **Company**, all required. In the form’s options, turn on *Block free email providers* so it only takes work emails.

Then open the form’s *Share → Embed code* and copy `portalId`, `formId` and `region` into `landing/hubspot-config.js` (both landing versions read it). That’s all: the page loads HubSpot’s native embed (v2) into both form spots, with HubSpot’s own CSS switched off so it picks up the page styles. Submissions go straight to HubSpot as contacts.

Until the IDs are set, the page shows a **preview form** with the same markup and styling, marked “Preview form · not connected to HubSpot”. It validates but sends nothing.

### 2. Route contacts into “Magnifico Business Development”

A form submission creates or updates a **contact**. Contacts don’t sit in pipelines themselves, so add a HubSpot workflow: *Trigger: form submission on this form → Create a lead (or deal) in the “Magnifico Business Development” pipeline, associated with the contact.* Set the lead source to this landing page while you’re there.

### 3. Deliver the playbook, keep it gated

The page never contains the playbook’s address. Delivery happens in HubSpot:

- **Instant access:** set the form’s *After submit → Redirect to another page* to the playbook URL. The page shows “Opening the playbook now” and HubSpot takes the reader there.
- **Inbox:** send a follow-up email from the form (or the workflow above) with the link. If no redirect is set, the page tells the reader to check their inbox.

Do both: the redirect gives instant access, and the email gives them a link to come back to.

**Important:** the playbook itself is still public at its current address, so anyone who has the link can skip the form. To really gate it, move the playbook to a new, unlisted address that only HubSpot hands out (and point the old address at this page), or put the playbook behind a password or token at the host.

## Other links

- Secondary CTA: the readiness assessment on ScoreApp (the same link the playbook’s rail uses).
- Chapter tiles and every “Get the playbook” button scroll to the form. None of them link into the playbook.
