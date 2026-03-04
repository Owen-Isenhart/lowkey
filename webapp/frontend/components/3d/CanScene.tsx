"use client";

import { Canvas } from "@react-three/fiber";
import { ContactShadows, OrbitControls } from "@react-three/drei";
import { CanModel } from "./CanModel";
import { Suspense, useMemo } from "react";

interface CanSceneProps {
  width: number;
  height: number;
}

export default function CanScene({ width, height }: CanSceneProps) {
  // Calculate responsive camera FOV based on viewport
  const fov = useMemo(
    () => Math.min(Math.max(45 * (height / width), 35), 55),
    [width, height]
  );

  return (
    <Canvas
      camera={{ position: [0, 1, 5], fov }}
      style={{ width: "100%", height: "100%" }}
      gl={{ preserveDrawingBuffer: true }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1.5} />
      <directionalLight position={[-10, 10, -5]} intensity={0.5} color="#b0d4ff" />

      <Suspense fallback={null}>
        <CanModel />
        <ContactShadows
          position={[0, 0, 0]}
          opacity={0.4}
          scale={5}
          blur={2}
          far={4}
        />
      </Suspense>

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate={true}
        autoRotateSpeed={2}
      />
    </Canvas>
  );
}
