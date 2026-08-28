"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import type { GalleryContent } from "@/types/wedding-config";
import { Section, Eyebrow, Divider } from "@/components/ui/Section";
import { Reveal } from "@/motion/Reveal";

export type GalleryVariant =
  | "masonry"
  | "carousel"
  | "grid"
  | "fullbleedSlider"
  | "masonryFade"
  | "masonryShift"
  | "masonry3d";

export const galleryRegistry: Record<GalleryVariant, { label: string }> = {
  masonry: { label: "Masonry so le" },
  carousel: { label: "Cuộn ngang" },
  grid: { label: "Lưới đều" },
  fullbleedSlider: { label: "Trình chiếu toàn màn hình" },
  masonryFade: { label: "Masonry chớp ảnh đổi chỗ" },
  masonryShift: { label: "Masonry ảnh di chuyển đổi chỗ" },
  masonry3d: { label: "Masonry 3D sống động" },
};

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Shared "which slot is each photo in right now" state for the three
 * reshuffling masonry variants below — periodically shuffles a permutation
 * of the photos' original indices. Aspect ratio is keyed by the ORIGINAL
 * index (not the shuffled position) so a given photo keeps its own size as
 * it moves, instead of resizing every time it lands in a new slot. */
function useShuffledOrder(length: number, intervalMs: number) {
  const [order, setOrder] = useState<number[]>(() => Array.from({ length }, (_, i) => i));

  useEffect(() => {
    if (length < 2) return;
    const timer = setInterval(() => {
      setOrder((prev) => shuffleArray(prev));
    }, intervalMs);
    return () => clearInterval(timer);
  }, [length, intervalMs]);

  return order;
}

function Lightbox({
  items,
  active,
  onClose,
}: {
  items: string[];
  active: number | null;
  onClose: () => void;
}) {
  // Projects with the "Mờ ảo (dissolve)" scroll transition
  // (SectionTransition, see transition.tsx) wrap every section — including
  // this gallery — in a div with `will-change: opacity, filter`. Per spec
  // that creates a new containing block for `position: fixed` descendants,
  // so without a portal this overlay stops being fixed to the real
  // viewport and instead sticks to that wrapper, shifted up by however far
  // the page has scrolled — on a phone, scrolled past the fold, that pushes
  // the whole modal off-screen and the tapped photo never visibly appears.
  // Portalling straight to <body> sidesteps every such ancestor.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const content = (
    <AnimatePresence>
      {active !== null && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/90 p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          // `pointerEvents: "none"` the instant the close animation starts
          // (not just once it finishes) — AnimatePresence keeps this
          // full-screen overlay mounted, still catching every tap, for its
          // whole ~0.3s fade-out. Without this, a guest tapping a *next*
          // photo right after closing this one — completely normal when
          // browsing quickly on a phone — lands on the still-closing
          // overlay instead of the photo underneath, and nothing opens.
          // Rarely hit with a mouse, where clicks land further apart in
          // time; this is the mobile-only "ảnh không mở" bug.
          exit={{ opacity: 0, pointerEvents: "none" }}
          onClick={onClose}
        >
          <motion.div
            className="relative aspect-[4/5] w-full max-w-lg"
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <Image src={items[active]} alt="" fill sizes="90vw" quality={90} className="object-contain" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (!mounted) return null;
  return createPortal(content, document.body);
}

function MasonryBody({ items, onOpen }: { items: string[]; onOpen: (i: number) => void }) {
  return (
    <div className="mt-12 columns-2 gap-4 md:columns-3">
      {items.map((src, i) => (
        <Reveal
          key={src + i}
          preset="fadeUp"
          delay={(i % 3) * 0.08}
          className={`mb-4 break-inside-avoid ${i % 5 === 0 ? "aspect-[3/4]" : "aspect-square"}`}
        >
          <button
            type="button"
            onClick={() => onOpen(i)}
            className="relative block h-full w-full cursor-zoom-in overflow-hidden"
          >
            <Image
              src={src}
              alt=""
              fill
              sizes="(min-width: 768px) 30vw, 45vw"
              quality={90}
              className="object-cover transition-transform duration-700 ease-out hover:scale-[1.04]"
            />
          </button>
        </Reveal>
      ))}
    </div>
  );
}

const WAVE_STAGGER_MS = 150;
const WAVE_FADE_MS = 1500;

// "Ẩn hiện đổi vị trí" — a wave sweeps across the grid instead of every
// photo blinking off and on together (which read as an all-at-once flash,
// not a ripple). Each tile gets its own CSS `transition-delay` based on its
// position in the current layout (0, 90ms, 180ms, ...), so even though the
// underlying `hidden` boolean flips for every tile at the exact same React
// state update, each one's fade visually starts a beat after the last —
// first tile leads, last tile trails, both hiding and revealing. The
// reshuffle itself only happens once the *last* tile in the wave has fully
// faded out (see hideMs below), so nothing jumps position while still
// partly visible.
function MasonryFadeBody({ items, onOpen }: { items: string[]; onOpen: (i: number) => void }) {
  const order = useShuffledOrderWithWave(items.length, 10000, WAVE_STAGGER_MS, WAVE_FADE_MS);

  return (
    <div className="mt-12 columns-2 gap-4 md:columns-3">
      {order.positions.map((originalIndex, i) => (
        <div
          key={originalIndex}
          className={`mb-4 break-inside-avoid overflow-hidden ease-in-out ${
            originalIndex % 5 === 0 ? "aspect-[3/4]" : "aspect-square"
          }`}
          style={{
            opacity: order.hidden ? 0 : 1,
            transitionProperty: "opacity",
            transitionDuration: `${WAVE_FADE_MS}ms`,
            transitionDelay: `${i * WAVE_STAGGER_MS}ms`,
          }}
        >
          <button
            type="button"
            onClick={() => onOpen(originalIndex)}
            className="relative block h-full w-full cursor-zoom-in"
          >
            <Image
              src={items[originalIndex]}
              alt=""
              fill
              sizes="(min-width: 768px) 30vw, 45vw"
              quality={90}
              className="object-cover"
            />
          </button>
        </div>
      ))}
    </div>
  );
}

// Same permutation idea as useShuffledOrder, but the reorder itself happens
// only once the whole hide-wave has finished (staggerMs * (length - 1) +
// fadeMs, not just a flat pause), on its own timer track (intervalMs)
// rather than reusing the plain shuffle hook.
function useShuffledOrderWithWave(
  length: number,
  intervalMs: number,
  staggerMs: number,
  fadeMs: number
) {
  const [positions, setPositions] = useState<number[]>(() =>
    Array.from({ length }, (_, i) => i)
  );
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (length < 2) return;
    const waveDuration = staggerMs * (length - 1) + fadeMs;
    let hideTimeout: ReturnType<typeof setTimeout>;
    const timer = setInterval(() => {
      setHidden(true);
      hideTimeout = setTimeout(() => {
        setPositions((prev) => shuffleArray(prev));
        setHidden(false);
      }, waveDuration);
    }, intervalMs);
    return () => {
      clearInterval(timer);
      clearTimeout(hideTimeout);
    };
  }, [length, intervalMs, staggerMs, fadeMs]);

  return { positions, hidden };
}

