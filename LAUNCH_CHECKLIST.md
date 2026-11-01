# Launch checklist: Capital Drywall & Renovation

Every unconfirmed business fact lives in **`content/site.config.ts`** (marked `// CONFIRM`) or in the
copy files under `content/` (marked `[CONFIRM]` / `confirm: true`). Swap in the real values, rebuild,
and the whole site updates: pages, FAQ, JSON-LD, `llms.txt`, emails and the privacy policy.

A `null` or `false` value hides its UI. The site never shows a broken or invented claim.

---

## 1. Business facts (`content/site.config.ts`)

| Field | Current demo value | Where it appears | If null / false |
|---|---|---|---|
| `legalName` | Capital Drywall & Renovation | Privacy policy §1 and §14 | Required (use the trading name) |
| `phone` | (613) 621-9757 ✓ confirmed | Header, mobile menu, mobile action bar, every hero "Call" button, final CTAs, footer title block, free-quote sidebar, thank-you page, form error message, customer confirmation email, privacy policy, llms.txt, JSON-LD `telephone` | Required |
| `email` | capitaldrywallandrenovations@gmail.com ✓ confirmed | Footer, mobile menu, free-quote sidebar, privacy policy, llms.txt, JSON-LD `email` | Required |
| `hours` + `openingHours` | Mon–Sat, 7 am – 7 pm | Footer, mobile menu, free-quote sidebar, llms.txt, JSON-LD `openingHoursSpecification` (keep both fields in sync) | Required |
| `responsePromise` | within one business day | Promise 01 (home), FAQ "Are your quotes free?", free-quote sidebar "We reply…", final CTA line, thank-you page, customer confirmation email | Required |
| `owner.name` | null | Owner-note signature (home, free quote) | Generic signature "The owner, Capital Drywall & Renovation" |
| `owner.photo` | null | Owner note portrait | Note renders without a portrait |
| `yearsExperience` | null | Reserved stat (not shown anywhere yet) | Hidden |
| `insured` | true | Trust strip "Fully insured", Promise 04 ("a fully insured crew") | Trust item and the insured clause disappear |
| `wsib` | true | Not shown in copy yet (no WSIB line in the copy deck); available for llms-full.txt facts | Hidden |
| `warranty` | 2-year workmanship warranty | Promise 04, llms.txt "Warranty" line | Warranty clause/line disappears (Promise 04 hides if `insured` is also false) |
| `paintReadyPromise` | true | Promise 03 "The Paint-Ready Promise" (home) | Promise hidden |
| `permitsHandled` | true | FAQ "Do I need a permit…" last sentence (home, basement), basement "What's included" item 02 | Sentence and item hidden |
| `sisterBrand.show` | false | Owner note optional line, footer line (Stoneworks Interlock) | Hidden (current) |
| `serviceAreas` | 16 communities | Service-area map + list (home, free quote), footer, JSON-LD `areaServed` | Edit the list; note the FAQ "What areas do you serve?" and the service-area paragraph name areas in prose: update those strings too (`content/faq.ts`, `content/copy/global.ts`) |
| `social.gbp/facebook/instagram` | empty | JSON-LD `sameAs`, reviews link (when reviews are on) | Omitted |
| `lastUpdated` | 2026-10-30 | "Last updated" on service pages + `dateModified`, sitemap `lastModified` | Update when copy changes |

### Feature flags (`site.features`)

| Flag | Now | Controls |
|---|---|---|
| `popcornRemoval` | on | Drywall section 05, home FAQ 05, drywall FAQ 06, price cards (home + drywall), quote-form tile, footer service link, schema offer, llms.txt line |
| `reviews` | off | Turn on only with real Google reviews (owner note shows while off). Never fake reviews or rating markup |
| `gallery` | on | Home "Recent work" (demo shows badged samples; production hides samples and the section if empty) |
| `estimator` | on | Basement budget estimator; the basement-cost FAQ sentence adapts |
| `siteCredit` | on | Footer "Website by Tekmadev" (`content/copy/global.ts` → `footer.siteCredit.url` is null until a URL is confirmed) |
| `call247` | off | Reserved "CALL 24/7" badge in the header once calls are answered around the clock |

## 2. Copy marked [CONFIRM] in the copy deck

