import type { ScheduleContent } from "@/types/wedding-config";
import { Section, Eyebrow, Divider } from "@/components/ui/Section";
import { Reveal } from "@/motion/Reveal";
import { ScheduleIcon } from "@/motion/registry/scheduleIcon";
import { BowOrnament } from "@/motion/registry/bow";

export function Schedule({
  content,
  bowStyle = "none",
}: {
  content: ScheduleContent;
  bowStyle?: string;
}) {
  const items = content.items ?? [];
  if (items.length === 0) return null;

  return (
    <Section className="text-center">
      <Eyebrow>Lịch trình</Eyebrow>
      <Divider />
      <BowOrnament variant={bowStyle} className="-mt-2" />

      <div className="relative mx-auto mt-12 max-w-md">
        {/* Dashed connector running through the icon column — position
            matches the grid below: time col (56px) + half the icon col
            (44px / 2 = 22px). */}
        <div
          className="absolute top-2 bottom-2 left-[78px] w-px border-l border-dashed border-line"
          aria-hidden
        />
        <div className="space-y-7">
          {items.map((item, i) => (
            <Reveal
              key={item.id}
              preset="fadeUp"
              delay={i * 0.08}
              className="grid grid-cols-[56px_44px_1fr] items-center gap-3 text-left"
            >
              <span className="font-heading text-base text-accent">{item.time}</span>
              <span className="relative z-10 flex h-11 w-11 items-center justify-center justify-self-center rounded-full border border-accent-soft bg-ivory text-accent">
                <ScheduleIcon name={item.icon} />
              </span>
              <span className="font-serif text-ink">{item.title}</span>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}
