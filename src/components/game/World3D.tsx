'use client';

import { Html, OrbitControls, Sky, PerspectiveCamera } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import React, { useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useStore } from '../../store';
import { POI, Chunk, Monster, Agent } from '../../types';
import { axiomFragmentShader, axiomVertexShader } from './AxiomShader';

const isPosInSanctuary = (pos: [number, number, number], chunks: Chunk[]) => {
    const chunkX = Math.floor((pos[0] + 40) / 80);
    const chunkZ = Math.floor((pos[2] + 40) / 80);
    const chunk = chunks.find(c => c.x === chunkX && c.z === chunkZ);
    return chunk?.biome === 'CITY' || chunk?.cellType === 'SANCTUARY';
};

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

    return (
        <>
            <Sky
                distance={450000}
                sunPosition={[sunX * 100, sunY * 100, sunZ * 100]}
                turbidity={isNight ? 20 : 2}
                rayleigh={isNight ? 0.1 : 1}
            />
            <ambientLight intensity={THREE.MathUtils.lerp(0.1, 0.5, dayFactor)} color={fogColor} />
            <directionalLight
                position={[sunX * 100, Math.max(sunY * 150, 5), sunZ * 100]}
                intensity={THREE.MathUtils.lerp(0.05, 1.5, dayFactor)}
                castShadow
            />
            <fog attach="fog" args={[fogColor, 120, 500]} />
            {isNight && <Stars />}
        </>
    );
};

const Stars = () => {
    const starsRef = useRef<THREE.Points>(null);
    const { positions, count } = useMemo(() => {
        const count = 1000;
        const positions = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(Math.random() * 2 - 1);
            const r = 400;
            positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = r * Math.cos(phi);
            positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
        }
        return { positions, count };
    }, []);

    useFrame((state) => {
        if (starsRef.current) {
            starsRef.current.rotation.y = state.clock.getElapsedTime() * 0.005;
        }
    });

    return (
        <points ref={starsRef}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[positions, 3]} count={count} />
            </bufferGeometry>
            <pointsMaterial color="#ffffff" size={1.5} transparent opacity={0.8} sizeAttenuation={false} />
        </points>
    );
};

const POIMesh: React.FC<{ poi: POI }> = ({ poi }) => {
    const selectPoi = useStore(state => state.selectPoi);
    const meshRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (meshRef.current) {
            const time = state.clock.getElapsedTime();
            if (poi.type === 'SHRINE') {
                meshRef.current.position.y = poi.position[1] + Math.sin(time) * 0.2;
                meshRef.current.rotation.y += 0.01;
            }
        }
    });

    return (
        <group position={poi.position} ref={meshRef} onClick={(e) => { e.stopPropagation(); selectPoi(poi.id); }}>
            {poi.type === 'MARKET_STALL' && (
                <group>
                    <mesh position={[0, 0.5, 0]} castShadow>
                        <boxGeometry args={[3.5, 1, 2.5]} />
                        <meshStandardMaterial color="#8B6914" />
                    </mesh>
                    <mesh position={[0, 3.2, 0]} castShadow>
                        <boxGeometry args={[4, 0.1, 3]} />
                        <meshStandardMaterial color="#C41E3A" />
                    </mesh>
                </group>
            )}
            {poi.type === 'TREE' && (
                <group>
                    <mesh position={[0, 2, 0]} castShadow>
                        <cylinderGeometry args={[0.2, 0.4, 4]} />
                        <meshStandardMaterial color="#3B2507" />
                    </mesh>
                    <mesh position={[0, 5, 0]} castShadow>
                        <sphereGeometry args={[2, 8, 8]} />
                        <meshStandardMaterial color="#1A5C1A" />
                    </mesh>
                </group>
            )}
            {poi.type === 'BUILDING' && (
                <group>
                    <mesh position={[0, 2, 0]} castShadow>
                        <boxGeometry args={[4, 4, 4]} />
                        <meshStandardMaterial color="#64748b" />
                    </mesh>
                    <mesh position={[0, 4.5, 0]} castShadow>
                        <coneGeometry args={[3.5, 2, 4]} />
                        <meshStandardMaterial color="#475569" />
                    </mesh>
                </group>
            )}
            {poi.type === 'SHRINE' && (
                <mesh castShadow>
                    <octahedronGeometry args={[1.5, 0]} />
                    <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={2} wireframe />
                </mesh>
            )}
            <Html position={[0, 4, 0]} center distanceFactor={20}>
                <div className="px-2 py-0.5 rounded bg-black/60 border border-white/20 text-white text-[8px] font-black uppercase tracking-widest">
                    {poi.type}
                </div>
            </Html>
        </group>
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

export const World3D: React.FC<{ tick: number; civilizationIndex: number; stability?: number; corruption?: number }> = ({ tick, civilizationIndex, stability, corruption }) => {
    return (
        <div className="w-full h-full bg-black">
            <Canvas shadows dpr={[1, 2]}>
                <PerspectiveCamera makeDefault position={[50, 30, 50]} fov={50} />
                <DayNightSky tick={tick} />
                <Terrain civilizationIndex={civilizationIndex} stability={stability} corruption={corruption} />
                
                <POIMesh poi={{ id: 'origin-shrine', type: 'SHRINE', position: [0, 1, 0], isDiscovered: true }} />
                {civilizationIndex > 400 && <POIMesh poi={{ id: 'b1', type: 'BUILDING', position: [-20, 0, -10], isDiscovered: true }} />}
                {civilizationIndex > 600 && <POIMesh poi={{ id: 'm1', type: 'MARKET_STALL', position: [15, 0, 20], isDiscovered: true }} />}
                {civilizationIndex > 800 && <POIMesh poi={{ id: 't1', type: 'TREE', position: [0, 0, -30], isDiscovered: true }} />}
                
                <OrbitControls 
                    enablePan={false} 
                    maxPolarAngle={Math.PI / 2.1} 
                    minDistance={20} 
                    maxDistance={200} 
                />
                <gridHelper args={[1000, 50, '#222', '#111']} position={[0, -1.9, 0]} />
            </Canvas>
        </div>
    );
};
