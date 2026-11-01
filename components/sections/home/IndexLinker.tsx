"use client";

import { useEffect, useRef, type ReactNode } from "react";

type IndexLinkerProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Tiny island for the secondary-services index: hovering (mouse/pen) or focusing a
 * `[data-index-row]` marks every `[data-index-key]` element with the same key `data-active`
 * (the row, its frame image and its caption). The last row stays lit, so the frame never empties.
 * The server renders the first key active, which is also the no-JS state. Attributes only, no state.
 */
export function IndexLinker({ children, className }: IndexLinkerProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    let current: string | null = null;

    const set = (key: string | null) => {
      if (key === null || key === current) return;
      current = key;
      root.querySelectorAll<HTMLElement>("[data-index-key]").forEach((el) => {
        el.toggleAttribute("data-active", el.dataset.indexKey === key);
      });
    };
    const keyOf = (target: EventTarget | null) =>
      target instanceof Element
        ? (target.closest<HTMLElement>("[data-index-row]")?.dataset.indexKey ?? null)
        : null;

    const onOver = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      set(keyOf(event.target));
    };
    const onFocusIn = (event: FocusEvent) => set(keyOf(event.target));

    root.addEventListener("pointerover", onOver);
    root.addEventListener("focusin", onFocusIn);
    return () => {
      root.removeEventListener("pointerover", onOver);
      root.removeEventListener("focusin", onFocusIn);
    };
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
