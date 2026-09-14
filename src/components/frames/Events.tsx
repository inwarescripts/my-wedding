import Image from "next/image";
import type { EventItem } from "@/types/wedding-config";
import { Section, Eyebrow, Divider } from "@/components/ui/Section";
import { Reveal } from "@/motion/Reveal";

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")}.${String(
    d.getMonth() + 1
  ).padStart(2, "0")}.${d.getFullYear()}`;
}

export function Events({
  events,
  variant = "floral",
}: {
  events: EventItem[];
  variant?: string;
}) {
  return (
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

          {/* A real flower photo (not line-art) vertically centred on each
              outer edge — same asset pair used on the Story section's
              photo. Rises into place once as the section scrolls into view
              (same one-shot Reveal/fadeUp every other section uses), then
              stays put; not a looping ambient effect. The centring
              transform lives on this wrapper, not the Reveal itself, since
              framer-motion drives its own inline `transform` for the fade
              animation and would otherwise wipe out any transform utility
              classes placed on the same element. */}
          {variant === "floral" && (
            <>
              <div className="pointer-events-none absolute left-0 top-1/2 hidden h-36 w-36 -translate-x-1/2 -translate-y-1/2 md:block lg:h-44 lg:w-44">
                <Reveal preset="fadeUp" delay={0.3} duration={1.3} className="relative h-full w-full">
                  <Image
                    src="/flower3-decoration.webp"
                    alt=""
                    fill
                    sizes="180px"
                    className="object-contain drop-shadow-[0_8px_16px_rgba(43,38,33,0.18)]"
                  />
                </Reveal>
              </div>
              <div className="pointer-events-none absolute right-0 top-1/2 hidden h-36 w-36 [transform:translate(50%,-50%)_scaleX(-1)] md:block lg:h-44 lg:w-44">
                <Reveal preset="fadeUp" delay={0.45} duration={1.3} className="relative h-full w-full">
                  <Image
                    src="/flower3-decoration.webp"
                    alt=""
                    fill
                    sizes="180px"
                    className="object-contain drop-shadow-[0_8px_16px_rgba(43,38,33,0.18)]"
                  />
                </Reveal>
              </div>
            </>
          )}

          {/* A "囍" medallion floating in the gap between the two event
              cards — always shown regardless of the floral decoration
              option above. Desktop only (md:flex): on the single-column
              mobile layout the cards stack and there's no gap to sit in. */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 z-20 hidden h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-gold/50 bg-ivory shadow-flat md:flex lg:h-20 lg:w-20">
            <Reveal preset="scaleIn" delay={0.2} className="relative h-10 w-10 lg:h-12 lg:w-12">
              <Image src="/flower/chu-hy.webp" alt="" fill sizes="80px" className="object-contain" />
            </Reveal>
          </div>
        </div>
      </Section>
  );
}
