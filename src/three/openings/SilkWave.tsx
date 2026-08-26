"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { ColorThemePalette } from "@/motion/registry/theme";

function Wave({ color }: { color: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const geomRef = useRef<THREE.PlaneGeometry>(null);

  useFrame(({ clock }) => {
    const geom = geomRef.current;
    if (!geom) return;
    const t = clock.getElapsedTime();
    const pos = geom.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = Math.sin(x * 1.1 + t * 0.6) * 0.22 + Math.cos(y * 1.4 + t * 0.4) * 0.14;
      pos.setZ(i, z);
    }
    pos.needsUpdate = true;
    if (meshRef.current) meshRef.current.rotation.z = Math.sin(t * 0.08) * 0.04;
  });

  return (
    <mesh ref={meshRef} rotation={[-0.55, 0, 0]} position={[0, -0.6, -0.5]}>
      <planeGeometry ref={geomRef} args={[9, 6, 56, 36]} />
      <meshStandardMaterial
        color={color}
        metalness={0.25}
        roughness={0.55}
        transparent
        opacity={0.45}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

/** A single undulating silk plane beneath the text — gentle fabric-like
 * motion rather than a literal texture, kept cheap (one draw call). Tinted
 * from the project's active colour theme. */
export function SilkWave({ palette }: { palette: ColorThemePalette }) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      camera={{ position: [0, 1.1, 4.6], fov: 45 }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[2, 3, 2]} intensity={1.2} color={palette.ivory} />
      <Wave color={palette.accent} />
    </Canvas>
  );
}
