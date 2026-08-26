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
    formats: ["image/avif", "image/webp"],
    // Next 16 clamps any `quality` prop to the nearest value in this
    // allowlist — without it every <Image> silently falls back to the
    // default 75, which over-compresses full-bleed wedding photos.
    qualities: [75, 90, 100],
  },
};

export default nextConfig;