| Item | File | Where it appears |
|---|---|---|
| All starting prices: drywall repair from $300, popcorn removal from $1,000 per room, basement finishing from $30,000, "quoted per project / per room" | `content/pricing.ts` | Home "Honest starting prices", drywall prices, JSON-LD `minPrice`, llms.txt |
| Basement estimator rates (Essential $45–60, Comfort $60–80, Premium $80–115 /sq ft; add-ons) | `content/pricing.ts` | Basement estimator |
| Promise 03 Paint-Ready, Promise 04 warranty + insured, Promise 05 licensed trades | `content/copy/home.ts` | Home "What you can count on" |
| Owner note body | `content/copy/global.ts` | Home, free quote |
| Finish levels "Our standard" (Level 4 standard, Level 5 recommended) | `content/copy/drywall.ts` | Drywall finish levels |
| Popcorn process + asbestos testing (pre-1990 homes) | `content/copy/drywall.ts`, `content/faq.ts` | Drywall section 05, FAQs |
| What's included 02 permits | `content/copy/basement.ts` | Basement spec sheet |
| Basement timeline (4–6 weeks; 6–8 with bathroom/bedroom) | `content/copy/basement.ts`, `content/faq.ts` | Basement timeline rail, FAQ |
| Bathroom plumbing by licensed plumbers | `content/copy/renovations.ts` | Renovations bathroom section |
| FAQ answers marked `confirm: true` (repair cost, basement cost, permits, popcorn, durations, basement bathroom, bathroom cost, kitchen duration, full kitchens, how soon we can start) | `content/faq.ts` | FAQ sections, FAQPage JSON-LD, llms.txt |

## 3. Images

- Every image on the site today is AI-generated atmosphere, a labelled concept visualization, or a
  demo **sample** (badged "Sample — replace with project photo"). Samples render only when
  `NEXT_PUBLIC_SITE_MODE=demo` and disappear automatically in production.
- To add real projects: put photos in `public/images/projects/`, register them in `content/media.ts`
  with `kind: "project"`, and add entries to `content/projects.ts` (`isSample: false`, neighbourhood).
  Shoot finished walls with a light held to the side (raking light).
- Generation log: `assets-src/MANIFEST.md` (prompt, model, job id for every generated asset).

## 4. Integrations (Vercel environment variables, see `.env.example`)

| Variable | Needed for |
|---|---|
| `NEXT_PUBLIC_SITE_MODE=production` | Hides samples, the dev kitchen sink, and requires a lead delivery channel |
| `RESEND_API_KEY`, `QUOTE_TO_EMAIL`, `QUOTE_FROM_EMAIL` | Quote notifications + customer confirmations (verify the sending domain in Resend) |
| `BLOB_READ_WRITE_TOKEN` | Photo uploads on the quote form (otherwise photos stay "preview only") |
| `LEAD_WEBHOOK_URL` | Optional: CRM / automation hook (POSTs each lead as JSON) |
| `BOOKING_URL` | Optional: shows "Book a site visit" on /free-quote and /thank-you |
| `NEXT_PUBLIC_GA_ID` | Optional: GA4 behind a consent banner (cookieless Vercel Analytics is on by default) |
| `NEXT_PUBLIC_SITE_URL` | `https://capitaldrywallrenovations.com` |

## 5. Before launch

- [ ] Owner reviews the privacy policy (it's a PIPEDA-based template, not legal advice).
- [ ] Logo (SVG) and any brand colours → replace the wordmark; if the logo has a strong colour, swap `--color-worklight` in `app/globals.css` and re-check contrast.
- [ ] Phone, email, hours, owner name, owner photo, a few lines of the owner's story.
- [ ] Real project photos (before/after), shot with light from the side.
- [ ] Confirm: starting prices, warranty, Paint-Ready Promise, response time, basement permits, service areas, insurance/WSIB.
- [ ] Popcorn ceiling removal: confirm the service and the asbestos-testing process.
- [ ] Google Business Profile live → add the URL to `site.social.gbp`; collect the first 5–10 reviews, then turn on `features.reviews`.
- [ ] Name, address and phone identical to the Google Business Profile.
- [ ] Domain DNS access; apex `capitaldrywallrenovations.com` canonical, `www` redirects to it.
- [ ] Set the environment variables above in Vercel (Production), switch `NEXT_PUBLIC_SITE_MODE` to `production`.
- [ ] After launch: Google Rich Results Test + schema.org validator on the live URLs; submit the sitemap in Search Console.

---

## Send to the owner (brief §17)

- Logo (SVG) and any brand colours
- Phone, email, hours, owner name, owner photo and a few lines of his story
- Real project photos (before/after), shot with light from the side
- Confirm: starting prices, warranty, Paint-Ready Promise, response time, basement permits, service areas, insurance/WSIB
- Popcorn ceiling removal: confirm the service and his asbestos-testing process
- Google Business Profile live → add the URL to config; collect the first 5–10 reviews
- Domain DNS access for launch
