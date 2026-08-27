import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.s3.*.amazonaws.com",
        pathname: "/**",
      },
    ],
    // AVIF was here too, but Next/sharp's AVIF encoder visibly softens
    // detailed photo content (hair, flowers, fabric) at the same `quality`
    // number WebP renders crisp — confirmed by diffing /_next/image output
    // for the same source at q=90: AVIF came out 173KB vs WebP's 428KB for
    // a noticeably blurrier result. Wedding photos are exactly the
    // detail-heavy case that suffers most, so WebP-only trades a bit of
    // bandwidth for images that actually look sharp.
    formats: ["image/webp"],
    // Next 16 clamps any `quality` prop to the nearest value in this
    // allowlist — without it every <Image> silently falls back to the
    // default 75, which over-compresses full-bleed wedding photos.
    qualities: [75, 90, 100],
  },
};

export default nextConfig;
