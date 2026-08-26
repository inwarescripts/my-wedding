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
  | "hearts";

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

const OVERLAY_CLASS =
  "ambient-fx pointer-events-none fixed inset-0 z-30 overflow-hidden";

export function AmbientEffect({ variant }: { variant: string }) {
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
    default:
      return null;
  }
}

function PetalBurst({ triggerKey }: { triggerKey: number | null }) {
  const petals = useBurst(
    triggerKey,
    () =>
      Array.from({ length: 300 }, (_, i) => ({
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
  const shells = useClientItems(() =>
    Array.from({ length: 5 }, (_, i) => {
      const hue = FIREWORK_HUES[i % FIREWORK_HUES.length];
      const radius = randomBetween(55, 95);
      return {
        id: i,
        left: randomBetween(12, 88),
        top: randomBetween(12, 55),
        hue,
        duration: randomBetween(9, 15),
        delay: randomBetween(0, 12),
        sparks: fireworkSparks(radius, 12, 0),
      };
    })
  );

  if (shells.length === 0) return null;

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
              className="absolute block h-[3px] w-[3px] rounded-full opacity-0"
              style={
                {
                  background: `hsl(${s.hue} 85% 72%)`,
                  boxShadow: `0 0 6px 1px hsl(${s.hue} 85% 72% / 0.75)`,
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

  const shells = useBurst(
    triggerKey,
    () => {
      const regular = Array.from({ length: 18 }, (_, i) => {
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
          sparks: fireworkSparks(radius, 18, 50),
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
        sparks: heartSparks(13, 90, 55),
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
      Array.from({ length: 70 }, (_, i) => ({
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
