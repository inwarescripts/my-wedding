"use client";

import { Section, Eyebrow, Divider } from "@/components/ui/Section";
import { Reveal } from "@/motion/Reveal";
import { useCountdown } from "@/lib/useCountdown";

export function Countdown({
  weddingDate,
  weddingDateLunar,
}: {
  weddingDate: string;
  weddingDateLunar?: string | null;
}) {
  const time = useCountdown(weddingDate);

  const units: [string, number][] = [
    ["Ngày", time?.days ?? 0],
    ["Giờ", time?.hours ?? 0],
    ["Phút", time?.minutes ?? 0],
    ["Giây", time?.seconds ?? 0],
  ];

  return (
    <Section className="text-center">
      <Eyebrow>Đếm ngược</Eyebrow>
      <Divider />
      {weddingDateLunar && (
        <p className="font-serif text-lg text-ink-soft">{weddingDateLunar}</p>
      )}

      <Reveal
        preset="fade"
        className="mx-auto mt-10 flex max-w-xl justify-center gap-4 md:gap-8"
      >
        {units.map(([label, value]) => (
          <div key={label} className="flex-1">
            <div className="card-flat py-6">
              <span className="font-heading text-4xl tabular-nums text-ink md:text-6xl">
                {String(value).padStart(2, "0")}
              </span>
            </div>
            <span className="mt-3 block text-xs tracking-[0.3em] uppercase text-ink-soft">
              {label}
            </span>
          </div>
        ))}
      </Reveal>
    </Section>
  );
}
