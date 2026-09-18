"use client";

import { useState } from "react";
import NextImage, { type ImageProps } from "next/image";

/**
 * Drop-in replacement for next/image. Normally goes through Vercel's Image
 * Optimization (`/_next/image`) like a plain `next/image` would — but if
 * that request ever fails (e.g. a 402 once the hosting account's Image
 * Optimization quota is exceeded, as happened before — see next.config.ts),
 * it falls back to serving the original source directly instead of
 * showing a broken image.
 */
export default function AppImage(props: ImageProps) {
  const [failed, setFailed] = useState(false);

  return (
    <NextImage
      {...props}
      unoptimized={failed || props.unoptimized}
      onError={(e) => {
        setFailed(true);
        props.onError?.(e);
      }}
    />
  );
}
