"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Image as DreiImage } from "@react-three/drei";
import * as THREE from "three";
import { ErrorBoundary } from "@/components/ErrorBoundary";

function Plane({
  images,
  startIndex,
  cycleSeconds,
  position,
  rotation,
  size,
  speed,
}: {
  images: string[];
  startIndex: number;
  cycleSeconds: number;
  position: [number, number, number];
  rotation: [number, number, number];
  size: [number, number];
  speed: number;
}) {
  const ref = useRef<THREE.Group>(null);
  const base = position[1];
  // Only 3 planes exist on screen at once, but a project can have many more
  // photos than that — each slot keeps cycling through the full set instead
  // of freezing on whichever photo happened to load first.
  const [imgIndex, setImgIndex] = useState(startIndex % images.length);

  useEffect(() => {
    if (images.length < 2) return;
    const id = setInterval(() => {
      setImgIndex((prev) => (prev + 1) % images.length);
    }, cycleSeconds * 1000);
    return () => clearInterval(id);
  }, [images.length, cycleSeconds]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.position.y = base + Math.sin(t * speed) * 0.12;
    ref.current.rotation.z = rotation[2] + Math.sin(t * speed * 0.6) * 0.03;
  });

  return (
    <group ref={ref} position={position} rotation={rotation}>
      {/* key={imgIndex} forces a clean unmount/remount on every cycle
          instead of relying on drei's in-place url swap, and the error
          boundary below means a single bad/slow-loading photo just drops
          out of rotation instead of taking the whole scene down with it
          (see the "Could not load ...: undefined" crash this was fixed
          for — the image itself was fine, but nothing caught the failure). */}
      <ErrorBoundary fallback={null}>
        <DreiImage key={imgIndex} url={images[imgIndex]} scale={size} radius={0.06} />
      </ErrorBoundary>
    </group>
  );
}

function Rig() {
  useFrame(({ camera, pointer }) => {
    camera.position.x += (pointer.x * 0.6 - camera.position.x) * 0.03;
    camera.position.y += (pointer.y * 0.35 - camera.position.y) * 0.03;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

export function FloatingPhotos({ images }: { images: string[] }) {
  if (images.length === 0) return null;

  return (
    <ErrorBoundary fallback={null}>
      <Canvas
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
        camera={{ position: [0, 0, 6], fov: 32 }}
      >
        <Suspense fallback={null}>
          <Plane
            images={images}
            startIndex={0}
            cycleSeconds={5}
            position={[-1.3, 0.2, 0]}
            rotation={[0, 0, -0.08]}
            size={[2.1, 2.6]}
            speed={0.35}
          />
          {images.length > 1 && (
            <Plane
              images={images}
              startIndex={1}
              cycleSeconds={6.5}
              position={[1.35, -0.15, -0.6]}
              rotation={[0, 0, 0.06]}
              size={[2.3, 2.9]}
              speed={0.28}
            />
          )}
          {images.length > 2 && (
            <Plane
              images={images}
              startIndex={2}
              cycleSeconds={8}
              position={[0.05, 0.55, -1.2]}
              rotation={[0, 0, -0.03]}
              size={[1.8, 2.2]}
              speed={0.42}
            />
          )}
          <Rig />
        </Suspense>
      </Canvas>
    </ErrorBoundary>
  );
}
