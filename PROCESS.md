# How we built the playbook

A record of the process behind *From Data Sprawl to a Single Source of Truth*, Magnifico's interactive web playbook. It covers how the work started, the routine we repeated for every visual, the animation system, what happened in each chapter, the design system, the work for phones and tablets, and how the site is built and deployed.

The work ran from **5 to 17 November 2026**, over 75 commits and 13 pull requests, built with Claude Code across several sessions.

---

## 1. Starting point

**Inputs**

- The playbook copy: an introduction, six CLEAR chapters (Context, Listen, Examine, Align, Roadmap, plus Test before you build) and a closing *Where to start* chapter.
- The **Energy Operations Playbook** design system in Figma (colors, type, spacing) and a visual reference used only for spacing and type.
- Four source illustrations for Step 1's *How to apply it* cards, and the Magnifico logos (full lockup and M mark).
- The CLEAR deck (slide 4 became the Introduction's staircase).

**The brief:** build the playbook as a scroll-driven web page with full-height sections, pinned and scrubbed animations, and a minimal, calm look. Claude could make the interaction decisions itself.

**Stack:** static HTML/CSS/JS, [GSAP 3.12.5](https://gsap.com/) with ScrollTrigger for pinning and scrubbing, [Lenis 1.1.13](https://github.com/darkroomengineering/lenis) for smooth scrolling, and Google Fonts. There is no framework and no bundler. A small Ruby script generates the pages.

---

## 2. The working method

We used the same loop for almost every hero, infographic and card:

1. **Brief.** Describe the section and what it should say, for example *"give me four options for this type of infographic, very minimalist"* or *"6 options for each of the components in this section"*.
2. **Options board.** Claude builds a standalone comparison page in `hero-explorations/` with every option side by side, each labelled with a short code (`02c`, `07h`, `m3`, `a1`...).
3. **Refine.** Pick one or two options, ask for variations (`A2`, `A3`, `measures-d`, `copies-a`), and simplify anything that feels too busy.
4. **In context.** Before committing, put the chosen options on a copy of the real page (`*-in-context.html`, `*-context.html`) to see them at the right scale.
5. **Ship.** Move the pick into the production code (`assets/motion/` or `tools/build/scripts.js`), rebuild the pages and commit with a message that explains the visual.
6. **Catalogue.** Add it to the animation library (`animations/index.html`) as live, parked, retired or exploration. Write any new visual rule into `hero-explorations/ANIMATION-RULES.md`.
7. **Tune.** Make small follow-up commits for type size, timing, pin length and margins after reviewing in the browser.

Nothing is deleted. Retired and parked pieces stay in the library with a note saying where they were and how to bring them back.

---

## 3. Timeline

### Phase 1: Step 1 and the heroes (5 to 6 Nov)

- **Step 1: Listen before you design**, built first as one self-contained page: full-height sections, a sticky contents rail, a pinned horizontal *How to apply it* sequence with four scroll-scrubbed SVG illustrations, and a logo that folds down to the M mark past the fold.
- **Listen hero.** Four directions were explored (`01-listen.html`). The winner, *voices coming in*, has lines arriving from every direction with fading trails while the pink ball swells and glows. It replaced the first version's outward-pulsing rings.
- **Chapter heroes.** A hero per chapter was explored in `chapters.html` and the board was narrowed to one final per chapter: Passing the baton, Roots, Overlap, Built around it, Wind tunnel, True north.
- **Animation rules** were written down in `ANIMATION-RULES.md` (section 4 below).
- **Step 1 refinements:** section eyebrows dropped, sentence-case labels, pink bullets that fly in beside each source, card names top left with no step numbers, and a compact rail.
- **How to apply card scenes:** 24 options (`howto.html`) redrawn in the hero language on the light card. Picks were Map *Every layer*, Ask *The bubble*, Evidence *The lens* and Patterns *Orbits fall into step*.

### Phase 2: All chapters from one build (6 Nov, PR #1 to #3)

- **Build tool.** `tools/build/build.rb` generates every chapter (intro, steps 1 to 6, where to start) from one shared shell, with copy in `content.rb`, section visuals in `scripts.js`, and one shared `assets/playbook.css` and `assets/playbook.js`.
- **Intro: *Where trust is lost*.** Options in `trust.html`, then a refined slope in `trust-b.html`. The ball moves Source → Act while the line steps down toward less trust, and each stage's sub-copy rises in word by word. Rows were later shortened by about 30%.
- **Intro: *One screen isn't one truth*.** Options A to D, then A2 and A3 (`truth.html`, `truth-in-context.html`). A dashboard of dots empties along a spectrum from "single pane of glass" to "single source of truth" until every point is threaded to one pink source. Outlines were thinned to 1px.
- **Intro: CLEAR staircase**, after slide 4 of the deck. Steps grow one rise taller each and build on scroll. A *Roots* divider was tried here and parked because it competed with the staircase.
- **Navigation:** collapsible menu (it remembers its state on wide screens), a "where you are" label, and one consistent gap between sections.

### Phase 3: Type and the chapter infographics (9 Nov, PR #4 and #5)

- **Syne for headlines**, Inter for body copy.
- **Step 2:** the role tabs and reshaping sample board were replaced by a **five-roles table** (role, needs, slowed by, sees). Options are in `roles.html`, `roles-table.html` and `roles-in-context.html`.
- **Step 4: the sieve.** Measures fall through five named tests (decision, shared, available, trusted, important). Survivors turn pink, failures go hollow and drop, and the few left settle over Safety, Quality, Delivery, Cost and People. Options: `measures.html`, `measures-d.html`.
- **Step 5: *From signal to action*** became scroll-driven and vertical. One alert moves down a rail through Signal, Context, Investigation and Action (`signal-to-action.html`).
- **Step 5: *What goes where*.** The pyramid was replaced by three see-through layers that fill in turn and then stack (`what-goes-where.html`, `-b.html`).
- **Illustration cards:** every viewBox is cropped to its content, so the card padding is the only margin and it's equal on all four sides.

### Phase 4: Context views, pins and the library (11 Nov, PR #6 to #8)

- **Step 5 context views.** Five full-screen operational views were built from imagery and Figma frames: Storm tracking, Price per barrel, Flare monitoring, Booster gas compressor, and Underwater pipelines and wells. They live as standalone pages in `assets/context-views/`, embedded with `?embed` and driven by `postMessage`. On the page they show as five tall tinted strips. Clicking one widens it, plays its animation and opens a caption, and the open view can grow to full screen with arrows and Esc. Display options: `context-views-options.html`.
- **Pin tuning:** pinned sections stop with a gap below the top bar, the signal-to-action pin was shortened, and Step 5 holds until all four steps have opened.
- **Cache-safe assets:** every CSS/JS link carries a content hash, so browsers never mix new scripts with an old stylesheet.
- **Step 1 card animations retired.** They were archived in `animations/archive/step-1-howto-cards.html`, and the **animation library** page was added.
- **Step 6: prototype to platform.** A pink dot laps prototype → test → refine, follows a dotted hand-off into the blueprint, then the platform draws in perspective with a predictive layer of linked diamonds above it. It uses two line weights only: 1px structure and 0.5px detail.

### Phase 5: Where to start, menu and type scale (12 to 13 Nov, PR #9 to #11)

- **GitHub Pages** redeploy. *Where to start* now ends on the assessment.
- **Start this month cards:** square cards with headlines. Card 1 is *The bubble*, card 2 is *Every layer, lighter* (`l2`) and card 3 is the *Flowchart* (`s4`). Options are in `start-month.html` and `start-month-context.html`.
- **Step 5 context views moved into the build.** They had been hand-added to the generated page, so every rebuild erased them. `content.rb` now produces them.
- **Contents menu** joined the logo: a caret toggle, a numbered sliver when collapsed, and the state is set before first paint so pages don't jump.
- **Assessment buttons** link to ScoreApp.
- **Type scale consolidated to 12, 14, 16, 20, 28 and 32px.** Infographics use 16px headings over 14px notes everywhere.
- **Step 3: *One number, many copies*.** A grid of twelve dots leaves the source whole, splits into copies that each lose a few dots, and is whole again in pink at the agreed definition. Options: `copies.html`, `copies-a.html`, `one-number.html`.
- **Fixes:** unpinned animations clamp their scroll start and end to the page so they always finish. The Step 6 dot does one slow lap instead of two. Next-chapter banners lost their card for a hairline.

### Phase 6: Phones, tablets and the closing panel (16 Nov, PR #12 and #13)

- **Stacked layouts below 767px** for steps 3, 4 and 6: lanes run downward, the caption sits above the chart, and the journey runs top to bottom. Nothing scrolls sideways.
- **Infographics finish on every device**, upright or sideways. A drawing is never taller than the screen, and `pinTopFor` pins a little lower where little page follows the last pin.
- **Full logo always shows** in the top bar on tablets and phones.
- **Magnifico sign-off** under the assessment: the full logo, a line on what we do, and a link.
- **Closing panel:** *Footer BG · Parallax*, from Figma's Footer BG, replaced the breathing rings. It's a pink M watermark, a dark gradient and a striped texture on two layers drifting at different speeds, all in pure CSS. Three other options stay in `animations/footer-bg-options.html`.
- **Safari fix (Step 3):** labels draw above the dot clusters, and their white edge is a separate copy behind the text, because Safari can paint a stroke over the fill.

### Phase 7: Design system (17 Nov)

- **Design system page** (`design-system/index.html`): principles, colour (primitives, semantic tokens and live contrast checks), type families and the scale, layout and space, components, motion, logo and icons, accessibility, and where things live. It reads `assets/playbook.css`, so it always shows the values that actually ship.
- **Accessible buttons:** the action fill moved to `#e6006a` (4.59:1 with white) because brand pink `#ff0074` only reaches 3.82:1.

---

## 4. The animation system

The full rules are in [hero-explorations/ANIMATION-RULES.md](hero-explorations/ANIMATION-RULES.md). The essentials:

- **One idea, minimal means.** The pink ball sits at the centre and stands for us, the team, or the single source of truth. Lines tell the story by arriving, leaving, circling or settling. There's no text, no icons and no illustration in the heroes.
- **Palette:** pink `#FF0074` for the ball only, slate `#d5def0` lines on deep teal `#002a32`. Hierarchy comes from opacity, not from new colours. On light cards the lines swap to teal at the same opacities.
- **Geometry:** a 600×600 viewBox, ball radius 16, 1.5px round-capped strokes, and guide hairlines at 1px and `.05` opacity.
- **Motion:** each scene is a pure `draw(t)` function. Loops are seamless, everything is eased, timing is staggered with seeded randomness, and physical things behave physically. The ball "breathes" about 16% and glows only while it's receiving.
- **The trail (brand motif):** every moving line leaves 10 fading echoes (`.42 × (1 − j/11)²`, with a 0.028 to 0.06s lag). Still things get no echo.
- **Accessibility:** scenes pause off screen, reduced motion shows a single still frame, and the SVGs are `aria-hidden`.
- **Gotcha:** never set `stroke-opacity` in CSS on animated lines, because a CSS rule beats the SVG attribute.

**Where the animations live**

| Kind | Source |
|---|---|
| Chapter heroes | `assets/motion/hero-scenes.js` |
| Card scenes | `assets/motion/howto-scenes.js` |
| Section infographics | `tools/build/scripts.js` (built into each page) |
| Context views | `assets/context-views/` + `assets/motion/context-views.js` |
| Closing panel | `assets/playbook.css` (`.cta-bg`) + `assets/footer/` |
| Catalogue of everything | `animations/index.html` |

**Final heroes:** 01 Voices coming in · 02 Passing the baton · 03 Roots · 04 Overlap · 05 Built around it · 06 Wind tunnel · 07 True north. The intro still uses a placeholder.

---

## 5. Build, preview and deploy

- **Edit copy** in `tools/build/content.rb`, section visuals in `tools/build/scripts.js`, and Step 1's body in `tools/build/step-1-body.html`. Then rebuild:

  ```bash
  ruby -Eutf-8 tools/build/build.rb
  ```

- **Never hand-edit generated pages** (`intro/`, `step-*/`, `where-to-start/`), because the next build overwrites them. This is how Step 5's context views were once lost.
- **Preview locally:** `.claude/launch.json` runs Ruby's static server on port 4320.
- **Branches and PRs:** work happened on feature branches (`playbook-pages-trust-chart`, `footer-signoff`, `footer-parallax`) and was merged through PRs. After merging `main` into a branch, rebuild the pages from the merged sources.
- **Deploy:** GitHub Pages from the repository.

---

## 6. Lessons learned

- Show options side by side, then **check them in context** before committing. Several picks changed once they were on the real page.
- **Simplify when in doubt.** True north lost its drawn needle and arrowheads, and the trust chart lost 30% of its height.
- **Write rules down as soon as they're settled** (ANIMATION-RULES, the design system page), so later pieces stay consistent.
- **Keep one type scale.** Consolidating to six sizes removed many small inconsistencies.
- **Scroll animations must always finish:** clamp their start and end to the page, check short pages and tablets on their side, and keep drawings shorter than the screen.
- **Test in Safari**, which handles text strokes differently.
- **Check contrast on brand colours.** Pink on white text needed a darker action tone.
- **Archive, don't delete.** The library records what was live, parked or retired, and how to bring each piece back.

---

## 7. Still open

- The Introduction hero is a placeholder and needs its own brief.
- Steps 2 to 6 *How to apply it* cards have no illustrations yet.
