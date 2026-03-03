"use client";

import { useLoader, useFrame } from "@react-three/fiber";
import { Center } from "@react-three/drei";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { useRef } from "react";
import * as THREE from "three";

export function CanModel() {
  const obj = useLoader(OBJLoader, "/can.obj");
  const meshRef = useRef<THREE.Group>(null);

  // Apply basic material to the loaded group's children recursively
  // just in case it's a multi-mesh group. Wait, we don't have to unless we need to color it.
  // The obj might come with materials or look white. Let's make it look decent.
  obj.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh;
      if (!mesh.material || (Array.isArray(mesh.material) ? mesh.material.length === 0 : true)) {
        mesh.material = new THREE.MeshStandardMaterial({
          color: 0xe0e0e0,
          roughness: 0.2,
          metalness: 0.8,
        });
      } else if (mesh.material instanceof THREE.MeshPhongMaterial) {
         // Upgrade to standard
         const oldMat = mesh.material;
         mesh.material = new THREE.MeshStandardMaterial({
             color: oldMat.color,
             roughness: 0.2,
             metalness: 0.8,
             map: oldMat.map
         });
      } else if (mesh.material instanceof THREE.MeshStandardMaterial) {
          mesh.material.roughness = 0.2;
          mesh.material.metalness = 0.8;
      }
    }
  });

  // Spin the can
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <group ref={meshRef} position={[0, 0, 0]} scale={[0.2, 0.2, 0.2]}>
      <Center>
        <primitive object={obj} />
      </Center>
    </group>
  );
}
