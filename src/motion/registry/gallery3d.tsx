"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import type { PhotoStackContent } from "@/types/wedding-config";
import { Section, Eyebrow, Divider } from "@/components/ui/Section";
import { Reveal } from "@/motion/Reveal";
import { hasWebGL } from "@/lib/hasWebGL";

export type Gallery3dVariant =
  | "floatingPhotos"
  | "cssStack"
  | "coverflow"
  | "cinematicReel"
  | "elegantSlide";

export const gallery3dRegistry: Record<Gallery3dVariant, { label: string }> = {
  floatingPhotos: { label: "Ảnh nổi 3D (WebGL)" },
  cssStack: { label: "Chồng ảnh nghiêng" },
  coverflow: { label: "Coverflow xoay 3D" },
  cinematicReel: { label: "Phim chậm dần nhanh" },
  elegantSlide: { label: "Trượt ảnh thẻ lớn (có nút điều hướng)" },
};

const FloatingPhotos = dynamic(
  () => import("@/three/FloatingPhotos").then((m) => m.FloatingPhotos),
  { ssr: false }
);

function CssStack({ images }: { images: string[] }) {
  return (
    <div className="relative flex h-full items-center justify-center [perspective:1200px]">
      {images.map((src, i) => (
        <div
          key={src}
          className="absolute h-[75%] w-[55%] overflow-hidden border-4 border-ivory shadow-flat transition-transform duration-700"
          style={{
            transform: `rotate(${(i - 1) * 8}deg) translateX(${(i - 1) * 70}px)`,
            zIndex: i === 1 ? 3 : 1,
          }}
        >
          <Image src={src} alt="" fill sizes="40vw" quality={90} className="object-cover" />
        </div>
      ))}
    </div>
  );
}

