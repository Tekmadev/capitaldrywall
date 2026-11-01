import { Button } from "@/components/ui/Button";
import { CallLink, EmailLink } from "@/components/ui/CallLink";
import { TitleCell } from "@/components/ui/drafting";
import { PhoneIcon } from "@/components/ui/icons";
import { Wordmark } from "@/components/ui/Wordmark";
import { brand, ctas, nav } from "@/content/copy/global";
import { pages } from "@/content/services";
import { feature, site } from "@/content/site.config";
import { HeaderShell, type HeaderPreview } from "./HeaderShell";
import { formatHours } from "./format";
import { MobileMenu, type NavItem } from "./MobileMenu";

export type { HeaderPreview };

const items: NavItem[] = nav.map(({ label, href, index }) => ({ label, href, index }));
const homeLabel = `${brand.name}, home`;

/**
 * Site header (brief §6). Fixed; transparent with plaster ink over a page whose first section has
 * `data-hero="dark"`, solid plaster otherwise; condenses with a hairline and shadow after scroll.
 * Below 1024 px the nav moves into a full-screen index sheet behind the "Menu" button.
 *
 * `preview` (kitchen sink only) renders it inline with a forced tone / scroll state.
 */
export function Header({ preview }: { preview?: HeaderPreview } = {}) {
  return (
    <HeaderShell
      items={items}
      homeHref={pages.home}
      homeLabel={homeLabel}
      wordmark={<Wordmark />}
      actions={<HeaderActions />}
      menuDetails={<MenuDetails />}
      preview={preview}
    />
  );
}

/** Kitchen sink: the open mobile menu sheet, rendered in place (`currentPath` shows the current tick). */
export function MobileMenuPreview({ currentPath }: { currentPath?: string } = {}) {
  return (
    <MobileMenu
      id="site-menu-preview"
      staticOpen
      currentPath={currentPath}
      items={items}
      homeHref={pages.home}
      homeLabel={homeLabel}
      wordmark={<Wordmark />}
      details={<MenuDetails />}
    />
  );
}

function HeaderActions() {
  return (
    <>
      <div className="hidden items-center gap-3 lg:flex">
        <CallLink
          location="header"
          className="group/call inline-flex min-h-11 items-center gap-2 whitespace-nowrap font-mono text-[0.8125rem] font-medium tracking-[0.02em]"
        >
          <PhoneIcon size={16} className="shrink-0" />
          <span className="relative py-1.5">
            {site.phone.display}
            <span
              aria-hidden="true"
              className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-worklight transition-transform duration-300 ease-[var(--ease-rake)] group-hover/call:scale-x-100"
            />
          </span>
        </CallLink>
        {/* Reserved slot (brief §12): shown once calls are answered around the clock */}
        {feature("call247") && (
          <span className="rounded-full border border-current px-2 py-1 font-mono text-[0.625rem] font-medium uppercase leading-none tracking-[0.14em]">
            Call 24/7
          </span>
        )}
      </div>
      <Button href={pages.quote} size="sm" className="hidden md:inline-flex">
        {ctas.primary}
      </Button>
    </>
  );
}

const cell = "border-b border-r border-[color:var(--hairline)] p-3.5";

/** Mobile menu foot: the primary CTA over a strip of title-block cells. */
function MenuDetails() {
  return (
    <div className="flex flex-col gap-6">
      <Button href={pages.quote} size="lg" arrow fullWidth>
        {ctas.primary}
      </Button>
      <div className="grid grid-cols-1 border-l border-t border-[color:var(--hairline)] min-[360px]:grid-cols-2">
        <div className={cell}>
          <TitleCell label="Phone">
            <CallLink
              location="mobile-menu"
              className="-my-2 inline-flex min-h-11 items-center whitespace-nowrap font-mono text-[0.9375rem] font-medium"
            />
          </TitleCell>
        </div>
        <div className={cell}>
          <TitleCell label="Hours">
            <span className="block text-balance">{formatHours(site.hours)}</span>
          </TitleCell>
        </div>
        <div className={`${cell} min-[360px]:col-span-2`}>
          <TitleCell label="Email">
            <EmailLink className="-my-2 inline-flex min-h-11 items-center text-[0.875rem] [overflow-wrap:anywhere]" />
          </TitleCell>
        </div>
      </div>
    </div>
  );
}
