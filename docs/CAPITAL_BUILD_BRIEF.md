# Capital Drywall & Renovation — Website Build Brief

> **How to use (Claude Code):** This file and `CAPITAL_COPY.md` live in `docs/` inside the project folder (`docs/` is allowed by create-next-app, so scaffold the Next.js app right in the project folder). Open Claude Code in the project folder and run:
> *"Read docs/CAPITAL_BUILD_BRIEF.md and docs/CAPITAL_COPY.md in full. Scaffold the Next.js app in this folder and build the site exactly as specified. Don't ask about anything these files already answer."*

---

## 0. Mission

Build the best-looking, fastest, most findable drywall and basement contractor website in Ottawa.

- **First load:** the client (and every homeowner) should instantly feel the quality of the work before reading a word.
- **Beat the competition:** better design, clearer proof and more transparency than every local competitor (see §2).
- **Get found:** rank on Google and Google Maps, and get cited by ChatGPT, Perplexity and Google AI Overviews.
- **Convert:** every page drives to one action: **Get a Free Quote** (or a call).

**Quality bar:** this site must be better than every site we've shipped before. If a section looks like a template, redo it.

**Demo + production:** ship it publish-ready. Every unconfirmed business fact lives in one config file (§14), flagged, so we can swap real details in minutes. A missing fact hides its UI. The site never shows a broken or invented claim.

---

## 1. Client & context

| | |
|---|---|
| Business | **Capital Drywall & Renovation** |
| Domain | capitaldrywallrenovations.com (apex canonical, redirect www → apex) |
| Location | Ottawa, Ontario. Service-area business, no storefront. |
| Stage | Brand new. No website, Google Business Profile being created now, zero reviews. |
| Owner | Also runs Stoneworks Interlock (summer business). Capital is his winter-season business. |
| Primary services | **Drywall services** and **Basement renovations**: most prominent on the homepage, dedicated pages, strongest CTAs, before/after proof. |
| Secondary services | Interior painting, bathroom renovations, kitchen renovations. Listed and linked, visually secondary. |
| Package | Tekmadev **Webline**: up to 5 pages, copy included, SEO + GEO/AEO, lead capture, launch on domain. Utility pages (privacy, thank-you, 404) don't count toward the 5. |

**Target searches:** drywall contractor Ottawa, drywall repair Ottawa, drywall installation Ottawa, basement renovation Ottawa, basement finishing Ottawa, plus long-tail (Level 5 finish, skim coating, popcorn ceiling removal, water-damaged drywall, basement cost, basement permit).

---

## 2. Competitive bar

| Competitor | What they do well | Weakness | How we beat them |
|---|---|---|---|
| PatchBoyz | 4.9★ / 231 Google reviews, "from" prices, photo-upload quote form, WSIB badge, before/afters | Cluttered page builder site, nav sprawls into mold/asbestos/franchising, repair-only | Same transparency and photo form, far cleaner and faster, plus basements |
| R&G Walls | Same positioning as us: Level 5, skim coat, popcorn removal, basement drywall | Thin Wix site, 1 testimonial, no pricing, no FAQ, social icons point to Wix's own accounts | Everything they lack, done properly |
| Three Steps Drywall | Post-primer touch-up guarantee, WSIB + liability, "no middleman" | Dated WordPress, reviews from 2021, COVID line still live | Modern build plus our own named guarantee |
| RenosGroup | Basement price table, 2-yr warranty, 10% deposit, permits handled, deep FAQ, area pages | Wall of text (25-min read), $15k minimum, general reno company | Same transparency, an interactive estimator, readable |
| Just Basements | Ottawa's largest basement design-build, 25+ yrs, design awards | Premium/luxury only | We own the mid-market on speed, clarity and finish quality |

**The gap:** every competitor runs on Wix, WordPress or a page builder template. None has scroll-driven storytelling, interactive proof, a mobile action bar or AI-search optimization. That's where we win.

---

## 3. Non-negotiables

1. **Craft.** Awwwards-level polish adapted to a trades business. Every section intentional, every state designed (hover, focus, loading, error, empty).
2. **No AI slop.** Banned:
   - Purple/blue gradients, gradient text, glassmorphism everywhere, floating blobs, generic 3D shapes
   - Emoji as icons; the "three icon cards: Quality · Reliability · Trust" section
   - Identical 3-card grids repeated down the page; centring everything
   - Stock hard-hat models, thumbs-up workers, handshakes, cartoon tools
   - Clichés: "elevate", "transform your space", "unlock", "look no further", "one-stop shop", "top-notch", "nestled", "in today's world", "we pride ourselves"
   - Fake stats, fake reviews, fake "trusted by" logos, fake awards, lorem ipsum
