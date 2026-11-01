import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        "t-display-xl",
        "t-display-l",
        "t-h2",
        "t-h3",
        "t-lede",
        "t-spec",
        "text-display-xl",
        "text-display-l",
        "text-h2",
        "text-h3",
        "text-lede",
        "text-body",
        "text-spec",
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** "Drywall repair" → "drywall-repair" */
export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Canadian currency, no cents: 30000 → "$30,000" */
export function formatCAD(value: number): string {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 0,
  }).format(value);
}

/** Two-digit index labels: 1 → "01" */
export function pad2(n: number): string {
  return String(n).padStart(2, "0");
}
