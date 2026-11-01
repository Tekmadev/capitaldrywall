/**
 * Raking Light colours for next/og. Satori renders outside the browser and cannot read the CSS
 * variables in app/globals.css, so this file mirrors those @theme tokens. Keep the two in sync.
 */
export const ogColor = {
  plaster: "#F2EFE9",
  plaster2: "#E7E2D9",
  compound: "#CFC8BC",
  graphite: "#141518",
  graphite2: "#1E2024",
  steel: "#6B6F76",
  steelLight: "#9A9EA5",
  worklight: "#F4A62A",
  worklightDeep: "#C77F0E",
  /** 8 % white hairline on dark (surface-dark --hairline), a touch stronger for small renders */
  hairline: "rgba(242, 239, 233, 0.16)",
  hairlineFaint: "rgba(242, 239, 233, 0.08)",
} as const;

/** `rake-line` utility: amber hairline that grazes in from the left and fades out. */
export const rakeGradient =
  "linear-gradient(90deg, rgba(244, 166, 42, 0) 0%, rgba(244, 166, 42, 0.9) 14%, rgba(244, 166, 42, 0.4) 52%, rgba(244, 166, 42, 0) 88%)";

/** `beam-rake` utility, drawn: a warm work light grazing a dark wall from the left and low. */
export const beamGradient = [
  "radial-gradient(ellipse 760px 300px at -60px 205px, rgba(244, 166, 42, 0.34) 0%, rgba(244, 166, 42, 0.12) 46%, rgba(244, 166, 42, 0) 100%)",
  "radial-gradient(ellipse 1100px 520px at -140px 250px, rgba(199, 127, 14, 0.18) 0%, rgba(199, 127, 14, 0) 100%)",
].join(", ");