3. **Honesty.**
   - AI-generated imagery is atmosphere or labelled concept only, never presented as a completed client project.
   - Gallery and before/after use real project photos only. Sample placeholders are allowed in demo mode and badged (§7.4).
   - No review/rating markup until real reviews exist.
4. **Performance.** Lighthouse mobile: Performance ≥ 90, SEO 100, Accessibility ≥ 95, Best Practices 100. LCP ≤ 2.0 s on 4G, CLS ≤ 0.05, INP ≤ 200 ms. The scroll hero must not hurt LCP.
5. **Accessibility.** WCAG 2.2 AA. Full `prefers-reduced-motion` fallbacks. Sliders, estimator and form fully keyboard-operable.
6. **Canadian English** (colour, centre, neighbourhood, metre). `lang="en-CA"`.
7. **Client-facing copy never mentions Tekmadev's internal tools or vendors.**

---

## 4. Skills & tools to load

- **UI/UX Pro Max skill:** load before designing. Use it for the design-system pass, spacing, component states and accessibility checks. Where it conflicts with a locked decision in this brief, **this brief wins**.
- **frontend-design skill**, if available, for the final taste pass.
- **Higgsfield (MCP)** for hero sequences and imagery (§8). Use `models_explore` to pick the current best photoreal image model and a video model that supports start + end frames.
- **ffmpeg** for frame extraction, **sharp** for image encoding.

---

## 5. Tech stack & structure

- Next.js latest stable (App Router, RSC), React 19, TypeScript strict
- Tailwind CSS v4 (CSS-first `@theme` tokens)
- GSAP + ScrollTrigger (scroll scenes) + SplitText (headline reveals), Lenis (smooth scroll, synced to ScrollTrigger), Motion (`motion/react`) for UI micro-interactions
- `next/font/google`: **Archivo** (variable, with width axis), **IBM Plex Sans**, **IBM Plex Mono**
- `next/image` (AVIF/WebP), `next/og` for OG images
- react-hook-form + zod, Resend (email), Vercel Blob (photo uploads), browser-image-compression
- Vercel hosting, Vercel Analytics + Speed Insights (cookieless)
- No CMS: content lives in typed TS files under `/content`
- Icons: Lucide only where an icon truly helps. Custom SVG for trade motifs.

```
app/
  layout.tsx                      # fonts, metadataBase, sitewide JSON-LD, Lenis provider, MobileActionBar
  page.tsx                        # Home
  drywall-ottawa/page.tsx
  basement-renovations-ottawa/page.tsx
  renovations-ottawa/page.tsx
  free-quote/page.tsx
  privacy-policy/page.tsx
  thank-you/page.tsx              # noindex
  not-found.tsx
  api/quote/route.ts              # form handler
  api/upload/route.ts             # Vercel Blob client-upload token
  llms.txt/route.ts               # generated from /content so it never drifts
  llms-full.txt/route.ts
  sitemap.ts  robots.ts  icon.tsx  opengraph-image.tsx (per route)
components/
  scenes/      HeroSequence, RakingLightTest, BasementTransform, WallLayers
  sections/    page sections
  ui/          Button, SpecLabel, DimensionLine, BeforeAfter, Accordion, Stepper, PriceCard, LevelVial, ...
  forms/       QuoteForm (multi-step), Estimator
content/
  site.config.ts                  # ALL business facts + feature flags (CONFIRM markers)
  copy/*.ts                       # page copy, transcribed from CAPITAL_COPY.md
  faq.ts                          # single source: FAQ UI + FAQPage schema + llms.txt (+ future AI agent knowledge base)
  services.ts  areas.ts  projects.ts  pricing.ts
lib/  schema.ts  seo.ts  analytics.ts
public/sequences/  hero-desktop/  hero-mobile/  basement-desktop/  basement-mobile/
assets-src/  MANIFEST.md          # every generated asset: prompt, model, seed
```

---

## 6. Design system: "Raking Light"

### Concept
Drywall pros judge a wall by holding a light flat against it. That **raking light** exposes every ridge, seam and sanding mark. A wall that looks flawless under raking light is a perfect finish.

That's the brand idea: **Smooth under any light.** Darkness, one warm grazing beam, and surfaces that hold up to it. Paired with the precise language of construction drawings: dimension lines, spec labels, measurement ticks, registration marks.

It should feel like a high-end architectural studio that happens to hold a taping knife: calm, precise, confident. Never loud, never generic-tradesy.

