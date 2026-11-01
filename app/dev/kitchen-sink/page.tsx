import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import KitchenSinkChrome from "@/components/dev/ks/Chrome";
import KitchenSinkForms from "@/components/dev/ks/Forms";
import KitchenSinkFormsB from "@/components/dev/ks/FormsB";
import KitchenSinkScenes from "@/components/dev/ks/Scenes";
import KitchenSinkScenesB from "@/components/dev/ks/ScenesB";
import KitchenSinkSections from "@/components/dev/ks/Sections";
import KitchenSinkUiKit from "@/components/dev/ks/UiKit";
import { Button } from "@/components/ui/Button";
import { DimensionLine } from "@/components/ui/DimensionLine";
import { DetailBubble, RegistrationMarks, TitleCell, VellumGrid } from "@/components/ui/drafting";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Wordmark } from "@/components/ui/Wordmark";
import { site } from "@/content/site.config";

export const metadata: Metadata = {
  title: "Kitchen sink · Capital Drywall design system",
  robots: { index: false, follow: false },
};

/**
 * Every component and state (brief §6). Disabled in production mode and on production deploys.
 * `?only=<group>` (chrome, uikit, sections, scenes, scenesb, forms, formsb, primitives) renders one group.
 */
export default function KitchenSinkPage({ searchParams }: PageProps<"/dev/kitchen-sink">) {
  if (site.mode === "production" || process.env.VERCEL_ENV === "production") notFound();
  return (
    <Suspense fallback={null}>
      <KitchenSink searchParams={searchParams} />
    </Suspense>
  );
}

async function KitchenSink({ searchParams }: { searchParams: PageProps<"/dev/kitchen-sink">["searchParams"] }) {
  const { only } = await searchParams;
  const show = (group: string) => !only || only === group;

  return (
    <div>
      {show("primitives") && (
      <>
      <section className="surface-dark beam-rake section-y-tight">
        <div className="site-container">
          <p className="t-spec">Dev · Kitchen sink · Raking Light design system</p>
          <h1 className="t-display-l mt-6 max-w-[16ch]">Every component, every state.</h1>
          <div className="mt-10 flex flex-wrap gap-4">
            <Button href="/free-quote" arrow>
              Get a Free Quote
            </Button>
            <Button href={`tel:${site.phone.e164}`} variant="call" trackLocation="kitchen-sink">
              {`Call ${site.phone.display}`}
            </Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost" arrow>
              Ghost link
            </Button>
            <Button loading>Sending</Button>
            <Button disabled>Disabled</Button>
          </div>
        </div>
      </section>

      <section className="surface-light texture-plaster section-y-tight relative isolate">
        <VellumGrid />
        <div className="site-container relative space-y-16">
          <SectionHeader
            index="00"
            eyebrow="Primitives"
            sheet="A-00"
            title="Two things, done properly."
            annotation="2 SERVICES · DONE PROPERLY"
            intro="Section header with sheet reference, offset headline, dimension-line annotation and intro."
          />
          <div className="flex flex-wrap items-center gap-6">
            <Button href="/free-quote" arrow>
              Get a Free Quote
            </Button>
            <Button href={`tel:${site.phone.e164}`} variant="call" trackLocation="kitchen-sink">
              {`Call ${site.phone.display}`}
            </Button>
            <Button variant="secondary" arrow>
              Secondary
            </Button>
            <Button variant="ghost" arrow>
              Explore drywall services
            </Button>
          </div>
          <div className="grid gap-10 md:grid-cols-2">
            <DimensionLine label="3 COATS · 24 H DRY" />
            <DimensionLine label="LEVEL 4 → LEVEL 5" align="start" tone="amber" />
          </div>
          <div className="flex flex-wrap items-center gap-6">
            <DetailBubble top="01" bottom="A-07" />
            <DetailBubble top="02" bottom="A-07" />
            <DetailBubble top="05" />
            <div className="relative h-24 w-40 bg-plaster-2">
              <RegistrationMarks />
            </div>
            <TitleCell label="Checked by">The owner</TitleCell>
          </div>
          <div className="flex flex-wrap items-end gap-12">
            <Wordmark />
            <div className="w-full max-w-3xl">
              <Wordmark size="footer" />
            </div>
          </div>
        </div>
      </section>

      </>
      )}
      {show("uikit") && <KitchenSinkUiKit />}
      {show("sections") && <KitchenSinkSections />}
      {show("chrome") && <KitchenSinkChrome />}
      {show("scenes") && <KitchenSinkScenes />}
      {show("scenesb") && <KitchenSinkScenesB />}
      {show("forms") && <KitchenSinkForms />}
      {show("formsb") && <KitchenSinkFormsB />}
    </div>
  );
}
