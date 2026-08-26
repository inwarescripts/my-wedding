"use client";

import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getScrollContainer } from "@/motion/getScrollContainer";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export type TransitionVariant = "none" | "fadeBlur";

export const transitionRegistry: Record<TransitionVariant, { label: string }> = {
  none: { label: "Không hiệu ứng" },
  fadeBlur: { label: "Mờ ảo (dissolve)" },
};

/**
 * Wraps one frame so it dissolves in/out of a soft blur as it scrolls
 * through the viewport — the "chuyển cảnh mờ ảo" effect. Opt-in per
 * project (see ProjectSettings.transitionVariant); "none" renders children
 * untouched so this never costs anything unless picked.
 */
export function SectionTransition({
  variant,
  children,
}: {
  variant: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || variant !== "fadeBlur") return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) return;

    const scroller = getScrollContainer(el);

    const ctx = gsap.context(() => {
      // Dissolve in as the section arrives...
      gsap.fromTo(
        el,
        { opacity: 0, filter: "blur(16px)" },
        {
          opacity: 1,
          filter: "blur(0px)",
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top 92%",
            end: "top 45%",
            scrub: 0.5,
            scroller,
          },
        }
      );
      // ...and dissolve out as it leaves, so the next section emerges
      // through the same haze rather than cutting sharply.
      gsap.fromTo(
        el,
        { opacity: 1, filter: "blur(0px)" },
        {
          opacity: 0.1,
          filter: "blur(20px)",
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "bottom 45%",
            end: "bottom 0%",
            scrub: 0.5,
            scroller,
          },
        }
      );
    }, el);

    return () => ctx.revert();
  }, [variant]);

  if (variant !== "fadeBlur") return <>{children}</>;

  return (
    <div ref={ref} style={{ willChange: "opacity, filter" }}>
      {children}
    </div>
  );
}
