"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { ColorThemePalette } from "@/motion/registry/theme";

const COUNT = 800;
const PETALS = 5;

// A mathematical "rose" curve (rhodonea, r = cos(k·θ)) — literally called a
// rose for the same reason we're using it here. k=5 traces 5 full petals.
// Same jitter-off-the-curve trick as HeartRibbon so it reads as a strand of
// glowing dust tracing the bloom rather than a wire outline. Colour blends
// between the theme's two accent tones across the sweep so each petal picks
// up a slightly different tint instead of one flat colour.
function buildGeometry(colorA: THREE.Color, colorB: THREE.Color) {
  const positions = new Float32Array(COUNT * 3);
  const colors = new Float32Array(COUNT * 3);
  const tmp = new THREE.Color();

  for (let i = 0; i < COUNT; i++) {
    const t = (i / COUNT) * Math.PI * 2;
    const r = Math.cos(PETALS * t);
    const x = r * Math.cos(t);
    const y = r * Math.sin(t);

    const a = (i * 12.9898) % 1;
    const b = (i * 78.233) % 1;
    const c = (i * 39.346) % 1;

    positions[i * 3] = x * 0.85 + (a - 0.5) * 0.07;
    positions[i * 3 + 1] = y * 0.85 + (b - 0.5) * 0.07;
    positions[i * 3 + 2] = (c - 0.5) * 0.35;

    tmp.copy(colorA).lerp(colorB, (Math.sin(t * PETALS) + 1) / 2);
    colors[i * 3] = tmp.r;
    colors[i * 3 + 1] = tmp.g;
    colors[i * 3 + 2] = tmp.b;
  }

  return { positions, colors };
}

function Ribbon({ colorA, colorB }: { colorA: string; colorB: string }) {
  const ref = useRef<THREE.Points>(null);
  const { positions, colors } = useMemo(
    () => buildGeometry(new THREE.Color(colorA), new THREE.Color(colorB)),
    [colorA, colorB]
  );

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.rotation.y = t * 0.16;
    ref.current.rotation.z = Math.sin(t * 0.1) * 0.06;
    const pulse = 1 + Math.sin(t * 0.6) * 0.04;
    ref.current.scale.setScalar(pulse);
  });

  return (
    <points ref={ref} rotation={[0.42, 0, 0]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        vertexColors
        transparent
        opacity={0.88}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/** A rose bloom traced out of soft glowing points along a mathematical
 * "rose" curve (5 petals), tumbling slowly in 3D so it reads as a flowing
 * strand rather than a flat sticker. Blends between the theme's two accent
 * tones across its petals. */
export function RoseRibbon({ palette }: { palette: ColorThemePalette }) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      camera={{ position: [0, 0, 5], fov: 45 }}
    >
      <Ribbon colorA={palette.accent} colorB={palette.gold} />
    </Canvas>
  );
}
