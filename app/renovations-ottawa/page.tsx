import type { Metadata } from "next";
import { CompactQuoteForm } from "@/components/forms/CompactQuoteForm";
import { BasementTransform } from "@/components/scenes/BasementTransform";
import { RenovationsHero } from "@/components/sections/renovations/RenovationsHero";
import { RenovationsIntro } from "@/components/sections/renovations/RenovationsIntro";
import { RoomScope } from "@/components/sections/renovations/RoomScope";
import { ServiceSheet, type ServiceSheetLayout } from "@/components/sections/renovations/ServiceSheet";
import { WhySpecialist } from "@/components/sections/renovations/WhySpecialist";
import { FaqSection } from "@/components/sections/shared/FaqSection";
import { FinalCta } from "@/components/sections/shared/FinalCta";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { ServiceJsonLd } from "@/components/seo/ServiceJsonLd";
import {
  renovationSections,
  renovationsBreadcrumb,
  renovationsFinalCta,
  roomSections,
} from "@/content/copy/renovations";
import { pages } from "@/content/services";
import { pageMetadata } from "@/lib/seo";
import { pad2 } from "@/lib/utils";

export const metadata: Metadata = pageMetadata("renovations");

/** How each service sheet after the rooms is laid out (photo off the left edge, on graphite). */
const sheetLayout: Record<string, { layout: ServiceSheetLayout; tone: "light" | "dark"; annotation?: string }> = {
  "interior-painting": { layout: "bleed-left", tone: "dark", annotation: "Bare board → finished" },
};

/**
 * Bathroom & kitchen renovations (with interior painting). Each room is built in front of you the
 * way the basement is: a scroll-scrubbed transformation (concept visualization) from the dated room
 * to the finished one, the bathroom scene bleeding right and the kitchen mirrored, each followed by
 * its scope sheet (full remodel / refresh). Painting keeps its service sheet.
 */
export default function RenovationsPage() {
  const rooms = roomSections.length;
  const sheets = rooms + renovationSections.length;

  return (
    <>
      <ServiceJsonLd page="renovations" />
      <BreadcrumbJsonLd trail={renovationsBreadcrumb} />

      <RenovationsHero />
      <RenovationsIntro />

      {roomSections.map((room, i) => (
        <div key={room.id}>
          <BasementTransform
            variant="teaser"
            room={room.room}
            id={room.id}
            index={pad2(i + 1)}
            eyebrow={room.title}
            sheet={`A-${pad2(i + 1)}`}
            title={room.heading}
            body={room.body}
            stages={room.stages}
            conceptLabel="Concept visualization"
            link={{ label: "See what's included", href: `#${room.id}-scope` }}
            quote={{ label: room.cta.label.replace(/\s*→\s*$/, ""), href: room.cta.href }}
            flip={i % 2 === 1}
          />
          <RoomScope section={room} number={i + 1} id={`${room.id}-scope`} />
        </div>
      ))}

      {renovationSections.map((section, i) => {
        const config = sheetLayout[section.id] ?? { layout: "bleed-left" as const, tone: "light" as const };
        return <ServiceSheet key={section.id} section={section} number={rooms + i + 1} {...config} />;
      })}

      <WhySpecialist index={pad2(sheets + 1)} fig={sheets + 1} />

      <FaqSection page="renovations" path={pages.renovations} index={pad2(sheets + 2)} />

      <FinalCta
        title={renovationsFinalCta.title}
        body={renovationsFinalCta.body}
        index={pad2(sheets + 3)}
        form={<CompactQuoteForm />}
      />
    </>
  );
}
