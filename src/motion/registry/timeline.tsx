"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import type { TimelineContent } from "@/types/wedding-config";
import { Section, Eyebrow, Divider } from "@/components/ui/Section";
import { Reveal } from "@/motion/Reveal";

export type TimelineVariant = "alternating" | "verticalLeft" | "horizontalScroll" | "road";

export const timelineRegistry: Record<TimelineVariant, { label: string }> = {
  alternating: { label: "So le hai bên" },
  verticalLeft: { label: "Một cột bên trái" },
  horizontalScroll: { label: "Tăng trưởng" },
  road: { label: "Con đường" },
};

function Alternating({ items }: { items: TimelineContent["items"] }) {
  return (
    <div className="relative mx-auto mt-14 max-w-2xl">
      <div className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-line md:block" />
      <ol className="space-y-10 md:space-y-0">
        {items.map((item, i) => (
          <li
            key={item.date}
            className="relative md:grid md:grid-cols-2 md:items-center md:gap-10 md:py-8"
          >
            <div className="absolute left-1/2 top-1 hidden h-2.5 w-2.5 -translate-x-1/2 rotate-45 bg-gold md:block" />
            <Reveal
              preset={i % 2 === 0 ? "fadeRight" : "fade"}
              className={i % 2 === 0 ? "md:text-right md:pr-14" : "md:col-start-2 md:pl-14"}
            >
              <p className="font-heading text-2xl italic text-accent">{item.date}</p>
              <p className="mt-1 font-heading text-xl text-ink">{item.title}</p>
              <p className="mt-2 font-serif text-base text-ink-soft">{item.desc}</p>
            </Reveal>
          </li>
        ))}
      </ol>
    </div>
  );
}

function VerticalLeft({ items }: { items: TimelineContent["items"] }) {
  return (
    <div className="relative mx-auto mt-14 max-w-xl">
      <div className="absolute left-[5px] top-1 h-[calc(100%-8px)] w-px bg-line" />
      <ol className="space-y-10">
        {items.map((item) => (
          <li key={item.date} className="relative pl-8">
            <div className="absolute left-0 top-1.5 h-2.5 w-2.5 rotate-45 bg-gold" />
            <Reveal preset="fadeUp">
              <p className="font-heading text-xl italic text-accent">{item.date}</p>
              <p className="mt-1 font-heading text-lg text-ink">{item.title}</p>
              <p className="mt-2 font-serif text-base text-ink-soft">{item.desc}</p>
            </Reveal>
          </li>
        ))}
      </ol>
    </div>
  );
}

