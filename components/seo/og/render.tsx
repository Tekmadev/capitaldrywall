import type { ReactElement } from "react";
import { ImageResponse } from "next/og";
import { pageSeo, type SeoPageKey } from "@/lib/seo";
import { getOgBase, ogFonts } from "./assets";
import { OG_SIZE, ShareCard } from "./ShareCard";

/**
 * Renders a satori element to a PNG Response with the brand fonts. The image is buffered (not
 * streamed) so a render error surfaces here, where the caller can fall back, instead of cutting the
 * response off mid-stream.
 */
export async function toPng(element: ReactElement, { width, height }: { width: number; height: number }) {
  const image = new ImageResponse(element, { width, height, fonts: ogFonts });
  const body = await image.arrayBuffer();
  return new Response(body, { status: image.status, headers: image.headers });
}

/**
 * Renders a page's share card. Used by every opengraph-image.tsx (and, via re-export, every
 * twitter-image.tsx):
 *
 *   export const alt = ogAlt("drywall");
 *   export const size = { width: 1200, height: 630 };
 *   export const contentType = "image/png";
 *   export default function Image() { return renderShareCard("drywall"); }
 *
 * If the background photo ever fails to render, the card is drawn again on graphite with the drawn
 * beam, so a share link never shows a broken image.
 */
export async function renderShareCard(key: SeoPageKey): Promise<Response> {
  const card = pageSeo[key].og ?? pageSeo.home.og!;
  const base = await getOgBase();
  try {
    return await toPng(<ShareCard card={card} base={base} />, OG_SIZE);
  } catch (error) {
    if (!base) throw error;
    console.error(`[og] share card "${key}" failed with the photo, drawing it without`, error);
    return toPng(<ShareCard card={card} base={null} />, OG_SIZE);
  }
}
