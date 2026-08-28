"use client";

import { useEffect, useState, type CSSProperties } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import type { CoupleInfo } from "@/types/wedding-config";
import { isVideoUrl } from "@/lib/media";
import { SmartCoverImage } from "@/components/SmartCoverImage";
import { hasWebGL } from "@/lib/hasWebGL";
import { getColorThemePalette, themeCssVars } from "@/motion/registry/theme";
import { useCountdown } from "@/lib/useCountdown";
import { getLenisInstance } from "@/lib/smooth-scroll";

export type OpeningVariant =
  | "particleBloom"
  | "silkWave"
  | "goldenRings"
  | "heartRibbon"
  | "roseRibbon"
  | "doubleHappiness"
  | "redDoor"
  | "curtain"
  | "envelope";

export const openingRegistry: Record<OpeningVariant, { label: string }> = {
  particleBloom: { label: "Dải hạt sáng 3D" },
  silkWave: { label: "Lụa 3D uốn lượn" },
  goldenRings: { label: "Nhẫn cưới 3D xoay" },
  heartRibbon: { label: "Dải trái tim 3D" },
  roseRibbon: { label: "Dải hoa hồng 3D" },
  doubleHappiness: { label: "Ấn Hỉ vàng son 3D" },
  redDoor: { label: "Cửa cưới đóng mở" },
  curtain: { label: "Rèm nhung khép mở" },
  envelope: { label: "Mở thiệp thư" },
};

// Scenes with their own fixed festive palette, independent of the site's
// selected colour theme — same reasoning as DOM_OPENING_VARIANTS below.
// Gets a matching deep-red backdrop behind the Canvas instead of the
// default bg-ink, since the look is specifically "red and gold", not
// whatever colorTheme happens to be active.
const RED_GOLD_3D_VARIANTS = new Set<OpeningVariant>(["doubleHappiness"]);

// These three render as plain DOM/CSS overlays (no WebGL), driven directly
// by the `entering` flag below — unlike the five 3D scenes above (ambient
// background animations that don't react to the click), they visibly open
// *in response to* the tap, so they need to be told when that happens.
const DOM_OPENING_VARIANTS = new Set<OpeningVariant>(["redDoor", "curtain", "envelope"]);

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
const DoubleHappiness = dynamic(
  () => import("@/three/openings/DoubleHappiness").then((m) => m.DoubleHappiness),
  { ssr: false, loading: SceneLoading }
);

interface OpeningProps {
  couple: CoupleInfo;
  variant?: string;
  colorTheme?: string;
  showCountdown?: boolean;
  onEnter: () => void;
}

// The couple's cover photo/video with a slow Ken-Burns zoom — shared by the
// WebGL-less fallback for the 3D scenes and by the DOM opening variants
// below, which layer their own overlay on top of it instead of a 3D scene.
// `entering` is only passed by the DOM opening variants below — when given,
// the backdrop drifts from a soft dreamy blur into full focus as the
// doors/curtain/iris open, instead of snapping sharp immediately. The
// WebGL-less 3D fallback call site doesn't pass it, so it's unaffected.
function CoverBackdrop({ couple, entering }: { couple: CoupleInfo; entering?: boolean }) {
  if (!couple.coverImage) return null;
  const media = (
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
        <SmartCoverImage
          src={couple.coverImage}
          alt=""
          sizes="130vw"
          quality={90}
          priority
          imageClassName="opacity-40"
          backdropClassName="opacity-30"
        />
      )}
    </motion.div>
  );

  if (entering === undefined) return media;

  return (
    <motion.div
      className="absolute inset-0"
      initial={false}
      animate={{ filter: entering ? "blur(0px)" : "blur(16px)" }}
      transition={DOOR_OPEN_TRANSITION}
    >
      {media}
    </motion.div>
  );
}

/** Soft, slowly-drifting glowing orbs — the "mờ ảo" (hazy, dreamlike) layer
 * that gives the gate a romantic, poetic atmosphere even before it's tapped.
 * Screen-blended so it only ever brightens/glows rather than muddying the
 * colours beneath it. Always on (not gated to `entering`) — it's ambience
 * for the closed gate, not part of the open transition itself. */
