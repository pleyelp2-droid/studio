"use client";

import { useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { createHumanoidModel } from "@/components/game/HumanoidModel";

function CharacterModel({ appearance }: { appearance: any }) {
  const groupRef = useRef<THREE.Group>(null);
  const modelRef = useRef<any>(null);

  useFrame(() => {
    if (!groupRef.current) return;
    
    const key = `${appearance.skinTone}-${appearance.heightScale}-${appearance.bodyScale}`;
    if (groupRef.current.userData.lastKey !== key) {
      if (modelRef.current) {
        groupRef.current.remove(modelRef.current.group);
      }
      const model = createHumanoidModel({
        skinTone: appearance.skinTone,
        heightScale: appearance.heightScale,
        bodyScale: appearance.bodyScale * 2.0
      });
      modelRef.current = model;
      groupRef.current.add(model.group);
      groupRef.current.userData.lastKey = key;
      groupRef.current.userData.modelGroup = model.group;
    }
    groupRef.current.rotation.y += 0.005;
  });

  return <group ref={groupRef} position={[0, -1.5, 0]} />;
}

export default function CharacterManifestationPreview({ appearance }: { appearance: any }) {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 40 }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1.5} color="#60D4FF" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#7b4fd4" />
      <Suspense fallback={null}>
        <CharacterModel appearance={appearance} />
      </Suspense>
    </Canvas>
  );
}
