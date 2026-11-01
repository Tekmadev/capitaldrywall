import { renderShareCard } from "@/components/seo/og/render";
import { ogAlt } from "@/lib/seo";

export const alt = ogAlt("freeQuote");
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return renderShareCard("freeQuote");
}