### Colour tokens
```css
--plaster:        #F2EFE9;  /* primary light bg, fresh compound */
--plaster-2:      #E7E2D9;  /* raised surfaces on light */
--compound:       #CFC8BC;  /* borders, dividers, muted UI */
--graphite:       #141518;  /* dark bg / primary ink */
--graphite-2:     #1E2024;  /* raised surfaces on dark */
--steel:          #6B6F76;  /* secondary text */
--worklight:      #F4A62A;  /* accent: warm amber of a jobsite work light */
--worklight-deep: #C77F0E;  /* hover/pressed; large text accents on light only */
--level:          #3F8F5A;  /* success states only */
```
- **Dark** (graphite) for cinematic moments: hero, raking-light test, basement transform, final CTA. **Light** (plaster) for reading sections. Alternate with rhythm; don't zebra-stripe every section.
- **Accent** only for actions and light beams, ≤ ~5% of any screen. Primary button = amber fill + graphite text (≈ 9:1 contrast). Never amber body text on plaster.
- If the client's logo has a strong brand colour, swap `--worklight` to it, re-check contrast, keep everything else.

### Typography
- **Display: Archivo** variable, width 112–125 (expanded), weight 700–800, tracking −0.02em, line-height 0.95. Sentence case for headlines.
- **Body: IBM Plex Sans** 400/500, 17–18 px base, line-height 1.6, max 68ch.
- **Spec labels: IBM Plex Mono** 500, uppercase, 11–12 px, letter-spacing 0.14em, `--steel`. Used for eyebrows, step numbers, captions and annotations ("LEVEL 5 · 3 COATS · PAINT-READY").
- Fluid scale: display-xl `clamp(3rem, 8vw, 7.5rem)`, display-l `clamp(2.5rem, 5.5vw, 5rem)`, h2 `clamp(2rem, 4vw, 3.5rem)`, h3 `1.5rem`.

### Layout
- 12-column grid, max width 1440 px, 24/32 px gutters, 20 px mobile side padding.
- Asymmetric, editorial compositions: offset headlines, media bleeding off one edge, 5/12 text against 7/12 media. Avoid centring everything.
- Generous rhythm: 120–200 px between sections on desktop, 80–120 px on mobile.
- Hairline rules (1 px `--compound` or 8% white) as structure, like drawing sheets.
- Radius 2 px everywhere (sharp, architectural). Pills only for small tags.

### Motifs
- **Dimension lines:** thin lines with end ticks plus a mono label, annotating images and headings. They draw on as they enter the viewport (stroke-dashoffset).
- **Raking beam:** soft amber gradient sweeping across dark surfaces. Used sparingly, including a single hairline "rake" across section boundaries on enter.
- **Spirit level (LevelVial):** form progress and success state (the bubble settles to centre: "Level. We've got it."), plus the 404 illustration.
- **Plaster texture:** very low-opacity trowel/noise texture on plaster sections (SVG feTurbulence or tiny tiled AVIF).
- **Registration marks** on image corners, like print/blueprint crop marks.

### Imagery direction
- Cinematic, low-key light: warm amber practicals against cool shadow. Texture-forward close-ups: compound under a trowel, a taping-knife edge, a sanded surface under grazing light, crisp inside corners.
- Spaces that feel like real Ottawa homes: modest suburban basements, bright finished rec rooms. Not US mansions.
- Brief for real project photos (goes to the client): shoot finished walls with a light held to the side.

### Motion principles
- Motion explains the craft (stages, transformation, light). Nothing floats for decoration.
- Ease: `cubic-bezier(0.22, 1, 0.36, 1)` for reveals; linear for scrubbed scenes. UI 150–250 ms, reveals 600–900 ms, stagger 60–80 ms.
- Headline reveals: line-by-line mask slide (SplitText), headlines only.
- Parallax ≤ 10–15%.
- `prefers-reduced-motion`: no pinning or scrubbing, static keyframe images, instant states, Lenis off.
- Mobile: lighter frame sets, no pin longer than ~220vh.

### Components (build as a mini design system, all states)
Button (primary, secondary outline, ghost, call) with a light-sweep shine on hover and a 2 px amber focus ring · SpecLabel · DimensionLine · SectionHeader · ServiceSplitCard · BeforeAfterSlider (pointer, touch, keyboard; the handle is a slim vertical light bar) · Accordion (built on `<details>` so it works without JS) · ProcessStepper · PriceCard · AreaMap (SVG) · TrustStrip · OwnerNote · MobileActionBar · Header (transparent over dark hero → solid plaster and condensed on scroll) · Footer · Toast · LevelVial.

Build a `/dev/kitchen-sink` route showing every component and state (excluded from sitemap, noindex, disabled in production).

---

## 7. Signature moments

