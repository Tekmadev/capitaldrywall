import { SheetRef } from "@/components/sections/shared/SheetRef";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { VellumGrid } from "@/components/ui/drafting";
import { LastUpdated } from "@/components/ui/LastUpdated";
import { privacyLastUpdated, privacyPolicy, type PolicyBlock } from "@/content/copy/privacy";
import { pageSeo } from "@/lib/seo";
import { pad2, slugify } from "@/lib/utils";
import { PolicyToc, type TocItem } from "./PolicyToc";
import { RichText } from "./RichText";
import { visibleTrail } from "./trail";

const LINK_LOCATION = "privacy-policy";

/** "6. Storage outside Canada" → { num: "6", label: "Storage outside Canada" } */
function splitTitle(title: string): { num: string; label: string } {
  const match = /^(\d+)\.\s*(.+)$/.exec(title);
  return match ? { num: match[1], label: match[2] } : { num: "", label: title };
}

function Block({ block }: { block: PolicyBlock }) {
  if (block.type === "ul") {
    return (
      <ul className="flex flex-col gap-3">
        {block.items.map((item) => (
          <li key={item} className="relative pl-7">
            <span aria-hidden="true" className="absolute left-0 top-[0.8em] h-px w-3.5 bg-[color:var(--spec)]" />
            <RichText text={item} location={LINK_LOCATION} />
          </li>
        ))}
      </ul>
    );
  }
  return (
    <p>
      {block.lead && (
        <>
          <strong className="font-semibold text-[color:var(--ink)]">{block.lead}</strong>{" "}
        </>
      )}
      <RichText text={block.text} location={LINK_LOCATION} />
    </p>
  );
}

/**
 * /privacy-policy (brief §13): the policy as the drawing set's GENERAL NOTES sheet (G-01). Numbered
 * notes hang in the margin, the text keeps a 68ch measure, a sticky mono contents list follows on
 * desktop, and every note has its own anchor.
 */
export function PrivacyPolicy() {
  const { title, intro, sections } = privacyPolicy;
  const seo = pageSeo.privacy;
  const notes = sections.map((section) => {
    const { num, label } = splitTitle(section.title);
    return { ...section, num, label, id: slugify(label), n: num ? pad2(Number(num)) : "" };
  });
  const toc: TocItem[] = notes.map(({ id, n, label }) => ({ id, n, label }));

  return (
    <>
      <section
        aria-labelledby="privacy-title"
        className="surface-light texture-plaster relative isolate overflow-x-clip pb-14 pt-3 md:pb-20 md:pt-5"
      >
        <VellumGrid crosses={false} />
        <div className="site-container relative">
          <Breadcrumbs items={visibleTrail("privacy")} />
          <SheetRef eyebrow={seo.og?.label ?? seo.name} sheet={seo.og?.sheet} className="mt-2 md:mt-4" />

          <div className="site-grid mt-10 gap-y-8 md:mt-14 lg:mt-16">
            <h1 id="privacy-title" className="t-display-l col-span-full text-[color:var(--ink)]">
              {title}
            </h1>
            <div className="col-span-full md:col-span-9 md:col-start-2 lg:col-span-7 lg:col-start-4">
              <LastUpdated date={privacyLastUpdated} />
              <p className="t-lede mt-6 max-w-[60ch] text-[color:var(--ink)]">
                <RichText text={intro} location={LINK_LOCATION} />
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="surface-light texture-plaster border-t border-[color:var(--hairline)] pb-24 md:pb-32 lg:pb-40">
        <div className="site-container">
          <div className="site-grid">
            <div className="col-span-full pt-8 lg:col-span-3 lg:border-r lg:border-[color:var(--hairline)] lg:pr-6 lg:pt-14">
              <PolicyToc
                items={toc}
                className="lg:[@media(min-height:50rem)]:sticky lg:[@media(min-height:50rem)]:top-[calc(var(--header-h)+2.5rem)]"
              />
            </div>

            <div className="col-span-full lg:col-span-8 lg:col-start-4 xl:col-span-7 xl:col-start-5">
              {notes.map((note) => (
                <section
                  key={note.id}
                  id={note.id}
                  aria-labelledby={`${note.id}-title`}
                  className="grid grid-cols-1 border-b border-[color:var(--hairline)] py-10 last:border-b-0 min-[360px]:grid-cols-[2.5rem_minmax(0,1fr)] min-[360px]:gap-x-3 md:grid-cols-[4.5rem_minmax(0,1fr)] md:gap-x-0 md:py-12 lg:pl-6 xl:pl-0"
                >
                  {/* The note number hangs in the margin, like a drawing's general notes. Under
                      360 px it sits over the heading instead, so the text keeps the full width. */}
                  <span aria-hidden="true" className="mb-3 flex items-center gap-2 self-start font-mono text-[0.8125rem] font-medium tabular-nums tracking-[0.06em] text-[color:var(--ink)] min-[360px]:mb-0 min-[360px]:pt-[0.55rem]">
                    {note.n}
                    <span className="h-px w-5 bg-[color:var(--hairline)] min-[360px]:hidden md:block" />
                  </span>
                  <div className="min-w-0 max-w-[68ch]">
                    <h2 id={`${note.id}-title`} className="t-h3 text-[color:var(--ink)]">
                      {note.num && <span className="sr-only">{note.num}. </span>}
                      {note.label}
                    </h2>
                    <div className="mt-5 flex flex-col gap-5 text-[1.0625rem] leading-[1.7] text-[color:var(--ink)]">
                      {note.blocks.map((block, i) => (
                        <Block key={i} block={block} />
                      ))}
                    </div>
                  </div>
                </section>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
