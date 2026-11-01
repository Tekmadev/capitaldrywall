/**
 * Shared geometry and timing for the wall-layers scene (brief §7.6). Pure functions only, so the
 * server (static previews) and the client (scroll motion) draw exactly the same states.
 */

export type WallLayer = {
  /** "01" */
  index: string;
  /** "Foundation wall" */
  title: string;
  /** One or two sentences from the copy deck */
  body: string;
};

/** Foundation wall, insulation, vapour barrier, framing, drywall, subfloor */
export const WL_COUNT = 6;

export type WallVariant = "desktop" | "mobile";

/** How far each layer sits from its place when exploded (viewBox units, to the right). */
export const WL_EXPLODE: Record<WallVariant, readonly number[]> = {
  desktop: [0, 90, 170, 250, 330, 330],
  mobile: [0, 70, 130, 190, 250, 250],
};

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** Scene progress (0–1) → assembly position (0–6), with a short hold at both ends. */
export function assemblyAt(progress: number): number {
  return clamp01((progress - 0.04) / 0.88) * WL_COUNT;
}

/** 0 = exploded, 1 = in place. Layer i slides in while the position runs from i to i + 1. */
export function layerAssembly(i: number, q: number): number {
  return i === 0 ? 1 : easeInOut(clamp01(q - i));
}

/** The layer being placed (and described) at assembly position q. */
export function activeLayerAt(q: number): number {
  return Math.max(0, Math.min(WL_COUNT - 1, Math.floor(q)));
}

/** Layers waiting to be placed are drawn ghosted, like future work on a drawing. */
export function layerOpacity(assembly: number): number {
  return 0.26 + 0.74 * assembly;
}
