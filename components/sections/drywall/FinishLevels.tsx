import { Button } from "@/components/ui/Button";
import { VellumGrid } from "@/components/ui/drafting";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { drywallSubServices, finishLevels } from "@/content/copy/drywall";
import { FinishLevelsExplorer } from "./FinishLevelsExplorer";
import "./drywall.css";

/** Display typesetting only: curly quotes (a straight 5" reads as inches here) and "Level 5" kept on one line. */
function typeset(text: string): string {
  return text.replace(/"([^"]*)"/g, "\u201C$1\u201D").replace(/Level (\d)/g, "Level\u00A0$1");
}

type FinishLevelsProps = {
  /** Section number on the page, e.g. "03" */
  index?: string;
  sheet?: string;
  /** FIG. number for the drawing */
  fig: number;
};

/**
 * "What does Level 5 actually mean?" (brief §7.7, §11): the answer paragraph, the interactive plate
 * (selector + drawing + readout, Level 4 selected on the server) and the full Level 0–5 schedule as
 * a semantic table that is always in the HTML, with the "Our standard" note.
 */
export function FinishLevels({ index = "03", sheet = `A-${index}`, fig }: FinishLevelsProps) {
  const [colLevel, colWhat, colWhere] = finishLevels.columns;
  // Level 5 lives with the skim-coat service: reuse its quote link.
  const cta = drywallSubServices.find((s) => s.service === "skim-coat-level-5")?.cta;

  return (
    <section
      id="finish-levels"
      aria-labelledby="finish-levels-title"
      className="surface-light texture-plaster section-y relative isolate overflow-x-clip"
    >
      <VellumGrid className="max-md:[&_span>span]:hidden" />
      <div className="site-container relative">
        <SectionHeader
          index={index}
          eyebrow={finishLevels.eyebrow}
          sheet={sheet}
          title={typeset(finishLevels.title)}
          id="finish-levels-title"
          intro={finishLevels.answer}
          annotation="Level 0 → Level 5"
        />

        <FinishLevelsExplorer
          levels={finishLevels.levels}
          columns={finishLevels.columns}
          initial={4}
          fig={fig}
          note={
            <div className="border-t border-[color:var(--hairline)] pt-6">
              {/* Drafting note tag */}
              <p aria-hidden="true" className="flex items-center gap-3">
                <span className="t-spec border border-[color:var(--spec)]/60 px-2 py-1.5 leading-none">
                  Our standard
                </span>
                <span className="h-px w-5 bg-[color:var(--spec)]/60" />
              </p>
              <p className="mt-4 max-w-[40ch] text-[1rem] leading-relaxed text-[color:var(--ink)]">
                <span className="sr-only">Our standard: </span>
                {finishLevels.ourStandard}
              </p>
              {cta && (
                <Button href={cta.href} variant="ghost" arrow className="mt-3">
                  {cta.label.replace(/\s*→\s*$/, "")}
                </Button>
              )}
            </div>
          }
          className="mt-12 md:mt-16 lg:mt-20"
        >
          <div className="site-grid mt-14 md:mt-20">
            <div className="col-span-full lg:col-span-10 lg:col-start-2">
              <table className="w-full border-collapse text-left">
                <caption className="t-spec pb-4 text-left">
                  {finishLevels.eyebrow} · GA-214
                </caption>
                <thead>
                  <tr className="border-y border-[color:var(--ink)]">
                    {/* Same inset as the row heads (they leave room for the selected-row bar) */}
                    <th scope="col" className="t-spec w-[22%] py-3 pl-3 pr-3 font-medium md:w-[16%] md:pl-4">
                      {colLevel}
                    </th>
                    <th scope="col" className="t-spec py-3 pr-4 font-medium md:pr-8">
                      {colWhat}
                    </th>
                    <th scope="col" className="t-spec py-3 font-medium">
                      {colWhere}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {finishLevels.levels.map((l) => (
                    <tr key={l.level} data-row={l.level} className="fl-row border-b border-[color:var(--hairline)]">
                      <th scope="row" className="py-4 pl-3 pr-3 align-baseline font-normal md:py-5 md:pl-4">
                        {/* Non-breaking space: a plain one between the spans is dropped from the
                            row header's accessible name ("Level4"); this one is kept ("Level 4") */}
                        <span className="t-spec hidden sm:inline">{colLevel}{" "}</span>
                        <span className="sr-only sm:hidden">{colLevel} </span>
                        <span className="font-display text-[1.375rem] font-extrabold leading-none text-[color:var(--ink)] tabular-nums [font-stretch:125%] md:text-[1.75rem]">
                          {l.level}
                        </span>
                      </th>
                      <td className="py-4 pr-4 align-baseline text-[0.9375rem] leading-snug text-[color:var(--ink)] md:py-5 md:pr-8 md:text-[1.0625rem]">
                        {l.what}
                      </td>
                      <td className="py-4 align-baseline text-[0.9375rem] leading-snug text-muted md:py-5 md:text-[1.0625rem]">
                        {l.where}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </FinishLevelsExplorer>
      </div>
    </section>
  );
}
