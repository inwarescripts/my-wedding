"use client";

import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Image as DreiImage } from "@react-three/drei";
import * as THREE from "three";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const SPARK_COUNT = 160;

/** Drives a "zoom past camera" burst on tap: scale ramps from 1 up to
 * `maxScale` over `duration` seconds with an ease-out curve (fast start,
 * settles at the end) the moment `entering` flips true, then holds there —
 * the rapid scale-up itself reads as a burst/blur outward (real gaussian
 * blur would need a postprocessing pass this project doesn't have), and
 * the gate's own opacity fade (see Opening.tsx's `entering` on the outer
 * motion.div) finishes the "fade and hide" a beat later. Returns a ref
 * rather than state so callers can read it every frame inside their own
 * `useFrame` without triggering a re-render per frame. */
function useZoomBurstScale(entering: boolean, duration = 0.55, maxScale = 1.5) {
  const scaleRef = useRef(1);
  const startRef = useRef<number | null>(null);
  const wasEntering = useRef(false);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (entering && !wasEntering.current) {
      startRef.current = t;
    }
    wasEntering.current = entering;

    if (entering && startRef.current !== null) {
      const p = Math.min(1, (t - startRef.current) / duration);
      const eased = 1 - (1 - p) ** 3;
      scaleRef.current = 1 + eased * (maxScale - 1);
    } else {
      scaleRef.current = 1;
    }
  });

  return scaleRef;
}

// Deterministic pseudo-random sphere scatter — no Math.random() in render,
// same technique as ParticleBloom.tsx, so the point cloud is stable across
// re-renders.
function buildSparkPositions(): Float32Array {
  const arr = new Float32Array(SPARK_COUNT * 3);
  for (let i = 0; i < SPARK_COUNT; i++) {
    const a = (i * 12.9898) % 1;
    const b = (i * 78.233) % 1;
    const r = 2.4 + ((i * 0.6180339887) % 1) * 2.2;
    const theta = a * Math.PI * 2;
    const phi = Math.acos(2 * b - 1);
    arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.55;
    arr[i * 3 + 2] = r * Math.cos(phi) - 1.5;
  }
  return arr;
}

/** A soft blurred radial-gradient halo, additive-blended so it only ever
 * brightens rather than muddying whatever's behind it — sits just behind
 * the real "囍" medallion image (see Medallion) to read as "glowing"
 * without needing to blur the artwork itself. */
function buildGlowTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const cx = size / 2;
  const cy = size / 2;
  const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, size / 2);
  glow.addColorStop(0, "rgba(255, 214, 130, 0.9)");
  glow.addColorStop(0.55, "rgba(255, 190, 90, 0.35)");
  glow.addColorStop(1, "rgba(255, 190, 90, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(canvas);
}

function GlowHalo({
  position,
  entering,
}: {
  position: [number, number, number];
  entering: boolean;
}) {
  const mesh = useRef<THREE.Mesh>(null);
  const texture = useMemo(() => buildGlowTexture(), []);
  const burst = useZoomBurstScale(entering);

  useFrame(({ clock }) => {
    if (!mesh.current) return;
    const pulse = 1 + Math.sin(clock.getElapsedTime() * 0.8) * 0.08;
    mesh.current.scale.setScalar(pulse * burst.current);
  });

  return (
    <mesh ref={mesh} position={position}>
      <planeGeometry args={[1.8, 1.8]} />
      <meshBasicMaterial map={texture} transparent blending={THREE.AdditiveBlending} depthWrite={false} />
    </mesh>
  );
}

/** The real "囍" (song hỷ / double-happiness) medallion artwork
 * (public/flower/chu-hy.webp — gold fretwork ring + the character, already
 * a finished seal design) swayed gently in front of its own glow halo. Real
 * artwork instead of a hand-drawn canvas glyph for the same reason as the
 * dragons in Dragons below: crisp linework a font-and-shapes approach can't
 * match. */
