'use client';

import { Html, OrbitControls, Sky, PerspectiveCamera, Environment, ContactShadows, Float } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import React, { useMemo, useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { useStore } from '../../store';
import { POI, Chunk, Monster, Agent, AgentState, ResourceNode } from '../../types';
import { axiomFragmentShader, axiomVertexShader } from './AxiomShader';
import { createHumanoidModel, HumanoidModel } from './HumanoidModel';
import { AnimationController } from './AnimationSystem';
import { WorldBuildingService } from '@/services/WorldBuildingService';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useFirestore } from '@/firebase';

const ARL_COLORS = {
  void: "#060810",
  arcane: "#7b4fd4",
  teal: "#1fb8b8",
  gold: "#c9a227",
  blood: "#c0392b",
  border: "#1e2a4a"
};

const HighTechMaterial = (color: string, emissive: string = "#000", intensity: number = 1) => {
  return new THREE.MeshStandardMaterial({
    color: color,
    metalness: 0.9,
    roughness: 0.1,
    emissive: emissive,
    emissiveIntensity: intensity,
  });
};

const POIModel = ({ poi }: { poi: POI }) => {
  const rotationY = poi.rotationY || 0;

  if (poi.type === 'SHRINE') {
    return (
      <Float speed={3} rotationIntensity={1} floatIntensity={2}>
        <group position={[poi.position[0], 2, poi.position[2]]}>
          <mesh castShadow>
            <octahedronGeometry args={[1.5, 0]} />
            <primitive object={HighTechMaterial(ARL_COLORS.void, ARL_COLORS.teal, 3)} attach="material" />
          </mesh>
          <mesh rotation={[Math.PI / 4, 0, 0]}>
            <torusGeometry args={[2.5, 0.05, 16, 100]} />
            <meshStandardMaterial color={ARL_COLORS.teal} emissive={ARL_COLORS.teal} emissiveIntensity={5} />
          </mesh>
        </group>
      </Float>
    );
  }

  if (poi.type === 'BUILDING' || poi.type === 'HOUSE' || poi.type === 'FORGE' || poi.type === 'BANK_VAULT') {
    const isMajor = poi.type === 'FORGE' || poi.type === 'BANK_VAULT' || poi.type === 'BUILDING';
    const height = isMajor ? 12 : 4;
    const color = poi.type === 'FORGE' ? ARL_COLORS.blood : poi.type === 'BANK_VAULT' ? ARL_COLORS.gold : ARL_COLORS.arcane;

    return (
      <group position={[poi.position[0], 0, poi.position[2]]} rotation={[0, rotationY, 0]}>
        <mesh position={[0, 0.5, 0]} receiveShadow>
          <boxGeometry args={[isMajor ? 6 : 3, 1, isMajor ? 6 : 3]} />
          <primitive object={HighTechMaterial(ARL_COLORS.void)} attach="material" />
        </mesh>
        
        <mesh position={[0, height / 2, 0]} castShadow>
          <cylinderGeometry args={[isMajor ? 1.5 : 0.8, isMajor ? 2 : 1.2, height, 6]} />
          <primitive object={HighTechMaterial(ARL_COLORS.border)} attach="material" />
        </mesh>

        {[0.3, 0.6, 0.9].map((h, i) => (
          <mesh key={i} position={[0, height * h, 0]}>
            <torusGeometry args={[isMajor ? 1.8 : 1.0, 0.05, 8, 32]} rotation={[Math.PI/2, 0, 0]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={3} />
          </mesh>
        ))}

        <mesh position={[0, height + 0.5, 0]}>
          <sphereGeometry args={[0.3, 8, 8]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={10} />
        </mesh>
        
        <pointLight position={[0, height, 0]} color={color} intensity={10} distance={20} />
      </group>
    );
  }

  if (poi.type === 'WALL' || poi.type === 'GATE') {
    const isGate = poi.type === 'GATE';
    return (
      <group position={[poi.position[0], 0, poi.position[2]]} rotation={[0, rotationY, 0]}>
        <mesh position={[0, 3, 0]} castShadow receiveShadow>
          <boxGeometry args={[isGate ? 4 : 20, 6, 2]} />
          <primitive object={HighTechMaterial(ARL_COLORS.void, ARL_COLORS.teal, isGate ? 0.8 : 0.2)} attach="material" />
        </mesh>
        <mesh position={[0, 6, 0]}>
          <boxGeometry args={[isGate ? 4.2 : 20.2, 0.1, 2.2]} />
          <meshStandardMaterial color={ARL_COLORS.teal} emissive={ARL_COLORS.teal} emissiveIntensity={2} />
        </mesh>
      </group>
    );
  }

  return null;
};

const AgentModel = ({ agent, isLocal = false }: { agent: Agent; isLocal?: boolean }) => {
  const groupRef = useRef<THREE.Group>(null);
  const [model, setModel] = useState<HumanoidModel | null>(null);
  const [animController, setAnimController] = useState<AnimationController | null>(null);

  useEffect(() => {
    const humanoid = createHumanoidModel({
      skinTone: agent.appearance?.skinTone || '#c68642',
      bodyScale: (agent.appearance?.bodyScale || 1.0) + (agent.level * 0.01)
    });
    setModel(humanoid);
    
    const controller = new AnimationController(humanoid.mesh, humanoid.bones);
    setAnimController(controller);

    return () => {
      controller.dispose();
    };
  }, [agent.id, agent.appearance, agent.level]);

  useEffect(() => {
    if (animController) {
      animController.playForState(agent.state || AgentState.IDLE);
    }
  }, [agent.state, animController]);

  useFrame((state, delta) => {
    if (animController) animController.update(delta);
    if (groupRef.current && !isLocal) {
      const targetPos = new THREE.Vector3(agent.position.x, agent.position.y || 0, agent.position.z);
      groupRef.current.position.lerp(targetPos, 0.1);
    }
  });

  if (!model) return null;

  return (
    <group ref={groupRef} position={[agent.position.x, agent.position.y || 0, agent.position.z]}>
      <primitive object={model.group} />
      <Html position={[0, 2.5, 0]} center distanceFactor={15}>
        <div className="flex flex-col items-center gap-1 pointer-events-none">
          <div className={`px-2 py-0.5 rounded bg-black/80 border ${isLocal ? 'border-axiom-cyan' : 'border-white/20'} text-[#e8dfc8] text-[10px] font-black uppercase tracking-widest whitespace-nowrap shadow-xl`}>
            {isLocal && <span className="text-axiom-cyan mr-1">YOU //</span>}
            {agent.displayName} <span className="text-axiom-cyan ml-1">LVL {agent.level}</span>
          </div>
        </div>
      </Html>
    </group>
  );
};

const LocalPlayerController = ({ agent }: { agent: Agent }) => {
  const { camera } = useThree();
  const db = useFirestore();
  const { virtualInput, controlMode } = useStore();
  const moveSpeed = 0.45;
  const updateInterval = 500;
  const lastUpdateRef = useRef(0);

  const keys = useRef<{ [key: string]: boolean }>({});

  useEffect(() => {
    const down = (e: KeyboardEvent) => (keys.current[e.key.toLowerCase()] = true);
    const up = (e: KeyboardEvent) => (keys.current[e.key.toLowerCase()] = false);
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, []);

  useFrame((state, delta) => {
    let moving = false;
    const newPos = { ...agent.position };

    if (controlMode === 'KEYBOARD') {
      if (keys.current['w']) { newPos.z -= moveSpeed; moving = true; }
      if (keys.current['s']) { newPos.z += moveSpeed; moving = true; }
      if (keys.current['a']) { newPos.x -= moveSpeed; moving = true; }
      if (keys.current['d']) { newPos.x += moveSpeed; moving = true; }
    } else if (controlMode === 'JOYSTICK') {
      if (Math.abs(virtualInput.x) > 0.1 || Math.abs(virtualInput.z) > 0.1) {
        newPos.x += virtualInput.x * moveSpeed;
        newPos.z += virtualInput.z * moveSpeed;
        moving = true;
      }
    }

    if (moving) {
      agent.position.x = newPos.x;
      agent.position.z = newPos.z;
      agent.state = AgentState.EXPLORING;

      camera.position.x = newPos.x + 30;
      camera.position.z = newPos.z + 30;
      camera.lookAt(newPos.x, 0, newPos.z);

      const now = Date.now();
      if (now - lastUpdateRef.current > updateInterval) {
        lastUpdateRef.current = now;
        const ref = doc(db, 'players', agent.id);
        updateDoc(ref, { 
          position: { x: newPos.x, y: 0, z: newPos.z },
          state: AgentState.EXPLORING,
          lastUpdate: serverTimestamp() 
        });
      }
    }
  });

  return <AgentModel agent={agent} isLocal />;
};

const Terrain = ({ civilizationIndex }: { civilizationIndex: number }) => {
    const materialRef = useRef<THREE.ShaderMaterial>(null);
    const { camera } = useThree();
    
    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uAwakeningDensity: { value: civilizationIndex / 1000 },
        uBiome: { value: civilizationIndex >= 800 ? 0.0 : civilizationIndex < 400 ? 1.0 : 2.0 },
        uAxiomaticIntensity: { value: 0.5 },
        uStability: { value: 0.5 },
        uCorruption: { value: 0.1 },
        uIsHovered: { value: false },
        uIsSelected: { value: false },
        uCameraPosition: { value: camera.position },
        uFogColor: { value: new THREE.Color('#060810') },
        uFogNear: { value: 50.0 },
        uFogFar: { value: 300.0 }
    }), [civilizationIndex, camera]);

    useFrame((state) => {
        if (materialRef.current) {
            materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
            materialRef.current.uniforms.uCameraPosition.value.copy(state.camera.position);
        }
    });

    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
            <planeGeometry args={[1000, 1000, 256, 256]} />
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

export const World3D: React.FC<{ tick: number; civilizationIndex: number; localPlayerId?: string | null }> = ({ tick, civilizationIndex, localPlayerId }) => {
    const agents = useStore(state => state.agents);
    const chunks = useStore(state => state.loadedChunks);

    const otherAgents = useMemo(() => agents.filter(a => a.id !== localPlayerId), [agents, localPlayerId]);
    const localAgent = useMemo(() => agents.find(a => a.id === localPlayerId), [agents, localPlayerId]);

    const worldContent = useMemo(() => {
      const allPois: POI[] = [];
      chunks.forEach(chunk => {
        const content = WorldBuildingService.generateAxiomaticContent(chunk);
        allPois.push(...content.pois);
      });
      return { pois: allPois };
    }, [chunks]);

    return (
        <div className="w-full h-full bg-black">
            <Canvas shadows dpr={[1, 2]}>
                <PerspectiveCamera makeDefault position={[40, 30, 40]} fov={50} />
                <Sky sunPosition={[100, 20, 100]} turbidity={0.1} rayleigh={0.5} />
                <Environment preset="night" />
                <ambientLight intensity={0.2} />
                <pointLight position={[0, 50, 0]} intensity={1} color={ARL_COLORS.teal} />
                <Terrain civilizationIndex={civilizationIndex} />
                {localAgent && <LocalPlayerController agent={localAgent} />}
                {otherAgents.map(agent => <AgentModel key={agent.id} agent={agent} />)}
                {worldContent.pois.map(poi => <POIModel key={poi.id} poi={poi} />)}
                <ContactShadows resolution={1024} scale={50} blur={2} opacity={0.5} far={10} color="#000000" />
                <OrbitControls enablePan={true} maxPolarAngle={Math.PI / 2.1} minDistance={10} maxDistance={250} />
            </Canvas>
        </div>
    );
};