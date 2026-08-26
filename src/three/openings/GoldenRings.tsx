"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { ColorThemePalette } from "@/motion/registry/theme";

function Rings({ colorA, colorB }: { colorA: string; colorB: string }) {
  const group = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!group.current) return;
    const t = clock.getElapsedTime();
    group.current.rotation.y = t * 0.22;
    group.current.rotation.x = Math.sin(t * 0.2) * 0.15;
  });

  return (
    <group ref={group} position={[0, -1.1, 0]}>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[-0.32, 0, 0]}>
        <torusGeometry args={[0.65, 0.045, 32, 100]} />
        <meshStandardMaterial color={colorA} metalness={0.9} roughness={0.25} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0.35, 0]} position={[0.32, 0, 0]}>
        <torusGeometry args={[0.65, 0.045, 32, 100]} />
        <meshStandardMaterial color={colorB} metalness={0.9} roughness={0.25} />
      </mesh>
    </group>
  );
}

/** Two interlocking wedding rings, slowly tumbling in soft studio light,
 * kept low in frame so they sit behind/below the name rather than through it.
 * Tinted from the project's active colour theme. */
export function GoldenRings({ palette }: { palette: ColorThemePalette }) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      camera={{ position: [0, 0, 5.4], fov: 40 }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 4, 5]} intensity={1.6} color={palette.ivory} />
      <directionalLight position={[-3, -2, -3]} intensity={0.4} color={palette.accent} />
      <Rings colorA={palette.gold} colorB={palette.ivory} />
    </Canvas>
  );
}