function DreamyMist() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <span className="dreamy-orb dreamy-orb-a" />
      <span className="dreamy-orb dreamy-orb-b" />
      <span className="dreamy-orb dreamy-orb-c" />
      <style>{`
        .dreamy-orb {
          position: absolute;
          border-radius: 9999px;
          filter: blur(46px);
          opacity: 0.55;
          mix-blend-mode: screen;
        }
        .dreamy-orb-a {
          left: 8%; top: 12%; width: 220px; height: 220px;
          background: radial-gradient(circle, rgba(212,175,55,0.5) 0%, rgba(212,175,55,0) 70%);
          animation: wedding-dreamy-drift 15s ease-in-out infinite;
        }
        .dreamy-orb-b {
          right: 6%; top: 52%; width: 260px; height: 260px;
          background: radial-gradient(circle, rgba(255,182,193,0.4) 0%, rgba(255,182,193,0) 70%);
          animation: wedding-dreamy-drift 19s ease-in-out infinite reverse;
        }
        .dreamy-orb-c {
          left: 46%; bottom: 6%; width: 200px; height: 200px;
          background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 70%);
          animation: wedding-dreamy-drift 21s ease-in-out infinite;
        }
        @keyframes wedding-dreamy-drift {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(22px, -18px, 0) scale(1.15); }
        }
        @media (prefers-reduced-motion: reduce) {
          .dreamy-orb { animation: none; }
        }
      `}</style>
    </div>
  );
}

// Same duration/easing for all three DOM openings — slow enough to actually
// read as doors swinging/curtains gathering rather than a snap, and to give
// the backdrop's blur-to-focus (see CoverBackdrop above) room to be felt.
// A touch faster than the gate's own opacity fade (see `entering` on the
// outer motion.div in Opening) so the motion visibly finishes while the
// gate is still opaque enough to see it, instead of being swallowed by the
// fade.
const DOOR_OPEN_TRANSITION = { duration: 1.35, ease: [0.65, 0, 0.35, 1] as const };

/** Two ornate red door panels (gold diamond brocade texture, gilded seam
 * trim, the traditional "long phụng" dragon-and-phoenix pair curling up
 * each panel toward the centre) with the real "囍" seal image sitting over
 * the seam — classic Chinese/Vietnamese wedding gate doors. Dragon
 * (rong.webp, groom) on the left, phoenix (phung.webp, bride) on the
 * right — each panel is roomy enough for the artwork to actually read,
 * unlike the short/wide envelope card in EnvelopeOverlay, which had to
 * drop it. On tap the panels swing apart off-screen and the seal shatters
 * back and fades. */
function RedDoorOverlay({ entering }: { entering: boolean }) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <motion.div
        className="door-brocade absolute inset-y-0 left-0 w-1/2 overflow-hidden border-r-[6px] border-[#d4af37]/85"
        initial={false}
        animate={entering ? { x: "-100%", filter: "blur(3px)" } : { x: "0%", filter: "blur(0px)" }}
        transition={DOOR_OPEN_TRANSITION}
      >
        <div className="pointer-events-none absolute inset-3 rounded-lg border border-[#d4af37]/30" />
        {/* rong.webp is dark maroon line-art — nearly invisible against the
            red brocade at any opacity. Recoloured to solid gold via a CSS
            mask (the art's alpha channel becomes the shape, fill colour is
            ours) instead of showing the image's own colour, so it actually
            reads against the door. */}
        <div
          aria-hidden
          className="dragon-mask pointer-events-none absolute bottom-[6%] right-[-6%] w-[95%] opacity-80 drop-shadow-[0_6px_14px_rgba(0,0,0,0.5)]"
          style={{ aspectRatio: "1424 / 1338" }}
        />
      </motion.div>
      <motion.div
        className="door-brocade absolute inset-y-0 right-0 w-1/2 overflow-hidden border-l-[6px] border-[#d4af37]/85"
        initial={false}
        animate={entering ? { x: "100%", filter: "blur(3px)" } : { x: "0%", filter: "blur(0px)" }}
        transition={DOOR_OPEN_TRANSITION}
      >
        <div className="pointer-events-none absolute inset-3 rounded-lg border border-[#d4af37]/30" />
        <div
          aria-hidden
          className="phoenix-mask pointer-events-none absolute bottom-[6%] left-[-6%] w-[95%] opacity-80 drop-shadow-[0_6px_14px_rgba(0,0,0,0.5)]"
          style={{ aspectRatio: "1241 / 1278", transform: "scaleX(-1)" }}
        />
      </motion.div>
      <motion.div
        className="absolute left-1/2 top-1/2 flex h-24 w-24 items-center justify-center rounded-full bg-[#4a0a12] shadow-[0_8px_24px_rgba(0,0,0,0.55)] md:h-28 md:w-28"
        initial={false}
        style={{ x: "-50%", y: "-50%" }}
        animate={
          entering
            ? { scale: 0.3, opacity: 0, rotate: 20 }
            : { scale: 1, opacity: 1, rotate: 0 }
        }
        transition={{ duration: 0.85, ease: "easeIn" }}
      >
        <Image src="/flower/chu-hy.webp" alt="" width={112} height={112} className="h-[86%] w-[86%]" />
      </motion.div>
      <style>{`
        .door-brocade {
          background-color: #7a1120;
          background-image:
            linear-gradient(45deg, rgba(212,175,55,0.16) 25%, transparent 25%, transparent 75%, rgba(212,175,55,0.16) 75%),
            linear-gradient(45deg, rgba(212,175,55,0.16) 25%, transparent 25%, transparent 75%, rgba(212,175,55,0.16) 75%);
          background-size: 36px 36px;
          background-position: 0 0, 18px 18px;
        }
        .dragon-mask, .phoenix-mask {
          background-color: #d4af37;
          -webkit-mask-size: contain;
          mask-size: contain;
          -webkit-mask-repeat: no-repeat;
          mask-repeat: no-repeat;
          -webkit-mask-position: center;
          mask-position: center;
        }
        .dragon-mask {
          -webkit-mask-image: url(/flower/rong.webp);
          mask-image: url(/flower/rong.webp);
        }
        .phoenix-mask {
          -webkit-mask-image: url(/flower/phung.webp);
          mask-image: url(/flower/phung.webp);
        }
      `}</style>
    </div>
  );
}

