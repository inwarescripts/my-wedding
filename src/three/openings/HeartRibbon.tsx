"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { ColorThemePalette } from "@/motion/registry/theme";

const COUNT = 700;

// Same parametric heart curve as heartSparks() in the ambient registry, just
// walked in 3D instead of projected to 2D screen px. Three's Y-up matches
// the formula's own "y-up" convention directly (no negation needed here,
// unlike the CSS version, which is y-down and has to flip it) — the curve's
// sharpest point (its most-negative y) already lands at the bottom, i.e.
// point-down, for free. Each point gets a small deterministic jitter off
// the curve (same no-Math.random-in-render approach as ParticleBloom) so it
// reads as a fuzzy glowing strand traced along the heart, not a wire.
function buildPositions(): Float32Array {
  const arr = new Float32Array(COUNT * 3);
  for (let i = 0; i < COUNT; i++) {
    const t = (i / COUNT) * Math.PI * 2;
    const x = 16 * Math.sin(t) ** 3;
    const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);

    const a = (i * 12.9898) % 1;
    const b = (i * 78.233) % 1;
    const c = (i * 39.346) % 1;

    arr[i * 3] = x / 20 + (a - 0.5) * 0.09;
    arr[i * 3 + 1] = y / 20 + (b - 0.5) * 0.09;
    arr[i * 3 + 2] = (c - 0.5) * 0.4;
  }
  return arr;
}

function Ribbon({ color }: { color: string }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => buildPositions(), []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.rotation.y = t * 0.1;
    const pulse = 1 + Math.sin(t * 1.1) * 0.035;
    ref.current.scale.setScalar(pulse);
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.034}
        color={color}
        transparent
        opacity={0.88}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/** A heart traced entirely out of soft glowing points — the same parametric
 * heart curve used for the hearts ambient burst, just drawn once in 3D and
 * left to slowly turn and pulse like a heartbeat behind the couple's name.
 * Tinted from the project's active colour theme. */
export function HeartRibbon({ palette }: { palette: ColorThemePalette }) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      camera={{ position: [0, 0, 5], fov: 45 }}
    >
      <Ribbon color={palette.accent} />
    </Canvas>
  );
}
