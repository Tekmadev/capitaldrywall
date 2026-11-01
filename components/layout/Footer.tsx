import { cacheLife } from "next/cache";
import Link from "next/link";
import type { ReactNode } from "react";
import { BreakableEmail, CallLink, EmailLink } from "@/components/ui/CallLink";
import { PhoneIcon } from "@/components/ui/icons";
import { Wordmark } from "@/components/ui/Wordmark";
import { areas } from "@/content/areas";
import { brand, ctas, footer } from "@/content/copy/global";
import { footerServices, pages, type Service } from "@/content/services";
import { feature, site } from "@/content/site.config";
import { cn } from "@/lib/utils";
import { formatHours } from "./format";

/**
 * The drawing year. cacheComponents forbids reading the clock during render, so it is read inside
 * a cache scope (refreshed daily) and prerenders into the static shell.
 */
async function SheetYear({ copyright = false }: { copyright?: boolean }) {
  "use cache";
  cacheLife("days");
  const year = new Date().getFullYear();
  return copyright ? footer.copyright(year) : String(year);
}

const services = footerServices.filter(
  (s): s is Service & { href: string; footerLabel: string } => Boolean(s.href && s.footerLabel),
);

/** Underline that draws from the left in amber when its parent link (group/l) is hovered or focused. */
function DrawText({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "bg-[linear-gradient(var(--color-worklight),var(--color-worklight))] bg-[length:0%_2px] bg-[position:0_100%] bg-no-repeat pb-0.5 [box-decoration-break:clone]",
        "transition-[background-size] duration-300 ease-[var(--ease-rake)] group-hover/l:bg-[length:100%_2px] group-focus-visible/l:bg-[length:100%_2px]",
        className,
      )}
    >
      {children}
    </span>
  );
}

/** 44 px tall for touch, 32 px with a fine pointer (dense lists stay compact on desktop). */
const linkBox = "group/l inline-flex min-h-11 items-center py-1 pointer-fine:min-h-8";

function FooterLink({ href, children, prefetch }: { href: string; children: ReactNode; prefetch?: boolean }) {
  return (
    <Link href={href} prefetch={prefetch} className={cn(linkBox, "text-[0.9375rem] leading-snug")}>
      <DrawText>{children}</DrawText>
    </Link>
  );
}

/** One title-block field: a tiny mono label over its content. */
function Cell({
  id,
  label,
  className,
  children,
}: {
  id?: string;
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-4 bg-graphite p-5 md:p-6 xl:p-7", className)}>
      <h2 id={id} className="t-spec">
        {label}
      </h2>
      {children}
    </div>
  );
}

function MetaCell({ label, emphasis, children }: { label: string; emphasis?: boolean; children: ReactNode }) {
  return (
    <dl className="flex min-h-24 flex-col justify-between gap-3 bg-graphite p-5 md:p-6 xl:px-7">
      <dt className="t-spec">{label}</dt>
      <dd
        className={cn(
          "uppercase text-[color:var(--ink)]",
          emphasis
            ? "whitespace-nowrap font-display text-[1.5rem] font-[780] leading-none tracking-[-0.01em] [font-stretch:125%] min-[360px]:text-[1.75rem] md:text-[2rem]"
            : "font-mono text-[0.875rem] font-medium tabular-nums tracking-[0.08em]",
        )}
      >
        {children}
      </dd>
    </dl>
  );
}

/**
 * Footer as a drawing title block (ART_DIRECTION device 6): hairline cells with mono field labels,
 * real values, and the oversized wordmark set into the bottom row. Hides the mobile action bar.
 * `idPrefix` keeps heading ids unique when a second copy renders (kitchen sink).
 */
