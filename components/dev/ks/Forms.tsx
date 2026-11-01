import type { ReactNode } from "react";
import { CompactQuoteForm } from "@/components/forms/CompactQuoteForm";
import type { PhotoItem } from "@/components/forms/PhotoDrop";
import { QuoteForm } from "@/components/forms/QuoteForm";
import { LevelVial } from "@/components/ui/LevelVial";
import { cn } from "@/lib/utils";

/* Static thumbnails for every upload state (inline SVG "photos": no network, no real images) */
const swatch = (a: string, b: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="0.3"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="120" height="120" fill="url(#g)"/><path d="M0 84h120M0 86h120" stroke="#000" stroke-opacity=".12"/></svg>`,
  )}`;

const demoPhotos: PhotoItem[] = [
  { id: "d1", name: "ceiling-crack.jpg", preview: swatch("#d9d2c6", "#b9b0a2"), status: "done", progress: 100, url: "#" },
  { id: "d2", name: "basement-wall.jpg", preview: swatch("#c9c1b4", "#8f877b"), status: "uploading", progress: 64 },
  { id: "d3", name: "corner-bead.heic", preview: swatch("#e6e0d6", "#cbc3b6"), status: "compressing", progress: 18 },
  { id: "d4", name: "stairwell.jpg", preview: swatch("#bdb5a8", "#7d766b"), status: "preview", progress: 100 },
  { id: "d5", name: "water-damage.jpg", preview: swatch("#d4ccbf", "#a39a8c"), status: "error", progress: 0 },
];

function Demo({ label, note, children, className }: { label: string; note?: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn("min-w-0", className)}>
      <div className="mb-5 flex items-baseline justify-between gap-4 border-b border-[color:var(--hairline)] pb-2">
        <p className="t-spec">{label}</p>
        {note && <p className="t-spec hidden text-right sm:block">{note}</p>}
      </div>
      {children}
    </div>
  );
}

/**
 * Kitchen-sink partial: LevelVial (progress, level, unfinished; sm + lg; light + dark), QuoteForm
 * (each step, errors, submit error, sending, live) and CompactQuoteForm (default, errors, live).
 * The budget estimator is demoed in the FormsB partial.
 */
