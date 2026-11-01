@AGENTS.md

# Capital Drywall & Renovation website

Specs (read before building anything; the brief wins on conflict):
- `docs/CAPITAL_BUILD_BRIEF.md`: the build brief (design system §6, signature moments §7, pages §9, SEO §10–11, forms §12)
- `docs/CAPITAL_COPY.md`: all copy, verbatim. Never invent marketing copy; trim only to fit a layout.
- `docs/ART_DIRECTION.md`: how "Raking Light" is applied (drawing-set vocabulary, signature devices,
  section-by-section direction, banned patterns). Nothing may look like a template.

## Stack (installed, exact)
Next.js 16.4 App Router (React 19.3, TS strict) · Tailwind v4 (CSS-first tokens in `app/globals.css`) ·
GSAP 3.15 (+ ScrollTrigger, SplitText, all free) + `@gsap/react` · Lenis 1.3 · Motion 14 (`motion/react`) ·
react-hook-form 7 + zod 4 + `@hookform/resolvers` 6 · Resend 6 · `@vercel/blob` 2 ·
browser-image-compression · `@vercel/analytics` 2 + `@vercel/speed-insights` 2 · lucide-react · sharp (dev).
Do not add dependencies without a strong reason (say so in your report).

## Next.js 16 rules that bite
- Read `node_modules/next/dist/docs/` for any API you're unsure of. Training-data Next.js is outdated.
- `cacheComponents: true` is on. In server components: no `new Date()`, `Date.now()`, `Math.random()`
  during render (use a `"use cache"` helper, or do it on the client). Don't read `searchParams`,
  `cookies()` or `headers()` in a page without a `<Suspense>` boundary; prefer reading query params in a
  client component (`useSearchParams`) wrapped in `<Suspense>`. No `export const runtime`. No `dynamic` export.
- `next/image`: `preload` replaces the deprecated `priority`; allowed `quality` values are 50, 60, 75, 85 (50 only for scene posters under a scrim).
  Always give accurate `sizes`. Use `MediaFrame` for content images.
- Route props types are global: `PageProps<"/route">`, `LayoutProps<"/">`.
- Route handlers: `app/**/route.ts`. Metadata files: `sitemap.ts`, `robots.ts`, `opengraph-image.tsx`, `icon.tsx`.

## Design tokens and utilities (app/globals.css)
Colours: `plaster`, `plaster-2`, `compound`, `graphite`, `graphite-2`, `steel`, `steel-ink` (small text on
light), `steel-light` (small text on dark), `worklight` (amber accent), `worklight-deep`, `level`, `alert`,
`alert-light`. Never raw hex in components; never amber text on plaster; amber ≤ ~5% of a screen.
Surfaces: wrap sections in `surface-dark` or `surface-light` (sets `--ink`, `--muted`, `--spec`, `--hairline`,
`--surface`, `--surface-raised`, `--error`). Use `text-[color:var(--ink)]`, `text-muted`,
`border-[color:var(--hairline)]` so components adapt to either surface.
Type: `t-display-xl`, `t-display-l`, `t-h2`, `t-h3`, `t-lede`, `t-spec` (mono label). Body is the default.
Layout: `site-container` (max 1440, side padding) + `site-grid` (4 cols mobile / 12 cols ≥768, gutters).
Rhythm: `section-y`, `section-y-tight`. `prose-measure` (68ch). Breakpoints: Tailwind defaults (md = 768).
Motifs: `texture-plaster`, `beam-rake`, `rake-line` (+ `animate-rake`), `link-draw`, `link-inline`, `no-scrollbar`.
Radius is 2 px for every `rounded-*` except `rounded-full` (small tags only).
Focus: global `:focus-visible` ring (amber + graphite band). Never remove outlines.
Ease: `ease-[var(--ease-rake)]`; GSAP equivalent `power4.out`. UI 150–250 ms, reveals 600–900 ms.

