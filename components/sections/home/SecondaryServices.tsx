import Image from "next/image";
import Link from "next/link";
import { ctas } from "@/content/copy/global";
import { secondaryServices } from "@/content/copy/home";
import { media, type MediaAsset } from "@/content/media";
import { quoteHref } from "@/content/services";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { RegistrationMarks } from "@/components/ui/drafting";
import { ArrowIcon } from "@/components/ui/icons";
import { cn, pad2 } from "@/lib/utils";
import { IndexLinker } from "./IndexLinker";

const imageFor: Record<string, MediaAsset> = {
  "interior-painting": media.paintRoller4x5,
  "bathroom-renovation": media.bathroom4x5,
  "kitchen-renovation": media.kitchen4x5,
};

/** Figures are numbered per sheet (this section is sheet A-05), as on a drawing set. */
const FIG_START = 1;

const stripArrow = (label: string) => label.replace(/\s*→\s*$/, "");

/**
 * Home §8, "The rest of the house, finished to the same standard." From 1024 px: an editorial
 * index (number, name, one line, arrow) whose active row's 4:5 image wipes into a fixed frame on
 * the right, lit from the left. Below 1024 px the same list becomes horizontal scroll-snap 4:5
 * cards. Each row links to its section on the renovations page, plus a quote link for that service.
 */
