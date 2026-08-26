import type { FamilyContent, FamilySide } from "@/types/wedding-config";
import { Section, Eyebrow, Divider } from "@/components/ui/Section";
import { Reveal } from "@/motion/Reveal";

function FamilyCard({ side, align }: { side: FamilySide; align: "left" | "right" }) {
  const map = side.map;
  return (
    <Reveal
      preset={align === "left" ? "fadeRight" : "fadeLeft"}
      className="card-flat px-8 py-10 text-center"
    >
      <p className="font-script text-3xl text-accent">{side.title}</p>
      <div className="mx-auto my-4 h-px w-10 bg-line" />
      <p className="font-serif text-lg text-ink">{side.father}</p>
      <p className="font-serif text-lg text-ink">{side.mother}</p>

      {map?.enabled && (
        <div className="mt-6 text-left">
          {map.address && (
            <p className="mb-3 text-center font-serif text-sm text-ink-soft">{map.address}</p>
          )}
          <div className="aspect-video w-full overflow-hidden border border-line">
            <iframe
              src={`https://maps.google.com/maps?q=${map.lat},${map.lng}&z=16&output=embed`}
              title={`Bản đồ ${side.title}`}
              loading="lazy"
              className="h-full w-full grayscale-[15%]"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          {map.directionsUrl && (
            <a
              href={map.directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex w-full items-center justify-center gap-2 border border-ink px-6 py-2.5 text-xs tracking-[0.2em] uppercase text-ink transition-colors hover:bg-ink hover:text-ivory"
            >
              Chỉ đường
            </a>
          )}
        </div>
      )}
    </Reveal>
  );
}

export function Family({ content }: { content: FamilyContent }) {
  return (
    // Same themed "banded section" treatment as Events — ivory-deep/line are
    // CSS vars from the project's own colour theme (see themeCssVars), so
    // this always matches the configured theme instead of a fixed colour.
    <div className="border-y border-line bg-ivory-deep">
      <Section className="text-center">
        <Eyebrow>Gia đình hai bên</Eyebrow>
        <Divider />

        <div className="mt-12 grid gap-8 md:grid-cols-2">
          <FamilyCard side={content.groom} align="left" />
          <FamilyCard side={content.bride} align="right" />
        </div>
      </Section>
    </div>
  );
}