function Medallion({ entering }: { entering: boolean }) {
  const group = useRef<THREE.Group>(null);
  const burst = useZoomBurstScale(entering);

  useFrame(({ clock }) => {
    if (!group.current) return;
    const t = clock.getElapsedTime();
    // A gentle pendulum swing (not a full spin) — keeps the glyph mostly
    // facing forward and legible instead of periodically turning edge-on
    // like a flipping coin.
    group.current.rotation.y = Math.sin(t * 0.5) * 0.4;
    group.current.position.y = 1.0 + Math.sin(t * 0.6) * 0.05;
    group.current.scale.setScalar(0.85 * burst.current);
  });

  return (
    <>
      <GlowHalo position={[0, 1.0, -0.45]} entering={entering} />
      <group ref={group} position={[0, 1.0, -0.3]}>
        <ErrorBoundary fallback={null}>
          <DreiImage url="/flower/chu-hy.webp" scale={[1.05, 1.05]} transparent />
        </ErrorBoundary>
      </group>
    </>
  );
}

/** Two real dragon illustrations (public/flower/dragon_left.webp and
 * dragon_right.webp — already mirrored artwork, not a computed flip)
 * flanking the seal, deep in the background. A hand-drawn canvas dragon
 * can't get anywhere near this level of scale/claw detail, so this uses
 * the actual images as textures instead, same technique as
 * FloatingPhotos.tsx's photo planes. Kept low-opacity and pushed back in Z
 * so they read as a watermark, not competing with the couple's name. */
function Dragons({ entering }: { entering: boolean }) {
  const left = useRef<THREE.Group>(null);
  const right = useRef<THREE.Group>(null);
  const burst = useZoomBurstScale(entering);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const sway = Math.sin(t * 0.35) * 0.08;
    if (left.current) {
      left.current.rotation.z = sway;
      left.current.scale.setScalar(burst.current);
    }
    if (right.current) {
      right.current.rotation.z = -sway;
      right.current.scale.setScalar(burst.current);
    }
  });

  return (
    <>
      <group ref={left} position={[-1.35, -0.35, -3.2]} rotation={[0, 0.15, 0]}>
        <ErrorBoundary fallback={null}>
          <DreiImage url="/flower/dragon_left.webp" scale={[1.1, 1.5]} transparent opacity={0.3} />
        </ErrorBoundary>
      </group>
      <group ref={right} position={[1.35, -0.35, -3.2]} rotation={[0, -0.15, 0]}>
        <ErrorBoundary fallback={null}>
          <DreiImage url="/flower/dragon_right.webp" scale={[1.1, 1.5]} transparent opacity={0.3} />
        </ErrorBoundary>
      </group>
    </>
  );
}

function Sparks() {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => buildSparkPositions(), []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.y = clock.getElapsedTime() * 0.05;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.045}
        color="#e8c674"
        transparent
        opacity={0.55}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

/** A slowly-swaying, glowing gold "囍" (song hỷ) medallion with a real pair
 * of dragon illustrations watermarked in the background — the classic
 * Chinese/Vietnamese wedding red-and-gold palette, in 3D instead of the
 * flat DOM seal used by the door/curtain/envelope openings. Deliberately
 * its own fixed palette (no `palette` prop, unlike the other 3D scenes) —
 * same reasoning as those DOM openings: this look IS the red-and-gold, it
 * shouldn't repaint under an unrelated colour theme.
 *
 * `entering` (passed once the guest taps the gate) drives a "zoom past
 * camera" burst on the medallion, its glow and both dragons — see
 * useZoomBurstScale — before the gate's own opacity fade finishes hiding
 * everything and hands off to the main site. */
export function DoubleHappiness({ entering = false }: { entering?: boolean }) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      camera={{ position: [0, 0, 5.2], fov: 42 }}
    >
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 4, 5]} intensity={1.4} color="#f0cf7a" />
      <directionalLight position={[-3, -2, -3]} intensity={0.35} color="#9a1a26" />
      <Sparks />
      <Suspense fallback={null}>
        <Dragons entering={entering} />
        <Medallion entering={entering} />
      </Suspense>
    </Canvas>
  );
}