### 7.1 Home hero: "The Raking Light" scroll sequence
- Sticky full-viewport `<canvas>`; section height ~350vh desktop, ~220vh mobile.
- Plays a frame sequence (§8.1): the camera glides along a wall in a dark room lit only by a low work light, while the wall progresses through 5 stages, from bare board to flawless and paint-ready.
- Stage captions (mono, bottom-left) with a vertical DimensionLine progress rail (01–05) on the right. Caption text is in COPY.md.
- From ~85% to 100% progress, the headline block resolves on the now-flawless wall: H1, display line, sub, CTAs and trust row.
- **LCP protection:**
  - First paint is the final frame as a `priority` `<Image>` poster with the headline already visible. This is also the no-JS and reduced-motion state.
  - Remaining frames load after `load` via `requestIdleCallback`, decoded with `createImageBitmap`. Scrubbing starts once ≥ 30% of frames are ready; nearest-frame fallback for gaps.
  - Canvas uses object-fit cover math, DPR capped at 2.
- Mobile uses a 9:16 sequence with ~72 frames.
- Scroll cue: mono "Scroll to finish the wall ↓", fading out as scrolling starts.
- **Captions must also exist as real HTML text** (for crawlers and screen readers), not only painted on canvas.

### 7.2 Raking-light test (home, interactive)
- Dark section with two wall panels side by side (stacked on mobile): **Rushed finish** and **Capital finish**.
- At rest, both look identical (flat light). The pointer is a low-angle light: a raking-lit layer is revealed under a soft radial mask around it. The left panel shows ridges, tape lines and sanding swirls; the right stays flawless.
- **Implementation:**
  - Each panel stacks two images with the same framing: flat-lit and raking-lit.
  - Mask the raking image with `mask-image: radial-gradient(...)` positioned via CSS variables, updated in `requestAnimationFrame`.
  - Custom light cursor only inside this section.
  - When idle, on touch devices before interaction, and for reduced motion: an automatic slow sweep (reduced motion gets static side-by-side raking images instead).
- Images per §8.3.

