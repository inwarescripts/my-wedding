"use client";

import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

type RevealPreset = "fadeUp" | "fadeDown" | "fadeLeft" | "fadeRight" | "fade" | "scaleIn";

const presets: Record<RevealPreset, Variants> = {
  fadeUp: {
    hidden: { opacity: 0, y: 36 },
    show: { opacity: 1, y: 0 },
  },
  fadeDown: {
    hidden: { opacity: 0, y: -36 },
    show: { opacity: 1, y: 0 },
  },
  fadeLeft: {
    hidden: { opacity: 0, x: 40 },
    show: { opacity: 1, x: 0 },
  },
  fadeRight: {
    hidden: { opacity: 0, x: -40 },
    show: { opacity: 1, x: 0 },
  },
  fade: {
    hidden: { opacity: 0 },
    show: { opacity: 1 },
  },
  scaleIn: {
    hidden: { opacity: 0, scale: 0.94 },
    show: { opacity: 1, scale: 1 },
  },
};

export function Reveal({
  children,
  preset = "fadeUp",
  delay = 0,
  duration = 1.1,
  className,
  once = true,
  amount = 0.3,
  as: Tag = "div",
}: {
  children: ReactNode;
  preset?: RevealPreset;
  delay?: number;
  duration?: number;
  className?: string;
  once?: boolean;
  amount?: number;
  as?: "div" | "span" | "li";
}) {
  const shared = {
    className,
    variants: presets[preset],
    initial: "hidden" as const,
    whileInView: "show" as const,
    viewport: { once, amount },
    transition: { duration, delay, ease: [0.16, 1, 0.3, 1] as const },
  };

  if (Tag === "span") return <motion.span {...shared}>{children}</motion.span>;
  if (Tag === "li") return <motion.li {...shared}>{children}</motion.li>;
  return <motion.div {...shared}>{children}</motion.div>;
}

export function Stagger({
  children,
  className,
  stagger = 0.12,
  amount = 0.2,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
  amount?: number;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: stagger } },
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
  preset = "fadeUp",
}: {
  children: ReactNode;
  className?: string;
  preset?: RevealPreset;
}) {
  return (
    <motion.div
      className={className}
      variants={presets[preset]}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
