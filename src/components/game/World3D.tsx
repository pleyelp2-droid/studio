'use client';

import { Html, OrbitControls, Sky, PerspectiveCamera, Environment, ContactShadows } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import React, { useMemo, useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { useStore } from '../../store';
import { POI, Chunk, Monster, Agent, AgentState } from '../../types';
import { axiomFragmentShader, axiomVertexShader } from './AxiomShader';
import { createHumanoidModel, HumanoidModel } from './HumanoidModel';
import { AnimationController } from './AnimationSystem';
import { attachEquipment, EquipmentSlots } from './EquipmentRenderer';

const AgentModel = ({ agent }: { agent: Agent }) => {
  const groupRef = useRef<THREE.Group>(null);
  const [model, setModel] = useState<HumanoidModel | null>(null);
  const [animController, setAnimController] = useState<AnimationController | null>(null);

  useEffect(() => {
    const humanoid = createHumanoidModel({
      skinTone: agent.thinkingMatrix?.alignment > 0.5 ? '#d1a37c' : '#8d5524',
      bodyScale: 1.0 + (agent.level * 0.01)
    });
    setModel(humanoid);
    
    const controller = new AnimationController(humanoid.mesh, humanoid.bones);
    setAnimController(controller);

    return () => {
      controller.dispose();
    };
  }, [agent.id]);

  useEffect(() => {
    if (animController) {
      animController.playForState(agent.state || AgentState.IDLE);
    }
  }, [agent.state, animController]);

  useEffect(() => {
    if (model) {
      // Mock equipment based on class for preview
      const slots: EquipmentSlots = {
        head: agent.npcClass === 'SOVEREIGN' ? { id: 'h1', name: 'Crown', rarity: 'AXIOMATIC', type: 'ARMOR', stats: {}, level: 1, value: 0 } : null,
        chest: null,
        legs: null,
        mainHand: agent.npcClass === 'PILOT' ? { id: 'w1', name: 'Blade', rarity: 'RARE', type: 'WEAPON', stats: {}, level: 1, value: 0 } : null,
        offHand: null
      };
      attachEquipment(model.group, slots);
    }
  }, [model, agent.npcClass]);

  useFrame((state, delta) => {
    if (animController) animController.update(delta);
    if (groupRef.current) {
      // Smooth interpolation to target position
      const targetPos = new THREE.Vector3(agent.position.x, agent.position.y, agent.position.z);
      groupRef.current.position.lerp(targetPos, 0.1);
    }
  });

  if (!model) return null;

  return (
    <group ref={groupRef}>
      <primitive object={model.group} />
      <Html position={[0, 2.5, 0]} center distanceFactor={15}>
        <div className="flex flex-col items-center gap-1 pointer-events-none">
          <div className="px-2 py-0.5 rounded bg-black/80 border border-accent/50 text-white text-[10px] font-black uppercase tracking-widest whitespace-nowrap shadow-xl">
            {agent.displayName} <span className="text-accent ml-1">LVL {agent.level}</span>
          </div>
          <div className="w-12 h-1 bg-secondary rounded-full overflow-hidden border border-white/10">
            <div className="h-full bg-emerald-500" style={{ width: `${(agent.hp / agent.maxHp) * 100}%` }} />
          </div>
        </div>
      </Html>
    </group>
  );
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
    }), [civilizationIndex, stability, corruption]);

    useFrame((state) => {
        if (materialRef.current) {
            materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
            materialRef.current.uniforms.uCameraPosition.value.copy(state.camera.position);
        }
    });

    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
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
    const agents = useStore(state => state.agents);

    return (
        <div className="w-full h-full bg-black">
            <Canvas shadows dpr={[1, 2]}>
                <PerspectiveCamera makeDefault position={[30, 20, 30]} fov={50} />
                <DayNightSky tick={tick} />
                <Environment preset="night" />
                
                <Terrain civilizationIndex={civilizationIndex} stability={stability} corruption={corruption} />
                
                {agents.map(agent => (
                  <AgentModel key={agent.id} agent={agent} />
                ))}

                <ContactShadows resolution={1024} scale={20} blur={2} opacity={0.35} far={10} color="#000000" />
                
                <OrbitControls 
                    enablePan={true} 
                    maxPolarAngle={Math.PI / 2.1} 
                    minDistance={5} 
                    maxDistance={150} 
                />
                <gridHelper args={[1000, 100, '#222', '#111']} position={[0, -0.05, 0]} />
            </Canvas>
        </div>
    );
};