import type { ReactNode } from "react";
import { BeforeAfterSection } from "@/components/sections/shared/BeforeAfterSection";
import { BeforeAfterSlider } from "@/components/ui/BeforeAfterSlider";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Chip } from "@/components/ui/Chip";
import { LastUpdated } from "@/components/ui/LastUpdated";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { TrustStrip } from "@/components/ui/TrustStrip";
import { projectsFor } from "@/content/projects";
import { cn } from "@/lib/utils";
import { ControlledSegmentDemo, ToastDemo, ToastStaticCards } from "./UiKitDemos";

/** Kitchen-sink partial for the ui-kit group: every interactive primitive in every state. */
export default function KitchenSinkUiKit() {
  const drywall = projectsFor("drywall");
  const lead = drywall[0];
  const second = drywall[1] ?? lead;
  const third = drywall[2] ?? lead;
  const homeDrywall = projectsFor("home-drywall-card")[0];
  const homeBasement = projectsFor("home-basement-card")[0];

  const levels = [0, 1, 2, 3, 4, 5].map((n) => ({ value: `level-${n}`, label: `Level ${n}` }));
  const levelsWithDisabled = levels.map((o) => (o.value === "level-0" ? { ...o, disabled: true } : o));
  const jumpChips = [
    { label: "Installation", href: "#installation" },
    { label: "Repair", href: "#repair" },
    { label: "Taping & mudding", href: "#taping-mudding" },
    { label: "Skim coat & Level 5", href: "#skim-coat-level-5" },
    { label: "Popcorn removal", href: "#popcorn-removal" },
  ];

  return (
    <div id="ks-uikit">
      {/* ── Before/after sliders on plaster ───────────────────────────── */}
      <section aria-labelledby="ks-uikit-title" className="surface-light texture-plaster section-y-tight relative">
        <div className="site-container space-y-20">
          <SectionHeader
            index="UI"
            eyebrow="UI kit"
            sheet="K-02"
            id="ks-uikit-title"
            title="Sliders, strips, toasts and small parts."
            intro="BeforeAfterSlider · BeforeAfterSection · TrustStrip · Toast · SegmentedControl · Chip · Breadcrumbs · LastUpdated"
            reveal={false}
          />

          <Group label="01 · BeforeAfterSlider · full (intro nudge on) · thumb ×2">
            <div className="site-grid gap-y-14">
              {lead && (
                <BeforeAfterSlider
                  project={lead}
                  fig={1}
                  sizes="(min-width: 1440px) 885px, (min-width: 768px) 62vw, calc(100vw - 40px)"
                  className="col-span-full md:col-span-8"
                />
              )}
              <div className="col-span-full grid gap-12 sm:grid-cols-2 md:col-span-4 md:grid-cols-1">
                {homeDrywall && (
                  <BeforeAfterSlider
                    project={homeDrywall}
                    variant="thumb"
                    initial={60}
                    sizes="(min-width: 1440px) 427px, (min-width: 768px) 30vw, calc(100vw - 40px)"
                  />
                )}
                {homeBasement && (
                  <BeforeAfterSlider
                    project={homeBasement}
                    variant="thumb"
                    ratio="16 / 10"
                    initial={40}
                    sizes="(min-width: 1440px) 427px, (min-width: 768px) 30vw, calc(100vw - 40px)"
                  />
                )}
              </div>
            </div>
          </Group>

          <Group label="02 · Slider states (static): 18% · 82% · hover · dragging · keyboard focus">
            <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {lead && <StateDemo label="initial 18" node={<BeforeAfterSlider project={lead} initial={18} forceStatic fig={2} sizes={third3} />} />}
              {second && <StateDemo label="initial 82" node={<BeforeAfterSlider project={second} initial={82} forceStatic fig={3} sizes={third3} />} />}
              {third && <StateDemo label="hover" node={<BeforeAfterSlider project={third} demoState="hover" forceStatic fig={4} sizes={third3} />} />}
              {lead && <StateDemo label="dragging" node={<BeforeAfterSlider project={lead} demoState="dragging" initial={64} forceStatic fig={5} sizes={third3} />} />}
              {second && <StateDemo label="keyboard focus" node={<BeforeAfterSlider project={second} demoState="focus" initial={36} forceStatic fig={6} sizes={third3} />} />}
              {homeBasement && (
                <StateDemo
                  label="thumb · dragging"
                  node={<BeforeAfterSlider project={homeBasement} variant="thumb" demoState="dragging" initial={70} forceStatic sizes={third3} />}
                />
              )}
            </div>
            <p className="t-spec mt-10 max-w-[70ch]">
              Production: sample items are filtered by projectsFor() and the slider also returns null for any sample, so
              sections with no real items render nothing.
            </p>
          </Group>
        </div>
      </section>

      {/* ── Dark context ─────────────────────────────────────────────────── */}
      <section aria-label="UI kit on graphite" className="surface-dark beam-rake section-y-tight">
        <div className="site-container space-y-16">
          <Group label="03 · On graphite: full slider · thumb · trust row (hero) · breadcrumbs · last updated">
            <div className="site-grid gap-y-12">
              {third && (
                <BeforeAfterSlider
                  project={third}
                  fig={7}
                  initial={56}
                  sizes="(min-width: 1440px) 656px, (min-width: 768px) 46vw, calc(100vw - 40px)"
                  className="col-span-full md:col-span-6"
                />
              )}
              <div className="col-span-full flex flex-col gap-10 md:col-span-5 md:col-start-8">
                {homeDrywall && (
                  <BeforeAfterSlider
                    project={homeDrywall}
                    variant="thumb"
                    sizes="(min-width: 1440px) 541px, (min-width: 768px) 38vw, calc(100vw - 40px)"
                  />
                )}
                <TrustStrip />
                <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Basements" }]} />
                <LastUpdated />
              </div>
            </div>
          </Group>
        </div>
      </section>

      {/* ── The shared section, as the service pages use it ─────────────── */}
      <BeforeAfterSection placement="drywall" index="05" sheet="A-05" id="ks-before-after-drywall" />
      <BeforeAfterSection
        placement="basement"
        index="06"
        sheet="B-06"
        surface="dark"
        id="ks-before-after-basement"
        title="From bare concrete to finished."
      />

      {/* ── Trust strip ──────────────────────────────────────────────────── */}
      <section aria-label="Trust strip variants" className="surface-light section-y-tight">
        <div className="site-container space-y-14">
          <Group label="04 · TrustStrip · row (light) · band (light, then dark)">
            <TrustStrip tone="light" />
          </Group>
        </div>
        <TrustStrip size="band" className="mt-14" />
        <TrustStrip size="band" tone="dark" />
      </section>

      {/* ── Toast, segmented control, chips, breadcrumbs, last updated ──── */}
      <section aria-label="Small parts" className="surface-light texture-plaster section-y-tight relative">
        <div className="site-container space-y-20">
          <Group label="05 · Toast · static cards (info · success · error · no dismiss) · live region">
            <ToastStaticCards />
            <div className="mt-8">
              <ToastDemo />
            </div>
          </Group>

          <Group label="06 · SegmentedControl · uncontrolled · controlled · hints · disabled option · disabled group · empty">
            <div className="grid gap-x-12 gap-y-12 lg:grid-cols-2">
              <SegmentedControl legend="Drywall finish level" options={levels} defaultValue="level-4" name="ks-levels" />
              <ControlledSegmentDemo />
              <SegmentedControl
                legend="Disabled option (Level 0)"
                options={levelsWithDisabled}
                defaultValue="level-5"
                name="ks-levels-disabled"
                size="sm"
              />
              <SegmentedControl
                legend="Whole group disabled"
                options={levels.slice(3)}
                defaultValue="level-4"
                disabled
                name="ks-levels-off"
              />
              <SegmentedControl legend="Nothing chosen yet" options={levels.slice(3)} name="ks-levels-empty" />
            </div>
            <div className="surface-dark mt-12 p-6 md:p-10">
              <SegmentedControl legend="On graphite" options={levels} defaultValue="level-5" name="ks-levels-dark" />
            </div>
          </Group>

          <Group label="07 · Chip · jump links (current, hover-able) · static values · on graphite">
            <div className="space-y-8">
              <ul className="flex flex-wrap gap-x-2.5 gap-y-3">
                {jumpChips.map((chip, i) => (
                  <li key={chip.href}>
                    <Chip href={chip.href} current={i === 0}>
                      {chip.label}
                    </Chip>
                  </li>
                ))}
              </ul>
              <ul className="flex flex-wrap gap-x-2.5 gap-y-3">
                <li>
                  <Chip>Level 5</Chip>
                </li>
                <li>
                  <Chip index="01">3 coats · 24 h dry</Chip>
                </li>
                <li>
                  <Chip>5/8&quot; Type X</Chip>
                </li>
                <li>
                  <Chip current>Paint-ready</Chip>
                </li>
                <li>
                  <Chip href="/free-quote">Get a Free Quote</Chip>
                </li>
              </ul>
              <div className="surface-dark flex flex-wrap gap-x-2.5 gap-y-3 p-6">
                {jumpChips.slice(0, 3).map((chip, i) => (
                  <Chip key={chip.href} href={chip.href} current={i === 1} index={`0${i + 1}`}>
                    {chip.label}
                  </Chip>
                ))}
                <Chip>Level 4</Chip>
              </div>
            </div>
          </Group>

          <Group label="08 · Breadcrumbs · LastUpdated">
            <div className="space-y-6">
              <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Drywall" }]} />
              <Breadcrumbs
                items={[
                  { label: "Home", href: "/" },
                  { label: "Renovations", href: "/renovations-ottawa" },
                  { label: "Bathroom renovations" },
                ]}
              />
              <LastUpdated />
              <LastUpdated date="2027-01-05" />
            </div>
          </Group>
        </div>
      </section>
    </div>
  );
}

const third3 = "(min-width: 1024px) 30vw, (min-width: 640px) 45vw, calc(100vw - 40px)";

function Group({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn("space-y-8", className)}>
      <div className="flex items-center gap-4">
        <h3 className="t-spec whitespace-normal">{label}</h3>
        <span aria-hidden="true" className="h-px min-w-6 flex-1 bg-[color:var(--hairline)]" />
      </div>
      {children}
    </div>
  );
}

function StateDemo({ label, node }: { label: string; node: ReactNode }) {
  return (
    <div className="space-y-3">
      <p className="t-spec">{label}</p>
      {node}
    </div>
  );
}
