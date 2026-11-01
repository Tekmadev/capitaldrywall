import type { Metadata } from "next";
import { CompactQuoteForm } from "@/components/forms/CompactQuoteForm";
import { RenovationsHero } from "@/components/sections/renovations/RenovationsHero";
import { RenovationsIntro } from "@/components/sections/renovations/RenovationsIntro";
import { ServiceSheet, type ServiceSheetLayout } from "@/components/sections/renovations/ServiceSheet";
import { WhySpecialist } from "@/components/sections/renovations/WhySpecialist";
import { FaqSection } from "@/components/sections/shared/FaqSection";
import { FinalCta } from "@/components/sections/shared/FinalCta";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { ServiceJsonLd } from "@/components/seo/ServiceJsonLd";
import { renovationSections, renovationsBreadcrumb, renovationsFinalCta } from "@/content/copy/renovations";
import { pages } from "@/content/services";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata("renovations");

/**
 * How each service sheet is laid out, so the three never repeat one template: photo off the left
 * edge on graphite, photo off the right edge on plaster, then a full-bleed band. Annotations state
 * facts from the copy deck.
 */
const sheetLayout: Record<string, { layout: ServiceSheetLayout; tone: "light" | "dark"; annotation?: string }> = {
  "interior-painting": { layout: "bleed-left", tone: "dark", annotation: "Bare board → finished" },
  "bathroom-renovations": { layout: "bleed-right", tone: "light", annotation: "Board → waterproofing → tile" },
  "kitchen-renovations": { layout: "band", tone: "light" },
};

export default function RenovationsPage() {
  const sheets = renovationSections.length;

  return (
    <>
      <ServiceJsonLd page="renovations" />
      <BreadcrumbJsonLd trail={renovationsBreadcrumb} />

      <RenovationsHero />
      <RenovationsIntro />

      {renovationSections.map((section, i) => {
        const config = sheetLayout[section.id] ?? { layout: i % 2 ? "bleed-right" : "bleed-left", tone: "light" };
        return <ServiceSheet key={section.id} section={section} number={i + 1} {...config} />;
      })}

      <WhySpecialist index={String(sheets + 1).padStart(2, "0")} fig={sheets + 1} />

      <FaqSection page="renovations" path={pages.renovations} index={String(sheets + 2).padStart(2, "0")} />

      <FinalCta
        title={renovationsFinalCta.title}
        body={renovationsFinalCta.body}
        index={String(sheets + 3).padStart(2, "0")}
        form={<CompactQuoteForm />}
      />
    </>
  );
}
