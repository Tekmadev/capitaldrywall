import type { ReactNode } from "react";
import { Estimator } from "@/components/forms/Estimator";
import { EstimatorSection } from "@/components/forms/EstimatorSection";
import { estimatorDetailsLine, estimatorQuoteHref, estimatorSizeLine } from "@/components/forms/EstimatorParams";

/** Kitchen-sink partial: the basement budget estimator (brief §7.5) in every state. */
export default function KitchenSinkFormsB() {
  const loaded = { size: 1500, level: "premium", addOns: ["bathroom", "bedroom", "wetbar"] } as const;

  return (
    <div id="ks-formsb">
      <section className="surface-dark section-y-tight">
        <div className="site-container">
          <p className="t-spec">Dev · FormsB · Basement budget estimator</p>
          <p className="mt-4 max-w-[60ch] text-muted">
            Live section as on the basement page (default 800 sq ft, Comfort, server-rendered), then fixed states.
            Keyboard: Tab to the tape, arrows step 50 sq ft, Home/End jump; arrows move between finish levels; Space
            toggles add-ons. Reduced motion: every roll and transition is instant.
          </p>
        </div>
      </section>

      <EstimatorSection index="06" sheet="B-06" />

      <section className="surface-light texture-plaster section-y-tight relative isolate">
        <div className="site-container space-y-20">
          <Demo label="State · maximum: 1,500 sq ft · Premium · all add-ons (static)">
            <Estimator
              initialSize={loaded.size}
              initialLevel={loaded.level}
              initialAddOns={[...loaded.addOns]}
              forceStatic
            />
          </Demo>

          <Demo label="State · minimum: 300 sq ft · Essential · no add-ons (static)">
            <Estimator initialSize={300} initialLevel="essential" forceStatic />
          </Demo>

          <Demo label="State · floating running total pinned on (shown while the result is off-screen)">
            <Estimator initialSize={950} initialAddOns={["bathroom"]} showReadout forceStatic />
          </Demo>

          <Demo label="Contract · CTA href and quote-form prefill lines">
            <dl className="grid gap-x-8 gap-y-3 border-t border-[color:var(--hairline)] pt-5 md:grid-cols-[14rem_1fr]">
              <dt className="t-spec">Default href</dt>
              <dd className="font-mono text-[0.875rem] break-all">{estimatorQuoteHref({ size: 800, level: "comfort", addOns: [] })}</dd>
              <dt className="t-spec">Loaded href</dt>
              <dd className="font-mono text-[0.875rem] break-all">{estimatorQuoteHref(loaded)}</dd>
              <dt className="t-spec">Size line</dt>
              <dd className="font-mono text-[0.875rem]">{estimatorSizeLine(800)}</dd>
              <dt className="t-spec">Details line</dt>
              <dd className="font-mono text-[0.875rem]">
                {estimatorDetailsLine({ size: 800, level: "comfort", addOns: ["bathroom"] })}
              </dd>
            </dl>
          </Demo>
        </div>
      </section>

      <section className="surface-dark section-y-tight">
        <div className="site-container">
          <Demo label="Surface · on graphite (tokens adapt; the basement page uses plaster)">
            <Estimator initialSize={1100} initialLevel="premium" initialAddOns={["bedroom"]} forceStatic />
          </Demo>
        </div>
      </section>
    </div>
  );
}

function Demo({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="t-spec mb-8">{label}</p>
      {children}
    </div>
  );
}
