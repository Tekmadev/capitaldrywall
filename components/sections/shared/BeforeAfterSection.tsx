import { BeforeAfterSlider } from "@/components/ui/BeforeAfterSlider";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { projectsFor, type Project } from "@/content/projects";
import { isDemo } from "@/content/site.config";
import { cn } from "@/lib/utils";

type BeforeAfterSectionProps = {
  placement: "drywall" | "basement";
  /** Section number on the page, e.g. "05" */
  index?: string;
  eyebrow?: string;
  title?: string;
  intro?: string;
  /** Drawing-sheet code, e.g. "A-05" */
  sheet?: string;
  /** Section id (anchor target for jump links) */
  id?: string;
  surface?: "light" | "dark";
  /** First FIG. number used by the captions (default 1) */
  figStart?: number;
  /** Project ids already shown elsewhere on the page (left out here so no pair appears twice) */
  exclude?: readonly string[];
  className?: string;
};

type Slot = { className: string; sizes: string; initial: number };

// Content width at ≥1440: 1344 px; one 12-col column ≈ 82.7 px with 32 px gutters.
const SIZES = {
  eight: "(min-width: 1440px) 885px, (min-width: 768px) 62vw, calc(100vw - 40px)",
  six: "(min-width: 1440px) 656px, (min-width: 768px) 46vw, calc(100vw - 40px)",
  five: "(min-width: 1440px) 541px, (min-width: 768px) 38vw, calc(100vw - 40px)",
  four: "(min-width: 1440px) 427px, (min-width: 768px) 30vw, calc(100vw - 40px)",
};

/**
 * Asymmetric contact-sheet placement: the lead pair is large over 8 columns, the next two are
 * smaller and stacked beside it, and any further pairs alternate offset rows. Never identical cards.
 */
function slot(i: number, count: number): Slot {
  if (i === 0) {
    if (count === 1) {
      return { className: "md:col-span-10 lg:col-span-8 lg:col-start-2", sizes: SIZES.eight, initial: 50 };
    }
    return {
      className: cn("md:col-span-8 md:self-start", count >= 3 && "md:row-span-2"),
      sizes: SIZES.eight,
      initial: 50,
    };
  }
  if (i === 1) {
    return {
      className: cn("md:col-span-4 md:col-start-9 md:self-start", count === 2 && "md:mt-40"),
      sizes: SIZES.four,
      initial: 42,
    };
  }
  if (i === 2) return { className: "md:col-span-4 md:col-start-9 md:self-end", sizes: SIZES.four, initial: 58 };
  return (i - 3) % 2 === 0
    ? { className: "md:col-span-5 md:col-start-2 md:mt-8", sizes: SIZES.five, initial: 46 }
    : { className: "md:col-span-6 md:col-start-7 md:mt-32", sizes: SIZES.six, initial: 54 };
}

/**
 * Before & after section for the Drywall and Basement pages (brief §7.4). Data comes from
 * content/projects.ts; samples render only in demo mode (badged). With no real items it renders
 * nothing at all.
 */
export function BeforeAfterSection({
  placement,
  index,
  eyebrow = "Before & after",
  title = "Before and after.",
  intro,
  sheet,
  id = "before-after",
  surface = "light",
  figStart = 1,
  exclude,
  className,
}: BeforeAfterSectionProps) {
  const items: Project[] = projectsFor(placement).filter(
    (p) =>
      Boolean(p.before) &&
      !exclude?.includes(p.id) &&
      (isDemo || (!p.isSample && p.before?.kind !== "sample" && p.after.kind !== "sample")),
  );
  if (items.length === 0) return null;

  const headingId = `${id}-title`;

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={cn(
        "section-y relative",
        surface === "dark" ? "surface-dark" : "surface-light texture-plaster",
        className,
      )}
    >
      <div className="site-container">
        <SectionHeader index={index} eyebrow={eyebrow} sheet={sheet} title={title} id={headingId} intro={intro} />
        <div className="site-grid mt-12 gap-y-14 md:mt-20 md:gap-y-16">
          {items.map((project, i) => {
            const s = slot(i, items.length);
            return (
              <BeforeAfterSlider
                key={project.id}
                project={project}
                fig={figStart + i}
                sizes={s.sizes}
                initial={s.initial}
                intro={i === 0}
                className={cn("col-span-full", s.className)}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