/** A heavy velvet curtain, gathered open with gold tassels — panels shrink
 * and slide off to each side on tap, like a stage curtain drawing open. */
function CurtainOverlay({ entering }: { entering: boolean }) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <motion.div
        className="curtain-velvet absolute inset-y-0 left-0 w-1/2 origin-left"
        initial={false}
        animate={
          entering
            ? { x: "-90%", scaleX: 0.35, filter: "blur(3px)" }
            : { x: "0%", scaleX: 1, filter: "blur(0px)" }
        }
        transition={DOOR_OPEN_TRANSITION}
      >
        <span className="absolute bottom-8 right-4 h-16 w-3 rounded-full bg-gradient-to-b from-[#d4af37] to-[#a9822f] shadow-[0_2px_6px_rgba(0,0,0,0.4)]" />
      </motion.div>
      <motion.div
        className="curtain-velvet absolute inset-y-0 right-0 w-1/2 origin-right"
        initial={false}
        animate={
          entering
            ? { x: "90%", scaleX: 0.35, filter: "blur(3px)" }
            : { x: "0%", scaleX: 1, filter: "blur(0px)" }
        }
        transition={DOOR_OPEN_TRANSITION}
      >
        <span className="absolute bottom-8 left-4 h-16 w-3 rounded-full bg-gradient-to-b from-[#d4af37] to-[#a9822f] shadow-[0_2px_6px_rgba(0,0,0,0.4)]" />
      </motion.div>
      <style>{`
        .curtain-velvet {
          background-color: #4a0f16;
          background-image: repeating-linear-gradient(
            90deg,
            rgba(0,0,0,0.28) 0 6px,
            rgba(255,255,255,0.05) 6px 12px,
            rgba(0,0,0,0.12) 12px 22px
          );
          box-shadow: inset -14px 0 36px rgba(0,0,0,0.45);
        }
      `}</style>
    </div>
  );
}

/** A red-and-gold wedding envelope "lid" sized to fully wrap the couple's
 * name and date, hiding them at rest — the envelope literally contains the
 * couple's names and the date, not just a decorative icon beside them.
 * Dressed with the same real dragon artwork and "囍" seal image as the
 * `doubleHappiness` 3D opening (see DoubleHappiness.tsx) instead of
 * hand-drawn shapes — a plain flat-coloured box read as "xấu" (ugly) next
 * to those. On tap it flips open on a real 3D `rotateX` top hinge, like a
 * box lid lifting away from the viewer, the seal at its top edge cracks
 * and falls away, and the name/date underneath is revealed — then the
 * whole gate fades into the site, per the usual `entering` flow. Rendered
 * as the last child of the name/date wrapper (see Opening below), covering
 * it via `inset-0`, so it stays within the button's own tap target. */
