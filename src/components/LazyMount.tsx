"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Defers mounting `children` until the wrapper scrolls near the viewport,
 * then mounts them for good. Every frame section on the public wedding page
 * currently mounts (and starts animating — WebGL scenes, GSAP scroll
 * triggers, infinite framer-motion loops) the instant the page loads,
 * regardless of scroll position, which stacks the cost of every section at
 * once instead of just the one actually in view. `rootMargin` pre-loads
 * well ahead of arrival so content is already settled by the time a guest
 * scrolls to it — IntersectionObserver correctly accounts for a scrollable
 * ancestor's clipped viewport too, so this also lazy-mounts sections inside
 * the admin editor's scrollable preview pane.
 */
export function LazyMount({
  children,
  rootMargin = "800px 0px",
}: {
  children: ReactNode;
  rootMargin?: string;
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

  return <div ref={ref}>{visible ? children : null}</div>;
}
