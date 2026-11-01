# Capital Drywall & Renovation: Art Direction

> Read this with `CAPITAL_BUILD_BRIEF.md` §3 and §6. The brief wins on any conflict. This file turns
> "Raking Light" into concrete, buildable decisions so every page reads as one hand-made system,
> never as a template.

## The idea in one line

**A set of construction drawings for a perfect wall, lit by one raking light.**

Two layers, always in dialogue:

| Layer | Surface | Feels like | Used for |
|---|---|---|---|
| **The light** | `surface-dark` graphite | A dark room, one warm work light grazing a wall | Hero, raking-light test, basement transform, final CTA, mobile menu |
| **The drawing** | `surface-light` plaster with `texture-plaster` | A crisp drawing sheet on vellum: hairlines, dimensions, schedules | Everything you read |

Alternate with rhythm (dark, light, light, dark, light…), never strict zebra stripes.

## What makes it ours (signature devices)

Use these instead of generic web patterns. Each one comes from real drafting or jobsite practice.

1. **Sheet references, not eyebrows.** Section eyebrows read like drawing-sheet references:
   `04 / HOW WE WORK` in `t-spec`, followed by a hairline that runs to the container edge and ends in
   a tick, with a right-aligned sheet code (`A-04`). Component: `SectionHeader`.
2. **Detail bubbles.** The architectural detail callout: a circle split by a horizontal line, item
   number on top, sheet code below. Use it for process steps, spec-list numbers and map callouts.
   Component: `DetailBubble`.
3. **Dimension lines everywhere it means something.** Thin lines with end ticks and a mono label,
   drawing on as they enter the viewport. Annotate *real* facts: `3 COATS · 24 H DRY`,
   `1.2 M WALL SECTION`, `4–6 WK AFTER PERMIT`, `LEVEL 4 → LEVEL 5`. Never decorative numbers.
4. **Figure captions.** Every image gets registration marks on its corners and a mono caption with
   a leader line: `FIG. 03 · TAPING KNIFE, SECOND COAT`. Atmosphere images describe what is shown,
   never a client, address or "our project". Component: `MediaFrame`.
5. **Schedules, not card grids.** Prices, finish levels, inclusions and timelines are set like the
   schedules on a drawing set: joined cells with shared hairlines, mono column heads, tabular figures,
   leader dots. Three things side by side are one framed schedule divided by hairlines, not three
   floating cards with gaps and shadows.
6. **The title block.** The footer is a drawing title block: a grid of hairline cells with tiny mono
   field labels (`CONTRACTOR`, `SERVICE AREA`, `PHONE`, `HOURS`, `CHECKED BY`, `SHEET`) and real
   values, and the oversized wordmark set into the bottom row.
7. **Vellum grid.** On two or three plaster sections per page, show the faint 12-column drafting grid
   (hairline columns about 5% ink) with `+` registration crosses at a few intersections. Never on every
   section.
8. **Raking light as interaction.** Light only ever comes from the left and low. Hover states on dark
   surfaces brighten the edge closest to the light. Button shine sweeps left to right. The only custom
   cursor on the site is the work light inside the raking-light test.
9. **The spirit level.** `LevelVial` is the progress and success language: form progress, the
   "Level. We've got it." success state and the 404.
10. **Section cut lines.** Where a page "cuts" through a wall (basement wall layers), use a section-cut
    marker: hairline across the page with circled `A` markers at both ends, labelled `SECTION A–A`.

## Layout rules

- 12-column `site-grid`, content offset from the left edge. Default text block: columns 2–7 (or 1–5)
  with media on 7–12 bleeding off the right edge. Mirror occasionally, never centre a whole section.
- Headlines start on a different column than body text at least once per page (hanging indent).
- Media bleeds off one edge (use negative margin to the viewport edge), never floats in a centred box.
- Hairline rules (`border-[color:var(--hairline)]`, 1 px) structure the page like a drawing sheet.
- Radius 2 px everywhere (already tokenised). Pills only for small tags and chips.
- Generous rhythm: `section-y` (80 → 160 px). Tight sections use `section-y-tight`.
- No drop shadows except for floating UI (toast, mobile action bar, sticky header after scroll).

## Typography in practice

- Display: Archivo expanded (`t-display-xl`, `t-display-l`, `t-h2`, `t-h3`), sentence case, tight.
  Pull a headline left past the body column (hanging) or break it on purpose with `<br>` for rhythm.
- Body: IBM Plex Sans 17–18 px, max 68ch (`prose-measure`), `text-muted` for secondary text.
- Spec labels: `t-spec` (Plex Mono 500, uppercase, 0.14em). Use for eyebrows, captions, step numbers,
  table heads, units and annotations. Numbers in data use `tabular-nums`.
- Units are part of the voice: `5/8" TYPE X`, `24 H`, `300–1,500 SQ FT`, `4–6 WK`, `LEVEL 5`.
- Never amber text on plaster. Amber appears as fills, beams, ticks and focus rings.

## Motion in practice

