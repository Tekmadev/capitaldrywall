import localFont from "next/font/local";
import { IBM_Plex_Mono } from "next/font/google";

/**
 * Display: Archivo variable (OFL, google/fonts), partially instanced to the ranges the design uses
 * (wght 400–820, wdth 100–125) and subset to Latin + typographic punctuation: 52 KB instead of 88 KB.
 * Width is set per style with font-stretch (100–125%). Rebuild: see assets/fonts/README.md.
 */
export const archivo = localFont({
  src: "../assets/fonts/archivo-display.woff2",
  variable: "--font-archivo",
  display: "swap",
  weight: "400 820",
  style: "normal",
  declarations: [{ prop: "font-stretch", value: "100% 125%" }],
  adjustFontFallback: "Arial",
});

/**
 * Body: IBM Plex Sans (OFL, google/fonts), instanced to wght 400–500 at normal width and subset to
 * Latin: one 32 KB file for both weights. Renamed internally to "CDR Text" because "Plex" is a
 * Reserved Font Name and a subset is a Modified Version under the OFL. See assets/fonts/README.md.
 */
export const plexSans = localFont({
  src: "../assets/fonts/cdr-text.woff2",
  variable: "--font-plex-sans",
  display: "swap",
  weight: "400 500",
  style: "normal",
  adjustFontFallback: "Arial",
});

/** Spec labels: IBM Plex Mono 500 only. */
export const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["500"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const fontVariables = `${archivo.variable} ${plexSans.variable} ${plexMono.variable}`;
