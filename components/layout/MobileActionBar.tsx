import { Button } from "@/components/ui/Button";
import { mobileActionBar } from "@/content/copy/global";
import { pages } from "@/content/services";
import { site } from "@/content/site.config";
import { ActionBarShell } from "./ActionBarShell";

/**
 * Mobile action bar (brief §7.8), below 768 px only: [Call] and [Get a Free Quote] as two equal
 * 48 px buttons, sliding up once the hero has scrolled away. Not rendered on /free-quote.
 * `preview` (kitchen sink) forces it visible and renders it in place.
 */
export function MobileActionBar({ preview }: { preview?: boolean } = {}) {
  return (
    <ActionBarShell hiddenOn={[pages.quote]} preview={preview}>
      <Button
        href={`tel:${site.phone.e164}`}
        variant="call"
        trackLocation="action-bar"
        aria-label={`${mobileActionBar.call} ${site.phone.display}`}
        fullWidth
        className="px-2 text-[0.9375rem]"
      >
        {mobileActionBar.call}
      </Button>
      <Button href={pages.quote} fullWidth className="px-2 text-[0.9375rem]">
        {mobileActionBar.quote}
      </Button>
    </ActionBarShell>
  );
}
