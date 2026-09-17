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
          className="font-heading text-4xl italic leading-[1.1] md:text-6xl"
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

/** A wide, flattened dome (a rectangle whose bottom corners are `50%`
 * radius — far wider than tall, so it reads as a gentle arch rather than a
 * true semicircle) in a fixed deep-red/gold "Song Hỷ" palette, independent
 * of the project's chosen colour theme — same reasoning as the opening
 * gate's RedDoorOverlay/EnvelopeOverlay: this look IS a red-and-gold
 * festive invitation, not "whatever accent colour happens to be picked".
 * The cover photo, in its own arched frame, overlaps up into the dome's
 * bottom edge (negative margin) so it reads as emerging from underneath it
 * rather than sitting as a separate block below. */
function DomeChuHyHero({
  couple,
  typographyVariant = "wordReveal",
  bowStyle = "none",
  projectId,
  chatPosition = "default",
}: HeroProps) {
  return (
    <section className="relative w-full overflow-hidden bg-ivory">
      {chatPosition === "default" && <LiveWishesOverlay projectId={projectId} />}

      <div
        className="relative bg-gradient-to-b from-[#8a1119] to-[#5c0c11] px-6 pb-24 pt-14 text-center text-[#f6ead0]"
        style={{ borderBottomLeftRadius: "50%", borderBottomRightRadius: "50%" }}
      >
        <p className="text-xs tracking-[0.5em] uppercase text-[#f6ead0]/70">
          Welcome to our wedding
        </p>
        <div className="mx-auto mt-7 flex max-w-xl items-center justify-center gap-4 sm:gap-8">
          <div className="flex-1 text-right">
            <p className="text-xs tracking-[0.25em] uppercase text-[#e0b74a]">Chú rể</p>
            <p className="mt-1 truncate pt-2 font-script text-4xl leading-[1.3] sm:text-5xl">
              {couple.groomName}
            </p>
          </div>
          <Image
            src="/flower/chu-hy.webp"
            alt=""
            aria-hidden
            width={56}
            height={56}
            className="h-10 w-10 flex-shrink-0 sm:h-12 sm:w-12"
          />
          <div className="flex-1 text-left">
            <p className="text-xs tracking-[0.25em] uppercase text-[#e0b74a]">Cô dâu</p>
            <p className="mt-1 truncate pt-2 font-script text-4xl leading-[1.3] sm:text-5xl">
              {couple.brideName}
            </p>
          </div>
        </div>
        <p className="mt-8 flex items-center justify-center gap-3 font-script text-2xl text-[#f6ead0]/85">
          <span aria-hidden>✦</span> Love never fails <span aria-hidden>✦</span>
        </p>
      </div>

      <Reveal preset="fade" className="relative z-10 mx-auto -mt-20 w-full max-w-[300px] sm:max-w-sm">
        <div
          className="relative overflow-hidden border-4 border-ivory shadow-flat"
          style={{ aspectRatio: "3 / 4.6", borderTopLeftRadius: "999px", borderTopRightRadius: "999px" }}
        >
          {couple.coverImage && !isVideoUrl(couple.coverImage) && (
            <Image
              src={couple.coverImage}
              alt={couple.displayName}
              fill
              sizes="(min-width: 640px) 384px, 300px"
              quality={90}
              priority
              className="object-cover"
            />
          )}
        </div>
      </Reveal>

      <div className="px-6 pb-16 pt-8 text-center">
        <AnimatedHeading
          as="h1"
          variant={typographyVariant}
          className="font-heading text-3xl italic leading-tight text-ink md:text-5xl"
        >
          {couple.displayName}
        </AnimatedHeading>
        <div className="mx-auto mt-5 flex items-center justify-center gap-4 text-sm tracking-[0.3em] text-ink-soft md:text-base">
          <span className="h-px w-10 bg-line" />
          {formatDate(couple.weddingDate)}
          <span className="h-px w-10 bg-line" />
        </div>
        <BowOrnament variant={bowStyle} className="mt-6" />
      </div>
    </section>
  );
}

