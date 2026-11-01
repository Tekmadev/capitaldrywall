import { VellumGrid } from "@/components/ui/drafting";
import { renovationsIntro } from "@/content/copy/renovations";

/**
 * The answer-first intro (brief §11, kept intact), set like the general note on a cover sheet:
 * a hanging mono label and the paragraph in large type over the vellum grid.
 */
export function RenovationsIntro() {
  return (
    <div className="surface-light texture-plaster relative border-t border-[color:var(--hairline)]">
      <VellumGrid crosses={false} className="hidden md:block" />
      <div className="site-container section-y-tight relative">
        <div className="site-grid gap-y-6">
          {/* Tablets give the label three columns so it never breaks onto two lines */}
          <p className="t-spec col-span-full flex items-center gap-3 self-start whitespace-nowrap md:col-span-3 md:pt-[0.9em] lg:col-span-2">
            <span aria-hidden="true" className="h-2.5 w-px bg-current/70" />
            General note
          </p>
          <p className="reno-note col-span-full text-[color:var(--ink)] md:col-span-9 md:col-start-4 lg:col-span-8 lg:col-start-3">
            {renovationsIntro}
          </p>
        </div>
      </div>
    </div>
  );
}
