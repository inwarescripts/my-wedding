"use client";

import Image from "next/image";
import type { CoupleInfo } from "@/types/wedding-config";
import { useParallax } from "@/motion/useParallax";
import { AnimatedHeading } from "@/motion/registry/typography";
import { isVideoUrl } from "@/lib/media";
import { BowOrnament } from "@/motion/registry/bow";
import { LiveWishesOverlay } from "@/components/LiveWishesOverlay";
import { SmartCoverImage } from "@/components/SmartCoverImage";
import { Reveal } from "@/motion/Reveal";
import { ARCH_FRAME_INNER_PATH, archFrameInnerMask } from "@/motion/registry/heroLayout";

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")} THÁNG ${String(
    d.getMonth() + 1
  ).padStart(2, "0")}, ${d.getFullYear()}`;
}

interface HeroProps {
  couple: CoupleInfo;
  typographyVariant?: string;
  bowStyle?: string;
  projectId: string;
  /** "default" renders the live-wishes stream here, drifting over the
   * Hero photo as always. Anything else ("bottomLeft"/"bottomRight") means
   * WeddingRenderer is already mounting a `fixed`, always-visible instance
   * of its own — rendering a second copy here would double it up. */
  chatPosition?: string;
}

function FullBleedHero({
  couple,
  typographyVariant = "wordReveal",
  bowStyle = "none",
  projectId,
  chatPosition = "default",
}: HeroProps) {
  const parallaxRef = useParallax<HTMLDivElement>(0.3);

  return (
    <section className="relative h-[100svh] w-full overflow-hidden">
      <div ref={parallaxRef} className="absolute inset-0 -top-[10%] h-[120%]">
        {couple.coverImage &&
          (isVideoUrl(couple.coverImage) ? (
            <video
              src={couple.coverImage}
              autoPlay
              muted
              loop
              playsInline
              className="h-full w-full object-cover"
            />
          ) : (
            <SmartCoverImage
              src={couple.coverImage}
              alt={couple.displayName}
              sizes="100vw"
              quality={90}
              priority
              backdropClassName="opacity-80"
            />
          ))}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-ink/30" />
      {chatPosition === "default" && <LiveWishesOverlay projectId={projectId} />}

      <div className="relative z-10 flex h-full flex-col items-center justify-end px-6 pb-16 text-center text-ivory md:pb-24">
        <p className="mb-4 text-xs tracking-[0.5em] uppercase text-ivory/80">
          Save the date
        </p>
        <AnimatedHeading
          as="h1"
          variant={typographyVariant}
          className="font-heading text-5xl italic leading-[1.05] md:text-8xl"
        >
          {couple.displayName}
        </AnimatedHeading>
        <div className="mt-6 flex items-center gap-4 text-sm tracking-[0.3em] text-ivory/85 md:text-base">
          <span className="h-px w-10 bg-ivory/50" />
          {formatDate(couple.weddingDate)}
          <span className="h-px w-10 bg-ivory/50" />
        </div>
        <BowOrnament variant={bowStyle} className="mt-6" />
      </div>

      <div className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-ivory/70">
        <div className="h-10 w-6 rounded-full border border-ivory/50 p-1">
          <span className="block h-1.5 w-1.5 animate-bounce rounded-full bg-ivory" />
        </div>
      </div>
    </section>
  );
}

/** The couple's cover photo masked (so it works for any photo without
 * pre-editing it) to public/frame.svg's arched inner silhouette — no
 * colored border drawn on top, just the photo's own cropped arch edge
 * against the section's ivory background, matching the reference design.
 * A pair of swallows (public/chim-en.webp, mirrored) fly in toward the
 * arch's peak — the classic "chim én" motif on a Vietnamese printed
 * invitation. Static (not `h-[100svh]`, no parallax): the whole point is
 * a composed card, not an immersive photo backdrop. */
function ArchFrameHero({
  couple,
  typographyVariant = "wordReveal",
  bowStyle = "none",
  projectId,
  chatPosition = "default",
}: HeroProps) {
  return (
    <section className="relative w-full overflow-hidden bg-ivory px-6 py-20 text-center md:py-28">
      {chatPosition === "default" && <LiveWishesOverlay projectId={projectId} />}

      <Reveal preset="fade" className="relative mx-auto w-full max-w-[340px] sm:max-w-sm md:max-w-md">
        <div className="relative translate-x-[3px]" style={{ aspectRatio: "754 / 1099" }}>
          {couple.coverImage && !isVideoUrl(couple.coverImage) && (
            <div
              // Fills the frame edge to edge — the photo and the frame
              // line share the exact same ARCH_FRAME_INNER_PATH shape at
              // the exact same size, so the crop lands right on the
              // border with no gap.
              className="absolute inset-0"
              style={{
                maskImage: archFrameInnerMask(),
                maskSize: "100% 100%",
                maskRepeat: "no-repeat",
                maskPosition: "center",
                WebkitMaskImage: archFrameInnerMask(),
                WebkitMaskSize: "100% 100%",
                WebkitMaskRepeat: "no-repeat",
                WebkitMaskPosition: "center",
              }}
            >
              <Image
                src={couple.coverImage}
                alt={couple.displayName}
                fill
                sizes="(min-width: 768px) 448px, (min-width: 640px) 384px, 340px"
                quality={90}
                priority
                className="object-cover"
              />
            </div>
          )}
          {/* The ornate scalloped arch — frame.svg's actual decorative
              silhouette — traced as the visible frame line, same shape
              and same size as the photo's own mask above so the line
              sits exactly on the photo's cropped edge. */}
          <svg
            viewBox="0 0 754 1099"
            aria-hidden
            className="pointer-events-none absolute inset-0 h-full w-full"
            fill="none"
          >
            <path d={ARCH_FRAME_INNER_PATH} stroke="var(--color-gold)" strokeWidth="4" />
          </svg>
        </div>

        {/* Two swallows flying in toward the top of the arch — mirrored
            copies of the same artwork rather than two different assets. */}
        <Image
          src="/chim-en.webp"
          alt=""
          aria-hidden
          width={140}
          height={128}
          className="pointer-events-none absolute -top-8 left-[-8%] w-[34%] -scale-x-100 drop-shadow-sm sm:-top-10"
        />
        <Image
          src="/chim-en.webp"
          alt=""
          aria-hidden
          width={140}
          height={128}
          className="pointer-events-none absolute -top-8 right-[-8%] w-[34%] drop-shadow-sm sm:-top-10"
        />
      </Reveal>

      <p className="mt-10 text-xs tracking-[0.5em] uppercase text-ink-soft">Save the date</p>
      <AnimatedHeading
        as="h1"
        variant={typographyVariant}
        className="mx-auto mt-4 max-w-2xl font-heading text-4xl italic leading-[1.15] text-ink md:text-6xl"
      >
        {couple.displayName}
      </AnimatedHeading>
      <div className="mx-auto mt-5 flex items-center justify-center gap-4 text-sm tracking-[0.3em] text-ink-soft md:text-base">
        <span className="h-px w-10 bg-line" />
        {formatDate(couple.weddingDate)}
        <span className="h-px w-10 bg-line" />
      </div>
      <BowOrnament variant={bowStyle} className="mt-6" />
    </section>
  );
}

export function Hero({ layout = "full", ...props }: HeroProps & { layout?: string }) {
  if (layout === "archFrame") return <ArchFrameHero {...props} />;
  return <FullBleedHero {...props} />;
}
