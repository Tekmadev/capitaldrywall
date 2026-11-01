/**
 * "Mon–Sat, 7 am – 7 pm" → keeps "7 am" and "7 pm" on one line (no-break spaces), so narrow cells
 * break hours only between their parts. Pair with `text-balance` on a block element.
 */
export function formatHours(hours: string): string {
  return hours.replace(/(\d)\s+(am|pm)\b/gi, "$1 $2");
}
