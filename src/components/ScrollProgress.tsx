"use client";

import { motion, useScroll, useSpring } from "framer-motion";

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      className="fixed left-1/2 top-0 z-40 h-[2px] w-full max-w-[768px] -translate-x-1/2 origin-left bg-gold"
      style={{ scaleX }}
    />
  );
}
