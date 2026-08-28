"use client";

import { useEffect, useState, type CSSProperties } from "react";

export type AmbientVariant =
  | "none"
  | "petals"
  | "bokeh"
  | "sparkle"
  | "lightLeak"
  | "mist"
  | "fireworks"
  | "roses"
  | "hearts"
  | "dryIce"
  | "balloonDrop"
  | "flowerShower";

export const ambientEffectRegistry: Record<AmbientVariant, { label: string }> = {
  none: { label: "Không có" },
  petals: { label: "Tung hoa rơi" },
  bokeh: { label: "Ánh sáng bokeh" },
  sparkle: { label: "Kim tuyến lấp lánh" },
  lightLeak: { label: "Ánh sáng điện ảnh" },
  mist: { label: "Sương mờ bay" },
  fireworks: { label: "Pháo hoa rực rỡ" },
  roses: { label: "Hoa hồng rơi" },
  hearts: { label: "Trái tim bay" },
  dryIce: { label: "Khói lạnh (Dry Ice)" },
  balloonDrop: { label: "Bóng bay & bong bóng ánh sáng" },
  flowerShower: { label: "Mưa cánh hoa rực rỡ" },
};

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

/** Random layout must never be computed during render — SSR and the client
 * would each roll different numbers and React would flag a hydration
 * mismatch. Every effect below generates its randomized items client-side
 * only, after mount, via this shared hook. */
