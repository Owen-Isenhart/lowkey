"use client";

import { useLoader, useFrame } from "@react-three/fiber";
import { Center, Bounds } from "@react-three/drei";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { useRef, useMemo } from "react";
import * as THREE from "three";

interface FlavorModelProps {
  modelPath: string;
}

/**
 * Generic 3D model loader and renderer for flavor OBJ files.
 * Handles material setup, auto-rotation, and proper centering.
 * Isolated from display logic for better reusability.
 */
export default function FlavorModel({ modelPath }: FlavorModelProps) {
  const obj = useLoader(OBJLoader, modelPath);
  const groupRef = useRef<THREE.Group>(null);

  // Process materials once during initial load
  useMemo(() => {
    obj.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        
        // Use existing material or create default metallic look
        if (!mesh.material || (Array.isArray(mesh.material) && mesh.material.length === 0)) {
          // Create professional metallic material
          mesh.material = new THREE.MeshStandardMaterial({
            color: 0xe0e0e0,
            roughness: 0.2,
            metalness: 0.8,
            envMapIntensity: 1,
          });
        } else if (mesh.material instanceof THREE.MeshPhongMaterial) {
          // Upgrade Phong materials to more modern Standard material
          const oldMat = mesh.material;
          mesh.material = new THREE.MeshStandardMaterial({
            color: oldMat.color,
            roughness: 0.2,
            metalness: 0.8,
            map: oldMat.map,
            envMapIntensity: 1,
          });
        } else if (mesh.material instanceof THREE.MeshStandardMaterial) {
          // Enhance existing Standard materials
          mesh.material.roughness = 0.2;
          mesh.material.metalness = 0.8;
          mesh.material.envMapIntensity = 1;
        }
      }
    });
  }, [obj]);

  // Apply subtle auto-rotation (OrbitControls will handle the main rotation)
  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.3;
    }
  });

  return (
    <Bounds fit clip observe>
      <group ref={groupRef}>
        <Center>
          <primitive object={obj} />
        </Center>
      </group>
    </Bounds>
  );
}
