# From Data Sprawl to a Single Source of Truth

An interactive, web-based playbook by Magnifico. It follows the CLEAR discovery process
(Context, Listen, Examine, Align, Roadmap) plus a final step for building with confidence:
six chapters, each explaining the step, showing how to apply it, and ending with a case study.

## Status

| Chapter | Page | State |
| --- | --- | --- |
| 01 · Listen before you design | [`step-1-listen/`](step-1-listen/index.html) | Built, in review |
| 00, 02–07 | — | Not started |

Step 1 is the reference chapter. Once it's signed off, the other chapters follow the same structure.

## Viewing it locally

Each chapter is a single self-contained HTML file. Open `step-1-listen/index.html` in a browser,
or serve the repo from any static server. The only network requests are Google Fonts and the
pinned animation libraries on public CDNs.

## How a chapter is built

- **Layout:** a sticky contents rail on the left (a slide-out drawer below 1100px) and a stack
  of full-height sections: header, Start with people, How to apply it, In the field, and a
  closing findings section.
- **How to apply it:** pins in place and travels horizontally through one card per step, then
  vertical scrolling resumes. On phones (below 768px) the cards stack vertically instead.
- **Illustrations:** inline SVGs rebuilt from the source files in `assets/illustrations/`. Each
  one is a GSAP timeline scrubbed by scroll position, so it builds forward and reverses when you
  scroll back. The Map motion follows the keyframes set up in Figma; the others use the same
  staggered, ease-out language.
- **Logo:** the full lockup shows at the top; once the header scrolls away, the wordmark folds
  out and leaves the M mark at the same size.
- **Accessibility:** keyboard-reachable navigation, a skip link, and `prefers-reduced-motion`
  support (everything shows in its finished state, no smooth scrolling or pinning).

## Libraries

- [GSAP 3.12.5](https://gsap.com/) and ScrollTrigger for pinning, horizontal travel and scrubbed animation.
- [Lenis 1.1.13](https://github.com/darkroomengineering/lenis) for smooth wheel scrolling.

## Design system

Colors, type and spacing come from the Energy Operations Playbook design system in Figma:
Inter for everything readable, IBM Plex Sans Medium (uppercase, 16% tracking) for eyebrows,
magenta `#FF0074` as the single accent, deep teal `#002A32` for dark panels, and `#F6F6F6`
as the canvas. The tokens live at the top of each chapter's `<style>` block.

## Repository layout

```
step-1-listen/index.html     Chapter 01 page
assets/illustrations/        Source SVGs for the How to apply illustrations
assets/logo/                 Magnifico full and reduced logos
```
