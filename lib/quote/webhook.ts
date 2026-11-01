/** POST a lead to LEAD_WEBHOOK_URL (CRM / automation seam). Never throws; failures are logged. */
export async function postLeadWebhook(url: string, payload: unknown, timeoutMs = 5000): Promise<boolean> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json", "user-agent": "capitaldrywall-quote/1.0" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(timeoutMs),
      cache: "no-store",
    });
    if (!res.ok) {
      console.error(`[quote] lead webhook answered ${res.status}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[quote] lead webhook failed:", err instanceof Error ? err.message : String(err));
    return false;
  }
}
