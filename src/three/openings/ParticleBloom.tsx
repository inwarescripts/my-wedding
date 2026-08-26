"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { ColorThemePalette } from "@/motion/registry/theme";

const COUNT = 900;

// Deterministic pseudo-random sphere scatter — no Math.random() in render,
// so the point cloud is stable across re-renders (see AGENTS.md purity note).
function buildPositions(): Float32Array {
  const arr = new Float32Array(COUNT * 3);
  for (let i = 0; i < COUNT; i++) {
    const a = (i * 12.9898) % 1;
    const b = (i * 78.233) % 1;
    const r = 2.1 + ((i * 0.6180339887) % 1) * 1.5;
    const theta = a * Math.PI * 2;
    const phi = Math.acos(2 * b - 1);
    arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.62;
    arr[i * 3 + 2] = r * Math.cos(phi);
  }
  return arr;
}

function Particles({ color }: { color: string }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => buildPositions(), []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.rotation.y = t * 0.07;
    ref.current.rotation.x = Math.sin(t * 0.15) * 0.1;
    const scale = 1 + Math.sin(t * 0.35) * 0.04;
    ref.current.scale.setScalar(scale);
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.032}
        color={color}
        transparent
        opacity={0.85}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

/** A slow-breathing sphere of soft particles orbiting behind the couple's
 * name — reads as a gentle constellation rather than a gimmick. Tinted from
 * the project's active colour theme so it never clashes with it. */
export function ParticleBloom({ palette }: { palette: ColorThemePalette }) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      camera={{ position: [0, 0, 5], fov: 45 }}
    >
      <Particles color={palette.accentSoft} />
    </Canvas>
  );
}