export default function KitchenSinkForms() {
  return (
    <div id="ks-forms">
      {/* ── LevelVial ───────────────────────────────────────── */}
      <section className="surface-light texture-plaster section-y-tight">
        <div className="site-container space-y-14">
          <div>
            <p className="t-spec">Forms · 01 / LevelVial</p>
            <h2 className="t-h2 mt-4 max-w-[18ch]">The spirit level.</h2>
          </div>
          <div className="grid gap-x-10 gap-y-12 md:grid-cols-3">
            <Demo label="progress · 0 · sm">
              <LevelVial progress={0} />
            </Demo>
            <Demo label="progress · 1/3 · sm">
              <LevelVial progress={1 / 3} />
            </Demo>
            <Demo label="progress · 2/3 · sm">
              <LevelVial progress={2 / 3} />
            </Demo>
          </div>
          <div className="grid gap-x-10 gap-y-12 md:grid-cols-2">
            <Demo label="level · lg · caption">
              <LevelVial state="level" size="lg" caption label="Level" />
            </Demo>
            <Demo label="unfinished · lg · 404">
              <LevelVial state="unfinished" size="lg" label="A spirit level tilted three degrees off level" />
            </Demo>
          </div>
        </div>
      </section>
      <section className="surface-dark beam-rake section-y-tight">
        <div className="site-container grid gap-x-10 gap-y-12 md:grid-cols-3">
          <Demo label="dark · progress 1/3">
            <LevelVial progress={1 / 3} />
          </Demo>
          <Demo label="dark · level · caption">
            <LevelVial state="level" caption />
          </Demo>
          <Demo label="dark · unfinished">
            <LevelVial state="unfinished" size="lg" />
          </Demo>
        </div>
      </section>

      {/* ── QuoteForm ───────────────────────────────────────── */}
      <section className="surface-light texture-plaster section-y-tight">
        <div className="site-container space-y-20">
          <div>
            <p className="t-spec">Forms · 02 / QuoteForm (7/12 column, as on /free-quote)</p>
            <h2 className="t-h2 mt-4 max-w-[18ch]">Three steps on one sheet.</h2>
          </div>

          <div className="site-grid gap-y-20">
            <Demo label="Step 1 · default" note="forceStatic" className="col-span-4 md:col-span-7">
              <QuoteForm forceStatic defaultValues={{ services: ["drywall-repair", "skim-coat-level-5"] }} />
            </Demo>
            <Demo label="Step 1 · error" note="Next pressed, nothing chosen" className="col-span-4 md:col-span-7">
              <QuoteForm forceStatic demo="errors" />
            </Demo>
            <Demo label="Step 2 · filled + every photo state" note="initialStep=2" className="col-span-4 md:col-span-7">
              <QuoteForm
                forceStatic
                initialStep={2}
                demoPhotos={demoPhotos}
                defaultValues={{
                  services: ["basement-renovation"],
                  area: "K2M 0A1",
                  timeline: "month",
                  size: "800 sq ft basement",
                  details: "Estimator: Comfort finish, 800 sq ft, + Bathroom",
                }}
              />
            </Demo>
            <Demo label="Step 2 · error" note="empty area" className="col-span-4 md:col-span-7">
              <QuoteForm forceStatic initialStep={2} demo="errors" />
            </Demo>
            <Demo label="Step 3 · filled" note="initialStep=3" className="col-span-4 md:col-span-7">
              <QuoteForm
                forceStatic
                initialStep={3}
                defaultValues={{
                  services: ["drywall-repair"],
                  area: "Kanata",
                  name: "Sam Tremblay",
                  phone: "613-555-0142",
                  email: "sam@example.com",
                  contactMethod: "text",
                  consent: true,
                }}
              />
            </Demo>
            <Demo label="Step 3 · errors" note="send pressed, empty" className="col-span-4 md:col-span-7">
              <QuoteForm forceStatic initialStep={3} demo="errors" />
            </Demo>
            <Demo label="Step 3 · sending" note="level settles" className="col-span-4 md:col-span-7">
              <QuoteForm
                forceStatic
                initialStep={3}
                demo="sending"
                defaultValues={{ name: "Sam Tremblay", phone: "613-555-0142", email: "sam@example.com", consent: true }}
              />
            </Demo>
            <Demo label="Step 3 · submit failed" note="data kept, call link" className="col-span-4 md:col-span-7">
              <QuoteForm
                forceStatic
                initialStep={3}
                demo="submit-error"
                defaultValues={{ name: "Sam Tremblay", phone: "613-555-0142", email: "sam@example.com", consent: true }}
              />
            </Demo>
            <Demo label="Live" note="sessionStorage draft + ?service= prefill" className="col-span-4 md:col-span-7">
              <QuoteForm />
            </Demo>
          </div>
        </div>
      </section>

      {/* ── CompactQuoteForm ────────────────────────────────── */}
      <section className="surface-dark beam-rake section-y-tight">
        <div className="site-container space-y-20">
          <div>
            <p className="t-spec">Forms · 03 / CompactQuoteForm (service pages&apos; final CTA)</p>
            <h2 className="t-h2 mt-4 max-w-[18ch]">One step, works without JS.</h2>
          </div>
          <div className="site-grid gap-y-20">
            <Demo label="Default · service=drywall-repair" note="live" className="col-span-4 md:col-span-7">
              <CompactQuoteForm service="drywall-repair" />
            </Demo>
            <Demo label="Errors" note="send pressed, empty" className="col-span-4 md:col-span-7">
              <CompactQuoteForm forceStatic demo="errors" />
            </Demo>
            <Demo label="Submit failed" className="col-span-4 md:col-span-7">
              <CompactQuoteForm forceStatic service="basement-renovation" demo="submit-error" />
            </Demo>
          </div>
        </div>
      </section>
    </div>
  );
}
