/** Small shared helpers for the scroll scenes. */

/** Graphite at `pct`% opacity, from the token (for scrims and gradients) */
export function shade(pct: number): string {
  return `color-mix(in srgb, var(--color-graphite) ${pct}%, transparent)`;
}

/** "Scroll to finish the wall ↓" → ["Scroll to finish the wall", "↓"] so the arrow can bob on its own. */
export function splitArrow(text: string): [string, string | null] {
  const match = text.match(/^(.*?)\s*([↓→↑←])\s*$/u);
  return match ? [match[1], match[2]] : [text, null];
}

/**
 * Keyframes the scenes need, hoisted into <head> once by React (deduped by href), so the shared
 * globals.css stays untouched.
 */
export function SceneKeyframes() {
  return (
    <style href="capital-scene-keyframes" precedence="default">{`
@keyframes cue-bob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(0.3em); } }
`}</style>
  );
}
