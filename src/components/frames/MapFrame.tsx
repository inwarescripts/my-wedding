import type { MapContent } from "@/types/wedding-config";
import { Section, Eyebrow, Divider } from "@/components/ui/Section";
import { Reveal } from "@/motion/Reveal";
import { MapModalButton } from "@/components/MapModalButton";

export function MapFrame({ content }: { content: MapContent }) {
  const { lat, lng, venue, address, directionsUrl } = content;

  return (
    <Section className="text-center">
      <Eyebrow>Đường đến lễ đường</Eyebrow>
      <Divider />
      <p className="font-heading text-2xl italic text-ink">{venue}</p>
      <p className="mt-1 font-serif text-ink-soft">{address}</p>

      <Reveal preset="fade" className="mt-8">
        <MapModalButton
          title={venue}
          lat={lat}
          lng={lng}
          address={address}
          directionsUrl={directionsUrl}
        />
      </Reveal>
    </Section>
  );
}
