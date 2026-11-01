"use client";

import dynamic from "next/dynamic";
import { Button } from "@/components/ui/Button";
import { ctas } from "@/content/copy/global";
import { pages } from "@/content/services";
import { site } from "@/content/site.config";
import { cn } from "@/lib/utils";
import type { CompactQuoteFormProps } from "./CompactQuoteFormImpl";

export type { CompactQuoteFormProps };

/**
 * The compact form's validation stack (react-hook-form + zod) is about 45 KB and the form sits at the
 * very bottom of the service pages, so it loads as its own chunk after hydration instead of competing
 * with the first paint. Until then, and without JavaScript, the fallback offers the same two actions:
 * the full quote form and a call.
 */
const CompactQuoteFormImpl = dynamic(
  () => import("./CompactQuoteFormImpl").then((m) => m.CompactQuoteForm),
  { ssr: false, loading: () => <CompactQuoteFallback /> },
);

export function CompactQuoteForm(props: CompactQuoteFormProps) {
  return <CompactQuoteFormImpl {...props} />;
}

function CompactQuoteFallback({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative flex min-h-[26rem] flex-col justify-end gap-4 border border-[color:var(--hairline)] p-6 md:min-h-[30rem]",
        className,
      )}
    >
      <Button href={pages.quote} arrow fullWidth>
        {ctas.primary}
      </Button>
      <Button href={`tel:${site.phone.e164}`} variant="call" trackLocation="final-cta-form" fullWidth>
        {ctas.call}
      </Button>
    </div>
  );
}
