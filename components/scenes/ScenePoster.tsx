"use client";

import { getImageProps } from "next/image";
import { useEffect, useRef } from "react";
import type { MediaAsset } from "@/content/media";
import { cn } from "@/lib/utils";
import { MOBILE_SET_QUERY } from "./frame-engine";

type ScenePosterProps = {
  desktop: MediaAsset;
  mobile: MediaAsset;
  /** LCP poster: eager + fetchpriority high. Otherwise lazy. */
  priority?: boolean;
  sizes?: string;
  className?: string;
};

/**
 * Art-directed scene poster: the 9:16 frame under 768 px or in portrait, 16:9 otherwise (the same
 * switch the frame engine uses), object-fit cover. A missing or broken file is hidden so only the
 * surface colour shows (assets can land after the code).
 */
export function ScenePoster({ desktop, mobile, priority = false, sizes = "100vw", className }: ScenePosterProps) {
  const local = useRef<HTMLImageElement>(null);
  const common = {
    alt: desktop.alt,
    sizes,
    loading: priority ? ("eager" as const) : ("lazy" as const),
    fetchPriority: priority ? ("high" as const) : undefined,
  };
  const {
    props: { srcSet: mobileSrcSet },
  } = getImageProps({ ...common, src: mobile.src, width: mobile.width, height: mobile.height, quality: 50 });
  const {
    props: { style: _style, ...img },
  } = getImageProps({ ...common, src: desktop.src, width: desktop.width, height: desktop.height, quality: 75 });

  useEffect(() => {
    const el = local.current;
    if (!el) return;
    const fail = () => {
      el.dataset.failed = "";
    };
    const ok = () => {
      delete el.dataset.failed;
    };
    if (el.complete && el.naturalWidth === 0 && el.currentSrc) fail();
    el.addEventListener("error", fail);
    el.addEventListener("load", ok);
    return () => {
      el.removeEventListener("error", fail);
      el.removeEventListener("load", ok);
    };
  }, []);

  return (
    <picture>
      <source media={MOBILE_SET_QUERY} srcSet={mobileSrcSet} sizes={sizes} />
      {/* eslint-disable-next-line jsx-a11y/alt-text -- art-directed next/image props (getImageProps); alt from the media registry */}
      <img
        {...img}
        ref={local}
        // 1 px short of the stage on purpose: Chrome treats an image that covers the whole viewport as a
        // background and skips it for LCP. A graphite hairline under the dark scrim is invisible, and it
        // keeps the poster counted as the hero's LCP element (brief §16).
        className={cn(
          "absolute inset-x-0 top-0 h-[calc(100%-1px)] w-full object-cover text-transparent data-[failed]:invisible",
          className,
        )}
      />
    </picture>
  );
}