export function SecondaryServices({ id = "more-services", className }: { id?: string; className?: string }) {
  const headingId = `${id}-title`;
  const items = secondaryServices.items.filter((item) => imageFor[item.id]);
  if (items.length === 0) return null;

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={cn("surface-light surface-raised texture-plaster section-y relative isolate overflow-x-clip", className)}
    >
      <div className="site-container">
        <SectionHeader
          index={secondaryServices.index}
          eyebrow={secondaryServices.eyebrow}
          sheet={`A-${secondaryServices.index}`}
          title={secondaryServices.title}
          id={headingId}
        />

        <IndexLinker className="site-grid mt-12 md:mt-16 lg:mt-20 lg:items-start">
          <ol
            className={cn(
              // Mobile/tablet: a scroll-snap strip running to both viewport edges
              "no-scrollbar col-span-full -mx-[var(--page-pad)] flex snap-x snap-mandatory scroll-px-[var(--page-pad)] gap-4 overflow-x-auto px-[var(--page-pad)] pb-1 md:gap-6",
              // Desktop: the index, joined by hairlines
              "lg:col-span-7 lg:mx-0 lg:block lg:overflow-visible lg:border-b lg:border-[color:var(--hairline)] lg:px-0 lg:pb-0",
            )}
          >
            {items.map((item, i) => {
              const image = imageFor[item.id] as MediaAsset;
              return (
                <li
                  key={item.id}
                  data-index-row=""
                  data-index-key={String(i)}
                  data-active={i === 0 ? "" : undefined}
                  className={cn(
                    "group/item relative isolate flex w-[78%] max-w-[22rem] shrink-0 snap-start flex-col sm:w-[46%]",
                    "lg:w-auto lg:max-w-none lg:border-t lg:border-[color:var(--hairline)] lg:py-9 xl:py-10",
                    // The lit row: a low glow from the left and an amber edge (the light source)
                    "lg:before:pointer-events-none lg:before:absolute lg:before:inset-0 lg:before:-z-10 lg:before:opacity-0 lg:before:transition-opacity lg:before:duration-500",
                    "lg:before:bg-[radial-gradient(60%_150%_at_0%_55%,rgb(244_166_42/0.1),transparent_70%)] lg:data-[active]:before:opacity-100",
                    "lg:after:absolute lg:after:inset-y-0 lg:after:left-0 lg:after:w-0.5 lg:after:origin-top lg:after:scale-y-0 lg:after:bg-worklight lg:after:transition-transform lg:after:duration-500 lg:after:ease-[var(--ease-rake)] lg:data-[active]:after:scale-y-100",
                  )}
                >
                  <MediaFrame
                    media={image}
                    sizes="(min-width: 640px) 46vw, 78vw"
                    ratio="4 / 5"
                    marks={false}
                    caption={false}
                    className="lg:hidden"
                  />
                  <div className="mt-5 flex flex-1 items-start gap-4 lg:mt-0 lg:gap-6 lg:pl-6 xl:pl-8">
                    <span className="t-spec shrink-0 pt-1.5 tabular-nums transition-colors duration-300 lg:w-12 lg:pt-3 lg:group-data-[active]/item:text-[color:var(--ink)]">
                      {secondaryServices.index}.{i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="t-h3 text-[color:var(--ink)] transition-transform duration-500 ease-[var(--ease-rake)] motion-reduce:transition-none lg:text-[clamp(1.75rem,2.7vw,2.625rem)]! lg:group-data-[active]/item:translate-x-2">
                        <Link
                          href={item.href}
                          className="outline-offset-4 after:absolute after:inset-0 after:content-['']"
                        >
                          {item.title}
                        </Link>
                      </h3>
                      <p className="mt-2 max-w-[44ch] text-muted lg:mt-3">{item.text}</p>
                      <Link
                        href={quoteHref(item.id)}
                        aria-label={`${ctas.primary}: ${item.title.toLowerCase()}`}
                        className="t-spec link-draw relative z-10 mt-2 inline-flex min-h-11 items-center text-[color:var(--ink)]!"
                      >
                        {ctas.primary}
                      </Link>
                    </div>
                    {/* Rests 8 px in, so the lit row's slide lands flush with the end of the hairline */}
                    <ArrowIcon
                      size={40}
                      className="mt-4 mr-2 hidden shrink-0 text-[color:var(--spec)] transition-[translate,color] duration-500 ease-[var(--ease-rake)] motion-reduce:transition-none lg:block lg:group-data-[active]/item:translate-x-2 lg:group-data-[active]/item:text-[color:var(--ink)]"
                    />
                  </div>
                </li>
              );
            })}
          </ol>

          {/* The fixed frame (desktop): decorative duplicates of the row images, swapped by the island */}
          <div
            aria-hidden="true"
            className="hidden lg:sticky lg:top-[calc(var(--header-h)_+_2.5rem)] lg:col-span-4 lg:col-start-9 lg:block"
          >
            <div className="relative">
              <div className="relative aspect-[4/5] overflow-hidden bg-[color:var(--surface)]">
                {items.map((item, i) => (
                  <div
                    key={item.id}
                    data-index-key={String(i)}
                    data-active={i === 0 ? "" : undefined}
                    className={cn(
                      "absolute inset-0 z-0 transition-[clip-path] delay-700 duration-0 [clip-path:inset(0_100%_0_0)]",
                      "data-[active]:z-10 data-[active]:delay-0 data-[active]:duration-700 data-[active]:ease-[var(--ease-rake)] data-[active]:[clip-path:inset(0_0_0_0)]",
                      "motion-reduce:transition-none",
                    )}
                  >
                    <Image
                      src={(imageFor[item.id] as MediaAsset).src}
                      alt=""
                      fill
                      sizes="(min-width: 1440px) 427px, 30vw"
                      quality={75}
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
              <RegistrationMarks />
            </div>
            <div className="t-spec relative mt-3 min-h-[2.8em]">
              {items.map((item, i) => (
                <p
                  key={item.id}
                  data-index-key={String(i)}
                  data-active={i === 0 ? "" : undefined}
                  className="absolute inset-x-0 top-0 flex items-start gap-3 opacity-0 transition-opacity duration-300 data-[active]:opacity-100"
                >
                  <span className="shrink-0 tabular-nums">FIG. {pad2(FIG_START + i)}</span>
                  <span className="mt-[0.7em] h-px w-6 shrink-0 bg-current/50" />
                  <span className="min-w-0">{(imageFor[item.id] as MediaAsset).caption}</span>
                </p>
              ))}
            </div>
          </div>
        </IndexLinker>

        <div className="mt-8 lg:mt-10 lg:pl-6 xl:pl-8">
          <Link
            href={secondaryServices.link.href}
            className="group/link inline-flex min-h-11 items-center gap-3 font-medium text-[color:var(--ink)]"
          >
            <span className="link-draw">{stripArrow(secondaryServices.link.label)}</span>
            <ArrowIcon className="shrink-0 transition-transform duration-300 ease-[var(--ease-rake)] group-hover/link:translate-x-1 motion-reduce:transition-none" />
          </Link>
        </div>
      </div>
    </section>
  );
}
