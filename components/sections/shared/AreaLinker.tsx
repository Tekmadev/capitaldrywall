"use client";

import { useEffect, useRef, type ReactNode } from "react";

type AreaLinkerProps = {
  children: ReactNode;
  className?: string;
  /** Area key (slug) highlighted on mount: static screenshots of the hover state */
  initialActive?: string;
};

/**
 * Tiny island linking the server-rendered map points and area list: hovering or focusing any
 * [data-area] element marks every element with the same key `data-active` (and the root
 * `data-has-active`), so a list item lights its point and a point lights its list item.
 * No React state: attributes only, styled with CSS.
 */
export function AreaLinker({ children, className, initialActive }: AreaLinkerProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    let current: string | null = null;

    const set = (key: string | null) => {
      if (key === current) return;
      current = key;
      root.querySelectorAll<Element>("[data-area]").forEach((el) => {
        el.toggleAttribute("data-active", key !== null && el.getAttribute("data-area") === key);
      });
      root.toggleAttribute("data-has-active", key !== null);
    };
    const keyOf = (target: EventTarget | null) =>
      target instanceof Element ? (target.closest("[data-area]")?.getAttribute("data-area") ?? null) : null;

    const onOver = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      set(keyOf(event.target));
    };
    const onLeave = () => {
      const focused = keyOf(document.activeElement);
      set(root.contains(document.activeElement) ? focused : null);
    };
    const onFocusIn = (event: FocusEvent) => set(keyOf(event.target));
    const onFocusOut = (event: FocusEvent) => {
      if (!root.contains(event.relatedTarget as Node | null)) set(null);
    };

    root.addEventListener("pointerover", onOver);
    root.addEventListener("pointerleave", onLeave);
    root.addEventListener("focusin", onFocusIn);
    root.addEventListener("focusout", onFocusOut);
    if (initialActive) set(initialActive);

    return () => {
      root.removeEventListener("pointerover", onOver);
      root.removeEventListener("pointerleave", onLeave);
      root.removeEventListener("focusin", onFocusIn);
      root.removeEventListener("focusout", onFocusOut);
      set(null);
    };
  }, [initialActive]);

  return (
    <div ref={ref} className={["group/areas", className].filter(Boolean).join(" ")}>
      {children}
    </div>
  );
}
