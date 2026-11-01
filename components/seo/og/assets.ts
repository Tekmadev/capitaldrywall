/**
 * Server-only assets for next/og (share cards, icons, logo).
 *
 * Fonts: satori needs static TTF/OTF/WOFF instances (no variable fonts, no woff2), so assets/fonts
 * holds Archivo at wdth 125 / wght 800 and IBM Plex Mono 500 (SIL OFL, licences beside them).
 *
 * Base photo: assets/og/og-base.jpg (brief §8.5) is checked with fs on every render, so the card
 * picks it up as soon as it exists and falls back to a drawn graphite + amber beam until then.
 * Brand rule: light only ever comes from the left and low. If the photo's beam enters from the
 * right, it is mirrored before use.
 *
 * Nothing in here may throw at module load: page metadata imports the image modules for their
 * `alt`/`size` exports, so a failure here must degrade the image, never break a page.
 */
import { readFile } from "node:fs/promises";
import { statSync } from "node:fs";
import { join } from "node:path";

export const OG_FONT = { display: "Archivo Expanded", mono: "Plex Mono" } as const;

type OgFont = { name: string; data: Buffer; weight: 500 | 800; style: "normal" };

async function loadFonts(): Promise<OgFont[] | undefined> {
  try {
    const [display, mono] = await Promise.all([
      readFile(join(process.cwd(), "assets/fonts/Archivo-Expanded-ExtraBold.ttf")),
      readFile(join(process.cwd(), "assets/fonts/IBMPlexMono-Medium.ttf")),
    ]);
    return [
      { name: OG_FONT.display, data: display, weight: 800, style: "normal" },
      { name: OG_FONT.mono, data: mono, weight: 500, style: "normal" },
    ];
  } catch (error) {
    console.error("[og] fonts missing in assets/fonts, using the default face", error);
    return undefined;
  }
}

/** Static font instances, read once (they never change at runtime). */
export const ogFonts = await loadFonts();

const BASE_PATH = join(process.cwd(), "assets/og/og-base.jpg");

let baseCache: { key: string; src: string } | null = null;

/** Encode the photo for the card: cover-crop to 1200×630 and mirror it if its light comes from the right. */
async function encodeBase(file: Buffer): Promise<string> {
  try {
    const { default: sharp } = await import("sharp");
    // Mean luminance of the left vs right half decides which side the beam enters from.
    const probe = await sharp(file).resize(16, 1, { fit: "fill" }).greyscale().raw().toBuffer();
    let left = 0;
    let right = 0;
    probe.forEach((value, i) => (i < 8 ? (left += value) : (right += value)));
    const cover = sharp(file).resize(1200, 630, { fit: "cover", position: "centre" });
    const out = await (right > left * 1.1 ? cover.flop() : cover).jpeg({ quality: 86, mozjpeg: true }).toBuffer();
    return `data:image/jpeg;base64,${out.toString("base64")}`;
  } catch {
    // sharp unavailable: use the photo exactly as delivered.
    return `data:image/jpeg;base64,${file.toString("base64")}`;
  }
}

/**
 * The share-card background as a data URI, or null when assets/og/og-base.jpg doesn't exist yet.
 * The existence check runs on every render; the encode is cached until the file changes.
 */
export async function getOgBase(): Promise<string | null> {
  try {
    const info = statSync(BASE_PATH, { throwIfNoEntry: false });
    if (!info?.isFile()) return null;
    const key = `${info.mtimeMs}:${info.size}`;
    if (baseCache?.key !== key) {
      baseCache = { key, src: await encodeBase(await readFile(BASE_PATH)) };
    }
    return baseCache.src;
  } catch {
    return null;
  }
}

// Warm the cache at module load so a render normally does no I/O beyond the stat.
await getOgBase();
