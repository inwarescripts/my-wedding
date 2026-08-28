"use client";

import { Fragment } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Section, Eyebrow, Divider } from "@/components/ui/Section";
import { Reveal } from "@/motion/Reveal";
import { BowOrnament } from "@/motion/registry/bow";
import { useCountdown } from "@/lib/useCountdown";

export type CountdownVariant = "classic" | "flipCard" | "minimalType" | "progressRing";

export const countdownRegistry: Record<CountdownVariant, { label: string }> = {
  classic: { label: "Vòng tròn cổ điển" },
  flipCard: { label: "Bảng lật Flip Clock" },
  minimalType: { label: "Chữ số tối giản" },
  progressRing: { label: "Vòng tròn tiến độ" },
};

interface Unit {
  label: string;
  value: number;
  max: number;
}

/** A small curling corner bracket — flat line-art, theme-coloured via
 * `currentColor`, matching the site's existing ornament vocabulary (see
 * BowOrnament, LeafyCorner). One asset, rotated per corner. */
function CornerFlourish({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={className}
      aria-hidden
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
    >
      <path d="M3 24 V9 Q3 3 9 3 H24" />
      <path d="M9 15 Q9 9 15 9" />
      <circle cx="24" cy="3" r="1.7" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** A horizontal ornamental rule — a hairline with a small scroll flourish
 * curling in at each end and a diamond mark at centre (the same diamond
 * Divider already uses). Scales full-width via `preserveAspectRatio`. */
function OrnateRule({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 20"
      preserveAspectRatio="none"
      className={className}
      aria-hidden
    >
      <line x1="44" y1="10" x2="356" y2="10" stroke="currentColor" strokeWidth="1" opacity="0.55" />
      <g stroke="currentColor" strokeWidth="1.2" fill="none">
        <path d="M18 10 Q28 2 38 10 Q28 18 18 10" />
        <path d="M382 10 Q372 2 362 10 Q372 18 362 10" />
      </g>
      <rect x="196" y="6" width="8" height="8" transform="rotate(45 200 10)" fill="currentColor" />
    </svg>
  );
}

/** Twelve small clock-face marks ringing a progress circle, like a
 * medallion's engraved rim — turns a plain progress ring into something
 * with a bit of hoa văn (ornamental detail) instead of a bare stroke. */
function PetalMarks({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      {Array.from({ length: 12 }, (_, i) => {
        const angle = (i / 12) * Math.PI * 2;
        const x1 = 50 + Math.cos(angle) * 47;
        const y1 = 50 + Math.sin(angle) * 47;
        const x2 = 50 + Math.cos(angle) * 44;
        const y2 = 50 + Math.sin(angle) * 44;
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
}

// All four variants below are deliberately theme-driven (bg-ivory,
// text-ink, text-accent, bg-gold, ...) rather than a fixed palette like the
// door/curtain/envelope opening effects — this section should always match
// whatever colorTheme the couple picked, not its own festive colours.
function useUnits(weddingDate: string): Unit[] {
  const time = useCountdown(weddingDate);
  return [
    { label: "Ngày", value: time?.days ?? 0, max: 30 },
    { label: "Giờ", value: time?.hours ?? 0, max: 24 },
    { label: "Phút", value: time?.minutes ?? 0, max: 60 },
    { label: "Giây", value: time?.seconds ?? 0, max: 60 },
  ];
}

/** The original style: a ring of soft ivory circles. Kept as the default so
 * existing projects don't change look under them. */
function Classic({ units }: { units: Unit[] }) {
  return (
    <Reveal
      preset="fade"
      className="mx-auto mt-10 flex max-w-xl items-start justify-center gap-3 md:gap-6"
    >
      {units.map((u, i) => (
        <Fragment key={u.label}>
          <div className="flex-1">
            <div className="relative flex aspect-square items-center justify-center rounded-full border border-accent-soft bg-ivory shadow-flat">
              <span className="font-heading text-3xl tabular-nums text-ink md:text-5xl">
                {String(u.value).padStart(2, "0")}
              </span>
            </div>
            <span className="mt-3 block text-xs tracking-[0.3em] uppercase text-ink-soft">
              {u.label}
            </span>
          </div>
          {i < units.length - 1 && (
            <span aria-hidden className="mt-4 font-heading text-2xl text-accent-soft md:text-3xl">
              :
            </span>
          )}
        </Fragment>
      ))}
    </Reveal>
  );
}

/** One split-flap card — a thin crease line at the vertical centre sells
 * the "flip clock" read, and the digit itself flips over (real 3D rotateX,
 * old value tumbling out as the new one tumbles in) whenever the value
 * changes, via AnimatePresence keyed on the value. */
function FlipDigit({ value }: { value: number }) {
  return (
    <div
      className="relative h-full w-full overflow-hidden rounded-md border border-line bg-ivory shadow-flat"
      style={{ perspective: 240 }}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={{ rotateX: -90, opacity: 0 }}
          animate={{ rotateX: 0, opacity: 1 }}
          exit={{ rotateX: 90, opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 flex items-center justify-center font-heading text-3xl tabular-nums text-ink md:text-5xl"
        >
          {String(value).padStart(2, "0")}
        </motion.span>
      </AnimatePresence>
      <div className="pointer-events-none absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-ink/10" />
      <div className="pointer-events-none absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 bg-gradient-to-b from-black/5 to-transparent" />
    </div>
  );
}

/** The flip-clock cards sit inside a shared display-case panel — a double
 * gold hairline border with a curling flourish in each corner — instead of
 * floating loose, so the whole thing reads as "an antique clock cabinet",
 * not just restyled digits. */
function FlipCard({ units }: { units: Unit[] }) {
  return (
    <Reveal preset="fade" className="mx-auto mt-10 max-w-xl">
      <div className="relative rounded-2xl border-2 border-double border-gold/60 bg-ivory/40 px-5 py-8 shadow-flat md:px-9 md:py-10">
        <CornerFlourish className="absolute left-2 top-2 h-6 w-6 text-gold/80 md:h-7 md:w-7" />
        <CornerFlourish className="absolute right-2 top-2 h-6 w-6 rotate-90 text-gold/80 md:h-7 md:w-7" />
        <CornerFlourish className="absolute bottom-2 right-2 h-6 w-6 rotate-180 text-gold/80 md:h-7 md:w-7" />
        <CornerFlourish className="absolute bottom-2 left-2 h-6 w-6 -rotate-90 text-gold/80 md:h-7 md:w-7" />

        <div className="flex items-start justify-center gap-2.5 md:gap-5">
          {units.map((u, i) => (
            <Fragment key={u.label}>
              <div className="flex-1">
                <div className="aspect-[4/5]">
                  <FlipDigit value={u.value} />
                </div>
                <span className="mt-3 block text-center text-[10px] tracking-[0.3em] uppercase text-ink-soft">
                  {u.label}
                </span>
              </div>
              {i < units.length - 1 && (
                <span aria-hidden className="mt-6 font-heading text-xl text-gold md:text-2xl">
                  ·
                </span>
              )}
            </Fragment>
          ))}
        </div>
      </div>
    </Reveal>
  );
}

/** No boxes at all — huge italic serif numerals between two ornamental
 * scroll rules (see OrnateRule), like a formal invitation's typeset date
 * rather than a digital counter. */
function MinimalType({ units }: { units: Unit[] }) {
  return (
    <Reveal preset="fade" className="mx-auto mt-10 max-w-2xl">
      <OrnateRule className="mx-auto h-4 w-full text-accent-soft" />
      <div className="flex items-end justify-center gap-6 pb-2 pt-8 md:gap-10">
        {units.map((u, i) => (
          <Fragment key={u.label}>
            <div className="text-center">
              <span className="font-heading text-4xl italic tabular-nums text-ink md:text-6xl">
                {String(u.value).padStart(2, "0")}
              </span>
              <span className="mt-2 block border-t border-accent-soft pt-2 text-[10px] tracking-[0.35em] uppercase text-ink-soft">
                {u.label}
              </span>
            </div>
            {i < units.length - 1 && (
              <span aria-hidden className="pb-6 font-serif text-2xl italic text-accent-soft md:pb-8">
                /
              </span>
            )}
          </Fragment>
        ))}
      </div>
      <OrnateRule className="mx-auto h-4 w-full rotate-180 text-accent-soft" />
    </Reveal>
  );
}

/** Each unit as an SVG progress ring (stroke-dashoffset driven by
 * value/max, e.g. minutes fills 0-60) instead of a static digit box — a
 * different visualization, not just a different skin — ringed with
 * PetalMarks for a medallion/clock-face read rather than a bare stroke. */
function ProgressRing({ value, max, label }: { value: number; max: number; label: string }) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(1, value / max);

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-20 w-20 md:h-28 md:w-28">
        <PetalMarks className="absolute inset-0 h-full w-full text-accent-soft" />
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="currentColor"
            className="text-line"
            strokeWidth="6"
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="currentColor"
            className="text-accent"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - pct)}
            style={{ transition: "stroke-dashoffset 0.6s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-heading text-2xl tabular-nums text-ink md:text-4xl">
            {String(value).padStart(2, "0")}
          </span>
        </div>
      </div>
      <span className="mt-3 text-[10px] tracking-[0.3em] uppercase text-ink-soft">{label}</span>
    </div>
  );
}

function ProgressRingRow({ units }: { units: Unit[] }) {
  return (
    <Reveal
      preset="fade"
      className="mx-auto mt-10 flex max-w-xl items-start justify-center gap-4 md:gap-8"
    >
      {units.map((u) => (
        <ProgressRing key={u.label} value={u.value} max={u.max} label={u.label} />
      ))}
    </Reveal>
  );
}

export function CountdownVariant({
  weddingDate,
  weddingDateLunar,
  bowStyle = "none",
  variant = "classic",
}: {
  weddingDate: string;
  weddingDateLunar?: string | null;
  bowStyle?: string;
  variant?: string;
}) {
  const units = useUnits(weddingDate);

  return (
    // Banded like Events/Family — a plain-ivory section on either side of
    // it would otherwise blur into one long, undifferentiated stretch of
    // page, especially since this section itself is visually light (a row
    // of numbers, no photo).
    <div className="border-y border-line bg-ivory-deep">
      <Section className="text-center">
        <Eyebrow>Đếm ngược</Eyebrow>
        <Divider />
        {weddingDateLunar && (
          <p className="font-serif text-lg text-ink-soft">{weddingDateLunar}</p>
        )}

        {variant === "flipCard" ? (
          <FlipCard units={units} />
        ) : variant === "minimalType" ? (
          <MinimalType units={units} />
        ) : variant === "progressRing" ? (
          <ProgressRingRow units={units} />
        ) : (
          <Classic units={units} />
        )}

        <BowOrnament variant={bowStyle} className="mt-10" />
      </Section>
    </div>
  );
}
