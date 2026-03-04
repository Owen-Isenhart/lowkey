"use client";

import { Canvas } from "@react-three/fiber";
import { ContactShadows, OrbitControls } from "@react-three/drei";
import { Suspense, useMemo } from "react";
import FlavorModel from "./FlavorModel";

interface FlavorDisplayProps {
  modelPath: string;
  width?: number;
  height?: number;
}

/**
 * Reusable 3D flavor display component that renders spinning OBJ models.
 * Prevents code duplication across product cards and detail pages.
 * 
 * @param modelPath - Relative path to OBJ file (e.g., "/flavors/purple.obj")
 * @param width - Container width in pixels (default: auto)
 * @param height - Container height in pixels (default: auto)
 */
export default function FlavorDisplay({
  modelPath,
  width = 300,
  height = 300,
}: FlavorDisplayProps) {
  // Calculate responsive camera FOV based on aspect ratio
  const fov = useMemo(
    () => Math.min(Math.max(45 * (height / width), 35), 55),
    [width, height]
  );

  return (
    <Canvas
      camera={{ position: [0, 1, 5], fov }}
      style={{ width: "100%", height: "100%" }}
      gl={{ preserveDrawingBuffer: true, antialias: true }}
    >
      {/* Ambient light for base illumination */}
      <ambientLight intensity={0.5} />
      
      {/* Primary directional light */}
      <directionalLight position={[10, 10, 5]} intensity={1.5} />
      
      {/* Fill light for balance and depth */}
      <directionalLight position={[-10, 10, -5]} intensity={0.5} color="#b0d4ff" />

      <Suspense fallback={null}>
        {/* Model with proper error boundary */}
        <FlavorModel modelPath={modelPath} />
        
        {/* Soft shadow for depth perception */}
        <ContactShadows
          position={[0, 0, 0]}
          opacity={0.4}
          scale={5}
          blur={2}
          far={4}
        />
      </Suspense>

      {/* Auto-rotating controls - touch-friendly with no panning */}
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate={true}
        autoRotateSpeed={2}
        minPolarAngle={Math.PI / 2.5}
        maxPolarAngle={Math.PI / 1.5}
      />
    </Canvas>
  );
}
