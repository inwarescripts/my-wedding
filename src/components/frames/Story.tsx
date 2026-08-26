import Image from "next/image";
import type { StoryContent } from "@/types/wedding-config";
import { Section, Eyebrow, Divider } from "@/components/ui/Section";
import { Reveal } from "@/motion/Reveal";
import { AnimatedHeading } from "@/motion/registry/typography";
import { BowOrnament } from "@/motion/registry/bow";

export function Story({
  content,
  quote,
  typographyVariant = "wordReveal",
  bowStyle = "none",
}: {
  content: StoryContent;
  quote?: string | null;
  typographyVariant?: string;
  bowStyle?: string;
}) {
  return (
    <Section className="grid items-center gap-14 md:grid-cols-2 md:gap-20">
      <Reveal
        preset="scaleIn"
        className="relative order-2 aspect-[4/5] w-full overflow-hidden md:order-1"
      >
        {content.image && (
          <Image
            src={content.image}
            alt="Câu chuyện của chúng tôi"
            fill
            sizes="(min-width: 768px) 45vw, 90vw"
            quality={90}
            className="object-cover"
          />
        )}
      </Reveal>

      <div className="order-1 md:order-2">
        <Eyebrow>{content.eyebrow}</Eyebrow>
        <AnimatedHeading
          as="h2"
          variant={typographyVariant}
          className="font-heading text-3xl italic leading-tight text-ink md:text-5xl"
        >
          {content.title}
        </AnimatedHeading>
        <Divider />
        <BowOrnament variant={bowStyle} className="-mt-2 mb-4" />
        {content.paragraphs.map((p, i) => (
          <Reveal key={i} preset="fadeUp" delay={i * 0.1}>
            <p className="mb-4 font-serif text-lg leading-relaxed text-ink-soft md:text-xl">
              {p}
            </p>
          </Reveal>
        ))}
        {quote && (
          <Reveal preset="fade" delay={0.3}>
            <p className="mt-6 font-script text-3xl text-accent">
              &ldquo;{quote}&rdquo;
            </p>
          </Reveal>
        )}
      </div>
    </Section>
  );
}
