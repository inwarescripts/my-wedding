"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let registered = false;
let activeLenis: Lenis | null = null;

/** The live Lenis instance driving the public site's smooth scroll, or null
 * when it isn't running (admin routes, prefers-reduced-motion, or before
 * mount). Lets code outside this provider — the intro auto-scroll tour —
 * drive scroll position without fighting Lenis's own state. */
export function getLenisInstance(): Lenis | null {
  return activeLenis;
}

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const pathname = usePathname();
  // Lenis hijacks wheel/touch scroll on the whole document to smooth-scroll
  // the window. The admin UI never scrolls the window (its panels scroll
  // internally instead) — leaving Lenis active there swallows every mouse
  // wheel event before it reaches those inner scroll containers.
  const isAdmin = pathname?.startsWith("/admin");

  useEffect(() => {
    if (isAdmin) return;

    if (!registered) {
      gsap.registerPlugin(ScrollTrigger);
      registered = true;
    }

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReduced) return;

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => 1 - Math.pow(1 - t, 3),
      wheelMultiplier: 1,
      touchMultiplier: 1.15,
    });
    lenisRef.current = lenis;
    activeLenis = lenis;

    lenis.on("scroll", ScrollTrigger.update);

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      gsap.ticker.remove(raf);
      if (activeLenis === lenis) activeLenis = null;
    };
  }, [isAdmin]);

  return <>{children}</>;
}
