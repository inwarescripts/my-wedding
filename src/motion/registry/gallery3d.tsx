"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import type { PhotoStackContent } from "@/types/wedding-config";
import { Section, Eyebrow, Divider } from "@/components/ui/Section";
import { Reveal } from "@/motion/Reveal";
import { hasWebGL } from "@/lib/hasWebGL";

export type Gallery3dVariant = "floatingPhotos" | "cssStack" | "coverflow" | "cinematicReel";

export const gallery3dRegistry: Record<Gallery3dVariant, { label: string }> = {
  floatingPhotos: { label: "Ảnh nổi 3D (WebGL)" },
  cssStack: { label: "Chồng ảnh nghiêng" },
  coverflow: { label: "Coverflow xoay 3D" },
  cinematicReel: { label: "Phim chậm dần nhanh" },
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
    const isSmall = window.matchMedia("(max-width: 640px)").matches;
    // One-time client-only capability detection (WebGL/viewport); no external subscription to attach to.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUse3d(variant === "floatingPhotos" && !prefersReduced && !isSmall && hasWebGL());
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
        {variant !== "cinematicReel" && !use3d && variant !== "coverflow" && (
          <CssStack images={content.images} />
        )}
      </Reveal>
    </Section>
  );
}
