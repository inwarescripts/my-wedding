import type { EventItem } from "@/types/wedding-config";
import { Section, Eyebrow, Divider } from "@/components/ui/Section";
import { Reveal } from "@/motion/Reveal";
import { BouquetOrnament } from "@/motion/registry/bouquet";

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")}.${String(
    d.getMonth() + 1
  ).padStart(2, "0")}.${d.getFullYear()}`;
}

export function Events({ events }: { events: EventItem[] }) {
  return (
    // ivory-deep + line border are theme CSS vars (see themeCssVars in
    // motion/registry/theme.tsx, applied on <main> in WeddingRenderer) —
    // same "banded section" treatment as the landing page's bottom CTA, so
    // this backdrop always matches whichever colour theme the project has
    // configured instead of a fixed colour that could clash with it.
    <div className="border-y border-line bg-ivory-deep">
      <Section className="text-center">
        <Eyebrow>Lễ cưới</Eyebrow>
        <Divider />

        <div className="relative mt-12">
          <div className="grid gap-6 md:grid-cols-2">
            {events.map((event, i) => (
              <Reveal
                key={event.id}
                preset="fadeUp"
                delay={i * 0.12}
                className="card-flat px-8 py-10"
              >
                <p className="font-heading text-2xl italic text-ink">{event.name}</p>
                <p className="mt-3 font-heading text-4xl text-accent">
                  {formatDate(event.date)}
                </p>
                {event.time && (
                  <p className="mt-1 text-sm tracking-widest text-ink-soft">
                    {event.time}
                  </p>
                )}
                <div className="mx-auto my-5 h-px w-10 bg-line" />
                <p className="font-serif text-lg text-ink">{event.venue}</p>
                {event.address && (
                  <p className="mt-1 font-serif text-sm text-ink-soft">
                    {event.address}
                  </p>
                )}
              </Reveal>
            ))}
          </div>

          {/* A bouquet vertically centred on each outer edge — rises into
              place once as the section scrolls into view (same one-shot
              Reveal/fadeUp every other section uses), then stays put. Not a
              looping ambient effect; a fixed decoration, one per side.
              The centring/flip transform lives on this wrapper, not on the
              Reveal itself, since framer-motion drives its own inline
              `transform` for the fade animation and would otherwise wipe out
              any transform utility classes placed on the same element. */}
          <div className="pointer-events-none absolute left-0 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 md:block">
            <Reveal preset="fadeUp" delay={0.3} duration={1.3}>
              <BouquetOrnament className="h-28 w-28 lg:h-32 lg:w-32" />
            </Reveal>
          </div>
          <div className="pointer-events-none absolute right-0 top-1/2 hidden -translate-y-1/2 translate-x-1/2 -scale-x-100 md:block">
            <Reveal preset="fadeUp" delay={0.45} duration={1.3}>
              <BouquetOrnament className="h-28 w-28 lg:h-32 lg:w-32" />
            </Reveal>
          </div>
        </div>
      </Section>
    </div>
  );
}
