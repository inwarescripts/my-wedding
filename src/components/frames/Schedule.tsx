import type { ScheduleContent, ScheduleItem } from "@/types/wedding-config";
import { Section, Eyebrow } from "@/components/ui/Section";
import { Reveal } from "@/motion/Reveal";
import { ScheduleIcon } from "@/motion/registry/scheduleIcon";
import { BowOrnament } from "@/motion/registry/bow";
import { FloralOrnament } from "@/motion/registry/family";

/** A wide horizontal vine-and-blossom flourish — stands in for the shared
 * <Divider/> just here, since this section wanted something more striking
 * than the standard short line+diamond every other section uses. Flat
 * line-art (`currentColor` stroke), same visual language as FloralOrnament/
 * BowOrnament; the blossom centre punches through to the page background
 * instead of being solid, so it doesn't look like a plain filled dot. */
function ScheduleFloralDivider({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`${compact ? "my-4" : "my-6"} flex justify-center text-gold`} aria-hidden>
      <svg
        className={compact ? "h-4 w-36 sm:h-5 sm:w-44" : "h-5 w-56 sm:h-6 sm:w-72"}
        viewBox="0 0 220 24"
        fill="none"
      >
        <path
          d="M4 12 C 30 12 46 6 62 12 C 78 18 94 12 100 12"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
        />
        <path
          d="M216 12 C 190 12 174 6 158 12 C 142 18 126 12 120 12"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
        />
        <g stroke="currentColor" strokeWidth="0.9" fill="none">
          <ellipse cx="18" cy="9" rx="6" ry="2.6" transform="rotate(-20 18 9)" />
          <ellipse cx="40" cy="15" rx="6.4" ry="2.7" transform="rotate(18 40 15)" />
          <ellipse cx="64" cy="8" rx="5.6" ry="2.4" transform="rotate(-24 64 8)" />
          <ellipse cx="86" cy="15" rx="5.2" ry="2.2" transform="rotate(20 86 15)" />
          <ellipse cx="202" cy="9" rx="6" ry="2.6" transform="rotate(20 202 9)" />
          <ellipse cx="180" cy="15" rx="6.4" ry="2.7" transform="rotate(-18 180 15)" />
          <ellipse cx="156" cy="8" rx="5.6" ry="2.4" transform="rotate(24 156 8)" />
          <ellipse cx="134" cy="15" rx="5.2" ry="2.2" transform="rotate(-20 134 15)" />
        </g>
        <g fill="currentColor">
          <ellipse cx="110" cy="6" rx="3.4" ry="5.2" />
          <ellipse cx="110" cy="18" rx="3.4" ry="5.2" />
          <ellipse cx="102" cy="12" rx="5.2" ry="3.4" />
          <ellipse cx="118" cy="12" rx="5.2" ry="3.4" />
        </g>
        <circle cx="110" cy="12" r="2.4" fill="var(--color-ivory)" />
      </svg>
    </div>
  );
}

function TimelineSchedule({ items, bowStyle }: { items: ScheduleItem[]; bowStyle: string }) {
  return (
    <>
      <BowOrnament variant={bowStyle} className="-mt-2" />
      <div className="relative mx-auto mt-12 w-fit max-w-full">
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
              className="grid grid-cols-[56px_44px_1fr] items-center gap-3 text-center"
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
    </>
  );
}

/** Dashed outline with diagonal "cut corners" — no filled background, so
 * it stays in step with every other section on the page (all plain/
 * transparent, see WeddingRenderer) instead of reintroducing a solid
 * colour block. The shape alone (not colour) is what makes this card feel
 * distinct from the rest of the timeline variants. */
function CardSchedule({ items }: { items: ScheduleItem[] }) {
  return (
    <div
      // Diagonal "cut corners" — top-right and bottom-left rounded large,
      // the opposite two kept small — instead of a plain rounded rectangle.
      className="relative mx-auto mt-12 max-w-lg overflow-hidden rounded-tl-lg rounded-tr-[5rem] rounded-br-lg rounded-bl-[5rem] border-2 border-dashed border-accent-soft/70 px-8 py-10 text-center sm:px-10 sm:py-12"
    >
      {/* Small floral flourishes tucked into the two large-radius corners —
          echoes the corner ornaments other card variants (InvitationFamily)
          use, so this card doesn't read as bare next to them. */}
      <FloralOrnament className="pointer-events-none absolute -right-1 -top-1 h-16 w-16 text-gold/50 [transform:scaleX(-1)]" />
      <FloralOrnament className="pointer-events-none absolute -bottom-1 -left-1 h-16 w-16 rotate-180 text-gold/50" />

      <p className="relative mb-2 font-heading text-lg font-bold uppercase tracking-wide text-ink">
        Lịch trình ngày cưới
      </p>
      <ScheduleFloralDivider compact />

      <div className="relative mx-auto w-fit">
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
              className="grid grid-cols-[56px_44px_1fr] items-center gap-3"
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
    </div>
  );
}

export function Schedule({
  content,
  bowStyle = "none",
  variant = "timeline",
}: {
  content: ScheduleContent;
  bowStyle?: string;
  variant?: string;
}) {
  const items = content.items ?? [];
  if (items.length === 0) return null;

  return (
    <Section className="text-center">
      <Eyebrow>Lịch trình</Eyebrow>
      <ScheduleFloralDivider />

      {variant === "card" ? (
        <CardSchedule items={items} />
      ) : (
        <TimelineSchedule items={items} bowStyle={bowStyle} />
      )}
    </Section>
  );
}
