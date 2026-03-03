"use client";

import { Canvas } from "@react-three/fiber";
import { ContactShadows, OrbitControls } from "@react-three/drei";
import { CanModel } from "./CanModel";
import { Suspense } from "react";

export default function CanScene() {
  return (
    <div style={{ width: "100%", height: "100%", minHeight: "400px" }}>
      <Canvas camera={{ position: [0, 1, 5], fov: 45 }}>
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
          autoRotate={false} 
        />
      </Canvas>
    </div>
  );
}