function Coverflow({ images }: { images: string[] }) {
  const [active, setActive] = useState(1);

  return (
    <div className="relative flex h-full flex-col items-center justify-center">
      <div className="relative flex h-[80%] w-full items-center justify-center [perspective:1400px]">
        {images.map((src, i) => {
          const offset = i - active;
          return (
            <button
              key={src}
              type="button"
              onClick={() => setActive(i)}
              className="absolute h-[85%] w-[46%] overflow-hidden border-4 border-ivory shadow-flat transition-transform duration-500"
              style={{
                transform: `translateX(${offset * 62}%) rotateY(${offset * -35}deg) scale(${
                  offset === 0 ? 1 : 0.82
                })`,
                zIndex: 10 - Math.abs(offset),
                opacity: Math.abs(offset) > 1 ? 0 : 1,
              }}
            >
              <Image src={src} alt="" fill sizes="40vw" quality={90} className="object-cover" />
            </button>
          );
        })}
      </div>
      <div className="mt-6 flex gap-2">
        {images.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActive(i)}
            aria-label={`Ảnh ${i + 1}`}
            className={`h-1.5 rounded-full transition-all ${
              i === active ? "w-6 bg-gold" : "w-1.5 bg-line"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      className={direction === "left" ? "-translate-x-px" : "translate-x-px"}
    >
      <path
        d={direction === "left" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** A large rounded center card with soft, faded "ghost" neighbours peeking
 * out on either side, plus explicit prev/next arrow buttons — the
 * "minimalism" reference look, distinct from Coverflow's 3D rotateY tilt
 * (these side cards stay flat, just scaled down and dimmed). */
const ELEGANT_SLIDE_AUTOPLAY_MS = 3500;

function ElegantSlide({ images }: { images: string[] }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = images.length;

  function go(delta: number) {
    setActive((prev) => (prev + delta + count) % count);
  }

  useEffect(() => {
    if (count < 2 || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % count);
    }, ELEGANT_SLIDE_AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [count, paused]);

  return (
    <div
      className="relative flex h-full flex-col items-center justify-center"
      // Pausing on hover/focus (not just while a nav button is pressed)
      // means a guest reading a caption or about to click prev/next never
      // has the slide advance out from under them mid-interaction.
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="relative flex h-[82%] w-full items-center justify-center [perspective:1400px]">
        {images.map((src, i) => {
          // Wrapped (circular) offset, not a plain linear `i - active` — so
          // the last image's right-hand neighbour is the first image and
          // vice versa, reading as one continuous loop instead of running
          // out of neighbours at either end.
          let offset = (i - active) % count;
          if (offset > count / 2) offset -= count;
          if (offset < -count / 2) offset += count;
          const abs = Math.abs(offset);
          if (abs > 2) return null;
          const isActive = offset === 0;
          return (
            <div
              key={src}
              className="absolute h-[88%] w-[48%] overflow-hidden rounded-2xl border-4 border-ivory shadow-flat transition-all duration-500"
              style={{
                // Active card stays flat; neighbours lean away from it a
                // little (rotateY), same "peeking sideways" read as
                // Coverflow but much subtler — this variant's cards stay
                // mostly flat-on, just tilted rather than fully turned.
                transform: `translateX(${offset * 58}%) rotateY(${isActive ? 0 : offset * -10}deg) scale(${isActive ? 1 : 0.8})`,
                zIndex: 10 - abs,
                opacity: isActive ? 1 : 0.55,
                filter: isActive ? "none" : "blur(1px)",
              }}
            >
              <Image src={src} alt="" fill sizes="45vw" quality={90} className="object-cover" />
            </div>
          );
        })}
      </div>

      {count > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Ảnh trước"
            className="absolute left-1 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-ivory/90 text-ink shadow-flat transition-transform hover:scale-110 md:left-4"
          >
            <ChevronIcon direction="left" />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Ảnh sau"
            className="absolute right-1 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-ivory/90 text-ink shadow-flat transition-transform hover:scale-110 md:right-4"
          >
            <ChevronIcon direction="right" />
          </button>
        </>
      )}

      <div className="mt-6 flex gap-2">
        {images.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActive(i)}
            aria-label={`Ảnh ${i + 1}`}
            className={`h-1.5 rounded-full transition-all ${
              i === active ? "w-6 bg-gold" : "w-1.5 bg-line"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

// Duration of each slide's hold, in ms — starts slow (a scene lingers) and
// eases toward a fast montage cut as the reel plays, then resets slow again
// on loop. `t` is playback progress through the reel (0 → 1).
function slideDuration(t: number): number {
  const eased = t * t; // ease-in: stays slow early, accelerates later
  const SLOW_MS = 1700;
  const FAST_MS = 380;
  return SLOW_MS - (SLOW_MS - FAST_MS) * eased;
}

function CinematicReel({ images }: { images: string[] }) {
  const [index, setIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (images.length < 2) return;
    function schedule(i: number) {
      const t = (i % images.length) / images.length;
      timerRef.current = setTimeout(() => {
        setIndex((prev) => (prev + 1) % images.length);
      }, slideDuration(t));
    }
    schedule(index);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [index, images.length]);

  if (images.length === 0) return null;
  const safeIndex = Math.min(index, images.length - 1);

  return (
    <div className="relative h-full w-full overflow-hidden">
      <AnimatePresence mode="sync">
        <motion.div
          key={safeIndex}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1.14 }}
          exit={{ opacity: 0 }}
          transition={{
            opacity: { duration: 0.6, ease: "easeInOut" },
            scale: {
              duration: (slideDuration((safeIndex % images.length) / images.length) / 1000) * 1.4,
              ease: "linear",
            },
          }}
        >
          <Image
            src={images[safeIndex]}
            alt=""
            fill
            sizes="70vw"
            quality={90}
            priority={safeIndex === 0}
            className="object-cover"
          />
        </motion.div>
      </AnimatePresence>
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-ink/40 to-transparent" />
      <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
        {images.map((_, i) => (
          <span
            key={i}
            className={`h-1 rounded-full transition-all duration-500 ${
              i === safeIndex ? "w-5 bg-ivory" : "w-1 bg-ivory/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export function Gallery3dVariant({
  content,
  variant = "floatingPhotos",
}: {
  content: PhotoStackContent;
  variant?: string;
}) {
  const [use3d, setUse3d] = useState(false);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    // Gate on actual capability, not viewport width — most phones are
    // ≤640px, so a width check was disabling this for nearly all mobile.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUse3d(variant === "floatingPhotos" && !prefersReduced && hasWebGL());
  }, [variant]);

  return (
    <Section className="text-center">
      <Eyebrow>{content.title}</Eyebrow>
      <Divider />

      <Reveal
        preset="fade"
        className="relative mx-auto mt-10 h-[420px] w-full max-w-3xl overflow-hidden md:h-[520px]"
      >
        {variant === "cinematicReel" && <CinematicReel images={content.images} />}
        {variant !== "cinematicReel" && use3d && <FloatingPhotos images={content.images} />}
        {variant !== "cinematicReel" && !use3d && variant === "coverflow" && (
          <Coverflow images={content.images} />
        )}
        {variant !== "cinematicReel" && !use3d && variant === "elegantSlide" && (
          <ElegantSlide images={content.images} />
        )}
        {variant !== "cinematicReel" &&
          !use3d &&
          variant !== "coverflow" &&
          variant !== "elegantSlide" && <CssStack images={content.images} />}
      </Reveal>
    </Section>
  );
}
