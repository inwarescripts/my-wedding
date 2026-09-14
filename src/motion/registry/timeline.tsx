"use client";

import type { TimelineContent } from "@/types/wedding-config";
import { Section, Eyebrow, Divider } from "@/components/ui/Section";
import { Reveal } from "@/motion/Reveal";

export type TimelineVariant = "alternating" | "verticalLeft" | "road";

export const timelineRegistry: Record<TimelineVariant, { label: string }> = {
  alternating: { label: "So le hai bên" },
  verticalLeft: { label: "Một cột bên trái" },
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
      {variant === "road" && <Road items={content.items} />}
      {(variant === "alternating" || !(variant in timelineRegistry)) && (
        <Alternating items={content.items} />
      )}
    </Section>
  );
}
