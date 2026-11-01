import { preload } from "react-dom";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Button } from "@/components/ui/Button";
import { LastUpdated } from "@/components/ui/LastUpdated";
import { drywallBreadcrumb, drywallHero } from "@/content/copy/drywall";
import { media, video } from "@/content/media";
import { HeroLoop } from "./HeroLoop";
import "./drywall.css";

/**
 * The loop's poster is the page's LCP element: serve it through the image optimizer (AVIF/WebP, sized
 * for the column) and preload it so the browser finds it from the HTML instead of from the <video>.
 */
const posterUrl = `/_next/image?url=${encodeURIComponent(video.drywallLoop.poster)}&w=1080&q=60`;

/** "Hung straight. Taped tight. Finished smooth." → one line per sentence. */
function sentences(text: string): string[] {
  return text.split(/(?<=\.)\s+/).filter(Boolean);
}

/**
 * Drywall hero (brief §9 Drywall 1): dark, a sheet-title strip (breadcrumb + last updated), the H1
 * as a small title line over the three-line display, sub and CTAs on the left; the raking-light
 * loop on the right, running off the right edge of the sheet with crop marks and a FIG. caption.
 */
export function DrywallHero({ fig = "01" }: { fig?: string }) {
  preload(posterUrl, { as: "image", fetchPriority: "high" });
  const crumbs = drywallBreadcrumb.map((c, i) => ({
    label: c.name,
    href: i < drywallBreadcrumb.length - 1 ? c.href : undefined,
  }));
  const lines = sentences(drywallHero.display);

  return (
    <section
      data-hero="dark"
      aria-labelledby="drywall-hero-title"
      className="surface-dark beam-rake relative isolate overflow-x-clip"
    >
      <div className="site-container pb-16 pt-[calc(var(--header-h)+0.75rem)] md:pb-24 lg:pb-28">
        {/* Sheet-title strip: where you are, and when the sheet was last revised */}
        <div className="flex flex-wrap items-center justify-between gap-x-10 border-b border-[color:var(--hairline)]">
          <Breadcrumbs items={crumbs} />
          <LastUpdated className="min-h-11" />
        </div>

        <div className="site-grid mt-10 gap-y-14 md:mt-14 lg:mt-20">
          {/* lg: bottom-aligned so the CTAs sit on the video frame's bottom edge (caption row = 3.5rem) */}
          <div className="@container col-span-full md:col-span-10 lg:col-span-6 lg:self-end lg:pb-14">
            <h1
              id="drywall-hero-title"
              className="flex items-center gap-4 font-display text-[1.0625rem] font-semibold tracking-[0.005em] text-[color:var(--ink)] [font-stretch:112%] md:text-[1.25rem]"
            >
              <span aria-hidden="true" className="h-px w-8 shrink-0 bg-worklight md:w-12" />
              {drywallHero.h1}
            </h1>

            <p className="t-display-l mt-7 whitespace-nowrap text-[color:var(--ink)] [font-size:clamp(1.625rem,9.4cqi,4.75rem)]! md:mt-9">
              {lines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </p>

            <p className="t-lede mt-8 max-w-[44ch] text-muted md:mt-10">{drywallHero.sub}</p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
              <Button href={drywallHero.primaryCta.href} size="lg" arrow className="w-full sm:w-auto">
                {drywallHero.primaryCta.label}
              </Button>
              <Button
                href={drywallHero.call.href}
                variant="call"
                size="lg"
                trackLocation="hero"
                className="w-full sm:w-auto"
              >
                {drywallHero.call.label}
              </Button>
            </div>
          </div>

          <HeroLoop
            mp4={video.drywallLoop.mp4}
            webm={video.drywallLoop.webm}
            poster={posterUrl}
            width={video.drywallLoop.width}
            height={video.drywallLoop.height}
            fig={fig}
            caption={media.drywallLoopPoster.caption ?? "Raking light across a finished wall"}
            className="dw-bleed-r col-span-full md:col-span-11 md:col-start-2 lg:col-span-6 lg:col-start-7 lg:mt-2"
          />
        </div>
      </div>
    </section>
  );
}
