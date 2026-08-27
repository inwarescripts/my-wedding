"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import type { CoupleInfo } from "@/types/wedding-config";
import { isVideoUrl } from "@/lib/media";
import { hasWebGL } from "@/lib/hasWebGL";
import { getColorThemePalette, themeCssVars } from "@/motion/registry/theme";
import { useCountdown } from "@/lib/useCountdown";
import { getLenisInstance } from "@/lib/smooth-scroll";

export type OpeningVariant =
  | "particleBloom"
  | "silkWave"
  | "goldenRings"
  | "heartRibbon"
  | "roseRibbon";

export const openingRegistry: Record<OpeningVariant, { label: string }> = {
  particleBloom: { label: "Dải hạt sáng 3D" },
  silkWave: { label: "Lụa 3D uốn lượn" },
  goldenRings: { label: "Nhẫn cưới 3D xoay" },
  heartRibbon: { label: "Dải trái tim 3D" },
  roseRibbon: { label: "Dải hoa hồng 3D" },
};

// Shown while the WebGL chunk itself is still downloading, and while we're
// still detecting whether 3D is even usable — so nothing ever flashes the
// static cover photo just before swapping to the 3D scene.
function SceneLoading() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <span className="relative flex h-3 w-3">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ivory/40" />
        <span className="relative inline-flex h-3 w-3 rounded-full bg-ivory/70" />
      </span>
    </div>
  );
}

const ParticleBloom = dynamic(
  () => import("@/three/openings/ParticleBloom").then((m) => m.ParticleBloom),
  { ssr: false, loading: SceneLoading }
);
const SilkWave = dynamic(
  () => import("@/three/openings/SilkWave").then((m) => m.SilkWave),
  { ssr: false, loading: SceneLoading }
);
const GoldenRings = dynamic(
  () => import("@/three/openings/GoldenRings").then((m) => m.GoldenRings),
  { ssr: false, loading: SceneLoading }
);
const HeartRibbon = dynamic(
  () => import("@/three/openings/HeartRibbon").then((m) => m.HeartRibbon),
  { ssr: false, loading: SceneLoading }
);
const RoseRibbon = dynamic(
  () => import("@/three/openings/RoseRibbon").then((m) => m.RoseRibbon),
  { ssr: false, loading: SceneLoading }
);

