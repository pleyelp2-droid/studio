'use client';

import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Sky, OrbitControls, Stars, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { axiomVertexShader, axiomFragmentShader } from './AxiomShader';

interface World3DProps {
  tick: number;
  civilizationIndex: number;
  stability?: number;
  corruption?: number;
}

const DayNightSky = ({ tick }: { tick: number }) => {
  const dayLength = 1440;
  const cycle = (tick % dayLength) / dayLength;
  
  const sunAngle = cycle * Math.PI * 2 - Math.PI * 0.5;
  const sunHeight = Math.sin(sunAngle);
  const sunX = Math.cos(sunAngle) * 0.8;
  const sunY = Math.max(sunHeight, -0.3);
  const sunZ = 0.3;

  const dayFactor = THREE.MathUtils.clamp((sunHeight + 0.1) / 0.3, 0, 1);
  const isNight = sunHeight <= -0.1;

  const dayFogColor = new THREE.Color('#8ba4c4');
  const nightFogColor = new THREE.Color('#0a0e1a');
  const fogColor = nightFogColor.clone().lerp(dayFogColor, dayFactor);

  const sunIntensity = THREE.MathUtils.lerp(0.05, 1.5, dayFactor);

  return (
    <>
      <Sky
        distance={450000}
        sunPosition={[sunX * 100, sunY * 100, sunZ * 100]}
        turbidity={isNight ? 20 : 2}
        rayleigh={isNight ? 0.1 : 1}
      />
      <ambientLight intensity={THREE.MathUtils.lerp(0.1, 0.5, dayFactor)} />
      <directionalLight 
        position={[sunX * 100, Math.max(sunY * 150, 5), sunZ * 100]} 
        intensity={sunIntensity} 
        castShadow 
      />
      <fog attach="fog" args={[fogColor, 100, 500]} />
      {isNight && <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />}
    </>
  );
};

const Terrain = ({ civilizationIndex, stability = 500, corruption = 100 }: { civilizationIndex: number, stability?: number, corruption?: number }) => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { camera } = useThree();
  
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uAwakeningDensity: { value: civilizationIndex / 1000 },
    uBiome: { value: civilizationIndex < 400 ? 1.0 : civilizationIndex < 800 ? 0.0 : 2.0 },
    uAxiomaticIntensity: { value: 0.5 },
    uStability: { value: stability / 1000 },
    uCorruption: { value: corruption / 1000 },
    uIsHovered: { value: false },
    uIsSelected: { value: false },
    uCameraPosition: { value: camera.position },
    uFogColor: { value: new THREE.Color('#0a0e1a') },
    uFogNear: { value: 100.0 },
    uFogFar: { value: 500.0 },
    uAgentPositions: { value: new Array(10).fill(new THREE.Vector3()) },
    uAgentVisionRanges: { value: new Array(10).fill(0) },
    uExplorationLevel: { value: 0.5 }
  }), [civilizationIndex, stability, corruption, camera.position]);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
      materialRef.current.uniforms.uCameraPosition.value.copy(state.camera.position);
    }
  });

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
      <planeGeometry args={[1000, 1000, 128, 128]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={axiomVertexShader}
        fragmentShader={axiomFragmentShader}
        uniforms={uniforms}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

const POIInstance = ({ type, position }: { type: string, position: [number, number, number] }) => {
  return (
    <group position={position}>
      {type === 'SHRINE' && (
        <mesh castShadow>
          <octahedronGeometry args={[1.5, 0]} />
          <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={2} wireframe />
        </mesh>
      )}
      {type === 'BUILDING' && (
        <mesh castShadow position={[0, 2, 0]}>
          <boxGeometry args={[4, 4, 4]} />
          <meshStandardMaterial color="#64748b" />
        </mesh>
      )}
    </group>
  );
};

export const World3D: React.FC<World3DProps> = ({ tick, civilizationIndex, stability, corruption }) => {
  return (
    <div className="w-full h-full bg-black">
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[50, 30, 50]} fov={50} />
        <DayNightSky tick={tick} />
        <Terrain civilizationIndex={civilizationIndex} stability={stability} corruption={corruption} />
        
        <POIInstance type="SHRINE" position={[0, 1, 0]} />
        {civilizationIndex > 400 && <POIInstance type="BUILDING" position={[-20, 0, -10]} />}
        {civilizationIndex > 600 && <POIInstance type="BUILDING" position={[15, 0, 20]} />}
        {civilizationIndex > 800 && <POIInstance type="BUILDING" position={[0, 0, -30]} />}
        
        <OrbitControls 
          enablePan={false} 
          maxPolarAngle={Math.PI / 2.1} 
          minDistance={20} 
          maxDistance={150} 
        />
        <gridHelper args={[1000, 50, '#222', '#111']} position={[0, -1.9, 0]} />
      </Canvas>
    </div>
  );
};
