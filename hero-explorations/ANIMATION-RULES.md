# Hero animation rules

The rules every chapter hero follows in the playbook *From Data Sprawl to a Single Source of Truth*. These are the source of truth for new heroes (Chapter 0 next) and for building the finals into the chapter pages. Add new rules at the bottom, under **Added rules**, with the date.

Reference code: [chapters/scenes.js](chapters/scenes.js) (scenes plus the trail) and [chapters.html](chapters.html) (the shared SVG styles and the clock). The live example is the Listen hero in [../step-1-listen/index.html](../step-1-listen/index.html).

## 1. The idea

- **Minimalist.** One ball, a few lines, lots of empty space. Nothing loud.
- **The ball is the hero.** The pink ball sits at the exact center, and it stands for us, the team, or the single source of truth. Every scene is about what happens *to* or *around* the ball.
- **Lines tell the story.** Meaning comes from how lines move: arriving, leaving, passing, circling, settling. There's no text, no icons and no illustration.
- **One idea per chapter.** Each hero is a visual metaphor for the chapter title that you can read in a couple of seconds (listening = voices coming in, follow the data = roots, where to start = true north).
- **Calm, but alive.** Motion should feel smooth and a little playful, never busy or flashy. If a version feels too detailed, simplify it (for example, True north uses a plain line needle and a pulse instead of a drawn needle and arrowheads).

## 2. Palette

| Role | Color | Use |
|---|---|---|
| Ball | Pink `#FF0074` | The center ball and its glow. The only saturated color. |
| Lines | Slate `#d5def0` | All lines, dots and outlines. |
| Background | Deep teal `#002a32` | The hero background. |

- Lines use **opacity, not new colors**, to set hierarchy: main moving lines about `.45–.6`, supporting lines `.2–.35`, guide hairlines `.05`.
- Pink is for the ball only (and the odd dashed pink "ghost" outline when it really is the ball's outline).

## 3. Geometry

- SVG `viewBox="0 0 600 600"`, center at `(300, 300)`.
- Ball radius **16**.
- Line stroke **1.5**, round caps and joins, no fill. Guide hairlines are stroke **1** at opacity `.05`.
- Keep the composition centered on the ball and within about 300 of it, so it works in both a square and a wide (21:9) frame.

## 4. The ball

- The ball **breathes**: it grows by about 16% when something reaches it, then eases back.
- It gets a **very subtle pink glow** (a radial gradient, opacity up to about `.4`) only while it's receiving. Don't use a constant glow.
- The ball never leaves the center for long. If it moves (a tap, a roll), it settles back.

## 5. Motion

- Each scene is a **pure `draw(t)`** function of time in seconds, so it can be replayed, paused and rewound with no stored state.
- **Loops must be seamless.** Fade lines out before resetting, and never pop back to a start pose.
- **Ease everything**: smoothstep, ease-in-out, ease-out and a gentle back-out for settles. Don't use linear motion, except for steady flows.
- **Vary the timing.** Lines shouldn't move in lockstep. Give each one its own start, speed and pause (seeded random) so it feels organic. For example, Roots goes out and comes back on different rhythms.
- **Physical things should behave physically.** Dominoes fall as one overlapping wave, compass needles overshoot and wobble before they settle, and things coming home speed up as they reach the ball.
- Draw-on lines use `pathLength="1"` with a dash offset. A "baton" dash has a head and tail that ease at slightly different rates.

## 6. The trail (brand motif)

Every moving line leaves a short, fading echo behind it, like a radar sweep. This is a candidate brand element and goes on **every** hero.

- The scene is drawn 10 more times underneath itself, each one slightly in the past (`t − j × lag`).
- Echo opacity is `.42 × (1 − j/11)²`, so it fades out smoothly.
- Lag is set per scene, usually **.028–.06 s**: shorter for fast spins, longer for slow drifts.
- **Still things get no echo.** An echo copy is hidden when it is within 1.2 units of the main layer, so still lines don't get brighter.
- The ball, the glow and the guide hairlines never echo.
- There's a toggle to turn trails off for comparison (`.no-trail`).

## 7. Implementation and accessibility

- Pause scenes that are off screen (IntersectionObserver), and cap the frame delta so tabbing back doesn't jump.
- `prefers-reduced-motion`: show a single representative still frame.
- **Don't set `stroke-opacity` in CSS** on animated lines. A CSS rule beats the SVG attribute, so the animation stays invisible. Set the starting opacity as an attribute instead.
- Hero SVGs are decorative: `aria-hidden="true"`.
- Chapter pages use GSAP + ScrollTrigger + Lenis for the intro reveal. The hero loop itself runs on its own requestAnimationFrame clock.

## 8. Final heroes

| Chapter | Hero | Scene |
|---|---|---|
| 00 Intro | To come, with its own brief | – |
| 01 Listen before you design | Many voices, taken in (live) | `01` |
| 02 Know who decides what | Passing the baton | `02c` |
| 03 Follow the data to its source | Roots | `03b` |
| 04 Agree on what matters | Overlap | `04b` |
| 05 Design around decisions | Built around it | `05d` |
| 06 Test before you build | Wind tunnel | `06c` |
| 07 Where to start | True north | `07h` |

## Added rules

<!-- New rules go here, newest last, with the date. Example:
- 2026-11-06: Rule text. -->
