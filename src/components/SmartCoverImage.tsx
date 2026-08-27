"use client";

import { useState, type SyntheticEvent } from "react";
import Image from "next/image";

/**
 * A full-bleed cover photo that only crops when it's actually safe to.
 * Measures the loaded image's real aspect ratio and compares it to the
 * viewport's: a landscape photo close to the viewport's own ratio still
 * uses `object-cover` (fills edge-to-edge, negligible crop, matches how
 * this looked before). A portrait or square photo — very common for a
 * couple's cover shot — would lose most of its width to `cover`'s crop, so
 * it switches to `object-contain` (nothing cut off) backed by a blurred,
 * cover-cropped copy of the same image filling the space around it instead
 * of empty bars.
 */
export function SmartCoverImage({
  src,
  alt,
  sizes,
  quality = 90,
  priority = false,
  imageClassName = "",
  backdropClassName = "",
}: {
  src: string;
  alt: string;
  sizes: string;
  quality?: number;
  priority?: boolean;
  imageClassName?: string;
  backdropClassName?: string;
}) {
  const [isNarrow, setIsNarrow] = useState(false);

  function handleLoad(e: SyntheticEvent<HTMLImageElement>) {
    const img = e.currentTarget;
    if (!img.naturalWidth || !img.naturalHeight || typeof window === "undefined") return;
    const imageRatio = img.naturalWidth / img.naturalHeight;
    const viewportRatio = window.innerWidth / window.innerHeight;
    // Some margin below the viewport's own ratio — a photo just a bit
    // narrower than the screen still crops acceptably with `cover`; only
    // meaningfully narrower (portrait-ish) photos need the swap.
    setIsNarrow(imageRatio < viewportRatio - 0.15);
  }

  return (
    <>
      {isNarrow && (
        <Image
          src={src}
          alt=""
          aria-hidden
          fill
          sizes={sizes}
          quality={Math.min(quality, 40)}
          className={`scale-110 object-cover blur-2xl ${backdropClassName}`}
        />
      )}
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        quality={quality}
        onLoad={handleLoad}
        className={`${isNarrow ? "object-contain" : "object-cover"} ${imageClassName}`}
      />
    </>
  );
}