/** An oval-cropped photo draped with a real watercolour floral wreath —
 * one bouquet arching over the top like a crown, a rounder second bouquet
 * anchored at the bottom as if the photo were nestled inside it. Reuses
 * the same real-flower-photo assets (not hand-drawn line art) already used
 * for the Story/Family "floral photo" treatments, in the currently very
 * popular oval-frame-plus-wreath invitation composition — soft, airy,
 * ivory-on-ivory rather than the dome layout's saturated red-and-gold. */
function OvalWreathHero({
  couple,
  typographyVariant = "wordReveal",
  bowStyle = "none",
  projectId,
  chatPosition = "default",
}: HeroProps) {
  return (
    // Same real botanical watermark (not theme-recoloured) already used as
    // the optional site-wide "floral" background pattern — laid on
    // directly here so this wreath-themed layout gets it regardless of
    // that separate setting, instead of the plain flat bg-ivory it painted
    // over whenever that pattern wasn't the one picked.
    <section
      className="relative w-full overflow-hidden bg-ivory px-6 py-20 text-center md:py-28"
      style={{
        backgroundImage: "url(/flower/bg-main.webp)",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "top left",
        backgroundSize: "min(380px, 75vw) auto",
      }}
    >
      {chatPosition === "default" && <LiveWishesOverlay projectId={projectId} />}

      <p className="text-xs tracking-[0.5em] uppercase text-ink-soft">Save the date</p>

      <Reveal preset="scaleIn" className="relative mx-auto mt-10 w-full max-w-[300px] sm:max-w-sm">
        <div className="pointer-events-none absolute -top-16 left-1/2 z-10 h-28 w-[135%] -translate-x-1/2 sm:-top-20 sm:h-36">
          <Image
            src="/flower1-decoration.webp"
            alt=""
            aria-hidden
            fill
            sizes="360px"
            className="object-contain drop-shadow-sm"
          />
        </div>

        <div
          // A full 50% ellipse cropped away too much of the photo at the
          // top/bottom to actually read as a person — a softer rounded
          // rectangle keeps almost the whole frame while still feeling
          // "oval-ish" next to the wreath.
          className="relative overflow-hidden rounded-[38%/24%] border-4 border-ivory shadow-flat"
          style={{ aspectRatio: "3 / 4.4" }}
        >
          {couple.coverImage && !isVideoUrl(couple.coverImage) && (
            <Image
              src={couple.coverImage}
              alt={couple.displayName}
              fill
              sizes="(min-width: 640px) 384px, 300px"
              quality={90}
              priority
              className="object-cover"
            />
          )}
        </div>

        <div className="pointer-events-none absolute -bottom-10 left-1/2 z-10 h-24 w-32 -translate-x-1/2 sm:-bottom-12 sm:h-28 sm:w-36">
          <Image
            src="/flower4-decoration.webp"
            alt=""
            aria-hidden
            fill
            sizes="160px"
            className="object-contain drop-shadow-sm"
          />
        </div>

        {/* Two swallows flying in toward the oval from each side — mirrored
            copies of the same artwork, same motif as ArchFrameHero. */}
        <Image
          src="/chim-en.webp"
          alt=""
          aria-hidden
          width={140}
          height={128}
          className="pointer-events-none absolute left-[-10%] top-[-6%] z-10 w-[26%] -scale-x-100 drop-shadow-sm"
        />
        <Image
          src="/chim-en.webp"
          alt=""
          aria-hidden
          width={140}
          height={128}
          className="pointer-events-none absolute right-[-10%] top-[-6%] z-10 w-[26%] drop-shadow-sm"
        />
      </Reveal>

      <AnimatedHeading
        as="h1"
        variant={typographyVariant}
        className="mx-auto mt-16 max-w-2xl font-heading text-4xl italic leading-[1.15] text-ink md:mt-20 md:text-6xl"
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
  if (layout === "domeChuHy") return <DomeChuHyHero {...props} />;
  if (layout === "ovalWreath") return <OvalWreathHero {...props} />;
  return <FullBleedHero {...props} />;
}
