"use client";

import Image from "@/components/AppImage";
import type { CoupleInfo } from "@/types/wedding-config";
import { Reveal } from "@/motion/Reveal";
import { useParallax } from "@/motion/useParallax";
import { isVideoUrl } from "@/lib/media";
import { Fireworks } from "@/motion/registry/ambient";

export function Final({ couple }: { couple: CoupleInfo }) {
  const parallaxRef = useParallax<HTMLDivElement>(0.2);
  const backgroundImage = couple.coverImage;

  return (
    // Same theme background/text as every other section — the cover photo
    // is a low-opacity watermark, not a full-contrast dark scrim.
    <section className="relative flex h-[90svh] min-h-[560px] w-full items-center justify-center overflow-hidden bg-ivory text-ink">
      {backgroundImage && (
        <div ref={parallaxRef} className="absolute inset-0 -top-[8%] h-[116%]">
          {isVideoUrl(backgroundImage) ? (
            <video
              src={backgroundImage}
              autoPlay
              muted
              loop
              playsInline
              className="h-full w-full object-cover opacity-20"
            />
          ) : (
            <Image
              src={backgroundImage}
              alt=""
              fill
              sizes="100vw"
              quality={90}
              className="object-cover opacity-20"
            />
          )}
        </div>
      )}
      <Fireworks contained />

      <div className="relative z-10 px-6 text-center">
        <Reveal preset="fade">
          <p className="font-script text-5xl md:text-7xl">{couple.displayName}</p>
        </Reveal>
        <Reveal preset="fadeUp" delay={0.2}>
          <p className="mt-6 font-serif text-lg text-ink-soft md:text-xl">
            Cảm ơn vì đã là một phần trong câu chuyện của chúng tôi.
          </p>
        </Reveal>
        <Reveal preset="fade" delay={0.4}>
          <p className="mt-10 text-xs tracking-[0.4em] uppercase text-ink-soft/70">
            #{couple.displayName.replace(/\s+/g, "")}Wedding
          </p>
        </Reveal>
      </div>
    </section>
  );
}
