"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getScrollContainer } from "@/motion/getScrollContainer";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function useParallax<T extends HTMLElement>(intensity = 0.25) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) return;

    const amount = isMobile ? intensity * 0.4 : intensity;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { yPercent: -amount * 40 },
        {
          yPercent: amount * 40,
          ease: "none",
          scrollTrigger: {
            trigger: el.parentElement ?? el,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.6,
            scroller: getScrollContainer(el),
          },
        }
      );
    });

    return () => ctx.revert();
  }, [intensity]);

  return ref;
}
