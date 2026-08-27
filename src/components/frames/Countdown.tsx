"use client";

import { Fragment } from "react";
import { Section, Eyebrow, Divider } from "@/components/ui/Section";
import { Reveal } from "@/motion/Reveal";
import { BowOrnament } from "@/motion/registry/bow";
import { useCountdown } from "@/lib/useCountdown";

export function Countdown({
  weddingDate,
  weddingDateLunar,
  bowStyle = "none",
}: {
  weddingDate: string;
  weddingDateLunar?: string | null;
  bowStyle?: string;
}) {
  const time = useCountdown(weddingDate);

  const units: [string, number][] = [
    ["Ngày", time?.days ?? 0],
    ["Giờ", time?.hours ?? 0],
    ["Phút", time?.minutes ?? 0],
    ["Giây", time?.seconds ?? 0],
  ];

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

        <Reveal
          preset="fade"
          className="mx-auto mt-10 flex max-w-xl items-start justify-center gap-3 md:gap-6"
        >
          {units.map(([label, value], i) => (
            <Fragment key={label}>
              <div className="flex-1">
                <div className="relative flex aspect-square items-center justify-center rounded-full border border-accent-soft bg-ivory shadow-flat">
                  <span className="font-heading text-3xl tabular-nums text-ink md:text-5xl">
                    {String(value).padStart(2, "0")}
                  </span>
                </div>
                <span className="mt-3 block text-xs tracking-[0.3em] uppercase text-ink-soft">
                  {label}
                </span>
              </div>
              {i < units.length - 1 && (
                <span
                  aria-hidden
                  className="mt-4 font-heading text-2xl text-accent-soft md:text-3xl"
                >
                  :
                </span>
              )}
            </Fragment>
          ))}
        </Reveal>

        <BowOrnament variant={bowStyle} className="mt-10" />
      </Section>
    </div>
  );
}
