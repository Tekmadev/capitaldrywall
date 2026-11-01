"use client";

import Link from "next/link";
import Script from "next/script";
import { useId, useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type Choice = "granted" | "denied";
type Snapshot = Choice | "unset" | "pending";

const STORAGE_KEY = "cdr.analytics-consent";

/* A tiny store over localStorage (wrapped in try/catch: private modes and blocked storage throw).
   The in-memory copy keeps the choice for this visit when storage is unavailable. */
let memoryChoice: Choice | null = null;
const listeners = new Set<() => void>();

function readChoice(): Snapshot {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "granted" || stored === "denied") return stored;
  } catch {
    /* storage unavailable */
  }
  return memoryChoice ?? "unset";
}

function writeChoice(choice: Choice) {
  memoryChoice = choice;
  try {
    window.localStorage.setItem(STORAGE_KEY, choice);
  } catch {
    /* storage unavailable: the in-memory choice still applies until reload */
  }
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/** GA4, injected only after Accept. The id is validated server-side (ConsentBanner). */
function GoogleAnalytics({ gaId }: { gaId: string }) {
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];window.gtag=function(){window.dataLayer.push(arguments);};window.gtag('js',new Date());window.gtag('config',${JSON.stringify(gaId)});`}
      </Script>
    </>
  );
}

type PanelProps = {
  privacyHref: string;
  onAccept: () => void;
  onDecline: () => void;
  /** Kitchen sink: in place instead of fixed to the viewport */
  inline?: boolean;
};

/** The banner itself: plain question, privacy link, Accept and Decline at equal weight. */
export function ConsentPanel({ privacyHref, onAccept, onDecline, inline }: PanelProps) {
  const headingId = useId();
  return (
    <section
      aria-labelledby={headingId}
      className={cn(
        "surface-dark w-full border border-[color:color-mix(in_srgb,var(--color-plaster)_16%,transparent)] p-5",
        "shadow-[0_18px_40px_-18px_color-mix(in_srgb,var(--color-graphite)_70%,transparent)]",
        inline
          ? "relative max-w-md"
          : "fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-[70] w-auto sm:inset-x-auto sm:left-6 sm:w-[26rem] md:bottom-6",
      )}
    >
      <div className="flex items-center gap-3">
        <span aria-hidden="true" className="h-2 w-2 shrink-0 bg-worklight" />
        <h2 id={headingId} className="t-spec">
          Analytics
        </h2>
      </div>
      <p className="mt-3 text-[0.9375rem] leading-relaxed text-[color:var(--ink)]">
        We&rsquo;d like to use Google Analytics to understand how the site is used. Is that OK?{" "}
        <Link href={privacyHref} className="link-inline text-[color:var(--ink)]">
          Privacy Policy
        </Link>
      </p>
      <div className="mt-5 grid grid-cols-2 gap-2">
        <Button variant="secondary" size="sm" fullWidth onClick={onAccept}>
          Accept
        </Button>
        <Button variant="secondary" size="sm" fullWidth onClick={onDecline}>
          Decline
        </Button>
      </div>
    </section>
  );
}

/**
 * GA4 consent (brief §12–13). Renders nothing until the stored choice is known (no flash for
 * returning visitors), the banner when no choice is stored, and GA4 only after Accept.
 * No focus trap: the banner sits in the page flow for keyboard and screen-reader users.
 */
export function ConsentBannerClient({ gaId, privacyHref }: { gaId: string; privacyHref: string }) {
  const choice = useSyncExternalStore<Snapshot>(subscribe, readChoice, () => "pending");
  if (choice === "pending" || choice === "denied") return null;
  if (choice === "granted") return <GoogleAnalytics gaId={gaId} />;
  return (
    <ConsentPanel
      privacyHref={privacyHref}
      onAccept={() => writeChoice("granted")}
      onDecline={() => writeChoice("denied")}
    />
  );
}

/** Kitchen sink: the banner forced visible; the buttons only record the choice locally (no GA). */
export function ConsentBannerDemo({ privacyHref }: { privacyHref: string }) {
  const [choice, setChoice] = useState<Choice | null>(null);
  if (choice) {
    return (
      <div className="flex max-w-md flex-wrap items-center gap-4">
        <p className="t-spec">Choice recorded (demo): {choice}</p>
        <Button variant="ghost" onClick={() => setChoice(null)}>
          Show again
        </Button>
      </div>
    );
  }
  return (
    <ConsentPanel
      inline
      privacyHref={privacyHref}
      onAccept={() => setChoice("granted")}
      onDecline={() => setChoice("denied")}
    />
  );
}