function useClientItems<T>(factory: () => T[]): T[] {
  const [items, setItems] = useState<T[]>([]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItems(factory());
    // Deliberately run once on mount only: `factory` is a fresh closure on
    // every render (each caller inlines `() => Array.from(...)`), so
    // depending on it would regenerate — and re-randomize — every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return items;
}

/** Same idea as useClientItems, but re-generates a fresh batch whenever
 * `triggerKey` changes (and clears it again after `ttlMs`) — for one-shot
 * bursts rather than a persistent ambient layer. */
function useBurst<T>(
  triggerKey: number | null,
  factory: () => T[],
  ttlMs: number
): T[] {
  const [items, setItems] = useState<T[]>([]);

  useEffect(() => {
    if (!triggerKey) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItems(factory());
    const timer = setTimeout(() => setItems([]), ttlMs);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggerKey, ttlMs]);

  return items;
}

/** Fires a fresh batch of items every `cycleMs` (from mount, forever), each
 * batch clearing back to empty after `activeMs` — for a persistent effect
 * that "phụt từng đợt" (fires in periodic waves with a pause in between)
 * instead of being continuously on screen like Petals/Hearts/etc. `activeMs`
 * must cover the slowest particle's own delay+duration or its tail gets cut
 * off mid-animation (same bug class the burst effects above hit before). */
function useCyclingBurst<T>(factory: () => T[], activeMs: number, cycleMs: number): T[] {
  const [items, setItems] = useState<T[]>([]);

  useEffect(() => {
    let cancelled = false;
    let activeTimer: ReturnType<typeof setTimeout>;
    let cycleTimer: ReturnType<typeof setTimeout>;

    function fire() {
      if (cancelled) return;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setItems(factory());
      activeTimer = setTimeout(() => {
        if (!cancelled) setItems([]);
      }, activeMs);
      cycleTimer = setTimeout(fire, cycleMs);
    }

    fire();
    return () => {
      cancelled = true;
      clearTimeout(activeTimer);
      clearTimeout(cycleTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMs, cycleMs]);

  return items;
}

/** Ambient effects are purely decorative, so they're the first thing to cut
 * for anyone who's asked their OS/browser to reduce motion — and, as a
 * side effect, this also protects weaker devices from paying for hundreds
 * of simultaneously-animated layers when the visitor has already signalled
 * they'd rather not have screens moving at them. Checked once on mount,
 * same pattern as `hasWebGL()` in Opening. */
function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);
  return reduced;
}

/** Halves the heaviest particle counts (confetti, petal/heart bursts) on
 * small screens — phones are where "giật lag" (stutter) reports come from,
 * since they pair the weakest GPUs with this being one of several
 * animated layers already on screen (Lenis smooth-scroll, the 3D opening
 * scene, framer-motion scroll reveals). Desktop keeps the full density.
 * A lazy initializer (not an effect) so the value is already correct by
 * the time it's read inside useCyclingBurst/useBurst's own mount-time
 * effect — those only fire once, so a value that arrived a render later
 * (the effect-based pattern the reduced-motion check above uses) would be
 * captured too late and never actually apply. Safe to read window here
 * unlike the reduced-motion check: this number never changes what the
 * very first render's JSX looks like (particle arrays are always empty
 * until an effect fills them in), so there's no hydration mismatch risk. */
function useIsCompactViewport(): boolean {
  const [compact] = useState(() => typeof window !== "undefined" && window.innerWidth <= 640);
  return compact;
}

// Deliberately full viewport width, not capped to the iPad-width content
// column (see `main` in WeddingRenderer.tsx) — on a wide desktop screen the
// falling petals/hearts/confetti should drift across the whole browser
// behind the narrower card, not be clipped to it.
const OVERLAY_CLASS =
  "ambient-fx pointer-events-none fixed inset-0 z-30 overflow-hidden";

export function AmbientEffect({ variant }: { variant: string }) {
  const reducedMotion = usePrefersReducedMotion();
  if (reducedMotion) return null;

  switch (variant as AmbientVariant) {
    case "petals":
      return <Petals />;
    case "bokeh":
      return <Bokeh />;
    case "sparkle":
      return <Sparkle />;
    case "lightLeak":
      return <LightLeak />;
    case "mist":
      return <Mist />;
    case "fireworks":
      return <Fireworks />;
    case "roses":
      return <Roses />;
    case "hearts":
      return <Hearts />;
    case "dryIce":
      return <DryIce />;
    case "balloonDrop":
      return <BalloonDrop />;
    case "flowerShower":
      return <FlowerShower />;
    default:
      return null;
  }
}

/** Falling flower petals — small gradient blobs drifting down with a sway
 * and rotation, deliberately CSS-only (no canvas/WebGL, see spec item 18). */
function Petals() {
  const petals = useClientItems(() =>
    Array.from({ length: 14 }, (_, i) => ({
      id: i,
      left: randomBetween(0, 100),
      size: randomBetween(10, 20),
      duration: randomBetween(11, 19),
      delay: randomBetween(0, 16),
      drift: randomBetween(-70, 70),
      rotate: randomBetween(180, 560),
      hue: randomBetween(-10, 10),
    }))
  );

  if (petals.length === 0) return null;

  return (
    <div className={OVERLAY_CLASS} aria-hidden>
      {petals.map((p) => (
        <span
          key={p.id}
          className="absolute top-[-8%] block opacity-0"
          style={
            {
              left: `${p.left}%`,
              width: p.size,
              height: p.size * 0.82,
              borderRadius: "0 100% 0 100%",
              background: `linear-gradient(135deg, hsl(${350 + p.hue} 70% 86%), hsl(${20 + p.hue} 60% 76%))`,
              animation: `wedding-petal-fall ${p.duration}s linear ${p.delay}s infinite`,
              "--petal-drift": `${p.drift}px`,
              "--petal-rotate": `${p.rotate}deg`,
            } as CSSProperties
          }
        />
      ))}
      <style>{`
        @keyframes wedding-petal-fall {
          0% { transform: translate3d(0, -10vh, 0) rotate(0deg); opacity: 0; }
          8% { opacity: 0.85; }
          92% { opacity: 0.6; }
          100% {
            transform: translate3d(var(--petal-drift), 112vh, 0) rotate(var(--petal-rotate));
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

/** Soft glowing bokeh circles slowly rising — the warm, dreamy "cinematic
 * lens flare" look, built with a blurred radial-gradient glow. */
function Bokeh() {
  const items = useClientItems(() =>
    Array.from({ length: 10 }, (_, i) => ({
      id: i,
      left: randomBetween(0, 100),
      size: randomBetween(40, 110),
      duration: randomBetween(14, 26),
      delay: randomBetween(0, 20),
      drift: randomBetween(-50, 50),
    }))
  );

  if (items.length === 0) return null;

  return (
    <div className={OVERLAY_CLASS} aria-hidden>
      {items.map((b) => (
        <span
          key={b.id}
          className="absolute bottom-[-15%] block rounded-full opacity-0"
          style={
            {
              left: `${b.left}%`,
              width: b.size,
              height: b.size,
              background:
                "radial-gradient(circle, rgba(255,223,180,0.55) 0%, rgba(255,223,180,0) 70%)",
              filter: "blur(2px)",
              animation: `wedding-bokeh-rise ${b.duration}s ease-in-out ${b.delay}s infinite`,
              "--bokeh-drift": `${b.drift}px`,
            } as CSSProperties
          }
        />
      ))}
      <style>{`
        @keyframes wedding-bokeh-rise {
          0% { transform: translate3d(0, 0, 0); opacity: 0; }
          15% { opacity: 0.8; }
          85% { opacity: 0.45; }
          100% { transform: translate3d(var(--bokeh-drift), -120vh, 0); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

/** Tiny fixed twinkling dots — "magical fairy dust", the cheapest of the
 * five (no movement, just an opacity/scale pulse). */
function Sparkle() {
  const items = useClientItems(() =>
    Array.from({ length: 26 }, (_, i) => ({
      id: i,
      left: randomBetween(0, 100),
      top: randomBetween(0, 100),
      size: randomBetween(2, 4),
      duration: randomBetween(2, 5),
      delay: randomBetween(0, 6),
    }))
  );

  if (items.length === 0) return null;

  return (
    <div className={OVERLAY_CLASS} aria-hidden>
      {items.map((s) => (
        <span
          key={s.id}
          className="absolute block rounded-full bg-gold opacity-0"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: s.size,
            height: s.size,
            boxShadow: "0 0 6px 1px rgba(176,141,87,0.8)",
            animation: `wedding-sparkle-twinkle ${s.duration}s ease-in-out ${s.delay}s infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes wedding-sparkle-twinkle {
          0%, 100% { opacity: 0; transform: scale(0.5); }
          50% { opacity: 0.9; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
}

/** A soft diagonal light streak sweeping across the screen — the film
 * "light leak" look editorial wedding videos use between cuts. */
function LightLeak() {
  const items = useClientItems(() =>
    Array.from({ length: 2 }, (_, i) => ({
      id: i,
      top: randomBetween(-10, 55),
      duration: randomBetween(16, 24),
      delay: randomBetween(0, 8),
    }))
  );

  if (items.length === 0) return null;

  return (
    <div className={OVERLAY_CLASS} aria-hidden>
      {items.map((l) => (
        <span
          key={l.id}
          className="absolute block opacity-0"
          style={{
            top: `${l.top}%`,
            left: "-30%",
            width: "160%",
            height: "40vh",
            background:
              "linear-gradient(100deg, transparent 30%, rgba(255,238,214,0.16) 48%, rgba(255,238,214,0.26) 50%, rgba(255,238,214,0.16) 52%, transparent 70%)",
            animation: `wedding-light-sweep ${l.duration}s ease-in-out ${l.delay}s infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes wedding-light-sweep {
          0%, 100% { opacity: 0; transform: translateX(-15%) rotate(-8deg); }
          50% { opacity: 1; transform: translateX(15%) rotate(-8deg); }
        }
      `}</style>
    </div>
  );
}

/** Large, very soft blurred blobs drifting sideways — a dreamy fog layer
 * that reads as atmosphere rather than a distinct shape. */
function Mist() {
  const items = useClientItems(() =>
    Array.from({ length: 4 }, (_, i) => ({
      id: i,
      top: randomBetween(10, 85),
      size: randomBetween(280, 420),
      duration: randomBetween(28, 42),
      delay: randomBetween(0, 20),
    }))
  );

  if (items.length === 0) return null;

  return (
    <div className={OVERLAY_CLASS} aria-hidden>
      {items.map((m) => (
        <span
          key={m.id}
          className="absolute left-[-30%] block rounded-full opacity-0"
          style={{
            top: `${m.top}%`,
            width: m.size,
            height: m.size * 0.5,
            background:
              "radial-gradient(ellipse, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0) 70%)",
            filter: "blur(40px)",
            animation: `wedding-mist-drift ${m.duration}s linear ${m.delay}s infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes wedding-mist-drift {
          0% { transform: translateX(0); opacity: 0; }
          10% { opacity: 0.5; }
          90% { opacity: 0.32; }
          100% { transform: translateX(140vw); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

// Rose, lavender, gold — same warm/pastel family as the rest of the ambient
// effects (see FIREWORK_HUES above) rather than a generic rainbow confetti.
const CONFETTI_HUES = [340, 272, 42];

// Three staggered pulses within one wave (instead of one uniform spray) —
// "phụt lúc chậm lúc nhanh": a quick pop, a short gap, another pop, a
// longer gap, then a last pop, rather than everything launching at once.
const CONFETTI_WAVE_DELAYS = [0, 0.55, 1.25];

function confettiPieces(side: "left" | "right", count: number) {
  const dirSign = side === "left" ? 1 : -1;
  return Array.from({ length: count }, (_, i) => ({
    id: `${side}-${i}`,
    side,
    hue: CONFETTI_HUES[i % CONFETTI_HUES.length],
    heart: Math.random() < 0.12,
    round: Math.random() < 0.4,
    // Rectangles are longer streamer-shaped strips now (w stays thin, h
    // stretches out) so they read clearly at a glance instead of looking
    // like near-invisible specks; round pieces get their own, slightly
    // bigger diameter since a tiny dot disappears more easily than a strip.
    w: randomBetween(4, 6.5),
    h: randomBetween(9, 14),
    dotSize: randomBetween(6, 9),
    // Travel is expressed as vw/vh so the cannons stay anchored to the
    // actual corners of the (full-bleed, see OVERLAY_CLASS) viewport
    // regardless of screen size. Sideways reach is kept fairly short (and,
    // per the keyframe below, never overshoots past its peak) so the two
    // cannons fan out across their own half instead of both streams
    // converging into one pile in the middle. Vertical reach varies
    // independently so throws fan out at different angles, not one beam.
    // Wide enough range that the longer throws from each side cross well
    // past the centre into the opposite half — reads as the two streams
    // leaning into and weaving through each other — while the short end
    // keeps some pieces near their own corner so it doesn't read as two
    // solid beams crossing in an X.
    cx: dirSign * randomBetween(10, 58),
    cy: -randomBetween(55, 110),
    // Shorter, slower fall than the initial rise — real confetti drifts
    // down more gently than it was launched.
    fall: randomBetween(20, 40),
    rot: dirSign * randomBetween(360, 900) * (Math.random() > 0.5 ? 1 : -1),
    duration: randomBetween(2.6, 3.6),
    delay: CONFETTI_WAVE_DELAYS[i % CONFETTI_WAVE_DELAYS.length] + randomBetween(0, 0.3),
  }));
}

function renderConfettiPieces(items: ReturnType<typeof confettiPieces>) {
  return items.map((p) => {
    const shapeStyle: CSSProperties = p.heart
      ? { fontSize: p.dotSize * 2.6 }
      : p.round
        ? {
            width: p.dotSize,
            height: p.dotSize,
            borderRadius: "50%",
            background: `hsl(${p.hue} 78% 72%)`,
          }
        : {
            width: p.w,
            height: p.h,
            borderRadius: 1.5,
            background: `hsl(${p.hue} 78% 72%)`,
          };
    return (
      <span
        key={p.id}
        className={`absolute bottom-0 block leading-none opacity-0 ${
          p.side === "left" ? "left-0" : "right-0"
        }`}
        style={
          {
            ...shapeStyle,
            animation: `wedding-confetti-shoot ${p.duration}s ease-out ${p.delay}s 1`,
            "--cx": `${p.cx}vw`,
            "--cy": `${p.cy}vh`,
            "--cfall": `${p.fall}vh`,
            "--crot": `${p.rot}deg`,
          } as CSSProperties
        }
      >
        {p.heart ? "❤️" : null}
      </span>
    );
  });
}

const CONFETTI_KEYFRAMES = `
  @keyframes wedding-confetti-shoot {
    0% { transform: translate3d(0, 0, 0) rotate(0deg) scale(0.5); opacity: 0; }
    6% { opacity: 1; }
    34% { transform: translate3d(var(--cx), var(--cy), 0) rotate(calc(var(--crot) * 0.55)) scale(1); opacity: 1; }
    100% { transform: translate3d(var(--cx), calc(var(--cy) + var(--cfall)), 0) rotate(var(--crot)) scale(0.85); opacity: 0; }
  }
`;

/** Two confetti cannons firing from the bottom-left and bottom-right
 * corners, arcing toward the centre and falling back down — matching a
 * classic party-popper effect. A standalone opt-in layer (see the
 * `confettiCannon` project setting), independent of — and layered on top
 * of — whichever `ambientEffect` is also chosen, not one more option
 * inside that same single-select. Fires a dense wave every ~7.5s and sits
 * empty in between ("phụt từng đợt... rồi ngừng"), rather than looping
 * continuously like Petals/Hearts. */
export function ConfettiCannon() {
  const ACTIVE_MS = 5300; // covers worst case: ~1.55s delay + 3.6s duration
  const CYCLE_MS = 9500; // ~4.2s pause between waves

  const reducedMotion = usePrefersReducedMotion();
  const compact = useIsCompactViewport();
  // 120 pieces a side (240 total) per wave on desktop — dense enough to read
  // as a real party-popper cannon. Halved on phones, where this is one of
  // several animated layers competing for a much weaker GPU.
  const perSide = compact ? 60 : 120;
  const items = useCyclingBurst(
    () => [...confettiPieces("left", perSide), ...confettiPieces("right", perSide)],
    ACTIVE_MS,
    CYCLE_MS
  );

  if (reducedMotion) return null;

  return (
    <div className={OVERLAY_CLASS} aria-hidden>
      {renderConfettiPieces(items)}
      <style>{CONFETTI_KEYFRAMES}</style>
    </div>
  );
}

/** Same shoot animation as ConfettiCannon, just one bigger one-shot wave for
 * the gate-entry moment (see AMBIENT_BURST_DURATION_MS-style burst pattern
 * used by the ambientEffect variants) — fired independently whenever the
 * `confettiCannon` setting is on, regardless of which ambientEffect (if
 * any) is also selected. */
export function ConfettiCannonBurst({ triggerKey }: { triggerKey: number | null }) {
  const reducedMotion = usePrefersReducedMotion();
  const compact = useIsCompactViewport();
  const perSide = compact ? 70 : 140;
  const items = useBurst(
    triggerKey,
    () => [...confettiPieces("left", perSide), ...confettiPieces("right", perSide)],
    5300
  );

  if (reducedMotion || items.length === 0) return null;

  return (
    <div className={OVERLAY_CLASS} aria-hidden>
      {renderConfettiPieces(items)}
      <style>{CONFETTI_KEYFRAMES}</style>
    </div>
  );
}

// How long the entry burst's flurry runs — WeddingRenderer can wait this
// long (same idea as AMBIENT_BURST_DURATION_MS) before anything else that
// shouldn't overlap it kicks in.
export const CONFETTI_CANNON_BURST_DURATION_MS = 5300;

/** How long each burst variant's flurry runs — WeddingRenderer waits this
 * long before starting the optional auto-scroll tour, so the two never
 * overlap awkwardly. Keep in sync with each burst's own `ttlMs` below. */
export const AMBIENT_BURST_DURATION_MS: Record<AmbientVariant, number> = {
  none: 0,
  petals: 6200,
  bokeh: 4200,
  sparkle: 3200,
  lightLeak: 4000,
  mist: 6000,
  fireworks: 6600,
  roses: 8200,
  hearts: 7650,
  dryIce: 5000,
  balloonDrop: 6800,
  flowerShower: 6100,
};

/**
 * A heavy one-shot flurry — plays right after the guest taps "Chạm để mở"
 * (see ProjectSettings.introSequence), matching whichever ambientEffect is
 * chosen for the persistent overlay, just denser/faster/non-looping.
 */
export function AmbientBurst({
  variant,
  triggerKey,
}: {
  variant: string;
  triggerKey: number | null;
}) {
  const reducedMotion = usePrefersReducedMotion();
  if (reducedMotion) return null;

  switch (variant as AmbientVariant) {
    case "petals":
      return <PetalBurst triggerKey={triggerKey} />;
    case "bokeh":
      return <BokehBurst triggerKey={triggerKey} />;
    case "sparkle":
      return <SparkleBurst triggerKey={triggerKey} />;
    case "lightLeak":
      return <LightLeakBurst triggerKey={triggerKey} />;
    case "mist":
      return <MistBurst triggerKey={triggerKey} />;
    case "fireworks":
      return <FireworksBurst triggerKey={triggerKey} />;
    case "roses":
      return <RosesBurst triggerKey={triggerKey} />;
    case "hearts":
      return <HeartsBurst triggerKey={triggerKey} />;
    case "dryIce":
      return <DryIceBurst triggerKey={triggerKey} />;
    case "balloonDrop":
      return <BalloonDropBurst triggerKey={triggerKey} />;
    case "flowerShower":
      return <FlowerShowerBurst triggerKey={triggerKey} />;
    default:
      return null;
  }
}

function PetalBurst({ triggerKey }: { triggerKey: number | null }) {
  const compact = useIsCompactViewport();
  const petals = useBurst(
    triggerKey,
    () =>
      Array.from({ length: compact ? 150 : 300 }, (_, i) => ({
        id: i,
        left: randomBetween(0, 100),
        size: randomBetween(12, 24),
        duration: randomBetween(2.4, 4.2),
        delay: randomBetween(0, 1.6),
        drift: randomBetween(-90, 90),
        rotate: randomBetween(180, 640),
        hue: randomBetween(-10, 10),
      })),
    // Same TTL-too-short bug as roses/hearts below: max delay (1.6s) + max
    // duration (4.2s) exceeded the old 4500ms TTL, cutting the slowest
    // petals off mid-fall.
    6200
  );

  if (petals.length === 0) return null;

  return (
    <div className={OVERLAY_CLASS} aria-hidden>
      {petals.map((p) => (
        <span
          key={p.id}
          className="absolute top-[-8%] block opacity-0"
          style={
            {
              left: `${p.left}%`,
              width: p.size,
              height: p.size * 0.82,
              borderRadius: "0 100% 0 100%",
              background: `linear-gradient(135deg, hsl(${350 + p.hue} 70% 86%), hsl(${20 + p.hue} 60% 76%))`,
              animation: `wedding-petal-fall ${p.duration}s linear ${p.delay}s 1`,
              "--petal-drift": `${p.drift}px`,
              "--petal-rotate": `${p.rotate}deg`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}

function BokehBurst({ triggerKey }: { triggerKey: number | null }) {
  const items = useBurst(
    triggerKey,
    () =>
      Array.from({ length: 26 }, (_, i) => ({
        id: i,
        left: randomBetween(0, 100),
        size: randomBetween(50, 130),
        duration: randomBetween(2.2, 3.6),
        delay: randomBetween(0, 0.8),
        drift: randomBetween(-60, 60),
      })),
    4200
  );

  if (items.length === 0) return null;

  return (
    <div className={OVERLAY_CLASS} aria-hidden>
      {items.map((b) => (
        <span
          key={b.id}
          className="absolute bottom-[-15%] block rounded-full opacity-0"
          style={
            {
              left: `${b.left}%`,
              width: b.size,
              height: b.size,
              background:
                "radial-gradient(circle, rgba(255,223,180,0.65) 0%, rgba(255,223,180,0) 70%)",
              filter: "blur(2px)",
              animation: `wedding-bokeh-rise ${b.duration}s ease-in-out ${b.delay}s 1`,
              "--bokeh-drift": `${b.drift}px`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}

function SparkleBurst({ triggerKey }: { triggerKey: number | null }) {
  const items = useBurst(
    triggerKey,
    () =>
      Array.from({ length: 60 }, (_, i) => ({
        id: i,
        left: randomBetween(0, 100),
        top: randomBetween(0, 100),
        size: randomBetween(2, 5),
        duration: randomBetween(0.6, 1.6),
        delay: randomBetween(0, 1.2),
      })),
    3200
  );

  if (items.length === 0) return null;

  return (
    <div className={OVERLAY_CLASS} aria-hidden>
      {items.map((s) => (
        <span
          key={s.id}
          className="absolute block rounded-full bg-gold opacity-0"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: s.size,
            height: s.size,
            boxShadow: "0 0 8px 2px rgba(176,141,87,0.9)",
            animation: `wedding-sparkle-twinkle ${s.duration}s ease-in-out ${s.delay}s 2`,
          }}
        />
      ))}
    </div>
  );
}

function LightLeakBurst({ triggerKey }: { triggerKey: number | null }) {
  const items = useBurst(
    triggerKey,
    () =>
      Array.from({ length: 4 }, (_, i) => ({
        id: i,
        top: randomBetween(-10, 60),
        duration: randomBetween(2.2, 3.4),
        delay: randomBetween(0, 0.6),
      })),
    4000
  );

  if (items.length === 0) return null;

  return (
    <div className={OVERLAY_CLASS} aria-hidden>
      {items.map((l) => (
        <span
          key={l.id}
          className="absolute block opacity-0"
          style={{
            top: `${l.top}%`,
            left: "-30%",
            width: "160%",
            height: "40vh",
            background:
              "linear-gradient(100deg, transparent 30%, rgba(255,238,214,0.3) 48%, rgba(255,238,214,0.45) 50%, rgba(255,238,214,0.3) 52%, transparent 70%)",
            animation: `wedding-light-sweep ${l.duration}s ease-in-out ${l.delay}s 1`,
          }}
        />
      ))}
    </div>
  );
}

function MistBurst({ triggerKey }: { triggerKey: number | null }) {
  const items = useBurst(
    triggerKey,
    () =>
      Array.from({ length: 10 }, (_, i) => ({
        id: i,
        top: randomBetween(5, 90),
        size: randomBetween(250, 420),
        duration: randomBetween(3.5, 5.5),
        delay: randomBetween(0, 1),
      })),
    6000
  );

  if (items.length === 0) return null;

  return (
    <div className={OVERLAY_CLASS} aria-hidden>
      {items.map((m) => (
        <span
          key={m.id}
          className="absolute left-[-30%] block rounded-full opacity-0"
          style={{
            top: `${m.top}%`,
            width: m.size,
            height: m.size * 0.5,
            background:
              "radial-gradient(ellipse, rgba(255,255,255,0.65) 0%, rgba(255,255,255,0) 70%)",
            filter: "blur(40px)",
            animation: `wedding-mist-drift ${m.duration}s linear ${m.delay}s 1`,
          }}
        />
      ))}
    </div>
  );
}

// Warm, curated hues (gold / rose-pink / warm red / soft champagne) instead
// of a full rainbow spectrum — keeps fireworks feeling premium/wedding-ish
// rather than like a generic countdown-party effect.
const FIREWORK_HUES = [42, 335, 355, 28];

function fireworkSparks(radius: number, count: number, fallAmount: number) {
  return Array.from({ length: count }, (_, i) => {
    const angle = ((360 / count) * i * Math.PI) / 180;
    const jitter = randomBetween(0.85, 1.15);
    return {
      i,
      sx: Math.cos(angle) * radius * jitter,
      // Embers keep drifting downward under gravity after reaching the
      // burst radius, instead of just fading in place — "rơi từ từ" (falls
      // slowly). Sparks already aimed downward (positive sy) fall a bit
      // further than ones aimed upward, for a touch of realism.
      sy: Math.sin(angle) * radius * jitter,
      fall: fallAmount * randomBetween(0.7, 1.3),
    };
  });
}

/** Same shape as fireworkSparks, but the target points trace a heart
 * outline (classic parametric heart curve) instead of a circle — used for
 * the finale so its sparks visibly resolve into a heart as they burst. The
 * curve's y is formula-native "up positive"; CSS is y-down, so it's negated
 * to keep the heart point-down instead of upside-down. */
function heartSparks(scale: number, count: number, fallAmount: number) {
  return Array.from({ length: count }, (_, i) => {
    const t = (2 * Math.PI * i) / count;
    const x = 16 * Math.sin(t) ** 3;
    const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    const jitter = randomBetween(0.96, 1.04);
    return {
      i,
      sx: x * scale * jitter,
      sy: -y * scale * jitter,
      fall: fallAmount * randomBetween(0.8, 1.2),
    };
  });
}

/** Slow, occasional shells popping across the sky — each spark's own
 * keyframe compresses the explosion into the first ~15% of a long cycle,
 * then stays invisible for the rest, so shells read as periodic "pops"
 * rather than constant fizzing. Exported (and given a `contained` mode —
 * `absolute inset-0` instead of the ambient default's `fixed inset-0`) so
 * it can also be dropped into a single section, e.g. the closing/footer
 * frame, instead of only the whole-page ambient overlay. */
export function Fireworks({ contained = false }: { contained?: boolean } = {}) {
  // Also used unconditionally by Final.tsx's closing frame (not only via
  // the AmbientEffect dispatcher, which already gates reduced-motion
  // itself) — gate here too so that call site respects it as well.
  const reducedMotion = usePrefersReducedMotion();
  const compact = useIsCompactViewport();
  // This variant runs forever (not a one-shot burst) whenever selected, so
  // its layer count is a sustained cost, not a brief spike — worth trimming
  // sparks-per-shell a bit further on phones than the burst effects below.
  const sparksPerShell = compact ? 11 : 18;
  const shells = useClientItems(() =>
    Array.from({ length: compact ? 4 : 5 }, (_, i) => {
      const hue = FIREWORK_HUES[i % FIREWORK_HUES.length];
      const radius = randomBetween(130, 220);
      return {
        id: i,
        left: randomBetween(12, 88),
        top: randomBetween(12, 55),
        hue,
        duration: randomBetween(9, 15),
        delay: randomBetween(0, 12),
        sparks: fireworkSparks(radius, sparksPerShell, 0),
      };
    })
  );

  if (reducedMotion || shells.length === 0) return null;

  return (
    <div
      className={
        contained
          ? "ambient-fx pointer-events-none absolute inset-0 z-0 overflow-hidden"
          : OVERLAY_CLASS
      }
      aria-hidden
    >
      {shells.map((s) => (
        <span key={s.id} className="absolute" style={{ left: `${s.left}%`, top: `${s.top}%` }}>
          {s.sparks.map((sp) => (
            <span
              key={sp.i}
              className="absolute block h-2 w-2 rounded-full opacity-0"
              style={
                {
                  background: `hsl(${s.hue} 90% 78%)`,
                  boxShadow: `0 0 18px 4px hsl(${s.hue} 90% 72% / 0.9), 0 0 4px 1px #fff`,
                  animation: `wedding-firework-pop ${s.duration}s ease-out ${s.delay}s infinite`,
                  "--sx": `${sp.sx}px`,
                  "--sy": `${sp.sy}px`,
                } as CSSProperties
              }
            />
          ))}
        </span>
      ))}
      <style>{`
        @keyframes wedding-firework-pop {
          0% { transform: translate(0, 0) scale(0.4); opacity: 0; }
          2% { opacity: 1; }
          15% { transform: translate(var(--sx), var(--sy)) scale(0.15); opacity: 0; }
          100% { transform: translate(var(--sx), var(--sy)) scale(0.15); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

/** A rapid-fire salvo of shells popping in quick succession — the "dồn dập"
 * burst — closing on one unmistakably big finale shell dead-center. The
 * finale's delay is fixed (not derived from the regular shells' random max),
 * and the burst's TTL is sized with real headroom past when it finishes —
 * both regular shells and the finale were previously timed close enough to
 * the TTL that the finale could get unmounted mid-animation. */
function FireworksBurst({ triggerKey }: { triggerKey: number | null }) {
  const FINALE_DELAY = 2.6;
  const FINALE_DURATION = 3.2;

  const compact = useIsCompactViewport();
  const shellCount = compact ? 12 : 18;
  const sparksPerShell = compact ? 12 : 18;
  const finaleSparks = compact ? 60 : 90;

  const shells = useBurst(
    triggerKey,
    () => {
      const regular = Array.from({ length: shellCount }, (_, i) => {
        const hue = FIREWORK_HUES[i % FIREWORK_HUES.length];
        const radius = randomBetween(70, 130);
        return {
          id: i,
          left: randomBetween(8, 92),
          top: randomBetween(8, 62),
          hue,
          radius,
          duration: randomBetween(1.3, 1.9),
          delay: randomBetween(0, 2),
          finale: false,
          sparks: fireworkSparks(radius, sparksPerShell, 50),
        };
      });
      regular.push({
        id: regular.length,
        left: 50,
        top: 38,
        hue: FIREWORK_HUES[1],
        radius: 320,
        duration: FINALE_DURATION,
        delay: FINALE_DELAY,
        finale: true,
        sparks: heartSparks(13, finaleSparks, 55),
      });
      return regular;
    },
    (FINALE_DELAY + FINALE_DURATION + 0.8) * 1000
  );

  if (shells.length === 0) return null;

  return (
    <div className={OVERLAY_CLASS} aria-hidden>
      {shells.map((s) => (
        <span key={s.id} className="absolute" style={{ left: `${s.left}%`, top: `${s.top}%` }}>
          <span
            className={`absolute block -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0 ${s.finale ? "h-9 w-9" : "h-3 w-3"}`}
            style={
              {
                background: `hsl(${s.hue} 90% 90%)`,
                boxShadow: s.finale
                  ? `0 0 100px 40px hsl(${s.hue} 90% 80% / 0.95)`
                  : `0 0 24px 8px hsl(${s.hue} 90% 75% / 0.9)`,
                animation: `wedding-firework-flash ${s.finale ? "0.7s" : "0.5s"} ease-out ${s.delay}s 1`,
              } as CSSProperties
            }
          />
          {s.sparks.map((sp) => (
            <span
              key={sp.i}
              className={`absolute block rounded-full opacity-0 ${s.finale ? "h-2 w-2" : "h-1 w-1"}`}
              style={
                {
                  background: `hsl(${s.hue} 90% 78%)`,
                  boxShadow: s.finale
                    ? `0 0 12px 3px hsl(${s.hue} 90% 78% / 0.9)`
                    : `0 0 8px 2px hsl(${s.hue} 90% 75% / 0.85)`,
                  animation: `wedding-firework-burst ${s.duration}s linear ${s.delay}s 1`,
                  "--sx": `${sp.sx}px`,
                  "--sy": `${sp.sy}px`,
                  "--fall": `${sp.fall}px`,
                } as CSSProperties
              }
            />
          ))}
        </span>
      ))}
      <style>{`
        @keyframes wedding-firework-flash {
          0% { transform: scale(0.2); opacity: 0; }
          15% { transform: scale(1.6); opacity: 1; }
          100% { transform: scale(2.4); opacity: 0; }
        }
        @keyframes wedding-firework-burst {
          0% { transform: translate(0, 0) scale(1); opacity: 0; }
          8% { opacity: 1; }
          45% { transform: translate(var(--sx), var(--sy)) scale(0.65); opacity: 0.95; }
          70% { transform: translate(var(--sx), calc(var(--sy) + var(--fall) * 0.5)) scale(0.4); opacity: 0.7; }
          100% { transform: translate(var(--sx), calc(var(--sy) + var(--fall))) scale(0.15); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

// A real rose glyph reads unmistakably as a rose (and renders pixel-smooth
// via the OS emoji font) where a hand-rolled gradient blob at 20px just
// looked like a red dot. `animation-timing-function: linear` matters here —
// with many keyframe stops, `ease-in-out` re-decelerates/re-accelerates at
// every single stop, which is what read as "not smooth"; linear lets the
// keyframe positions alone encode the fall curve. The curve itself bakes in
// gravity (vh stops get denser near 0%, i.e. it accelerates downward),
// a left-right flutter (the drift multiplier oscillates sign before
// settling, like a real petal swaying as it falls) and scale pulsing
// (simulates the flower tumbling edge-on) instead of a straight diagonal.
function Roses() {
  const roses = useClientItems(() =>
    Array.from({ length: 11 }, (_, i) => ({
      id: i,
      left: randomBetween(0, 100),
      size: randomBetween(20, 34),
      duration: randomBetween(14, 23),
      delay: randomBetween(0, 18),
      drift: randomBetween(-110, 110),
      rotate: randomBetween(-260, 260),
      spin: Math.random() > 0.5,
    }))
  );

  if (roses.length === 0) return null;

  return (
    <div className={OVERLAY_CLASS} aria-hidden>
      {roses.map((r) => (
        <span
          key={r.id}
          className="absolute top-[-8%] block leading-none opacity-0"
          style={
            {
              left: `${r.left}%`,
              fontSize: r.size,
              filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.25))",
              animation: `wedding-rose-fall ${r.duration}s linear ${r.delay}s infinite`,
              "--rose-drift": `${r.drift}px`,
              "--rose-rotate": `${r.rotate}deg`,
            } as CSSProperties
          }
        >
          {r.spin ? "🌹" : "🌷"}
        </span>
      ))}
      <style>{`
        @keyframes wedding-rose-fall {
          0% { transform: translate3d(0, -10vh, 0) rotate(0deg) scale(0.9); opacity: 0; }
          5% { transform: translate3d(calc(var(--rose-drift) * 0.05), -8vh, 0) rotate(calc(var(--rose-rotate) * 0.03)) scale(0.95); opacity: 0.95; }
          15% { transform: translate3d(calc(var(--rose-drift) * -0.12), -5vh, 0) rotate(calc(var(--rose-rotate) * 0.1)) scale(1.05); }
          30% { transform: translate3d(calc(var(--rose-drift) * 0.32), 6.5vh, 0) rotate(calc(var(--rose-rotate) * 0.24)) scale(0.9); }
          45% { transform: translate3d(calc(var(--rose-drift) * -0.08), 20vh, 0) rotate(calc(var(--rose-rotate) * 0.42)) scale(1); }
          60% { transform: translate3d(calc(var(--rose-drift) * 0.58), 38.5vh, 0) rotate(calc(var(--rose-rotate) * 0.62)) scale(0.92); }
          75% { transform: translate3d(calc(var(--rose-drift) * 0.3), 61vh, 0) rotate(calc(var(--rose-rotate) * 0.8)) scale(1.02); }
          90% { transform: translate3d(calc(var(--rose-drift) * 0.88), 90.5vh, 0) rotate(calc(var(--rose-rotate) * 0.94)) scale(0.95); opacity: 0.85; }
          100% { transform: translate3d(var(--rose-drift), 112vh, 0) rotate(var(--rose-rotate)) scale(1); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

// Same "converge into a heart" idea as HeartsBurst, but deliberately a
// different feel to match roses' own tumbling-petal identity instead of
// reusing the hearts effect verbatim: roses swirl in along a curved arc
// (an extra --rose-ax/ay control-point offset bulges the path outward mid-
// flight, then fades to 0 by arrival — a cheap way to fake a curved swoop
// with plain linear keyframe interpolation, no trig needed), tumbling the
// whole way. Once formed they bloom bigger (scale 1.18 vs hearts' 1.06),
// then scatter back DOWNWARD like falling petals instead of rising away.
function RosesBurst({ triggerKey }: { triggerKey: number | null }) {
  const FORM_DURATION = 7;
  const MAX_DELAY = 0.4;

  const roses = useBurst(
    triggerKey,
    () =>
      heartSparks(12, 46, 45).map((p) => ({
        id: p.i,
        size: randomBetween(18, 28),
        delay: randomBetween(0, MAX_DELAY),
        fx: randomBetween(-190, 190),
        fy: randomBetween(-190, 190),
        ax: randomBetween(-70, 70),
        ay: randomBetween(-70, 70),
        tx: p.sx,
        ty: p.sy,
        fall: p.fall,
        fallDrift: randomBetween(-60, 60),
        rotate: randomBetween(-260, 260),
        spin: Math.random() > 0.5,
      })),
    // Duration + max delay + buffer — same TTL-too-short bug class as the
    // scatter version this replaced.
    (FORM_DURATION + MAX_DELAY + 0.8) * 1000
  );

  if (roses.length === 0) return null;

  return (
    <div className={OVERLAY_CLASS} aria-hidden>
      {roses.map((r) => (
        <span
          key={r.id}
          className="absolute left-1/2 top-[44%] block leading-none opacity-0"
          style={
            {
              fontSize: r.size,
              filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.25))",
              animation: `wedding-rose-heart-form ${FORM_DURATION}s linear ${r.delay}s 1`,
              "--rose-fx": `${r.fx}px`,
              "--rose-fy": `${r.fy}px`,
              "--rose-ax": `${r.ax}px`,
              "--rose-ay": `${r.ay}px`,
              "--rose-tx": `${r.tx}px`,
              "--rose-ty": `${r.ty}px`,
              "--rose-fall": `${r.fall}vh`,
              "--rose-falldrift": `${r.fallDrift}px`,
              "--rose-rotate": `${r.rotate}deg`,
            } as CSSProperties
          }
        >
          {r.spin ? "🌹" : "🌷"}
        </span>
      ))}
      <style>{`
        @keyframes wedding-rose-heart-form {
          0% { transform: translate3d(var(--rose-fx), var(--rose-fy), 0) rotate(0deg) scale(0.5); opacity: 0; }
          10% { opacity: 1; }
          20% { transform: translate3d(calc(var(--rose-fx) + (var(--rose-tx) - var(--rose-fx)) * 0.2 + var(--rose-ax) * 0.5), calc(var(--rose-fy) + (var(--rose-ty) - var(--rose-fy)) * 0.2 + var(--rose-ay) * 0.5), 0) rotate(calc(var(--rose-rotate) * 0.15)) scale(0.7); }
          32% { transform: translate3d(calc(var(--rose-fx) + (var(--rose-tx) - var(--rose-fx)) * 0.5 + var(--rose-ax) * 0.9), calc(var(--rose-fy) + (var(--rose-ty) - var(--rose-fy)) * 0.5 + var(--rose-ay) * 0.9), 0) rotate(calc(var(--rose-rotate) * 0.4)) scale(0.9); }
          42% { transform: translate3d(calc(var(--rose-fx) + (var(--rose-tx) - var(--rose-fx)) * 0.8 + var(--rose-ax) * 0.35), calc(var(--rose-fy) + (var(--rose-ty) - var(--rose-fy)) * 0.8 + var(--rose-ay) * 0.35), 0) rotate(calc(var(--rose-rotate) * 0.7)) scale(1.05); }
          50% { transform: translate3d(var(--rose-tx), var(--rose-ty), 0) rotate(var(--rose-rotate)) scale(1); opacity: 1; }
          62% { transform: translate3d(var(--rose-tx), var(--rose-ty), 0) rotate(calc(var(--rose-rotate) * 1.1)) scale(1.18); opacity: 1; }
          74% { transform: translate3d(var(--rose-tx), var(--rose-ty), 0) rotate(calc(var(--rose-rotate) * 1.2)) scale(1); opacity: 1; }
          100% { transform: translate3d(calc(var(--rose-tx) + var(--rose-falldrift)), calc(var(--rose-ty) + var(--rose-fall)), 0) rotate(calc(var(--rose-rotate) * 1.7)) scale(0.8); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

// Real glyphs, same reasoning as the roses fix above — guaranteed-correct
// shape and smooth font rendering beats a hand-rolled CSS shape. The rise
// keyframe is deliberately front-loaded: the first 60% of the animation's
// TIME covers only the first ~20% of its DISTANCE (slow float), then the
// remaining 40% of time covers the other ~80% (fast dart up and out) — with
// `linear` timing so nothing re-eases at each stop and blurs that contrast.
function Hearts() {
  const hearts = useClientItems(() =>
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      left: randomBetween(0, 100),
      size: randomBetween(16, 28),
      duration: randomBetween(12, 18),
      delay: randomBetween(0, 14),
      drift: randomBetween(-45, 45),
      glyph: ["💕", "💗", "❤️"][i % 3],
    }))
  );

  if (hearts.length === 0) return null;

  return (
    <div className={OVERLAY_CLASS} aria-hidden>
      {hearts.map((h) => (
        <span
          key={h.id}
          className="absolute bottom-[-8%] block leading-none opacity-0"
          style={
            {
              left: `${h.left}%`,
              fontSize: h.size,
              animation: `wedding-heart-rise ${h.duration}s linear ${h.delay}s infinite`,
              "--heart-drift": `${h.drift}px`,
            } as CSSProperties
          }
        >
          {h.glyph}
        </span>
      ))}
      {/* Gentle, evenly-graduated float — the earlier version jumped between
          just 2-3 keyframe stops for the "slow then dart" feel, which read as
          a sudden lurch ("xấu") rather than a smooth accelerating rise. More
          stops with smaller deltas keeps the same slow→fast shape but as a
          continuous curve. */}
      <style>{`
        @keyframes wedding-heart-rise {
          0% { transform: translate3d(0, 0, 0) scale(0.8); opacity: 0; }
          15% { opacity: 0.9; transform: translate3d(calc(var(--heart-drift) * 0.05), -4vh, 0) scale(0.85); }
          35% { transform: translate3d(calc(var(--heart-drift) * 0.15), -12vh, 0) scale(0.9); opacity: 0.85; }
          55% { transform: translate3d(calc(var(--heart-drift) * 0.3), -24vh, 0) scale(0.95); opacity: 0.75; }
          72% { transform: translate3d(calc(var(--heart-drift) * 0.5), -45vh, 0) scale(1); opacity: 0.6; }
          88% { transform: translate3d(calc(var(--heart-drift) * 0.75), -78vh, 0) scale(1.02); opacity: 0.35; }
          100% { transform: translate3d(var(--heart-drift), -125vh, 0) scale(0.9); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

// Each heart flies in from a scattered start point toward its own spot on
// the heartSparks outline (reusing the same parametric heart curve as the
// fireworks finale), so together they visibly resolve into one big heart
// mid-screen. All hearts share one duration/keyframe — arrival is baked in
// as fixed stop fractions blending --heart-fx/fy toward --heart-tx/ty via
// calc(), so `linear` timing still reads as an eased approach (dense stops
// near arrival) without the re-decelerate-per-stop artifact `ease` gives.
// Once formed they hold with a small "heartbeat" pulse, then keep floating
// up individually (each own --heart-rise) while fading, instead of just
// dissolving in place.
function HeartsBurst({ triggerKey }: { triggerKey: number | null }) {
  const FORM_DURATION = 6.5;
  const MAX_DELAY = 0.35;
  // A second, sparser layer of hearts drifting straight up from the bottom,
  // staggered across the whole burst window (not just at the start) so the
  // centerpiece heart doesn't form in an empty frame — there's always a few
  // small hearts rising around it, same as the persistent ambient effect but
  // folded into the burst itself so it reads as one richer moment.
  const FLOAT_MAX_DELAY = FORM_DURATION - 1.2;
  const FLOAT_MAX_DURATION = 4;

  const compact = useIsCompactViewport();

  const hearts = useBurst(
    triggerKey,
    () =>
      heartSparks(12, 50, 40).map((p) => ({
        id: p.i,
        size: randomBetween(18, 28),
        delay: randomBetween(0, MAX_DELAY),
        fx: randomBetween(-180, 180),
        fy: randomBetween(160, 380),
        tx: p.sx,
        ty: p.sy,
        rise: p.fall,
        glyph: ["💕", "💗", "❤️"][p.i % 3],
      })),
    // Duration + max delay + buffer — same TTL-too-short bug class as
    // petals/roses, this used to cut hearts off before they finished.
    (FORM_DURATION + MAX_DELAY + 0.8) * 1000
  );
  const floaters = useBurst(
    triggerKey,
    () =>
      Array.from({ length: compact ? 35 : 70 }, (_, i) => ({
        id: i,
        left: randomBetween(0, 100),
        size: randomBetween(14, 24),
        duration: randomBetween(2.6, FLOAT_MAX_DURATION),
        delay: randomBetween(0, FLOAT_MAX_DELAY),
        drift: randomBetween(-70, 70),
        glyph: ["💕", "💗", "❤️"][i % 3],
      })),
    (FLOAT_MAX_DELAY + FLOAT_MAX_DURATION + 0.8) * 1000
  );

  if (hearts.length === 0 && floaters.length === 0) return null;

  return (
    <div className={OVERLAY_CLASS} aria-hidden>
      {floaters.map((f) => (
        <span
          key={f.id}
          className="absolute bottom-[-8%] block leading-none opacity-0"
          style={
            {
              left: `${f.left}%`,
              fontSize: f.size,
              animation: `wedding-heart-rise ${f.duration}s linear ${f.delay}s 1`,
              "--heart-drift": `${f.drift}px`,
            } as CSSProperties
          }
        >
          {f.glyph}
        </span>
      ))}
      {hearts.map((h) => (
        <span
          key={h.id}
          className="absolute left-1/2 top-[44%] block leading-none opacity-0"
          style={
            {
              fontSize: h.size,
              animation: `wedding-heart-form ${FORM_DURATION}s linear ${h.delay}s 1`,
              "--heart-fx": `${h.fx}px`,
              "--heart-fy": `${h.fy}px`,
              "--heart-tx": `${h.tx}px`,
              "--heart-ty": `${h.ty}px`,
              "--heart-rise": `${h.rise}vh`,
            } as CSSProperties
          }
        >
          {h.glyph}
        </span>
      ))}
      <style>{`
        @keyframes wedding-heart-form {
          0% { transform: translate3d(var(--heart-fx), var(--heart-fy), 0) scale(0.4); opacity: 0; }
          8% { opacity: 1; }
          18% { transform: translate3d(calc(var(--heart-fx) + (var(--heart-tx) - var(--heart-fx)) * 0.45), calc(var(--heart-fy) + (var(--heart-ty) - var(--heart-fy)) * 0.45), 0) scale(0.6); }
          30% { transform: translate3d(calc(var(--heart-fx) + (var(--heart-tx) - var(--heart-fx)) * 0.75), calc(var(--heart-fy) + (var(--heart-ty) - var(--heart-fy)) * 0.75), 0) scale(0.85); }
          40% { transform: translate3d(calc(var(--heart-fx) + (var(--heart-tx) - var(--heart-fx)) * 0.93), calc(var(--heart-fy) + (var(--heart-ty) - var(--heart-fy)) * 0.93), 0) scale(0.98); }
          47% { transform: translate3d(var(--heart-tx), var(--heart-ty), 0) scale(1); opacity: 1; }
          60% { transform: translate3d(var(--heart-tx), var(--heart-ty), 0) scale(1.06); opacity: 1; }
          68% { transform: translate3d(var(--heart-tx), var(--heart-ty), 0) scale(1); opacity: 1; }
          100% { transform: translate3d(var(--heart-tx), calc(var(--heart-ty) - var(--heart-rise)), 0) scale(0.88); opacity: 0; }
        }
        @keyframes wedding-heart-rise {
          0% { transform: translate3d(0, 0, 0) scale(0.8); opacity: 0; }
          15% { opacity: 0.9; transform: translate3d(calc(var(--heart-drift) * 0.05), -4vh, 0) scale(0.85); }
          35% { transform: translate3d(calc(var(--heart-drift) * 0.15), -12vh, 0) scale(0.9); opacity: 0.85; }
          55% { transform: translate3d(calc(var(--heart-drift) * 0.3), -24vh, 0) scale(0.95); opacity: 0.75; }
          72% { transform: translate3d(calc(var(--heart-drift) * 0.5), -45vh, 0) scale(1); opacity: 0.6; }
          88% { transform: translate3d(calc(var(--heart-drift) * 0.75), -78vh, 0) scale(1.02); opacity: 0.35; }
          100% { transform: translate3d(var(--heart-drift), -125vh, 0) scale(0.9); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

/** Low, ground-hugging cold fog banks drifting side to side near the
 * bottom of the screen — "khói đá khô" rolling across a stage floor.
 * Deliberately distinct from Mist (which drifts loosely across the WHOLE
 * viewport, any height): anchored low (`top` stays in the bottom quarter),
 * flatter (squashed ellipses), cooler-toned, and denser. Half the banks
 * drift rightward and half leftward (alternating by index) so they weave
 * past each other instead of the whole layer marching one direction. */
function DryIce() {
  const banks = useClientItems(() =>
    Array.from({ length: 7 }, (_, i) => ({
      id: i,
      top: randomBetween(72, 94),
      size: randomBetween(260, 480),
      duration: randomBetween(20, 32),
      delay: randomBetween(0, 18),
      rightward: i % 2 === 0,
      bob: randomBetween(6, 16),
    }))
  );

  if (banks.length === 0) return null;

  return (
    <div className={OVERLAY_CLASS} aria-hidden>
      {banks.map((b) => (
        <span
          key={b.id}
          className={`absolute block rounded-full opacity-0 ${
            b.rightward ? "left-[-35%]" : "right-[-35%]"
          }`}
          style={
            {
              top: `${b.top}%`,
              width: b.size,
              height: b.size * 0.34,
              // Neutral "smoke white" (grey, not blue-tinted) — real dry
              // ice reads as a plain pale grey haze, and the earlier blue
              // cast looked more like a cooling-mist effect than smoke.
              // Still graded from near-white core to a soft grey rim so it
              // keeps a visible body over the site's own near-white ivory
              // background, rather than just barely tinting the page.
              background:
                "radial-gradient(ellipse, rgba(255,255,255,0.85) 0%, rgba(232,232,229,0.55) 40%, rgba(205,204,199,0.22) 68%, rgba(205,204,199,0) 85%)",
              boxShadow: "0 10px 40px 10px rgba(180,178,172,0.25)",
              filter: "blur(20px)",
              animation: `wedding-dryice-roll-${b.rightward ? "r" : "l"} ${b.duration}s ease-in-out ${b.delay}s infinite`,
              "--dryice-bob": `${b.bob}px`,
            } as CSSProperties
          }
        />
      ))}
      <style>{`
        @keyframes wedding-dryice-roll-r {
          0% { transform: translate3d(0, 0, 0); opacity: 0; }
          10% { opacity: 0.95; }
          50% { transform: translate3d(70vw, calc(var(--dryice-bob) * -1), 0); }
          90% { opacity: 0.75; }
          100% { transform: translate3d(140vw, 0, 0); opacity: 0; }
        }
        @keyframes wedding-dryice-roll-l {
          0% { transform: translate3d(0, 0, 0); opacity: 0; }
          10% { opacity: 0.95; }
          50% { transform: translate3d(-70vw, var(--dryice-bob), 0); }
          90% { opacity: 0.75; }
          100% { transform: translate3d(-140vw, 0, 0); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

/** The gate-entry moment: a thick bank billows in from both sides at once
 * and climbs, instead of the persistent version's slow, thin, low roll —
 * reads as the fog machine "phun mạnh" (firing hard) right as the guest
 * steps in, then clearing. */
function DryIceBurst({ triggerKey }: { triggerKey: number | null }) {
  const banks = useBurst(
    triggerKey,
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        id: i,
        top: randomBetween(55, 94),
        size: randomBetween(300, 560),
        duration: randomBetween(2.8, 3.8),
        delay: randomBetween(0, 0.7),
        rightward: i % 2 === 0,
        bob: randomBetween(8, 20),
      })),
    // Worst case 3.8s duration + 0.7s delay + buffer — same TTL-headroom
    // reasoning as the burst effects above (see PetalBurst's comment).
    5000
  );

  if (banks.length === 0) return null;

  return (
    <div className={OVERLAY_CLASS} aria-hidden>
      {banks.map((b) => (
        <span
          key={b.id}
          className={`absolute block rounded-full opacity-0 ${
            b.rightward ? "left-[-35%]" : "right-[-35%]"
          }`}
          style={
            {
              top: `${b.top}%`,
              width: b.size,
              height: b.size * 0.34,
              background:
                "radial-gradient(ellipse, rgba(255,255,255,0.92) 0%, rgba(232,232,229,0.65) 40%, rgba(205,204,199,0.28) 68%, rgba(205,204,199,0) 85%)",
              boxShadow: "0 10px 44px 12px rgba(180,178,172,0.3)",
              filter: "blur(22px)",
              animation: `wedding-dryice-billow-${b.rightward ? "r" : "l"} ${b.duration}s ease-out ${b.delay}s 1`,
              "--dryice-bob": `${b.bob}px`,
            } as CSSProperties
          }
        />
      ))}
      <style>{`
        @keyframes wedding-dryice-billow-r {
          0% { transform: translate3d(0, 10vh, 0) scale(0.7); opacity: 0; }
          20% { opacity: 0.9; }
          60% { transform: translate3d(55vw, calc(var(--dryice-bob) * -1), 0) scale(1.1); opacity: 0.7; }
          100% { transform: translate3d(110vw, -8vh, 0) scale(1.25); opacity: 0; }
        }
        @keyframes wedding-dryice-billow-l {
          0% { transform: translate3d(0, 10vh, 0) scale(0.7); opacity: 0; }
          20% { opacity: 0.9; }
          60% { transform: translate3d(-55vw, var(--dryice-bob), 0) scale(1.1); opacity: 0.7; }
          100% { transform: translate3d(-110vw, -8vh, 0) scale(1.25); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

// Soft pastel spread (not a full rainbow), moderate saturation/lightness
// so the balloons read as "wedding", not a kids' birthday party — and
// don't look oversaturated/muddy the way the old hue-rotated 🎈 emoji did.
const BALLOON_HUES = [340, 25, 200, 265, 42];

function balloonPieces(count: number) {
  return Array.from({ length: count }, (_, i) => {
    // ~1 in 5 balloons pops partway through its fall instead of landing —
    // a real balloon drop always has a few that don't survive.
    const pop = Math.random() < 0.22;
    // Real balloon-net drops mix noticeably big and small balloons, not a
    // narrow band all reading as roughly the same size — big ones also
    // drift a little slower/heavier and sway a little wider, matching
    // more air resistance on a bigger surface.
    const size = randomBetween(22, 76);
    const sizeT = (size - 22) / (76 - 22); // 0 (smallest) .. 1 (biggest)
    return {
      id: i,
      left: randomBetween(4, 96),
      size,
      hue: BALLOON_HUES[i % BALLOON_HUES.length],
      duration: randomBetween(4.2, 6.4) + sizeT * 2.2,
      delay: randomBetween(0, 1.4),
      sway: randomBetween(26, 60) + sizeT * 18,
      // A real bouquet is a mix — plain balloons and a few tied with a
      // ribbon, not every single one. Also varies the body a touch
      // rounder/narrower/more egg-shaped per balloon instead of one
      // identical mould.
      hasBow: Math.random() < 0.45,
      bodyHeight: randomBetween(52, 62),
      bodyWidth: randomBetween(74, 88),
      pop,
      // Small, tight radial burst (not a firework-sized one) — reused via
      // fireworkSparks so the fragments fly out at even, jittered angles
      // instead of a hand-rolled set of fixed directions.
      fragments: pop ? fireworkSparks(24, 6, 16) : [],
    };
  });
}

/** A hand-built glossy balloon — real "quả" volume via an off-centre
 * highlight + darker rim (not a flat colour dot), a knotted tip, a thin
 * curling string, and (on about half of them) a small ribbon "nơ" tied
 * where the string starts — instead of a single hue-rotated 🎈 glyph,
 * which is why the old version read as flat/oversaturated. `--hue`/
 * `--balloon-sway` are set once on the outer (unanimated) layout span and
 * inherited by every child below, since CSS custom properties cascade
 * normally. */
function renderBalloons(items: ReturnType<typeof balloonPieces>) {
  return items.map((b) => {
    const anim = b.pop
      ? `wedding-balloon-pop-track ${b.duration}s ease-in ${b.delay}s 1, wedding-balloon-pop-fade ${b.duration}s ease-in ${b.delay}s 1`
      : `wedding-balloon-fall ${b.duration}s ease-in ${b.delay}s 1`;

    return (
    <span
      key={b.id}
      // No opacity-0 here, unlike the other effects' single animated span
      // — visibility is now delegated entirely to each child's own opacity
      // keyframe (see BALLOON_KEYFRAMES), since a static opacity on this
      // parent would multiply against every child and hide them all.
      className="absolute top-[-14%] block"
      style={
        {
          left: `${b.left}%`,
          width: b.size,
          height: b.size * 1.7,
          "--hue": b.hue,
          "--balloon-sway": `${b.sway}px`,
          "--balloon-body-h": `${b.bodyHeight}%`,
          "--balloon-body-w": `${b.bodyWidth}%`,
        } as CSSProperties
      }
    >
      <span className="wedding-balloon-body" style={{ animation: anim }} />
      <span className="wedding-balloon-knot" style={{ animation: anim }} />
      <span className="wedding-balloon-string" style={{ animation: anim }} />
      {b.hasBow && (
        <>
          <span
            className="wedding-balloon-bow-wing wedding-balloon-bow-wing-l"
            style={{ animation: anim }}
          />
          <span
            className="wedding-balloon-bow-wing wedding-balloon-bow-wing-r"
            style={{ animation: anim }}
          />
          <span className="wedding-balloon-bow-knot" style={{ animation: anim }} />
        </>
      )}
      {b.pop && (
        <>
          <span
            className="wedding-balloon-flash"
            style={{ animation: `wedding-balloon-pop-flash ${b.duration}s ease-in ${b.delay}s 1` }}
          />
          {b.fragments.map((f) => (
            <span
              key={f.i}
              className="wedding-balloon-fragment"
              style={
                {
                  animation: `wedding-balloon-pop-fragment ${b.duration}s ease-in ${b.delay}s 1`,
                  "--fx": `${f.sx}px`,
                  "--fy": `${f.sy}px`,
                } as CSSProperties
              }
            />
          ))}
        </>
      )}
    </span>
    );
  });
}

const BALLOON_KEYFRAMES = `
  .wedding-balloon-body {
    position: absolute;
    top: 0;
    left: calc((100% - var(--balloon-body-w, 80%)) / 2);
    width: var(--balloon-body-w, 80%);
    height: var(--balloon-body-h, 55%);
    border-radius: 50% 50% 48% 48% / 58% 58% 42% 42%;
    /* Two layered gradients: a small crisp specular dot (real glossy
       plastic/latex has a tight sharp glint, not just a broad soft sheen)
       on top of the main soft-shaded sphere gradient underneath. */
    background:
      radial-gradient(circle at 27% 21%, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0) 9%),
      radial-gradient(circle at 32% 26%,
        rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.35) 12%,
        hsl(var(--hue) 62% 60%) 38%, hsl(var(--hue) 56% 46%) 76%,
        hsl(var(--hue) 50% 34%) 100%);
    box-shadow: inset -5px -8px 12px rgba(0,0,0,0.2), 0 3px 8px rgba(0,0,0,0.16);
    opacity: 0;
  }
  .wedding-balloon-knot {
    position: absolute;
    top: calc(var(--balloon-body-h, 55%) - 3%);
    left: 50%;
    width: 0;
    height: 0;
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    border-top: 6px solid hsl(var(--hue) 50% 34%);
    transform: translateX(-50%);
    opacity: 0;
  }
  .wedding-balloon-string {
    position: absolute;
    top: calc(var(--balloon-body-h, 55%) + 3%);
    left: 50%;
    width: 1.5px;
    height: 20%;
    background: rgba(120,108,96,0.55);
    opacity: 0;
  }
  /* A rounded "petal" (one square corner via asymmetric border-radius)
     rotated away from centre on each side reads as a soft ribbon loop —
     much smoother than a sharp clip-path flag shape at this size. */
  .wedding-balloon-bow-wing {
    position: absolute;
    top: calc(var(--balloon-body-h, 55%) + 20%);
    width: 15%;
    height: 11%;
    background: hsl(var(--hue) 60% 52%);
    box-shadow: inset 0 0 0 1px rgba(0,0,0,0.06);
    border-radius: 50% 50% 50% 4%;
    opacity: 0;
  }
  .wedding-balloon-bow-wing-l {
    left: 32%;
    transform: rotate(-42deg);
  }
  .wedding-balloon-bow-wing-r {
    left: 53%;
    transform: rotate(42deg) scaleX(-1);
  }
  .wedding-balloon-bow-knot {
    position: absolute;
    top: calc(var(--balloon-body-h, 55%) + 20%);
    left: 46%;
    width: 8%;
    height: 8%;
    background: hsl(var(--hue) 52% 42%);
    border-radius: 50%;
    opacity: 0;
  }
  .wedding-balloon-flash {
    position: absolute;
    top: 30%;
    left: 10%;
    width: 80%;
    height: 45%;
    border-radius: 50%;
    background: radial-gradient(circle, #fff 0%, hsl(var(--hue) 85% 78% / 0.65) 45%, transparent 75%);
    opacity: 0;
  }
  .wedding-balloon-fragment {
    position: absolute;
    top: 45%;
    left: 46%;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: hsl(var(--hue) 68% 62%);
    box-shadow: 0 0 6px 2px hsl(var(--hue) 68% 58% / 0.7);
    opacity: 0;
  }
  @keyframes wedding-balloon-fall {
    0% { transform: translate3d(0, -14vh, 0) rotate(0deg); opacity: 0; }
    8% { opacity: 0.95; }
    25% { transform: translate3d(calc(var(--balloon-sway) * 1), 22vh, 0) rotate(6deg); }
    50% { transform: translate3d(calc(var(--balloon-sway) * -1), 48vh, 0) rotate(-6deg); }
    75% { transform: translate3d(calc(var(--balloon-sway) * 0.6), 74vh, 0) rotate(4deg); }
    92% { opacity: 0.9; }
    100% { transform: translate3d(0, 106vh, 0) rotate(0deg); opacity: 0; }
  }
  @keyframes wedding-balloon-pop-track {
    0% { transform: translate3d(0, -14vh, 0) rotate(0deg); }
    25% { transform: translate3d(calc(var(--balloon-sway) * 1), 22vh, 0) rotate(6deg); }
    50% { transform: translate3d(calc(var(--balloon-sway) * -1), 48vh, 0) rotate(-6deg); }
    62%, 100% { transform: translate3d(calc(var(--balloon-sway) * -0.3), 58vh, 0) rotate(-2deg); }
  }
  @keyframes wedding-balloon-pop-fade {
    0% { opacity: 0; }
    8% { opacity: 0.95; }
    58% { opacity: 0.95; }
    62% { opacity: 1; }
    67%, 100% { opacity: 0; }
  }
  @keyframes wedding-balloon-pop-flash {
    0%, 60% { opacity: 0; transform: translate3d(calc(var(--balloon-sway) * -0.3), 58vh, 0) scale(0.3); }
    64% { opacity: 0.9; transform: translate3d(calc(var(--balloon-sway) * -0.3), 58vh, 0) scale(1.6); }
    78%, 100% { opacity: 0; transform: translate3d(calc(var(--balloon-sway) * -0.3), 58vh, 0) scale(2.4); }
  }
  @keyframes wedding-balloon-pop-fragment {
    0%, 60% { opacity: 0; transform: translate3d(calc(var(--balloon-sway) * -0.3), 58vh, 0) scale(0.4); }
    64% { opacity: 1; transform: translate3d(calc(var(--balloon-sway) * -0.3 + var(--fx)), calc(58vh + var(--fy)), 0) scale(1); }
    100% { opacity: 0; transform: translate3d(calc(var(--balloon-sway) * -0.3 + var(--fx) * 1.7), calc(58vh + var(--fy) * 1.7 + 7vh), 0) scale(0.5); }
  }
`;

function bubblePieces(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: randomBetween(0, 100),
    size: randomBetween(10, 26),
    duration: randomBetween(9, 16),
    delay: randomBetween(0, 14),
    drift: randomBetween(-50, 50),
  }));
}

function renderBubbles(items: ReturnType<typeof bubblePieces>) {
  return items.map((bu) => (
    <span
      key={bu.id}
      className="absolute bottom-[-8%] block rounded-full opacity-0"
      style={
        {
          left: `${bu.left}%`,
          width: bu.size,
          height: bu.size,
          // Off-centre highlight + a bright rim, the two things that read
          // as "glass/soap film" rather than a flat coloured dot.
          background:
            "radial-gradient(circle at 32% 28%, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.35) 22%, rgba(200,230,255,0.12) 55%, rgba(200,230,255,0.05) 100%)",
          border: "1px solid rgba(255,255,255,0.5)",
          boxShadow: "0 0 6px 1px rgba(255,255,255,0.35), inset 0 0 6px rgba(255,255,255,0.4)",
          animation: `wedding-bubble-rise ${bu.duration}s ease-in-out ${bu.delay}s infinite`,
          "--bubble-drift": `${bu.drift}px`,
        } as CSSProperties
      }
    />
  ));
}

const BUBBLE_KEYFRAMES = `
  @keyframes wedding-bubble-rise {
    0% { transform: translate3d(0, 0, 0) scale(0.7); opacity: 0; }
    10% { opacity: 0.85; }
    50% { transform: translate3d(calc(var(--bubble-drift) * 0.6), -60vh, 0) scale(1); }
    90% { opacity: 0.5; }
    100% { transform: translate3d(var(--bubble-drift), -118vh, 0) scale(1.1); opacity: 0; }
  }
`;

function lightGlintPieces(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: randomBetween(0, 100),
    top: randomBetween(0, 100),
    size: randomBetween(2, 4),
    duration: randomBetween(1.4, 3),
    delay: randomBetween(0, 3),
  }));
}

function renderLightGlints(items: ReturnType<typeof lightGlintPieces>) {
  return items.map((g) => (
    <span
      key={g.id}
      className="absolute block rounded-full opacity-0"
      style={{
        left: `${g.left}%`,
        top: `${g.top}%`,
        width: g.size,
        height: g.size,
        background: "#fff8e6",
        boxShadow: "0 0 8px 2px rgba(255,238,200,0.9)",
        animation: `wedding-glint-twinkle ${g.duration}s ease-in-out ${g.delay}s infinite`,
      }}
    />
  ));
}

const GLINT_KEYFRAMES = `
  @keyframes wedding-glint-twinkle {
    0%, 100% { opacity: 0; transform: scale(0.4); }
    50% { opacity: 1; transform: scale(1.2); }
  }
`;

/** The three-layer "Balloon Drop" look: soap bubbles rising and warm light
 * glints twinkling run continuously as the ambient backdrop, while the
 * balloons themselves fall in periodic waves via useCyclingBurst — a real
 * balloon-net release is a discrete event that happens every so often, not
 * a constant rain, so only that layer cycles on/off. */
function BalloonDrop() {
  const compact = useIsCompactViewport();
  const bubbles = useClientItems(() => bubblePieces(compact ? 10 : 16));
  const glints = useClientItems(() => lightGlintPieces(compact ? 10 : 18));
  // Worst case per wave: 7s duration + 1.4s delay + buffer — activeMs must
  // clear the slowest balloon's own fall before the next wave re-rolls.
  const balloons = useCyclingBurst(() => balloonPieces(compact ? 6 : 10), 8700, 13000);

  if (bubbles.length === 0 && glints.length === 0 && balloons.length === 0) return null;

  return (
    <div className={OVERLAY_CLASS} aria-hidden>
      {renderBubbles(bubbles)}
      {renderLightGlints(glints)}
      {renderBalloons(balloons)}
      <style>{`
        ${BUBBLE_KEYFRAMES}
        ${GLINT_KEYFRAMES}
        ${BALLOON_KEYFRAMES}
      `}</style>
    </div>
  );
}

/** The gate-entry burst: one big balloon-net release plus a denser flurry
 * of bubbles and light glints, all firing together — the persistent
 * version's three separately-paced layers collapsed into a single moment. */
function BalloonDropBurst({ triggerKey }: { triggerKey: number | null }) {
  const compact = useIsCompactViewport();
  const balloons = useBurst(
    triggerKey,
    () =>
      balloonPieces(compact ? 16 : 28).map((b) => ({
        ...b,
        duration: randomBetween(3.6, 5.2),
        delay: randomBetween(0, 0.8),
      })),
    6800
  );
  const bubbles = useBurst(
    triggerKey,
    () =>
      bubblePieces(compact ? 16 : 26).map((bu) => ({
        ...bu,
        duration: randomBetween(3, 5),
        delay: randomBetween(0, 1),
      })),
    6800
  );
  const glints = useBurst(
    triggerKey,
    () =>
      lightGlintPieces(compact ? 20 : 36).map((g) => ({
        ...g,
        duration: randomBetween(0.8, 1.8),
        delay: randomBetween(0, 2),
      })),
    6800
  );

  if (balloons.length === 0 && bubbles.length === 0 && glints.length === 0) return null;

  return (
    <div className={OVERLAY_CLASS} aria-hidden>
      {renderBubbles(bubbles)}
      {renderLightGlints(glints)}
      {renderBalloons(balloons)}
      <style>{`
        ${BUBBLE_KEYFRAMES}
        ${GLINT_KEYFRAMES}
        ${BALLOON_KEYFRAMES}
      `}</style>
    </div>
  );
}

// A wider, more varied bouquet than Roses' 🌹/🌷 pair — reads as a genuine
// "mưa hoa" (flower shower) mixing several kinds, not one flower repeated.
const FLOWER_GLYPHS = ["🌸", "🌺", "🌼", "💮", "🌷"];

function flowerShowerPieces(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: randomBetween(0, 100),
    size: randomBetween(18, 32),
    duration: randomBetween(9, 16),
    delay: randomBetween(0, 12),
    drift: randomBetween(-130, 130),
    rotate: randomBetween(-320, 320),
    glyph: FLOWER_GLYPHS[i % FLOWER_GLYPHS.length],
  }));
}

function renderFlowerShower(
  items: ReturnType<typeof flowerShowerPieces>,
  infinite: boolean
) {
  return items.map((f) => (
    <span
      key={f.id}
      className="absolute top-[-8%] block leading-none opacity-0"
      style={
        {
          left: `${f.left}%`,
          fontSize: f.size,
          filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.22))",
          animation: `wedding-flower-tumble ${f.duration}s linear ${f.delay}s ${
            infinite ? "infinite" : "1"
          }`,
          "--flower-drift": `${f.drift}px`,
          "--flower-rotate": `${f.rotate}deg`,
        } as CSSProperties
      }
    >
      {f.glyph}
    </span>
  ));
}

// `scaleY` oscillating toward ~0.25-0.35 mid-fall (rather than staying at
// 1) fakes a flower tumbling edge-on toward the camera — a cheap pseudo-3D
// flip layered on top of the same drift/rotate curve Roses uses.
const FLOWER_SHOWER_KEYFRAMES = `
  @keyframes wedding-flower-tumble {
    0% { transform: translate3d(0, -10vh, 0) rotate(0deg) scaleY(1); opacity: 0; }
    6% { opacity: 0.95; }
    20% { transform: translate3d(calc(var(--flower-drift) * 0.22), 12vh, 0) rotate(calc(var(--flower-rotate) * 0.18)) scaleY(0.3); }
    35% { transform: translate3d(calc(var(--flower-drift) * -0.1), 30vh, 0) rotate(calc(var(--flower-rotate) * 0.38)) scaleY(1); }
    50% { transform: translate3d(calc(var(--flower-drift) * 0.5), 50vh, 0) rotate(calc(var(--flower-rotate) * 0.58)) scaleY(0.25); }
    65% { transform: translate3d(calc(var(--flower-drift) * 0.2), 68vh, 0) rotate(calc(var(--flower-rotate) * 0.76)) scaleY(1); }
    80% { transform: translate3d(calc(var(--flower-drift) * 0.85), 86vh, 0) rotate(calc(var(--flower-rotate) * 0.9)) scaleY(0.35); opacity: 0.85; }
    100% { transform: translate3d(var(--flower-drift), 112vh, 0) rotate(var(--flower-rotate)) scaleY(1); opacity: 0; }
  }
`;

function FlowerShower() {
  const compact = useIsCompactViewport();
  const flowers = useClientItems(() => flowerShowerPieces(compact ? 14 : 22));

  if (flowers.length === 0) return null;

  return (
    <div className={OVERLAY_CLASS} aria-hidden>
      {renderFlowerShower(flowers, true)}
      <style>{FLOWER_SHOWER_KEYFRAMES}</style>
    </div>
  );
}

/** The gate-entry burst: a dense, fast one-shot downpour instead of the
 * persistent version's sparse, slow, looping shower. */
function FlowerShowerBurst({ triggerKey }: { triggerKey: number | null }) {
  const compact = useIsCompactViewport();
  const flowers = useBurst(
    triggerKey,
    () =>
      flowerShowerPieces(compact ? 45 : 80).map((f) => ({
        ...f,
        duration: randomBetween(3.2, 5),
        delay: randomBetween(0, 0.8),
      })),
    // Worst case 5s duration + 0.8s delay + buffer.
    6100
  );

  if (flowers.length === 0) return null;

  return (
    <div className={OVERLAY_CLASS} aria-hidden>
      {renderFlowerShower(flowers, false)}
      <style>{FLOWER_SHOWER_KEYFRAMES}</style>
    </div>
  );
}
