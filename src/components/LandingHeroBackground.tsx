"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { hasWebGL } from "@/lib/hasWebGL";
import { colorThemeRegistry } from "@/motion/registry/theme";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const HeartRibbon = dynamic(
  () => import("@/three/openings/HeartRibbon").then((m) => m.HeartRibbon),
  { ssr: false }
);

/** A quiet 3D heart traced in glowing particles behind the landing page's
 * hero copy — same lightweight scene already used on wedding opening
 * screens, tinted from the site's own default palette. Purely decorative,
 * so it's gated behind the same WebGL/reduced-motion checks and wrapped in
 * an error boundary as everywhere else this scene is used — a failed
 * texture/context here should never take the marketing page down with it. */
export function LandingHeroBackground() {
  const [use3d, setUse3d] = useState(false);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUse3d(!prefersReduced && hasWebGL());
  }, []);

  if (!use3d) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-0 opacity-70">
      <ErrorBoundary fallback={null}>
        <HeartRibbon palette={colorThemeRegistry.classic.colors} />
      </ErrorBoundary>
    </div>
  );
}