// "Ảnh di chuyển đổi vị trí" — each tile keeps `layout` so Framer Motion
// animates the slide from its old slot to its new one (a FLIP transition)
// instead of hiding the move like MasonryFadeBody does. Its own signature,
// distinct from Masonry3dBody below: a flat "lift off the wall, glide,
// settle back down" — scale bumps up and the shadow deepens mid-glide, no
// rotation at all, so it reads as a physical 2D card sliding rather than a
// 3D object turning (that's Masonry3dBody's thing).
function MasonryShiftBody({ items, onOpen }: { items: string[]; onOpen: (i: number) => void }) {
  const order = useShuffledOrder(items.length, 9000);

  return (
    <div className="mt-12 columns-2 gap-4 md:columns-3">
      {order.map((originalIndex) => (
        <motion.div
          key={originalIndex}
          layout
          animate={{
            scale: [1, 1.05, 1],
            boxShadow: [
              "0 1px 3px rgba(0,0,0,0.08)",
              "0 16px 26px -8px rgba(0,0,0,0.3)",
              "0 1px 3px rgba(0,0,0,0.08)",
            ],
          }}
          transition={{
            layout: { duration: 3.4, ease: "easeInOut" },
            scale: { duration: 3.4, times: [0, 0.5, 1], ease: "easeInOut" },
            boxShadow: { duration: 3.4, times: [0, 0.5, 1], ease: "easeInOut" },
          }}
          className={`mb-4 break-inside-avoid overflow-hidden ${
            originalIndex % 5 === 0 ? "aspect-[3/4]" : "aspect-square"
          }`}
        >
          <button
            type="button"
            onClick={() => onOpen(originalIndex)}
            className="relative block h-full w-full cursor-zoom-in"
          >
            <Image
              src={items[originalIndex]}
              alt=""
              fill
              sizes="(min-width: 768px) 30vw, 45vw"
              quality={90}
              className="object-cover"
            />
          </button>
        </motion.div>
      ))}
    </div>
  );
}

