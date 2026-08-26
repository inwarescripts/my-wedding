import type { MapContent } from "@/types/wedding-config";
import { Section, Eyebrow, Divider } from "@/components/ui/Section";
import { Reveal } from "@/motion/Reveal";

export function MapFrame({ content }: { content: MapContent }) {
  const { lat, lng, venue, address, directionsUrl } = content;
  const embedSrc = `https://maps.google.com/maps?q=${lat},${lng}&z=16&output=embed`;

  return (
    <Section className="text-center">
      <Eyebrow>Đường đến lễ đường</Eyebrow>
      <Divider />
      <p className="font-heading text-2xl italic text-ink">{venue}</p>
      <p className="mt-1 font-serif text-ink-soft">{address}</p>

      <Reveal
        preset="fade"
        className="mt-8 aspect-video w-full overflow-hidden border border-line"
      >
        <iframe
          src={embedSrc}
          title={`Bản đồ ${venue}`}
          loading="lazy"
          className="h-full w-full grayscale-[15%]"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </Reveal>

      <a
        href={directionsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-8 inline-flex items-center gap-2 border border-ink px-8 py-3 text-sm tracking-[0.2em] uppercase text-ink transition-colors hover:bg-ink hover:text-ivory"
      >
        Chỉ đường
      </a>
    </Section>
  );
}
