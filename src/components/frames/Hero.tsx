"use client";

import Image from "next/image";
import type { CoupleInfo } from "@/types/wedding-config";
import { useParallax } from "@/motion/useParallax";
import { AnimatedHeading } from "@/motion/registry/typography";
import { isVideoUrl } from "@/lib/media";
import { BowOrnament } from "@/motion/registry/bow";
import { LiveWishesOverlay } from "@/components/LiveWishesOverlay";

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")} THÁNG ${String(
    d.getMonth() + 1
  ).padStart(2, "0")}, ${d.getFullYear()}`;
}

export function Hero({
  couple,
  typographyVariant = "wordReveal",
  bowStyle = "none",
  projectId,
}: {
  couple: CoupleInfo;
  typographyVariant?: string;
  bowStyle?: string;
  projectId: string;
}) {
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
            <Image
              src={couple.coverImage}
              alt={couple.displayName}
              fill
              priority
              sizes="100vw"
              quality={90}
              className="object-cover"
            />
          ))}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-ink/30" />
      <LiveWishesOverlay projectId={projectId} />

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
