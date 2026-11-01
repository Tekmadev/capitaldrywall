# Capital Drywall & Renovation

Website for Capital Drywall & Renovation, an Ottawa drywall and basement renovation contractor.
Production domain: **capitaldrywallrenovations.com** (apex canonical; `www` redirects).

- Spec: [`docs/CAPITAL_BUILD_BRIEF.md`](docs/CAPITAL_BUILD_BRIEF.md) · copy: [`docs/CAPITAL_COPY.md`](docs/CAPITAL_COPY.md) · art direction: [`docs/ART_DIRECTION.md`](docs/ART_DIRECTION.md)
- Before launch: [`LAUNCH_CHECKLIST.md`](LAUNCH_CHECKLIST.md) (every CONFIRM item and where it appears)
- Generated imagery log: [`assets-src/MANIFEST.md`](assets-src/MANIFEST.md)

## Run it

```bash
npm install
cp .env.example .env.local   # optional: integrations work in demo mode without keys
npm run dev                  # http://localhost:3000
```

Design-system sandbox (every component and state, demo mode only): <http://localhost:3000/dev/kitchen-sink>

```bash
npm run build && npm run start   # production build
npm run lint
npx tsc --noEmit -p .
```

## Where things live

| Path | What |
|---|---|
| `content/site.config.ts` | Every business fact + feature flags (`// CONFIRM` markers). `null`/`false` hides its UI. |
| `content/copy/*.ts` | Page copy, verbatim from the copy deck |
| `content/faq.ts` | Single FAQ source: FAQ UI, FAQPage JSON-LD and `llms.txt` |
| `content/services.ts`, `areas.ts`, `pricing.ts`, `projects.ts`, `media.ts` | Services, service areas, prices + estimator rates, before/after projects, image registry |
| `app/globals.css` | "Raking Light" design tokens (Tailwind v4 `@theme`) and utilities |
| `components/ui` | Design-system primitives (Button, SectionHeader, DimensionLine, MediaFrame, BeforeAfterSlider, …) |
| `components/scenes` | Scroll scenes: hero wall sequence, raking-light test, basement transformation, wall layers |
| `components/sections` | Page sections (shared + per page) |
| `components/forms` | Multi-step quote form, compact form, basement estimator |
| `app/api/quote`, `app/api/upload` | Lead handler (Resend + optional webhook) and Vercel Blob upload tokens |
| `lib/schema.ts`, `lib/seo.ts`, `lib/llms.ts` | JSON-LD, metadata, `llms.txt` / `llms-full.txt` |
| `public/sequences` | AVIF frame sequences for the scroll scenes |

## Modes

`NEXT_PUBLIC_SITE_MODE=demo` (default) shows badged sample images and the dev kitchen sink and accepts quote
requests without email keys. `production` hides samples (sections with no real items hide themselves), disables
`/dev`, and requires a lead delivery channel (Resend or `LEAD_WEBHOOK_URL`).