interface OpeningProps {
  couple: CoupleInfo;
  variant?: string;
  colorTheme?: string;
  showCountdown?: boolean;
  onEnter: () => void;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")} . ${String(
    d.getMonth() + 1
  ).padStart(2, "0")} . ${d.getFullYear()}`;
}

export function Opening({
  couple,
  variant = "particleBloom",
  colorTheme = "classic",
  showCountdown = false,
  onEnter,
}: OpeningProps) {
  const [entering, setEntering] = useState(false);
  const [hidden, setHidden] = useState(false);
  // null = still detecting capability (first paint) — deliberately distinct
  // from `false` so we never render the static-photo fallback for a single
  // frame before flipping over to the 3D scene once detection resolves.
  const [use3d, setUse3d] = useState<boolean | null>(null);

  useEffect(() => {
    // These 3 scenes are all cheap (a few hundred points / one plane / two
    // tori, capped dpr, low-power GPU preference) — real phones handle them
    // fine, so unlike the 3D gallery there's no screen-size cutoff here.
    // Only accessibility (reduced motion) and actual WebGL support gate it.
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUse3d(!prefersReduced && hasWebGL());
  }, []);

  // The gate is `fixed`, which only covers the page visually — it doesn't
  // stop wheel/touch input from reaching the document underneath, and Lenis
  // (smooth-scroll.tsx) converts that into a real scroll of the page behind
  // the gate. Without this, a guest who scrolls while still looking at the
  // opening screen lands mid-page (not the top) the moment they tap in, and
  // the intro auto-scroll tour (autoScrollTour.ts, which starts from
  // whatever `window.scrollY` happens to be) inherits the same offset.
  //
  // Locking via `<html>` overflow rather than `lenis.stop()`: Opening sits
  // deep in the tree under SmoothScrollProvider, so React fires its mount
  // effect *before* SmoothScrollProvider's own effect creates the Lenis
  // instance (child effects run before the parent's) — getLenisInstance()
  // is still null at this point, so calling .stop() here would silently do
  // nothing. Removing the document's scrollable area works regardless of
  // whether Lenis exists yet, since it leaves Lenis nothing to move.
  useEffect(() => {
    window.scrollTo(0, 0);
    const html = document.documentElement;
    const prevOverflow = html.style.overflow;
    html.style.overflow = "hidden";
    return () => {
      html.style.overflow = prevOverflow;
    };
  }, []);

  function handleEnter() {
    if (entering) return;
    setEntering(true);
    document.documentElement.style.overflow = "";
    window.scrollTo(0, 0);
    getLenisInstance()?.scrollTo(0, { immediate: true });
    onEnter();
    window.setTimeout(() => setHidden(true), 1300);
  }

  if (hidden) return null;

  const palette = getColorThemePalette(colorTheme);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-ink"
        initial={{ opacity: 1 }}
        animate={entering ? { opacity: 0 } : { opacity: 1 }}
        transition={{ duration: 1.1, ease: [0.65, 0, 0.35, 1] }}
        style={{ pointerEvents: entering ? "none" : "auto", ...themeCssVars(colorTheme) }}
        // Lenis (smooth-scroll.tsx) listens for wheel/touch on `window`, so
        // `overflow: hidden` on <html> alone doesn't stop it — it converts
        // these into a real scroll of the page underneath regardless.
        // Stopping propagation here, at the gate's own node, keeps the
        // event from ever bubbling up to Lenis's listener while the gate is
        // shown (harmless once `entering`, since pointerEvents is already
        // "none" by then and this node stops receiving input at all).
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
      >
        {use3d === null ? (
          <SceneLoading />
        ) : use3d ? (
          <div className="absolute inset-0">
            {variant === "silkWave" ? (
              <SilkWave palette={palette} />
            ) : variant === "goldenRings" ? (
              <GoldenRings palette={palette} />
            ) : variant === "heartRibbon" ? (
              <HeartRibbon palette={palette} />
            ) : variant === "roseRibbon" ? (
              <RoseRibbon palette={palette} />
            ) : (
              <ParticleBloom palette={palette} />
            )}
          </div>
        ) : (
          // Devices without WebGL (or with reduced-motion/small screens) fall
          // back to the couple's own cover photo with a slow Ken-Burns zoom —
          // still cinematic, just not 3D.
          couple.coverImage && (
            <motion.div
              className="absolute inset-0"
              initial={{ scale: 1.1 }}
              animate={{ scale: 1.24 }}
              transition={{ duration: 22, repeat: Infinity, repeatType: "mirror", ease: "linear" }}
            >
              {isVideoUrl(couple.coverImage) ? (
                <video
                  src={couple.coverImage}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="h-full w-full object-cover opacity-40"
                />
              ) : (
                <Image
                  src={couple.coverImage}
                  alt=""
                  fill
                  priority
                  sizes="130vw"
                  quality={90}
                  className="object-cover opacity-40"
                />
              )}
            </motion.div>
          )
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-ink/60 via-ink/40 to-ink/70" />

        <motion.button
          type="button"
          onClick={handleEnter}
          className="relative z-10 flex flex-col items-center gap-6 px-8 text-center text-ivory cursor-pointer"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="text-xs tracking-[0.4em] uppercase text-ivory/70">
            The Wedding Of
          </span>

          <span className="font-script text-6xl md:text-8xl leading-none">
            {couple.displayName}
          </span>

          <span className="mt-2 flex items-center gap-4 text-sm tracking-widest text-ivory/85 md:text-base">
            <span className="h-px w-8 bg-ivory/40" />
            {formatDate(couple.weddingDate)}
            <span className="h-px w-8 bg-ivory/40" />
          </span>

          {showCountdown && <GateCountdown weddingDate={couple.weddingDate} />}

          <span className="mt-10 inline-flex items-center gap-2 rounded-full border border-ivory/40 px-6 py-3 text-xs tracking-[0.25em] uppercase">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ivory/60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-ivory" />
            </span>
            Chạm để mở câu chuyện
          </span>
        </motion.button>
      </motion.div>
    </AnimatePresence>
  );
}

function GateCountdown({ weddingDate }: { weddingDate: string }) {
  const time = useCountdown(weddingDate);
  const units: [string, number][] = [
    ["Ngày", time?.days ?? 0],
    ["Giờ", time?.hours ?? 0],
    ["Phút", time?.minutes ?? 0],
    ["Giây", time?.seconds ?? 0],
  ];

  return (
    <div className="mt-6 flex items-center gap-3 md:gap-5">
      {units.map(([label, value]) => (
        <div key={label} className="flex flex-col items-center">
          <span className="font-heading text-2xl tabular-nums text-ivory md:text-3xl">
            {String(value).padStart(2, "0")}
          </span>
          <span className="mt-1 text-[10px] tracking-[0.2em] uppercase text-ivory/60">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}