- Ease `--ease-rake` (`cubic-bezier(0.22, 1, 0.36, 1)`) for reveals; linear only for scrubbed scenes.
  UI 150–250 ms, reveals 600–900 ms, stagger 60–80 ms.
- Headlines: line-by-line mask slide (`RevealHeading`, GSAP SplitText), headlines only, and only for
  headings that start below the fold.
- Dimension lines draw on (stroke-dashoffset). The `rake-line` hairline sweeps across the top
  boundary of a dark section on enter.
- Parallax at most 10–15%, only on a couple of large images per page.
- `prefers-reduced-motion`: everything is present and still. No pinning, no scrubbing, no Lenis.

## Banned (from the brief, plus what we've learned)

- Purple/blue gradients, gradient text, glassmorphism, blobs, generic 3D shapes, emoji icons.
- The three-icon "Quality · Reliability · Trust" row; identical 3-card grids; everything centred.
- Stock hard hats, thumbs-up workers, handshakes, cartoon tools.
- Words: elevate, transform your space, unlock, look no further, one-stop shop, top-notch, nestled,
  in today's world, we pride ourselves.
- Fake stats, fake reviews, fake "trusted by" logos, fake awards, lorem ipsum.
- Also banned here: floating cards with soft shadows, pill-shaped buttons, gradient borders, icon-in-
  a-circle feature rows, "✓" emoji lists, animated counters of made-up numbers, auto-playing
  carousels, decorative scroll-jacking, stock-photo hero with a dark overlay and centred headline.

## Section-by-section direction (home)

| # | Section | Direction |
|---|---|---|
| 2 | HeroSequence | Canvas wall sequence. Stage caption bottom-left as a dimension string (`02 — JOINTS TAPED`), vertical rail right with ticks 01–05 filling in amber. Final state: small H1 spec line, giant `Smooth under any light.` set left over columns 1–9, sub and CTAs beneath, trust row as a mono dimension string. |
| 3 | TrustStrip | One mono line built like a dimension string: `├─ FREE ON-SITE QUOTES ─┼─ FULLY INSURED ─┼─ …─┤`. Wraps to two rows on mobile, no icons. |
| 4 | Primary services | Two unequal panels, staggered: Drywall 7 cols, Basements 5 cols set lower (offset), each with a before/after slider thumbnail, mono label, H3, text, arrow link. A dimension line under the H2 reads `2 SERVICES · DONE PROPERLY`. |
| 5 | Raking-light test | The showpiece. Two panels, work-light cursor, auto-sweep at idle. Angle annotation (`15° RAKING ANGLE`) drawn as an arc near the H2. |
| 6 | Basement teaser | Pinned, scrubbed; step rail with four stages; `Concept visualization` label in a corner title-block cell. |
| 7 | Promises | Spec sheet: five rows, detail-bubble numbers, Archivo title, body, and a right-hand mono "spec" value per row (e.g. `TOUCH-UPS · AFTER PRIMER`). Hairline rows; a faint amber light sweep across a row on hover. |
| 8 | Secondary services | Desktop: an editorial index (three rows, number, name, one line, arrow) with the row's image revealed in a fixed frame on the right on hover/focus. Mobile: horizontal scroll-snap 4:5 cards. |
| 9 | Process | Desktop: pinned horizontal track, five panels joined by one long dimension line with ticks at each step and detail bubbles. Mobile: vertical stepper with the line running down. |
| 10 | Starting prices | A joined three-column "finish schedule" (`PriceCard` cells sharing hairlines): mono `ITEM 01`, name, `FROM` + big Archivo price, scope line. Fine print beneath with an `HST EXTRA` annotation. |
| 11 | Recent work | A contact sheet: asymmetric sizes, mono frame numbers and captions (`FRAME 03 · POPCORN CEILING · KANATA`), sample badges in demo mode. |
| 12 | Owner note | A letter set in Archivo (not italic) with a title-block "CHECKED BY" signature cell. No portrait unless `owner.photo` exists. |
| 13 | Service area | Abstract SVG plan of Ottawa (river at the top, communities as labelled points), north arrow, scale bar `0 · 5 · 10 KM`, mono coordinates; two-column list beside it that highlights points on hover/focus. |
| 14 | FAQ | `Q.01` mono numbers, Archivo questions, `<details>` accordion with a crosshair `+` that rotates. |
| 15 | Final CTA | Dark, raking beam sweeping across a wall-like surface, huge two-line headline, primary + call buttons, mono response promise. |

Other pages follow the same vocabulary: finish levels as a selector plus schedule table, the estimator
as an "estimate sheet", the basement timeline as a mini Gantt chart (weeks as columns), wall layers as
an exploded section with a `SECTION A–A` cut marker.

## Quality bar checklist (run on every section)

- Would this section look at home in a template marketplace? If yes, redo it.
- Is there one clear focal point and one clear action?
- Are all annotations true and useful (real units, real facts)?
- Is the amber under ~5% of the screen?
- Does it hold up at 320 px, 768 px, 1440 px, keyboard-only and with reduced motion?
