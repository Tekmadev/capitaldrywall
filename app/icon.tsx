import { Monogram } from "@/components/seo/og/marks";
import { toPng } from "@/components/seo/og/render";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/** Favicon: the "C" monogram on graphite with an amber raking hairline. */
export default function Icon() {
  return toPng(<Monogram size={size.width} />, size);
}
