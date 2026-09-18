import Image from "@/components/AppImage";
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
  variant = "floral",
}: {
  content: StoryContent;
  quote?: string | null;
  typographyVariant?: string;
  bowStyle?: string;
  variant?: string;
}) {
  return (
    <Section className="grid items-start gap-14 md:grid-cols-[1.2fr_1fr] md:gap-16">
      {/* Sticks in place on desktop while the (often much taller) text
          column scrolls past, instead of leaving empty space below a
          fixed-aspect-ratio image once the text runs long. `top-24` just
          gives it some breathing room from the viewport edge while pinned;
          mobile stays static — it's a single stacked column there, nothing
          for the image to "stick" against. */}
      <div className="relative order-2 w-full md:order-1 md:sticky md:top-24">
        <Reveal preset="scaleIn" className="relative aspect-[4/5] w-full overflow-hidden">
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

        {/* Decorative bouquets overlapping the photo's corners — siblings
            of the image's own overflow-hidden box (not children), so they
            can spill past its edges instead of being clipped. */}
        {variant === "floral" && (
          <>
            <Reveal
              preset="fadeRight"
              className="pointer-events-none absolute -right-12 -top-12 z-10 h-32 w-32 sm:-right-16 sm:-top-14 sm:h-44 sm:w-44"
            >
              <Image
                src="/flower1-decoration.webp"
                alt=""
                fill
                sizes="180px"
                className="object-contain drop-shadow-[0_8px_16px_rgba(43,38,33,0.18)]"
              />
            </Reveal>
            <Reveal
              preset="fadeLeft"
              delay={0.2}
              className="pointer-events-none absolute -bottom-14 -left-14 z-10 h-40 w-40 sm:-left-16 sm:-bottom-16 sm:h-56 sm:w-56"
            >
              <Image
                src="/flower3-decoration.webp"
                alt=""
                fill
                sizes="220px"
                className="object-contain drop-shadow-[0_8px_16px_rgba(43,38,33,0.18)]"
              />
            </Reveal>
          </>
        )}
      </div>

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
