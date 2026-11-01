"use client";

import { useSyncExternalStore } from "react";
import { CallLink } from "@/components/ui/CallLink";
import { thankYou } from "@/content/copy/quote";
import { site } from "@/content/site.config";
import { FIRST_NAME_KEY } from "@/lib/quote/client";

/* sessionStorage never changes under this page, so there is nothing to subscribe to */
const subscribe = () => () => {};

/** The first name QuoteForm remembered on submit ("cdr:firstName"), or null. */
function readFirstName(): string | null {
  try {
    const name = sessionStorage.getItem(FIRST_NAME_KEY)?.trim();
    return name ? name.slice(0, 40) : null;
  } catch {
    return null; // storage unavailable (private mode): "Thanks."
  }
}

/**
 * The thank-you body (copy deck): "Thanks{{, firstName}}. …". The server renders the no-name version;
 * after hydration the visitor's first name is read from this tab's sessionStorage. The phone number
 * in the sentence is a tel: link.
 */
export function ThankYouBody({ className }: { className?: string }) {
  const firstName = useSyncExternalStore(subscribe, readFirstName, () => null);
  const text = thankYou.body(firstName);
  const phone = site.phone.display;
  const at = text.lastIndexOf(phone);

  return (
    <p className={className}>
      {at < 0 ? (
        text
      ) : (
        <>
          {text.slice(0, at)}
          <CallLink location="thank-you-body" className="link-inline whitespace-nowrap">
            {phone}
          </CallLink>
          {text.slice(at + phone.length)}
        </>
      )}
    </p>
  );
}
