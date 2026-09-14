"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Defers mounting `children` until the wrapper scrolls near the viewport,
 * then mounts them for good — avoids every section's animations (WebGL,
 * GSAP scroll triggers, framer-motion loops) starting at once on page load
 * regardless of scroll position. `rootMargin` pre-loads ahead of arrival so
 * content is already settled by the time a guest scrolls to it.
 *
 * The placeholder reserves `minHeight` before mounting — collapsing to 0px
 * let a fast scroll fling pass straight through it before the
 * IntersectionObserver callback fired, so it ended up mounting (inserting
 * real height) only after that spot had already scrolled above the
 * viewport, shoving the page the guest was reading further down and
 * reading as a sudden jump. Reserving roughly a section's worth of space
 * up front means there's always something to intersect before it's
 * scrolled past.
 */
export function LazyMount({
  children,
  rootMargin = "800px 0px",
  minHeight = "60vh",
}: {
  children: ReactNode;
  rootMargin?: string;
  minHeight?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || visible) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [visible, rootMargin]);

  // Mounting real content in place of the placeholder changes the
  // document's total height, which staled GSAP's cached trigger positions
  // (useParallax, SectionTransition's fadeBlur) for sections further down
  // — they'd been measured against a page that was still short a bunch of
  // not-yet-mounted placeholders. That's what left sections from partway
  // down the page onward reading as permanently hazy/out of focus:
  // their scroll-linked opacity/blur was scrubbing against stale
  // start/end points. Refreshing after paint keeps every trigger's
  // measurements matched to the page's real, current layout.
  useEffect(() => {
    if (!visible) return;
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [visible]);

  return (
    <div ref={ref} style={visible ? undefined : { minHeight }}>
      {visible ? children : null}
    </div>
  );
}
