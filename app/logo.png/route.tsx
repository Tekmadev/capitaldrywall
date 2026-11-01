import { LogoTile } from "@/components/seo/og/marks";
import { toPng } from "@/components/seo/og/render";

/** /logo.png: the 512 × 512 wordmark tile referenced as `logo` in the sitewide JSON-LD. */
export function GET() {
  return toPng(<LogoTile size={512} />, { width: 512, height: 512 });
}
