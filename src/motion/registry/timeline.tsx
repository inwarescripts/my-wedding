import type { TimelineContent } from "@/types/wedding-config";
import { Section, Eyebrow, Divider } from "@/components/ui/Section";
import { Reveal } from "@/motion/Reveal";

export type TimelineVariant = "alternating" | "verticalLeft" | "horizontalScroll";

export const timelineRegistry: Record<TimelineVariant, { label: string }> = {
  alternating: { label: "So le hai bên" },
  verticalLeft: { label: "Một cột bên trái" },
  horizontalScroll: { label: "Cuộn ngang" },
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

function HorizontalScroll({ items }: { items: TimelineContent["items"] }) {
  return (
    <div className="mt-14 flex snap-x snap-mandatory gap-6 overflow-x-auto pb-6 no-scrollbar">
      {items.map((item) => (
        <div
          key={item.date}
          className="card-flat w-[75%] flex-shrink-0 snap-center px-6 py-8 md:w-[28%]"
        >
          <p className="font-heading text-2xl italic text-accent">{item.date}</p>
          <p className="mt-2 font-heading text-lg text-ink">{item.title}</p>
          <p className="mt-2 font-serif text-base text-ink-soft">{item.desc}</p>
        </div>
      ))}
    </div>
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
      {variant === "horizontalScroll" && <HorizontalScroll items={content.items} />}
      {(variant === "alternating" || !(variant in timelineRegistry)) && (
        <Alternating items={content.items} />
      )}
    </Section>
  );
}
