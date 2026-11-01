"use client";

import { useRef, type ReactNode } from "react";
import { useNearViewport } from "@/lib/inview";
import { cn } from "@/lib/utils";

/**
 * Mounts its children only once the box is within about a screen of the viewport. Used for
 * below-the-fold images that Chrome's native lazy-loading would otherwise fetch during first paint.
 * Until then the children sit in <noscript>: without JS the image (and its alt) still renders, while
 * a scripted browser never parses or fetches it.
 */
export function DeferredMount({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const near = useNearViewport(ref);
  return (
    <div ref={ref} className={cn("absolute inset-0", className)}>
      {near ? children : <noscript>{children}</noscript>}
    </div>
  );
}