### 7.3 Basement transformation
- Pinned, scroll-scrubbed sequence: unfinished concrete → framed and insulated → drywalled → finished rec room. Four labelled stages on a step rail.
- Corner label **"Concept visualization"** (it's AI-generated).
- Basement page: full hero version. Home: shorter teaser (~200vh).

### 7.4 Before/after sliders
- Used on the home service cards, the Drywall page and the Basement page. Data comes from `content/projects.ts`.
- Items with `isSample: true` show a small badge **"Sample — replace with project photo"** only when `NEXT_PUBLIC_SITE_MODE=demo`. In production mode, sample items are filtered out automatically, and a section with no real items hides itself.

### 7.5 Basement budget estimator (basement page)
- **Inputs:** size slider (300–1,500 sq ft, step 50), finish level (Essential / Comfort / Premium), add-ons (Bathroom, Bedroom with egress window, Wet bar or kitchenette).
- **Output:** a live range with an animated number roll. Rates come from `content/pricing.ts` (CONFIRM). Disclaimer line included.
- **CTA "Get my exact quote"** → `/free-quote?service=basement&size=…&level=…&addons=…`, prefilling the form.
- Analytics events: `estimator_used`, `estimator_to_quote`.

### 7.6 Wall layers diagram (basement page)
- Exploded SVG wall section (foundation → insulation → vapour barrier → framing → drywall, plus subfloor) that assembles layer by layer on scroll, with mono labels and DimensionLines. Static and fully labelled for reduced motion.

### 7.7 Drywall finish levels (drywall page)
- A Level 0–5 selector (segmented control or scrub). Each step shows the same wall illustration getting smoother, with the level description.
- A semantic HTML table of the levels is always present, for SEO/AEO.

### 7.8 Mobile action bar
- Below 768 px, after the hero: fixed bottom bar with **[Call]** and **[Get a Free Quote]**.
- SVG phone icon, safe-area insets, 44 px+ targets.
- Hides when the footer or the quote form is in view.

### 7.9 Small details that signal craft
- Wordmark placeholder until the logo arrives: "CAPITAL" in Archivo expanded over "DRYWALL & RENOVATION" in mono. Swap for the SVG logo later.
- Link underlines draw from the left in amber.
- Form success: the LevelVial bubble settles → "Level. We've got it."
- 404: "This wall isn't finished yet." with a half-taped wall illustration.

---

## 8. Higgsfield asset plan

**Method for consistent multi-stage sequences:**
1. Generate stage 1 as a still.
2. Generate every later stage by editing or referencing stage 1, so camera, framing and light stay identical.
3. Use a video model with start + end frames to interpolate each consecutive pair.
4. Concatenate the clips and extract frames.

- Render 16:9 (desktop) and 9:16 (mobile) versions.
- No faces, no text, no logos in any asset.
- Log the prompt, model and seed for every asset in `assets-src/MANIFEST.md`.

### 8.1 Hero wall sequence
**Style suffix (append to every stage):**
`photorealistic, cinematic, dark interior room, a single low-angle warm work light (3200K) grazing the wall surface from the left, strong raking light revealing surface texture, fine dust particles drifting in the beam, shallow depth of field, 35mm lens, camera at chest height facing the wall, wall fills the frame, no people, no text, no logos`

| Stage | Prompt |
|---|---|
| S1 | `a freshly hung bare gypsum drywall wall, visible board seams and screw heads in a neat grid, paper-faced board texture,` + suffix |
| S2 | same framing, `drywall seams covered with paper tape bedded in wet joint compound, screw heads spotted with compound, slight wet sheen,` + suffix |
| S3 | same framing, `joints feathered wide with three coats of off-white joint compound, broad smooth trowel strokes visible,` + suffix |
| S4 | same framing, `fully sanded uniform matte compound surface, seams invisible, a little fine sanding dust in the light beam,` + suffix |
| S5 | same framing, `flawless finished wall painted warm off-white, perfectly smooth under the raking light, no seams or ridges visible, calm and premium,` + suffix |

**Interpolation (4 clips, ~5 s each):**
`slow steady lateral camera dolly to the right along the wall, the wall surface gradually transforms from [stage A] to [stage B], continuous smooth motion, consistent lighting`

**Frame pipeline:**
```bash
ffmpeg -f concat -safe 0 -i clips.txt -c copy hero.mp4
# desktop ~150 frames
ffmpeg -i hero.mp4 -vf "fps=150/20,scale=1920:-2" assets-src/hero-desktop/%04d.png
# mobile ~72 frames, 9:16 render
ffmpeg -i hero-mobile.mp4 -vf "fps=72/20,scale=900:-2" assets-src/hero-mobile/%04d.png
# then sharp → AVIF (quality ~45) into public/sequences/...
```
Budget: desktop sequence ≤ 6 MB total, mobile ≤ 2.5 MB. Poster = final frame, also exported as an optimized AVIF + JPEG.

### 8.2 Basement transformation
**Style suffix:** `photorealistic wide-angle 24mm interior photograph of a typical Ottawa suburban house basement, eye-level, identical camera position, soft daylight from small basement windows plus warm practical lights, no people, no text`

| Stage | Prompt |
|---|---|
| B1 | `unfinished basement, bare poured-concrete foundation walls, exposed wood floor joists and ductwork overhead, concrete floor, one bare bulb, a small hopper window,` + suffix |
| B2 | same, `new wood stud walls framed, insulation and clear vapour barrier installed, electrical boxes roughed in,` + suffix |
| B3 | same, `walls and ceiling covered in drywall, taped and mudded, recessed light cut-outs, concrete floor still exposed,` + suffix |
| B4 | same, `fully finished modern family rec room, smooth warm-white walls, flat drywall ceiling with recessed pot lights, light oak luxury vinyl plank floor, white baseboards and trim, a low media console and neutral sofa, bright and cozy,` + suffix |

Interpolation: `slow push-in camera move, the basement gradually transforms from [A] to [B]`. Same frame pipeline.

### 8.3 Raking-light test (4 stills, identical framing, ~1.2 m wall section)
- R1: `a painted white interior wall evenly lit by soft overhead light, looks plain and smooth, photorealistic close-up`
- R2: same wall, `lit by a single low-angle light from the left, revealing visible taped seams, ridges, trowel marks, sanding swirls and two nail pops`
- R3: a second wall, flat-lit like R1
- R4: R3 `lit by a single low-angle light from the left, revealing a perfectly flat, uniform surface with no visible seams or marks`

### 8.4 Atmosphere stills (16:9 and 4:5)
- Macro: taping knife spreading joint compound over a seam, warm light
- Sanding pole with a dust-extraction hose against a smooth ceiling
- Hands rolling warm-white paint on a smooth wall (hands only)
- Smooth flat ceiling with pot lights (popcorn-removal section)
- Modern bathroom: large-format tile shower, floating vanity
- Updated kitchen: painted shaker cabinets, white tile backsplash
- Short loop (≤ 1.5 MB, muted, poster) for the Drywall page hero: raking light slowly sweeping across a flawless wall

These are atmosphere images. **Never caption them as completed client projects.**

### 8.5 OG base
Dark wall with an amber raking beam and negative space for text. Page titles are overlaid via `next/og`.

---

## 9. Pages & section order

Copy for every element is in `CAPITAL_COPY.md`. Use it verbatim; trim only to fit a layout.

**Home `/`**
1. Header (transparent over dark)
2. HeroSequence (§7.1)
3. TrustStrip
4. Primary services split: Drywall / Basements, with before/after thumbnails
5. RakingLightTest (§7.2)
6. BasementTransform teaser (§7.3)
7. "What you can count on": 5 promises as a numbered spec-sheet list (not icon cards)
8. Secondary services (3 items; horizontal scroll-snap on mobile)
9. Process (5 steps; pinned horizontal track on desktop, vertical stepper on mobile)
10. Starting prices (3 PriceCards)
11. Recent work gallery (flag: `gallery`)
12. Owner note (replaces reviews until real reviews exist; reviews section behind flag `reviews`)
13. Service area (SVG map + list)
14. FAQ (8)
15. Final CTA (dark, raking beam)
16. Footer

**Drywall `/drywall-ottawa`**
1. Hero: H1 + sub + CTAs on the left; raking-light loop or BeforeAfter on the right
2. Answer-first intro + jump-link chips
3. Five sub-service sections, alternating media/text. Each has an H2, answer paragraph, mono-labelled bullet list and mini CTA.
4. Finish levels 0–5 (§7.7)
5. Before/after (flagged)
6. Starting prices
7. Process (compact)
8. FAQ (drywall)
9. Final CTA

**Basement `/basement-renovations-ottawa`**
1. Hero: full BasementTransform with H1 overlay
2. Answer-first intro
3. What we build: 6 tiles in an asymmetric grid (photo + mono label each)
4. What's included: a numbered "spec sheet" checklist
5. Built for Ottawa basements: WallLayers diagram (§7.6)
6. Budget estimator (§7.5)
7. Timeline (week-by-week rail)
8. Before/after (flagged)
9. FAQ (basement)
10. Final CTA

**Renovations `/renovations-ottawa`**
1. Hero
2. Three sections with anchors `#interior-painting`, `#bathroom-renovations`, `#kitchen-renovations`. Each has an image, H2, answer paragraph, bullets and CTA.
3. "Why a drywall specialist" band
4. FAQ
5. Final CTA

**Free quote `/free-quote`**
1. H1 + sub
2. Multi-step QuoteForm (7/12) beside a sidebar (call, email, hours, response promise, "What happens next")
3. About (owner note expanded + values)
4. Service area
5. Mini FAQ

**Utility pages:** `/privacy-policy`, `/thank-you` (noindex), 404.

---

## 10. SEO

**Metadata**
- Titles and descriptions per page are in COPY.md. `metadataBase` = `https://capitaldrywallrenovations.com`.
- Canonical on every page. OG + Twitter cards via `next/og` (dark raking-light template with the page title).
- One H1 per page; logical H2/H3 nesting.
- Internal links: every service section links to `/free-quote?service=…`. Home links to every service page with descriptive anchors. The footer links all services and areas.
- Descriptive, natural alt text; kebab-case descriptive filenames.
- `sitemap.ts`: the 5 pages + privacy. `robots.ts`: disallow `/thank-you`, `/api`, `/dev`.

**Structured data (`lib/schema.ts`)**
- **Sitewide:** `GeneralContractor` with `@id: https://capitaldrywallrenovations.com/#business`. Fields:
  - name, url, logo, image, telephone, email, `priceRange: "$$"`
  - `areaServed` (Ottawa + each community), `address` (addressLocality Ottawa, addressRegion ON, addressCountry CA; no street unless confirmed), `geo`
  - `openingHoursSpecification`, `hasOfferCatalog` (all services), `knowsAbout`
  - `sameAs` (GBP, Facebook, Instagram once they exist)
- Also sitewide: `WebSite` and `Organization`.
- **Service pages:** `Service` (serviceType, provider → #business, areaServed, offers with `priceSpecification.minPrice` where a starting price is confirmed).
- **FAQPage** on every page with an FAQ, generated from `content/faq.ts`. The visible text must match the schema exactly.
- **BreadcrumbList** on inner pages.
- **No AggregateRating or Review markup** until real reviews exist, and never self-serving review markup.
- Validate with Google's Rich Results Test and the schema.org validator. Sample JSON-LD is in COPY.md.

**Keyword map**

| Page | Primary | Secondary |
|---|---|---|
| Home | drywall and basement renovations Ottawa | drywall contractor Ottawa, basement finishing Ottawa, renovation contractor Ottawa |
| Drywall | drywall contractor Ottawa | drywall repair / installation Ottawa, taping and mudding Ottawa, Level 5 drywall finish, skim coating Ottawa, popcorn ceiling removal Ottawa, water damaged drywall repair, ceiling repair Ottawa |
| Basement | basement renovations Ottawa | basement finishing Ottawa, basement contractor Ottawa, cost to finish a basement Ottawa, basement permit Ottawa |
| Renovations | interior painting Ottawa | bathroom renovation Ottawa, kitchen renovation Ottawa, painting contractor Ottawa |
| Free quote | free drywall quote Ottawa | basement renovation quote Ottawa |

Neighbourhood names appear naturally in service-area copy and FAQs. **No doorway pages.** Area pages are a later phase.

---

## 11. GEO / AEO (AI search)

- **Answer-first:** every service or question H2 opens with a 40–60 word self-contained answer naming the business, the service and Ottawa. The copy is already written this way; keep it intact.
- **Entity consistency:** the exact name "Capital Drywall & Renovation" everywhere. Name, address and phone must match the Google Business Profile once it's live.
- **llms.txt / llms-full.txt:** generated at request time from `/content` (route handlers), with the template in COPY.md.
- **robots.ts:** explicitly allow GPTBot, OAI-SearchBot, ChatGPT-User, PerplexityBot, ClaudeBot, Claude-SearchBot, Claude-User, Google-Extended, Applebot-Extended and Bingbot.
- **Citable data blocks:** price ranges, timelines, the finish-levels table and permit facts as clean semantic HTML tables and lists.
- A visible "Last updated" date on service pages, mirrored as `dateModified`.
- All content server-rendered. No important text that exists only client-side or only on canvas.

---

## 12. Lead capture & integrations

### Quote form (multi-step)
Lives on `/free-quote`; a compact one-step version sits in the service pages' final CTA. Field copy is in COPY.md.

1. **Service:** multi-select tiles.
2. **Project details:**
   - Postal code or neighbourhood (accepts `A1A 1A1` or text)
   - Timeline, optional size, description
   - Photos: up to 6 images, ≤ 10 MB each, compressed client-side to ≤ 2 MB, uploaded to Vercel Blob
3. **Contact:**
   - Name, phone, email, preferred contact method
   - Required contact consent; separate **unchecked** optional marketing consent (CASL)

**Behaviour:**
- Progress shown as a LevelVial filling across the 3 steps.
- Prefill from query params (`service`, estimator values).
- zod validation on client and server.
- Anti-spam: honeypot field + minimum fill time (3 s) + basic per-IP rate limit.

**`POST /api/quote`:**
1. Sends a notification email to the business via Resend. Subject: `New quote request: {services} · {area}`. Clean HTML with every field and photo links.
2. Sends a confirmation email to the customer.
3. If `LEAD_WEBHOOK_URL` is set, POSTs the lead as JSON.
4. Redirects to `/thank-you`.

### Other integrations
- **Calls:** every `tel:` link fires a `call_click` event with its location.
- **Booking:** if `BOOKING_URL` is set, show a "Book a site visit" secondary CTA on `/free-quote` and `/thank-you`; hidden otherwise.
- **Analytics events:** `quote_start`, `quote_step_2`, `quote_step_3`, `quote_submit`, `call_click`, `estimator_used`, `estimator_to_quote`, `faq_open`.
- **GA4:** optional via `NEXT_PUBLIC_GA_ID`, loaded only after consent. The consent banner renders only when GA4 is enabled.

**`.env.example`:**
```
RESEND_API_KEY=
QUOTE_TO_EMAIL=
QUOTE_FROM_EMAIL=
BLOB_READ_WRITE_TOKEN=
LEAD_WEBHOOK_URL=
BOOKING_URL=
NEXT_PUBLIC_SITE_URL=https://capitaldrywallrenovations.com
NEXT_PUBLIC_SITE_MODE=demo   # demo | production
NEXT_PUBLIC_GA_ID=
```

### Future-ready seams (don't build now; keep the structure clean)
- `content/faq.ts` doubles as the knowledge base for a future AI receptionist or chat.
- `LEAD_WEBHOOK_URL` feeds a future CRM pipeline and automated follow-up.
- A reserved header/hero slot for a "Call 24/7" badge once calls are answered around the clock.
- The reviews section is ready to switch on with real Google reviews.
- Routing leaves room for `/guides/*` (blog) and `/areas/*` without refactoring.

---

## 13. Privacy & compliance

- `/privacy-policy` uses the PIPEDA-based policy in COPY.md, filled from config, and is linked in the footer and beside the form consent.
- Form consent wording per COPY.md. Marketing consent is separate and unchecked (CASL).
- Cookieless analytics by default, so no cookie banner is needed. If GA4 is enabled, show a consent banner and load GA only after acceptance.
- Uploaded photos are stored in Vercel Blob with unguessable URLs. Retention is described in the policy.
- Prices and the estimator carry "Estimate only, not a quote. HST extra."

---

## 14. Config & placeholders (`content/site.config.ts`)

```ts
export const site = {
  mode: process.env.NEXT_PUBLIC_SITE_MODE ?? 'demo',
  name: 'Capital Drywall & Renovation',
  legalName: 'Capital Drywall & Renovation',            // CONFIRM (incorporated name?)
  url: 'https://capitaldrywallrenovations.com',
  phone: { display: '(613) 000-0000', e164: '+16130000000' }, // CONFIRM
  email: 'info@capitaldrywallrenovations.com',           // CONFIRM
  hours: 'Mon–Sat, 7 am – 7 pm',                          // CONFIRM
  responsePromise: 'within one business day',            // CONFIRM
  owner: { name: null, photo: null },                    // CONFIRM; note uses generic wording if null
  yearsExperience: null,                                 // CONFIRM; stat hidden if null
  insured: true,                                          // CONFIRM; badge hidden if false
  wsib: true,                                             // CONFIRM
  warranty: { years: 2, label: '2-year workmanship warranty' }, // CONFIRM
  paintReadyPromise: true,                                // CONFIRM; post-primer touch-up
  permitsHandled: true,                                   // CONFIRM; basement permit copy switches
  sisterBrand: { name: 'Stoneworks Interlock', url: 'https://stoneworksinterlock.com', show: false }, // CONFIRM with owner
  serviceAreas: [/* from COPY.md */],                     // CONFIRM
  social: { gbp: '', facebook: '', instagram: '' },
  features: {
    popcornRemoval: true,   // CONFIRM; hides section, FAQ, price card, schema offer
    reviews: false,         // turn on with real Google reviews
    gallery: true,          // demo shows badged samples; production hides samples
    estimator: true,
    siteCredit: true,       // footer "Website by Tekmadev"
  },
} as const
```

- Every `// CONFIRM` value that is `null` or `false` hides its UI gracefully.
- Also generate **`LAUNCH_CHECKLIST.md`** listing every CONFIRM item with where it appears.

---

## 15. Build order

1. Scaffold, tokens, fonts, layout, `site.config.ts`, and content files transcribed from COPY.md
2. Design-system components + `/dev/kitchen-sink`; screenshot and self-review against §3 and §6
3. Generate Higgsfield assets (§8), process frames, write MANIFEST.md
4. Home page, including all three scenes
5. Service pages, free quote and utility pages
6. Form, API routes and emails
7. SEO: metadata, schema, llms.txt, sitemap, robots, OG images
8. Performance, accessibility, reduced-motion and cross-browser passes (iOS Safari, Android Chrome, desktop Safari/Chrome/Firefox)
9. Deploy a Vercel preview

---

## 16. Definition of done

- [ ] Lighthouse mobile targets met on every page (median of 3 runs)
- [ ] Hero LCP element is the poster image; sequence frames load after
- [ ] Reduced motion: no pinning or scrubbing, all content present
- [ ] All 5 pages + privacy + thank-you + 404 render; no lorem ipsum
- [ ] Every CONFIRM item listed in LAUNCH_CHECKLIST.md; null/false values hide their UI
- [ ] No fake reviews, stats or logos; sample badges appear only in demo mode
- [ ] JSON-LD valid; FAQ schema text matches the visible text
- [ ] `/llms.txt`, `/sitemap.xml` and `/robots.txt` live and correct
- [ ] Form: validation, uploads, honeypot, both emails received, webhook fires when set, thank-you page shown
- [ ] Full keyboard-only journey works, including sliders, estimator and form
- [ ] Tap targets ≥ 44 px; the mobile bar never covers content or form fields
- [ ] No horizontal scroll at 320 px width
- [ ] Canadian English throughout; name, address and phone identical everywhere
- [ ] **Self-critique pass:** screenshot every section on desktop and mobile, compare against the competitor table (§2) and the banned list (§3), and fix anything generic before calling it done

---

## 17. Client launch checklist (send to the owner)

- Logo (SVG) and any brand colours
- Phone, email, hours, owner name, owner photo and a few lines of his story
- Real project photos (before/after), shot with light from the side
- Confirm: starting prices, warranty, Paint-Ready Promise, response time, basement permits, service areas, insurance/WSIB
- Popcorn ceiling removal: confirm the service and his asbestos-testing process
- Google Business Profile live → add the URL to config; collect the first 5–10 reviews
- Domain DNS access for launch