function Road({ items }: { items: TimelineContent["items"] }) {
  const n = items.length;
  if (n === 0) return null;
  const width = 1000;
  const height = 280;
  const topY = 80;
  const bottomY = 180;

  const points = items.map((_, i) => ({
    x: ((i + 0.5) / n) * width,
    y: i % 2 === 0 ? topY : bottomY,
  }));

  const pathD = points.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x - 30},${p.y} L ${p.x},${p.y}`;
    const prev = points[i - 1];
    const cx = (prev.x + p.x) / 2;
    return `${acc} C ${cx},${prev.y} ${cx},${p.y} ${p.x},${p.y}`;
  }, "");
  const last = points[n - 1];
  const pathWithArrow = `${pathD} L ${last.x + 30},${last.y}`;

  return (
    <>
      <div className="md:hidden">
        <VerticalLeft items={items} />
      </div>

      <div className="relative mx-auto mt-14 hidden max-w-4xl md:block" style={{ height }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full"
        >
          <path
            d={pathWithArrow}
            fill="none"
            stroke="var(--color-line)"
            strokeWidth="3"
          />
          <polygon
            points={`${last.x + 20},${last.y - 7} ${last.x + 34},${last.y} ${last.x + 20},${last.y + 7}`}
            fill="var(--color-line)"
          />
        </svg>

        {points.map((p, i) => {
          const item = items[i];
          const isTop = i % 2 === 0;
          return (
            <div
              key={item.date}
              className="absolute"
              style={{ left: `${(p.x / width) * 100}%`, top: p.y, transform: "translate(-50%, -50%)" }}
            >
              <div className="h-3 w-3 rotate-45 bg-gold ring-4 ring-ivory" />
              <Reveal
                preset={isTop ? "fadeDown" : "fadeUp"}
                className={`absolute left-1/2 w-44 -translate-x-1/2 text-center ${
                  isTop ? "bottom-full mb-4" : "top-full mt-4"
                }`}
              >
                <p className="font-heading text-lg italic text-accent">{item.date}</p>
                <p className="mt-1 font-heading text-base text-ink">{item.title}</p>
                <p className="mt-1 font-serif text-sm text-ink-soft line-clamp-3">{item.desc}</p>
              </Reveal>
            </div>
          );
        })}
      </div>
    </>
  );
}

const GROWTH_PALETTE = ["#d99a4e", "#c97a4a", "#7fa89a", "#5c8aa6", "#3d5670"];

function GrowthIcon({ variant }: { variant: 0 | 1 }) {
  if (variant === 0) {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-[18px] w-[18px]">
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-[18px] w-[18px]">
      <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.12 2.12 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.12 2.12 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.12 2.12 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.12 2.12 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.12 2.12 0 0 0 1.597-1.16z" />
    </svg>
  );
}

function CarIcon() {
  return (
    <svg viewBox="0 0 48 28" className="h-7 w-12 drop-shadow-md">
      <path
        d="M6 20 C4 20 3 18.5 3 17 L3 14 C3 12.3 4.2 10.9 5.9 10.6 L10 10 12.8 5.6 C13.5 4.6 14.6 4 15.8 4 L30 4 C31.4 4 32.7 4.7 33.4 5.9 L36.5 11 42 12 C44.2 12.4 45.5 14 45.5 16.2 L45.5 17 C45.5 18.7 44.2 20 42.5 20"
        fill="var(--color-accent)"
      />
      <path d="M10 10 L13.4 5.4 C13.9 4.7 14.7 4.3 15.6 4.3 L15.6 10 Z" fill="var(--color-accent-soft)" />
      <rect x="17" y="4.3" width="12" height="6" rx="1.4" fill="var(--color-accent-soft)" />
      <circle cx="13" cy="21" r="4.6" fill="var(--color-ink)" />
      <circle cx="13" cy="21" r="1.9" fill="var(--color-ivory)" />
      <circle cx="36" cy="21" r="4.6" fill="var(--color-ink)" />
      <circle cx="36" cy="21" r="1.9" fill="var(--color-ivory)" />
    </svg>
  );
}

/** Nearest ancestor that scrolls its own content, or null when the page
 * itself (the window) is what scrolls — the admin editor's live preview
 * scrolls internally (see smooth-scroll.tsx), while the public site scrolls
 * the window, so the car's progress tracking has to work with either. */
function findScrollParent(el: HTMLElement): HTMLElement | null {
  let node = el.parentElement;
  while (node) {
    const style = getComputedStyle(node);
    if (/(auto|scroll)/.test(style.overflowY) && node.scrollHeight > node.clientHeight + 1) {
      return node;
    }
    node = node.parentElement;
  }
  return null;
}

function Growth({ items }: { items: TimelineContent["items"] }) {
  const n = items.length;
  const stepY = 108;
  const height = n > 0 ? stepY * (n - 1) + 140 : 140;
  const startXPct = 4;
  const endXPct = 50;
  const stepXPct = n > 1 ? (endXPct - startXPct) / (n - 1) : 0;

  const nodes = items.map((_, i) => ({
    xPct: startXPct + i * stepXPct,
    y: height - 70 - i * stepY,
  }));
  const safeNodes = n > 0 ? nodes : [{ xPct: startXPct, y: height - 70 }];

  const containerRef = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(1);

  // Raw scroll progress (0-1), updated directly on the motion value so the
  // car doesn't wait on a React re-render every scroll frame; a spring on
  // top smooths out the jump between two rAF-throttled samples.
  const rawProgress = useMotionValue(0);
  const smoothProgress = useSpring(rawProgress, { stiffness: 260, damping: 32, mass: 0.6 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const scrollParent = findScrollParent(el);
    const target: HTMLElement | Window = scrollParent ?? window;
    const firstY = safeNodes[0].y;
    const lastY = safeNodes[safeNodes.length - 1].y;
    let raf = 0;

    const update = () => {
      const rect = el.getBoundingClientRect();
      const viewportH = scrollParent ? scrollParent.clientHeight : window.innerHeight;
      // Anchor the trigger points to where the first/last marker actually
      // sit inside the container, not the container's own edges — otherwise
      // the car (which ends up near the container's top) can scroll out of
      // view before progress ever reaches 1.
      const rectTopAtStart = viewportH * 0.82 - firstY;
      const rectTopAtEnd = viewportH * 0.32 - lastY;
      const span = rectTopAtStart - rectTopAtEnd || 1;
      const p = Math.min(1, Math.max(0, (rectTopAtStart - rect.top) / span));
      rawProgress.set(p);
      const idx = safeNodes.length > 1 ? Math.round(p * (safeNodes.length - 1)) : 0;
      setRevealed((r) => Math.max(r, Math.min(safeNodes.length, idx + 1)));
    };

    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        update();
      });
    };

    update();
    target.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      target.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeNodes.length]);

  const progressStops = safeNodes.length > 1 ? safeNodes.map((_, i) => i / (safeNodes.length - 1)) : [0, 1];
  const carXPct = useTransform(
    smoothProgress,
    progressStops,
    safeNodes.length > 1 ? safeNodes.map((p) => p.xPct) : [safeNodes[0].xPct, safeNodes[0].xPct]
  );
  const carLeft = useTransform(carXPct, (v) => `${v}%`);
  const carTop = useTransform(
    smoothProgress,
    progressStops,
    safeNodes.length > 1 ? safeNodes.map((p) => p.y) : [safeNodes[0].y, safeNodes[0].y]
  );

  if (n === 0) return null;

  return (
    <>
      <div className="md:hidden">
        <VerticalLeft items={items} />
      </div>

      <div ref={containerRef} className="relative mx-auto mt-14 hidden max-w-3xl md:block" style={{ height }}>
        <svg
          viewBox={`0 0 100 ${height}`}
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full"
        >
          {nodes.slice(1).map((p, idx) => {
            const prev = nodes[idx];
            return (
              <line
                key={idx}
                x1={prev.xPct}
                y1={prev.y}
                x2={p.xPct}
                y2={p.y}
                stroke={GROWTH_PALETTE[(idx + 1) % GROWTH_PALETTE.length]}
                strokeWidth="3"
                strokeDasharray="1 10"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
            );
          })}
        </svg>

        {n > 1 && (
          <motion.div className="absolute z-20" style={{ left: carLeft, top: carTop }}>
            <div style={{ transform: "translate(-50%, -78%)" }}>
              <motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}>
                <CarIcon />
                <div className="mx-auto mt-0.5 h-1.5 w-8 rounded-full bg-ink/15 blur-[1px]" />
              </motion.div>
            </div>
          </motion.div>
        )}

        {nodes.map((p, i) => {
          const item = items[i];
          const color = GROWTH_PALETTE[i % GROWTH_PALETTE.length];
          const isVisible = i < revealed;
          return (
            <div
              key={item.date}
              className="absolute flex items-center"
              style={{ left: `${p.xPct}%`, top: p.y, transform: "translateY(-50%)" }}
            >
              <span
                className="relative z-10 grid h-8 w-8 flex-shrink-0 place-items-center rounded-full border-[3px] bg-ivory"
                style={{ borderColor: color }}
              >
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
              </span>
              <motion.div
                className="ml-2"
                initial={false}
                animate={isVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: -16 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              >
                <div
                  className="flex max-w-[260px] items-center gap-3 rounded-full py-2 pl-2 pr-5 text-white shadow-flat"
                  style={{ background: color }}
                >
                  <span className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-full bg-white/20">
                    <GrowthIcon variant={i % 2 === 0 ? 0 : 1} />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-heading text-base italic leading-tight">{item.date}</span>
                    <span className="block truncate font-serif text-sm text-white/90 leading-tight">
                      {item.title}
                    </span>
                  </span>
                </div>
              </motion.div>
            </div>
          );
        })}
      </div>
    </>
  );
}

export function TimelineVariant({
  content,
  variant = "alternating",
}: {
  content: TimelineContent;
  variant?: string;
}) {
  return (
    <Section className="text-center">
      <Eyebrow>Hành trình</Eyebrow>
      <Divider />

      {variant === "verticalLeft" && <VerticalLeft items={content.items} />}
      {variant === "horizontalScroll" && <Growth items={content.items} />}
      {variant === "road" && <Road items={content.items} />}
      {(variant === "alternating" || !(variant in timelineRegistry)) && (
        <Alternating items={content.items} />
      )}
    </Section>
  );
}
