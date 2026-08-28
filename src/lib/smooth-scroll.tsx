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
      // GSAP's own documented fix for scroll-linked animations jumping/
      // stuttering on mobile: by default ScrollTrigger re-measures every
      // trigger on any window `resize`, and a phone's browser chrome
      // (address bar) hiding/showing *while the guest scrolls* fires
      // exactly that — mid-scroll, mid-auto-tour. Ignoring resizes that
      // are only a viewport-height change (not an actual orientation/
      // width change) keeps ScrollTrigger from re-syncing against a scroll
      // position that's still moving.
      ScrollTrigger.config({ ignoreMobileResize: true });
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
