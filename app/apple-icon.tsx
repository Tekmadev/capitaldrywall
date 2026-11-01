import { Monogram } from "@/components/seo/og/marks";
import { toPng } from "@/components/seo/og/render";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Apple touch icon (iOS rounds the corners; the hairline sits above the corner curve). */
export default function AppleIcon() {
  return toPng(<Monogram size={size.width} />, size);
}
