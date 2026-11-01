import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Button } from "@/components/ui/Button";
import { DimensionLine } from "@/components/ui/DimensionLine";
import { DetailBubble } from "@/components/ui/drafting";
import { ArrowIcon } from "@/components/ui/icons";
import { LastUpdated } from "@/components/ui/LastUpdated";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { renovationSections, renovationsBreadcrumb, renovationsHero } from "@/content/copy/renovations";
import { pad2 } from "@/lib/utils";
import { sheetFor } from "./parts";
import "./renovations.css";

/** "Same standard, every room." → ["Same standard,", "every room."] (hanging second line). */
function displayLines(text: string): [string, string] {
  const i = text.indexOf(",");
  return i > 0 ? [text.slice(0, i + 1), text.slice(i + 1).trim()] : [text, ""];
}

/**
 * Renovations hero, on plaster (no data-hero, so the header stays solid): the drawing-sheet header
 * (breadcrumb + last updated), a spec-style H1, the display line with a hanging second line, and a
 * three-panel "sheet index" whose detail bubbles jump to the service sheets below.
 */
export function RenovationsHero() {
  const [line1, line2] = displayLines(renovationsHero.display);
  const crumbs = renovationsBreadcrumb.map((c) => ({ label: c.name, href: c.href }));

  return (
    <section
      aria-labelledby="renovations-title"
      className="surface-light texture-plaster relative overflow-x-clip pb-16 pt-3 md:pb-24 md:pt-5 lg:pb-28"
    >
      <div className="site-container">
        {/* Sheet header: where you are + when this sheet was last revised */}
        <div className="flex flex-wrap items-center justify-between gap-x-8 border-b border-[color:var(--hairline)]">
          <Breadcrumbs items={crumbs} />
          <LastUpdated className="min-h-11 md:border-l md:border-[color:var(--hairline)] md:pl-6" />
        </div>

        <div className="site-grid mt-10 md:mt-14 lg:mt-16">
          <h1
            id="renovations-title"
            className="t-spec col-span-full flex items-start gap-3 text-[0.75rem]! text-[color:var(--ink)] md:col-span-8 md:text-[0.8125rem]! lg:col-span-6"
          >
            <span aria-hidden="true" className="mt-[0.6em] h-px w-7 shrink-0 bg-current" />
            <span>{renovationsHero.h1}</span>
          </h1>

          <p className="t-display-xl reno-display col-span-full mt-5 text-[color:var(--ink)] md:mt-7">
            <span className="block">{line1}</span>{" "}
            {line2 && <span className="reno-hang block">{line2}</span>}
          </p>

          <div className="col-span-full mt-10 md:col-span-10 lg:col-span-4 lg:mt-16">
            <p className="t-lede max-w-[34ch] text-muted">{renovationsHero.sub}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:max-w-[22rem] lg:flex-col">
              <Button href={renovationsHero.primaryCta.href} size="lg" arrow className="w-full sm:w-auto lg:w-full">
                {renovationsHero.primaryCta.label}
              </Button>
              <Button
                href={renovationsHero.call.href}
                variant="call"
                size="lg"
                trackLocation="hero"
                className="w-full sm:w-auto lg:w-full"
              >
                {renovationsHero.call.label}
              </Button>
            </div>
          </div>

          {/*
            Sheet index, set like a details sheet: each panel is a detail with its title on a heavy
            rule capped by the detail bubble (the same title device the sheets below use), so the
            three read as one drawing, not three cards. The rule draws amber on hover/focus.
          */}
          <nav
            aria-label="Renovation services on this page"
            className="col-span-full mt-14 md:mt-16 lg:col-span-7 lg:col-start-6 lg:mt-16"
          >
            <DimensionLine label={`${renovationSections.length} services · one standard`} className="mb-3 md:mb-5" />
            <ol className="reno-strip">
              {renovationSections.map((s, i) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="group/panel block pb-6">
                    <MediaFrame
                      media={{ ...s.imageTall, alt: "" }}
                      sizes="(min-width: 1024px) 17vw, (min-width: 768px) 30vw, 64vw"
                      caption={false}
                      marks={false}
                      preload={i === 0}
                      imageClassName="transition-transform duration-700 ease-[var(--ease-rake)] group-hover/panel:scale-[1.035]"
                    />
                    <span className="mt-5 block">
                      {/* Two-line slot (+ its padding; min-height is border-box), bottom-aligned, so all
                          three rules share one baseline whether a title takes one line or two */}
                      <span className="t-spec flex min-h-[calc(2.8em_+_0.625rem)] items-end pb-2.5 pl-[3.25rem] text-[color:var(--ink)]">
                        <span>{s.title}</span>
                      </span>
                      <span aria-hidden="true" className="flex items-center">
                        <DetailBubble top={pad2(i + 1)} bottom={sheetFor(i + 1)} size={44} className="-my-[22px]" />
                        <span className="relative h-0.5 flex-1 bg-[color:var(--ink)]">
                          <span className="absolute inset-0 origin-left scale-x-0 bg-worklight transition-transform duration-500 ease-[var(--ease-rake)] group-hover/panel:scale-x-100 group-focus-visible/panel:scale-x-100" />
                        </span>
                      </span>
                      {/* Drop arrow under the rule's end: "this sheet is further down the page" */}
                      <span aria-hidden="true" className="mt-3 flex justify-end">
                        <ArrowIcon
                          size={16}
                          className="rotate-90 text-[color:var(--spec)] transition-transform duration-300 ease-[var(--ease-rake)] group-hover/panel:translate-y-1 group-focus-visible/panel:translate-y-1"
                        />
                      </span>
                    </span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </div>
      </div>
    </section>
  );
}