function EnvelopeOverlay({ entering }: { entering: boolean }) {
  return (
    <motion.div
      className="absolute -inset-x-5 -inset-y-4 sm:-inset-x-7 sm:-inset-y-5"
      style={{ perspective: 900, transformOrigin: "top" }}
      initial={false}
      animate={
        entering
          ? { rotateX: -110, opacity: 0, y: -18 }
          : { rotateX: 0, opacity: 1, y: 0 }
      }
      transition={DOOR_OPEN_TRANSITION}
    >
      <div className="envelope-lid absolute inset-0 overflow-hidden rounded-2xl shadow-[0_16px_36px_rgba(0,0,0,0.5)]">
        <div className="envelope-lid-sheen pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute inset-1.5 rounded-xl border border-[#d4af37]/45" />
      </div>

      <motion.div
        className="absolute left-1/2 top-0 flex h-14 w-14 items-center justify-center rounded-full bg-[#4a0a12] shadow-[0_6px_16px_rgba(0,0,0,0.5)] md:h-16 md:w-16"
        style={{ x: "-50%", y: "-50%" }}
        initial={false}
        animate={
          entering
            ? { scale: 0.3, opacity: 0, rotate: -20 }
            : { scale: 1, opacity: 1, rotate: 0 }
        }
        transition={{ duration: 0.7, ease: "easeIn" }}
      >
        <Image src="/flower/chu-hy.webp" alt="" width={56} height={56} className="h-11 w-11 md:h-12 md:w-12" />
      </motion.div>

      <style>{`
        .envelope-lid {
          background-color: #7a1120;
          background-image:
            linear-gradient(45deg, rgba(212,175,55,0.2) 25%, transparent 25%, transparent 75%, rgba(212,175,55,0.2) 75%),
            linear-gradient(45deg, rgba(212,175,55,0.2) 25%, transparent 25%, transparent 75%, rgba(212,175,55,0.2) 75%);
          background-size: 16px 16px;
          background-position: 0 0, 8px 8px;
          border: 2px solid rgba(212, 175, 55, 0.7);
        }
        .envelope-lid-sheen {
          background: linear-gradient(
            135deg,
            rgba(255, 224, 160, 0.16) 0%,
            rgba(255, 224, 160, 0) 30%,
            rgba(0, 0, 0, 0.12) 75%,
            rgba(0, 0, 0, 0.22) 100%
          );
        }
      `}</style>
    </motion.div>
  );
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
    window.setTimeout(() => setHidden(true), 1700);
  }

  if (hidden) return null;

  const palette = getColorThemePalette(colorTheme);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-ink"
        initial={{ opacity: 1 }}
        animate={entering ? { opacity: 0 } : { opacity: 1 }}
        transition={{ duration: 1.5, ease: [0.65, 0, 0.35, 1] }}
        style={{
          pointerEvents: entering ? "none" : "auto",
          ...themeCssVars(colorTheme),
          // The gate's own chrome (this dark backdrop, the button's light
          // text/CTA pill) is a fixed cinematic dark-bg/light-text look,
          // not something that should follow the site's chosen colour
          // theme — themeCssVars above already overwrote --color-ink/
          // --color-ivory for the whole gate, so on an inverted theme
          // (midnightGold, crimsonFestive: ivory becomes the dark colour,
          // ink the light one) bg-ink/text-ivory throughout this
          // component would otherwise flip to a light backdrop with dark
          // text, or a translucent light "ink" vignette that washes out
          // the doubleHappiness/redDoor/curtain scenes instead of
          // darkening them. Re-pinning both back to fixed values here
          // keeps the gate itself theme-independent; the 3D scenes still
          // get properly tinted separately via the `palette` prop below,
          // computed from the same colorTheme.
          ...({ "--color-ink": "#15130f", "--color-ivory": "#f7f2e7" } as CSSProperties),
        }}
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
        {DOM_OPENING_VARIANTS.has(variant as OpeningVariant) ? (
          <>
            <CoverBackdrop couple={couple} entering={entering} />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
            {variant === "redDoor" ? (
              <RedDoorOverlay entering={entering} />
            ) : variant === "curtain" ? (
              <CurtainOverlay entering={entering} />
            ) : null}
            <DreamyMist />
          </>
        ) : (
          <>
            {RED_GOLD_3D_VARIANTS.has(variant as OpeningVariant) && (
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "radial-gradient(ellipse at 50% 32%, #8a1120 0%, #4a0a12 65%, #2c0509 100%)",
                }}
              />
            )}
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
                ) : variant === "doubleHappiness" ? (
                  <DoubleHappiness entering={entering} />
                ) : (
                  <ParticleBloom palette={palette} />
                )}
              </div>
            ) : (
              // Devices without WebGL (or with reduced-motion/small screens)
              // fall back to the couple's own cover photo with a slow
              // Ken-Burns zoom — still cinematic, just not 3D.
              <CoverBackdrop couple={couple} />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
          </>
        )}

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

          <div className="relative">
            <span className="font-script text-6xl md:text-8xl leading-none">
              {couple.displayName}
            </span>

            <span className="mt-2 flex items-center gap-4 text-sm tracking-widest text-ivory/85 md:text-base">
              <span className="h-px w-8 bg-ivory/40" />
              {formatDate(couple.weddingDate)}
              <span className="h-px w-8 bg-ivory/40" />
            </span>

            {variant === "envelope" && <EnvelopeOverlay entering={entering} />}
          </div>

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
