"use client";

import { createElement, useEffect, useRef, type ElementType } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getScrollContainer } from "@/motion/getScrollContainer";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export type TypographyVariant = "wordReveal" | "charReveal" | "lineMask" | "fadeSoft";

export const typographyRegistry: Record<TypographyVariant, { label: string }> = {
  wordReveal: { label: "Mở từng từ" },
  charReveal: { label: "Mở từng chữ cái" },
  lineMask: { label: "Mở nguyên dòng" },
  fadeSoft: { label: "Mờ dần nhẹ nhàng" },
};

function MaskedReveal({
  children,
  as,
  className,
  delay,
  splitBy,
}: {
  children: string;
  as: ElementType;
  className?: string;
  delay: number;
  splitBy: "word" | "char" | "none";
}) {
  const ref = useRef<HTMLElement | null>(null);

  const units =
    splitBy === "word"
      ? children.split(" ")
      : splitBy === "char"
        ? children.split("")
        : [children];

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const targets = el.querySelectorAll<HTMLElement>("[data-unit]");

    if (prefersReduced) {
      gsap.set(targets, { opacity: 1, yPercent: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        targets,
        { opacity: 0, yPercent: 110 },
        {
          opacity: 1,
          yPercent: 0,
          duration: splitBy === "char" ? 0.7 : 1,
          ease: "power4.out",
          stagger: splitBy === "char" ? 0.02 : 0.045,
          delay,
          scrollTrigger: {
            trigger: el,
            start: "top 82%",
            scroller: getScrollContainer(el),
          },
        }
      );
    }, el);

    return () => ctx.revert();
  }, [delay, splitBy]);

  return createElement(
    as,
    // eslint-disable-next-line react-hooks/refs -- `as` is always a host tag (h1/h2) at call sites
    { ref, className },
    units.flatMap((unit, i) => [
      createElement(
        "span",
        {
          key: `u${i}`,
          className: "inline-block overflow-hidden align-top pb-[0.1em]",
        },
        createElement(
          "span",
          { "data-unit": true, className: "inline-block will-change-transform" },
          unit === " " ? " " : unit
        )
      ),
      splitBy === "word" && i < units.length - 1 ? " " : null,
    ])
  );
}

export function AnimatedHeading({
  children,
  as = "h2",
  className,
  variant,
  delay = 0,
}: {
  children: string;
  as?: ElementType;
  className?: string;
  variant: string;
  delay?: number;
}) {
  switch (variant as TypographyVariant) {
    case "charReveal":
      return (
        <MaskedReveal as={as} className={className} delay={delay} splitBy="char">
          {children}
        </MaskedReveal>
      );
    case "lineMask":
      return (
        <MaskedReveal as={as} className={className} delay={delay} splitBy="none">
          {children}
        </MaskedReveal>
      );
    case "fadeSoft": {
      const MotionTag = as === "h1" ? motion.h1 : motion.h2;
      return (
        <MotionTag
          className={className}
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 1, delay, ease: [0.16, 1, 0.3, 1] }}
        >
          {children}
        </MotionTag>
      );
    }
    case "wordReveal":
    default:
      return (
        <MaskedReveal as={as} className={className} delay={delay} splitBy="word">
          {children}
        </MaskedReveal>
      );
  }
}