// The "best effect" pick — a genuine 3D card-flip signature, clearly
// distinct from MasonryShiftBody's flat lift-and-glide: every reshuffle,
// each tile sweeps rotateY out to ~100° and back (turning edge-on to the
// camera, dipping in scale/opacity right at the midpoint the way a thin
// card would) while `layout` slides it to its new slot underneath that
// flip. rotateY is reserved for that one-shot flip; the always-on idle
// life between shuffles instead rocks gently on rotateX only, so the two
// motions never fight over the same axis.
function Masonry3dBody({ items, onOpen }: { items: string[]; onOpen: (i: number) => void }) {
  const order = useShuffledOrder(items.length, 10000);

  return (
    <div className="mt-12 [perspective:1400px] columns-2 gap-4 md:columns-3">
      {order.map((originalIndex, i) => (
        <motion.div
          key={originalIndex}
          layout
          animate={{
            rotateX: [0, 4, 0, -4, 0],
            rotateY: [0, 100, 0],
            scale: [1, 0.85, 1],
            opacity: [1, 0.65, 1],
          }}
          transition={{
            layout: { duration: 3.6, ease: "easeInOut" },
            rotateX: { duration: 11, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 },
            rotateY: { duration: 3.6, times: [0, 0.5, 1], ease: "easeInOut" },
            scale: { duration: 3.6, times: [0, 0.5, 1], ease: "easeInOut" },
            opacity: { duration: 3.6, times: [0, 0.5, 1], ease: "easeInOut" },
          }}
          style={{ transformStyle: "preserve-3d" }}
          className={`mb-4 break-inside-avoid overflow-hidden shadow-flat ${
            originalIndex % 5 === 0 ? "aspect-[3/4]" : "aspect-square"
          }`}
        >
          <button
            type="button"
            onClick={() => onOpen(originalIndex)}
            className="relative block h-full w-full cursor-zoom-in"
          >
            <Image
              src={items[originalIndex]}
              alt=""
              fill
              sizes="(min-width: 768px) 30vw, 45vw"
              quality={90}
              className="object-cover"
            />
          </button>
        </motion.div>
      ))}
    </div>
  );
}

function GridBody({ items, onOpen }: { items: string[]; onOpen: (i: number) => void }) {
  return (
    <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">
      {items.map((src, i) => (
        <Reveal key={src + i} preset="scaleIn" delay={(i % 4) * 0.06} className="aspect-square">
          <button
            type="button"
            onClick={() => onOpen(i)}
            className="relative block h-full w-full cursor-zoom-in overflow-hidden"
          >
            <Image
              src={src}
              alt=""
              fill
              sizes="(min-width: 768px) 22vw, 45vw"
              quality={90}
              className="object-cover transition-transform duration-700 ease-out hover:scale-[1.04]"
            />
          </button>
        </Reveal>
      ))}
    </div>
  );
}

function CarouselBody({ items, onOpen }: { items: string[]; onOpen: (i: number) => void }) {
  return (
    <div className="mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 no-scrollbar">
      {items.map((src, i) => (
        <button
          key={src + i}
          type="button"
          onClick={() => onOpen(i)}
          className="relative aspect-[3/4] w-[70%] flex-shrink-0 snap-center overflow-hidden md:w-[32%]"
        >
          <Image src={src} alt="" fill sizes="70vw" quality={90} className="object-cover" />
        </button>
      ))}
    </div>
  );
}

function FullbleedSlider({ items }: { items: string[] }) {
  const [index, setIndex] = useState(0);

  return (
    <div className="relative mt-12 aspect-[4/5] w-full max-w-2xl mx-auto overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <Image src={items[index]} alt="" fill sizes="70vw" quality={90} className="object-cover" />
        </motion.div>
      </AnimatePresence>
      <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
        {items.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Ảnh ${i + 1}`}
            className={`h-1.5 rounded-full transition-all ${
              i === index ? "w-6 bg-ivory" : "w-1.5 bg-ivory/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export function GalleryVariant({
  content,
  variant = "masonry",
}: {
  content: GalleryContent;
  variant?: string;
}) {
  const [active, setActive] = useState<number | null>(null);
  const items = content.items;

  return (
    <Section>
      <div className="text-center">
        <Eyebrow>{content.title}</Eyebrow>
        <Divider />
        <p className="mx-auto max-w-md font-serif text-lg text-ink-soft">
          {content.subtitle}
        </p>
      </div>

      {variant === "grid" && <GridBody items={items} onOpen={setActive} />}
      {variant === "carousel" && <CarouselBody items={items} onOpen={setActive} />}
      {variant === "fullbleedSlider" && <FullbleedSlider items={items} />}
      {variant === "masonryFade" && <MasonryFadeBody items={items} onOpen={setActive} />}
      {variant === "masonryShift" && <MasonryShiftBody items={items} onOpen={setActive} />}
      {variant === "masonry3d" && <Masonry3dBody items={items} onOpen={setActive} />}
      {(variant === "masonry" || !(variant in galleryRegistry)) && (
        <MasonryBody items={items} onOpen={setActive} />
      )}

      {variant !== "fullbleedSlider" && (
        <Lightbox items={items} active={active} onClose={() => setActive(null)} />
      )}
    </Section>
  );
}