## Shared building blocks (use them; don't fork them)
- `components/ui/Button.tsx`: `variant` primary | secondary | ghost | call, `size`, `arrow`, `href` (Link/a) or button, `loading`, `trackLocation` for tel: links.
- `components/ui/SectionHeader.tsx`: sheet-reference eyebrow (`index`, `eyebrow`, `sheet`), `title`, `intro`, `annotation`, `layout`.
- `components/ui/DimensionLine.tsx` (client): `label`, `orientation`, `align`, `tone`, draws on in view.
- `components/ui/drafting.tsx`: `SpecLabel`, `DetailBubble`, `RegistrationMarks`, `RegCross`, `VellumGrid`, `TitleCell`.
- `components/ui/MediaFrame.tsx`: next/image + crop marks + `FIG.` caption + automatic `ConceptLabel` /
  `SampleBadge` (samples never render in production). Also exports `ConceptLabel`, `SampleBadge`.
- `components/ui/Wordmark.tsx`, `components/ui/CallLink.tsx` (`CallLink`, `EmailLink`), `components/ui/icons.tsx`
  (`PhoneIcon`, `ArrowIcon`, `CrossIcon`, `TickIcon`; Lucide only where an icon truly helps).
- `components/motion/RevealHeading.tsx` (client): SplitText line reveal for headings below the fold.
- `lib/utils.ts` (`cn`, `slugify`, `formatCAD`, `pad2`), `lib/inview.ts` (shared IntersectionObserver,
  `prefersReducedMotion`, `isInInitialViewport`), `lib/analytics.ts` (`track(event, props)`).
- Analytics: tel: clicks and `<details data-faq-id>` opens are tracked by `AnalyticsListeners` (delegated);
  give tel: links a `data-location`. Other events call `track()`. Never send personal data.

## Content (single sources; never hard-code business facts in components)
- `content/site.config.ts`: every business fact + feature flags (`feature("popcornRemoval")`, `isDemo`,
  `site.*`, `integrations`). A `null`/`false` CONFIRM value must hide its UI gracefully.
- `content/services.ts` (`services`, `pages`, `quoteHref`, `resolveServiceParam`), `content/areas.ts`,
  `content/pricing.ts` (starting prices, estimator rates, `estimateRange`), `content/faq.ts` (`getFaqs(page)`,
  `getAllFaqs()`: the ONLY FAQ source for UI, schema and llms.txt), `content/media.ts` (image registry with
  honest `kind` + alt; `sequences`, `video`), `content/projects.ts` (`projectsFor`, `projectCaption`, samples
  filtered in production), `content/copy/global.ts` (nav, CTAs, trust strip, footer, shared sections).
- Page copy lives in `content/copy/<page>.ts`, transcribed verbatim from the copy deck.

## Non-negotiables
- Honesty: AI images are atmosphere or labelled concept only, never captioned as client work. Samples only
  in demo mode, badged. No review/rating markup or UI until real reviews exist. No fake stats/logos/awards.
- Canadian English (colour, centre, neighbourhood, metre). `lang="en-CA"`.
- Accessibility: WCAG 2.2 AA, one H1 per page, logical H2/H3, 44 px+ targets, full keyboard support,
  visible focus, `prefers-reduced-motion` fallbacks (no pinning/scrubbing, everything present and still).
- Performance: Lighthouse mobile ≥ 90. Server components by default; `"use client"` only for interaction.
  Import GSAP/ScrollTrigger/SplitText/Lenis dynamically inside effects, never at module top level of a
  component that renders above the fold. No layout shift: reserve space for every image, canvas and embed.
- All important text is server-rendered HTML (never only on canvas or only client-side).
- Client-facing copy never mentions Tekmadev's internal tools or vendors.

## Working in this repo (parallel agents)
- `npm run dev` is ALREADY running on http://localhost:3000 (the owner is watching it live). Never start
  another dev server, never run `next build` (it fights with other agents), never kill port 3000.
- Check your work with `npx tsc --noEmit -p .`, `npx eslint <your files>`, and by requesting your page with
  `curl -s localhost:3000/<path>` (look for errors and your text in the HTML).
- Only write the files you were assigned. If you need a change in a shared file you don't own, make the
  smallest additive change possible and list it in your final report.
- Keep the live site working at every save: never leave a broken import in a page that's being viewed.
