import { getLenisInstance } from "@/lib/smooth-scroll";

// Only guards against an instant snap on a very short page — there is
// deliberately no upper clamp. Capping the duration on long pages would
// silently inflate the effective px/s speed past what was configured
// (a 10,000px page at a chosen 40px/s needs 250s; clamping that down to
// 90s quietly triples the speed), defeating the whole point of picking a
// constant speed in the first place.
const MIN_DURATION_SEC = 6;

// How often to check whether the page's real bottom has moved (images
// finishing load, fonts swapping in, a section's reveal animation settling
// into its final height...). Frequent enough to catch it well before the
// tour visibly reaches the stale target, cheap enough to poll instead of
// wiring a ResizeObserver on the whole document.
const RECHECK_INTERVAL_MS = 500;

/**
 * Drives one smooth top → bottom "guided tour" scroll after the guest taps
 * into the site — see ProjectSettings.introSequence. Lenis's scrollTo runs
 * the whole animation itself (no manual rAF loop needed), and defaults to
 * `lock: false`, meaning the guest's own wheel/touch input takes over and
 * cancels the tour the instant they scroll.
 *
 * `scrollSpeedPxPerSec` is a constant speed rather than a fixed total
 * duration: a fixed duration made the tour race through long pages and
 * crawl on short ones, so the pace felt inconsistent (and, on the demo
 * page, just too fast). A constant speed keeps the same slow pace no
 * matter how many sections the project has.
 *
 * The original version computed the scroll target ONCE from
 * `document.documentElement.scrollHeight` at the moment the tour started,
 * then handed the whole animation to a single `lenis.scrollTo` call. That
 * target goes stale the instant the page's real height changes afterward —
 * a below-the-fold image finishing load, a webfont swapping in and
 * reflowing text, an aspect-ratio placeholder resolving to its real size —
 * which on a guest's first visit is happening constantly while the tour is
 * mid-flight. Lenis keeps animating toward the stale number regardless, so
 * once the page's actual bottom moves, the tour either stalls short of it
 * or overshoots past where content now ends, and the *next* recalculation
 * (a resize, a manual scroll bounds check) snaps the visible position back
 * to line up with the real page — read by a guest as "cuộn bị khựng lại,
 * màn hình nhảy lùi xuống, rồi mới cuộn tiếp". Re-measuring the target
 * periodically below and re-issuing `scrollTo` from wherever the scroll
 * actually is right now (Lenis always eases smoothly from the current
 * position, so doing this mid-flight doesn't itself cause a jump) keeps
 * the tour locked onto the page's real bottom throughout.
 */
export function startAutoScrollTour(scrollSpeedPxPerSec: number) {
  const lenis = getLenisInstance();
  if (!lenis) return;

  const speed = Math.max(scrollSpeedPxPerSec, 1);

  function currentTarget() {
    return document.documentElement.scrollHeight - window.innerHeight;
  }

  function kick(from: number) {
    const target = currentTarget();
    const distance = target - from;
    if (distance <= 0) return false;

    const duration = Math.max(distance / speed, MIN_DURATION_SEC);
    lenis!.scrollTo(target, { duration, easing: (t: number) => t, lock: false });
    return true;
  }

  const startY = window.scrollY;
  if (!kick(startY)) return;

  let lastTarget = currentTarget();
  let stopped = false;

  function stop() {
    if (stopped) return;
    stopped = true;
    window.clearInterval(interval);
    window.removeEventListener("wheel", onUserInput);
    window.removeEventListener("touchstart", onUserInput);
  }

  // The exact same signal Lenis itself watches to decide "the guest has
  // taken over" (see `lock: false` above) — once real wheel/touch input
  // happens, stop re-correcting the target too, or a guest who scrolled
  // themselves partway down would get silently dragged back toward the
  // bottom on the next recheck tick.
  function onUserInput() {
    stop();
  }
  window.addEventListener("wheel", onUserInput, { passive: true });
  window.addEventListener("touchstart", onUserInput, { passive: true });

  const interval = window.setInterval(() => {
    if (!getLenisInstance()) {
      stop();
      return;
    }

    const nowY = window.scrollY;
    const target = currentTarget();
    if (nowY >= target - 2) {
      stop();
      return;
    }

    // Only re-kick when the real bottom actually moved — re-issuing
    // scrollTo on an unchanged target would just restart its easing from
    // the current position for no reason.
    if (Math.abs(target - lastTarget) > 4) {
      lastTarget = target;
      kick(nowY);
    }
  }, RECHECK_INTERVAL_MS);
}
