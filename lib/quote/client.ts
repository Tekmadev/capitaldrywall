/** Browser-side helpers shared by the quote forms. */
import { firstNameOf } from "@/content/site.config";
import type { QuoteInput } from "./schema";

export type SubmitResult =
  | { ok: true; redirect: string }
  | { ok: false; kind: "validation"; fieldErrors: Record<string, string[] | undefined> }
  | { ok: false; kind: "error" };

/** POST a lead as JSON to /api/quote. Never throws. */
export async function submitLead(payload: Record<string, unknown>): Promise<SubmitResult> {
  try {
    const res = await fetch("/api/quote", {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify(payload),
    });
    const body = (await res.json().catch(() => null)) as {
      ok?: boolean;
      redirect?: unknown;
      fieldErrors?: Record<string, string[] | undefined>;
    } | null;
    if (res.ok && body?.ok) {
      const redirect = typeof body.redirect === "string" && body.redirect.startsWith("/") ? body.redirect : "/thank-you";
      return { ok: true, redirect };
    }
    if (res.status === 400 && body?.fieldErrors) return { ok: false, kind: "validation", fieldErrors: body.fieldErrors };
    return { ok: false, kind: "error" };
  } catch {
    return { ok: false, kind: "error" };
  }
}

/** /thank-you greets the visitor by first name ("Thanks, Sam.") from this key */
export const FIRST_NAME_KEY = "cdr:firstName";

export function rememberFirstName(fullName: string): void {
  try {
    sessionStorage.setItem(FIRST_NAME_KEY, firstNameOf(fullName));
  } catch {
    /* storage can be unavailable (private mode); the thank-you page falls back to "Thanks." */
  }
}

/* ── Draft (sessionStorage only: kept while the tab is open, never in localStorage) ── */

const DRAFT_KEY = "cdr:quote-draft";

export type QuoteDraft = {
  values: Partial<QuoteInput>;
  step: 1 | 2 | 3;
  startedAt: number;
  /** Area/size last filled from a link (?area=…): a later link may replace those, never typed text */
  prefill?: { area?: string; size?: string };
};

export function loadDraft(): QuoteDraft | null {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const draft = JSON.parse(raw) as QuoteDraft;
    return draft && typeof draft === "object" && draft.values ? draft : null;
  } catch {
    return null;
  }
}

export function saveDraft(draft: QuoteDraft): void {
  try {
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {
    /* quota or privacy mode: the form still works, it just won't survive a reload */
  }
}

export function clearDraft(): void {
  try {
    sessionStorage.removeItem(DRAFT_KEY);
  } catch {
    /* ignore */
  }
}
