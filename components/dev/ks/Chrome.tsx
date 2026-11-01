import type { CSSProperties, ReactNode } from "react";
import { ConsentBannerDemo } from "@/components/layout/ConsentBannerClient";
import { Footer } from "@/components/layout/Footer";
import { Header, MobileMenuPreview } from "@/components/layout/Header";
import { MobileActionBar } from "@/components/layout/MobileActionBar";
import { pages } from "@/content/services";

/** Phone-width frame with mobile spacing tokens, so mobile chrome previews read true on desktop. */
const phoneVars = { "--page-pad": "1.25rem", "--header-h": "4.5rem" } as CSSProperties;

function Demo({ label, note, children }: { label: string; note?: string; children?: ReactNode }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-[color:var(--hairline)] pb-2">
        <p className="t-spec">{label}</p>
        {note && <p className="text-[0.8125rem] text-muted">{note}</p>}
      </div>
      {children}
    </div>
  );
}

/**
 * Kitchen sink · Chrome: header (transparent over dark, solid, condensed), mobile menu open,
 * mobile action bar, consent banner and the title-block footer. Every preview is static.
 */
export default function KitchenSinkChrome() {
  return (
    <div id="ks-chrome">
      <section className="surface-light texture-plaster section-y-tight">
        <div className="site-container space-y-14">
          <div>
            <p className="t-spec">Chrome · header, menu, action bar, consent, footer</p>
            <h2 className="t-h2 mt-4 max-w-[20ch]">Site chrome, every state.</h2>
          </div>

          <Demo
            label="Header · over a dark hero · top of page"
            note='Pages mark their first section data-hero="dark"; CSS picks this tone on first paint.'
          >
            <div className="surface-dark beam-rake relative overflow-hidden">
              <Header preview={{ tone: "dark", scrolled: false }} />
              <div className="site-container pb-16 pt-10 md:pb-24">
                <p className="t-display-l max-w-[12ch]">Smooth under any light.</p>
              </div>
            </div>
          </Demo>

          <Demo
            label="Header · solid · page without a hero · current page"
            note="Main starts below it. Current route: aria-current + an amber-ticked dimension line (here: Drywall)."
          >
            <div className="border border-[color:var(--hairline)] bg-plaster">
              <Header preview={{ tone: "light", scrolled: false, pathname: pages.drywall }} />
              <div className="h-16" />
            </div>
          </Demo>

          <Demo
            label="Header · scrolled · solid, condensed, hairline + shadow"
            note="After ~40% of the first viewport, on every page. Never hides on scroll-down."
          >
            <div className="border border-[color:var(--hairline)] bg-plaster-2">
              <Header preview={{ scrolled: true }} />
              <div className="h-16" />
            </div>
          </Demo>

          <div className="grid gap-14 lg:grid-cols-12">
            <div className="lg:col-span-6">
              <Demo label="Mobile menu · open (A-00 / Index sheet)" note="Below 1024 px. Current page here: Basements.">
                <div className="mx-auto w-full max-w-[390px] border border-[color:var(--hairline)]" style={phoneVars}>
                  <MobileMenuPreview currentPath={pages.basement} />
                </div>
              </Demo>
            </div>
            <div className="space-y-14 lg:col-span-6">
              <Demo label="Mobile action bar · visible" note="Below 768 px, after the hero; hidden over the footer and forms.">
                <div className="mx-auto w-full max-w-[390px] border border-[color:var(--hairline)] bg-plaster" style={phoneVars}>
                  <div className="h-40 p-5">
                    <p className="t-spec">Page content</p>
                    <p className="mt-3 text-[0.9375rem] text-muted">
                      Main gets bottom padding equal to the bar, so it never covers content.
                    </p>
                  </div>
                  <MobileActionBar preview />
                </div>
              </Demo>
              <Demo label="Consent banner · forced visible" note="Only when NEXT_PUBLIC_GA_ID is set. GA4 loads after Accept.">
                <div className="bg-plaster-2 p-5 md:p-8">
                  <ConsentBannerDemo privacyHref={pages.privacy} />
                </div>
              </Demo>
            </div>
          </div>

          <Demo label="Footer · title block" />
        </div>
      </section>
      <Footer idPrefix="ks-footer" />
    </div>
  );
}
