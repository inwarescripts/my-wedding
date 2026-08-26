import { getLenisInstance } from "@/lib/smooth-scroll";

// Only guards against an instant snap on a very short page — there is
// deliberately no upper clamp. Capping the duration on long pages would
// silently inflate the effective px/s speed past what was configured
// (a 10,000px page at a chosen 40px/s needs 250s; clamping that down to
// 90s quietly triples the speed), defeating the whole point of picking a
// constant speed in the first place.
const MIN_DURATION_SEC = 6;

/**
 * Drives one smooth top → bottom "guided tour" scroll after the guest taps
 * into the site — see ProjectSettings.introSequence. Lenis's scrollTo runs
 * the whole animation itself (no manual rAF loop needed), and defaults to
 * `lock: false`, meaning the guest's own wheel/touch input takes over and
 * cancels the tour the instant they scroll — no extra listener required.
 *
 * `scrollSpeedPxPerSec` is a constant speed rather than a fixed total
 * duration: a fixed duration made the tour race through long pages and
 * crawl on short ones, so the pace felt inconsistent (and, on the demo
 * page, just too fast). A constant speed keeps the same slow pace no
 * matter how many sections the project has.
 */
export function startAutoScrollTour(scrollSpeedPxPerSec: number) {
  const lenis = getLenisInstance();
  if (!lenis) return;

  const startY = window.scrollY;
  const target = document.documentElement.scrollHeight - window.innerHeight;
  const distance = target - startY;
  if (distance <= 0) return;

  const speed = Math.max(scrollSpeedPxPerSec, 1);
  const duration = Math.max(distance / speed, MIN_DURATION_SEC);

  lenis.scrollTo(target, {
    duration,
    easing: (t: number) => t,
    lock: false,
  });
}