export function Footer({ idPrefix = "footer" }: { idPrefix?: string } = {}) {
  const servicesId = `${idPrefix}-services`;
  const legalId = `${idPrefix}-legal`;
  return (
    <footer
      data-hide-action-bar=""
      className="surface-dark relative pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-16 md:pt-24"
    >
      <div className="site-container">
        <div
          className={cn(
            "grid grid-cols-2 gap-px border bg-clip-padding md:grid-cols-12",
            "[--tb-frame:color-mix(in_srgb,var(--color-plaster)_24%,transparent)] [--tb-line:color-mix(in_srgb,var(--color-plaster)_12%,transparent)]",
            "border-[color:var(--tb-frame)] bg-[color:var(--tb-line)]",
          )}
        >
          <Cell label="Contractor" className="col-span-2 md:col-span-6 lg:col-span-4">
            <p className="t-h3 max-w-[15ch] text-[color:var(--ink)]">{brand.name}</p>
            <p className="max-w-[46ch] text-[0.9375rem] leading-relaxed text-muted">{footer.blurb}</p>
          </Cell>

          <Cell id={servicesId} label="Services" className="col-span-2 md:col-span-6 lg:col-span-3">
            <nav aria-labelledby={servicesId}>
              <ul className="flex flex-col">
                {services.map((service) => (
                  <li key={service.id}>
                    <FooterLink href={service.href}>{service.footerLabel}</FooterLink>
                  </li>
                ))}
              </ul>
            </nav>
          </Cell>

          <Cell label="Service area" className="col-span-2 md:col-span-12 lg:col-span-5">
            <ul className="grid grid-cols-2 gap-x-5 md:grid-cols-3 lg:grid-cols-2">
              {areas.map((area) => (
                <li key={area.name}>
                  <FooterLink href={`${pages.quote}?area=${encodeURIComponent(area.name)}`} prefetch={false}>
                    {area.name}
                    <span className="sr-only">: {ctas.primary}</span>
                  </FooterLink>
                </li>
              ))}
            </ul>
          </Cell>

          <Cell label="Contact" className="col-span-2 md:col-span-6 lg:col-span-4">
            <address className="flex flex-col not-italic">
              <CallLink location="footer" className={cn(linkBox, "gap-2.5 whitespace-nowrap font-mono text-[0.9375rem] font-medium")}>
                <PhoneIcon size={16} className="shrink-0" />
                <DrawText>{site.phone.display}</DrawText>
              </CallLink>
              {/* Breaks after the "@" in a narrow column; anywhere only as the last resort */}
              <EmailLink className={cn(linkBox, "text-[0.9375rem] [overflow-wrap:anywhere]")}>
                <DrawText>
                  <BreakableEmail />
                </DrawText>
              </EmailLink>
              <span className="mt-2 text-[0.9375rem] text-muted">{footer.contact.location}</span>
            </address>
          </Cell>

          <Cell label="Hours" className="col-span-1 md:col-span-3 lg:col-span-3">
            <p className="text-balance text-[0.9375rem] leading-snug text-[color:var(--ink)]">{formatHours(footer.contact.hours)}</p>
          </Cell>

          <Cell id={legalId} label="Legal" className="col-span-1 md:col-span-3 lg:col-span-2">
            <ul aria-labelledby={legalId}>
              {footer.legal.map((item) => (
                <li key={item.href}>
                  <FooterLink href={item.href}>{item.label}</FooterLink>
                </li>
              ))}
            </ul>
          </Cell>

          {/* Right-hand title strip: sign-off, scale, date and the sheet number in the corner */}
          <div className="col-span-2 grid grid-cols-2 gap-px md:col-span-12 md:grid-cols-4 lg:col-span-3 lg:row-span-2 lg:auto-rows-fr lg:grid-cols-1">
            <MetaCell label="Checked by">{site.owner.name ?? "The owner"}</MetaCell>
            <MetaCell label="Scale">1:1</MetaCell>
            <MetaCell label="Drawn">
              <SheetYear />
            </MetaCell>
            <MetaCell label="Sheet" emphasis>
              1 of 1
            </MetaCell>
          </div>

          {/* The oversized wordmark, set into the bottom row and lit from the left */}
          <div className="beam-rake relative col-span-2 flex flex-col justify-end gap-10 overflow-hidden bg-graphite p-5 pt-8 max-lg:order-last md:col-span-12 md:p-6 md:pt-8 lg:col-span-9 xl:p-7">
            <p className="t-spec">{brand.tagline}</p>
            <div aria-hidden="true" className="text-[color:var(--ink)]">
              <Wordmark size="footer" />
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-2 font-mono text-[0.6875rem] font-medium uppercase leading-relaxed tracking-[0.1em] text-muted md:flex-row md:flex-wrap md:items-baseline md:justify-between md:gap-x-8">
          <p>
            <SheetYear copyright />
          </p>
          {footer.sisterBrandLine && <p className="normal-case tracking-[0.02em]">{footer.sisterBrandLine}</p>}
          {feature("siteCredit") && (
            <p>
              {footer.siteCredit.url ? (
                <a
                  href={footer.siteCredit.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/l inline-flex min-h-11 items-center pointer-fine:min-h-6"
                >
                  <DrawText>{footer.siteCredit.label}</DrawText>
                </a>
              ) : (
                footer.siteCredit.label
              )}
            </p>
          )}
        </div>
      </div>
    </footer>
  );
}
