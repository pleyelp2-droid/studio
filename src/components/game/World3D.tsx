
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

const HighScienceSpire = ({ position, rotationY, color, type }: { position: [number, number, number], rotationY: number, color: string, type: string }) => {
  const ring1Ref = useRef<THREE.Group>(null);
  const ring2Ref = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (ring1Ref.current) ring1Ref.current.rotation.y = t * 0.6;
    if (ring2Ref.current) ring2Ref.current.rotation.y = -t * 0.9;
    if (coreRef.current) {
      coreRef.current.position.y = Math.sin(t * 2.5) * 0.3 + 8;
      coreRef.current.rotation.z = t * 1.2;
    }
  });

  const isMajor = type === 'FORGE' || type === 'BANK_VAULT' || type === 'BUILDING';
  const height = isMajor ? 16 : 8;

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Heavy Hexagonal Foundation */}
      <mesh position={[0, 0.5, 0]} receiveShadow>
        <cylinderGeometry args={[isMajor ? 4.5 : 2.2, isMajor ? 5.5 : 2.8, 1.2, 6]} />
        <meshStandardMaterial color={ARL_COLORS.void} metalness={1} roughness={0.15} />
      </mesh>

      {/* Main Spire Core Structure */}
      <mesh position={[0, height / 2, 0]} castShadow>
        <cylinderGeometry args={[isMajor ? 0.6 : 0.35, isMajor ? 1.8 : 0.9, height, 6]} />
        <meshStandardMaterial color={ARL_COLORS.border} metalness={0.95} roughness={0.05} />
      </mesh>

      {/* Floating Energy Core */}
      <mesh ref={coreRef} position={[0, 8, 0]}>
        <octahedronGeometry args={[isMajor ? 1.0 : 0.5]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={12} />
      </mesh>

      {/* Orbital Logic Rings */}
      <group position={[0, height * 0.75, 0]} ref={ring1Ref}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[isMajor ? 3.0 : 1.8, 0.06, 8, 64]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={6} transparent opacity={0.9} />
        </mesh>
        <mesh position={[isMajor ? 3.0 : 1.8, 0, 0]}>
          <boxGeometry args={[0.25, 0.25, 0.25]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={20} />
        </mesh>
      </group>

      <group position={[0, height * 0.45, 0]} ref={ring2Ref}>
        <mesh rotation={[Math.PI / 2, 0, Math.PI / 4]}>
          <torusGeometry args={[isMajor ? 3.8 : 2.4, 0.04, 8, 64]} />
          <meshStandardMaterial color={ARL_COLORS.teal} emissive={ARL_COLORS.teal} emissiveIntensity={3} transparent opacity={0.5} />
        </mesh>
      </group>

      <pointLight position={[0, height, 0]} color={color} intensity={20} distance={40} decay={2} />
    </group>
  );
};

const POIModel = ({ poi }: { poi: POI }) => {
  const rotationY = poi.rotationY || 0;

  if (poi.type === 'SHRINE') {
    return (
      <Float speed={4} rotationIntensity={1.5} floatIntensity={2.5}>
        <group position={[poi.position[0], 2.5, poi.position[2]]}>
          <mesh castShadow>
            <octahedronGeometry args={[1.8, 0]} />
            <meshStandardMaterial color={ARL_COLORS.void} metalness={1} roughness={0.05} emissive={ARL_COLORS.teal} emissiveIntensity={4} />
          </mesh>
          <mesh rotation={[Math.PI / 4, 0, 0]}>
            <torusGeometry args={[2.8, 0.06, 16, 100]} />
            <meshStandardMaterial color={ARL_COLORS.teal} emissive={ARL_COLORS.teal} emissiveIntensity={6} />
          </mesh>
        </group>
      </Float>
    );
  }

  if (['BUILDING', 'HOUSE', 'FORGE', 'BANK_VAULT', 'MARKET_STALL'].includes(poi.type)) {
    const color = poi.type === 'FORGE' ? ARL_COLORS.blood : 
                  poi.type === 'BANK_VAULT' ? ARL_COLORS.gold : 
                  poi.type === 'MARKET_STALL' ? ARL_COLORS.teal : ARL_COLORS.arcane;
    return <HighScienceSpire position={poi.position} rotationY={rotationY} color={color} type={poi.type} />;
  }

  if (poi.type === 'WALL' || poi.type === 'GATE') {
    const isGate = poi.type === 'GATE';
    return (
      <group position={[poi.position[0], 0, poi.position[2]]} rotation={[0, rotationY, 0]}>
        <mesh position={[0, 3.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[isGate ? 4.5 : 20, 7, 2.5]} />
          <meshStandardMaterial color={ARL_COLORS.void} metalness={0.95} roughness={0.05} emissive={ARL_COLORS.teal} emissiveIntensity={isGate ? 1.2 : 0.3} />
        </mesh>
        <mesh position={[0, 7, 0]}>
          <boxGeometry args={[isGate ? 4.8 : 20.2, 0.15, 2.8]} />
          <meshStandardMaterial color={ARL_COLORS.teal} emissive={ARL_COLORS.teal} emissiveIntensity={3} />
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
      groupRef.current.position.lerp(targetPos, 0.12);
    }
  });

  if (!model) return null;

  return (
    <group ref={groupRef} position={[agent.position.x, agent.position.y || 0, agent.position.z]}>
      <primitive object={model.group} />
      <Html position={[0, 2.8, 0]} center distanceFactor={15}>
        <div className="flex flex-col items-center gap-1 pointer-events-none">
          <div className={`px-2.5 py-1 rounded bg-black/90 border-2 ${isLocal ? 'border-axiom-cyan' : 'border-white/30'} text-[#e8dfc8] text-[11px] font-black uppercase tracking-widest whitespace-nowrap shadow-[0_0_15px_rgba(0,0,0,0.5)] backdrop-blur-md`}>
            {isLocal && <span className="text-axiom-cyan mr-1.5">PILOT //</span>}
            {agent.displayName} <span className="text-axiom-cyan ml-1.5">LVL {agent.level}</span>
          </div>
        </div>
      </Html>
    </group>
  );
};

const LocalPlayerController = ({ agent }: { agent: Agent }) => {
  const { camera } = useThree();
  const db = useFirestore();
  const { virtualInput, controlMode, targetPosition, setTargetPosition } = useStore();
  const moveSpeed = 0.5;
  const updateInterval = 400;
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

    if (moving && targetPosition) {
      setTargetPosition(null);
    }

    if (!moving && targetPosition && controlMode === 'PUSH_TO_WALK') {
      const dx = targetPosition.x - agent.position.x;
      const dz = targetPosition.z - agent.position.z;
      const dist = Math.hypot(dx, dz);

      if (dist > 0.6) {
        newPos.x += (dx / dist) * moveSpeed;
        newPos.z += (dz / dist) * moveSpeed;
        moving = true;
      } else {
        setTargetPosition(null);
      }
    }

    if (moving) {
      agent.position.x = newPos.x;
      agent.position.z = newPos.z;
      agent.state = AgentState.EXPLORING;

      camera.position.x = newPos.x + 35;
      camera.position.z = newPos.z + 35;
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
    } else if (agent.state === AgentState.EXPLORING) {
      agent.state = AgentState.IDLE;
    }
  });

  return <AgentModel agent={agent} isLocal />;
};

const Terrain = ({ civilizationIndex }: { civilizationIndex: number }) => {
    const materialRef = useRef<THREE.ShaderMaterial>(null);
    const { camera } = useThree();
    const setTargetPosition = useStore(state => state.setTargetPosition);
    const controlMode = useStore(state => state.controlMode);
    
    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uAwakeningDensity: { value: civilizationIndex / 1000 },
        uBiome: { value: civilizationIndex >= 800 ? 0.0 : civilizationIndex < 400 ? 1.0 : 2.0 },
        uAxiomaticIntensity: { value: 0.5 },
        uStability: { value: 0.5 },
        uCorruption: { value: 0.1 },
        uCameraPosition: { value: new THREE.Vector3() },
        uFogColor: { value: new THREE.Color('#060810') },
        uFogNear: { value: 60.0 },
        uFogFar: { value: 400.0 }
    }), [civilizationIndex]);

    useFrame((state) => {
        if (materialRef.current) {
            materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
            materialRef.current.uniforms.uCameraPosition.value.copy(state.camera.position);
        }
    });

    const handlePointerDown = (e: any) => {
      if (controlMode === 'PUSH_TO_WALK') {
        const point = e.point;
        setTargetPosition({ x: point.x, y: 0, z: point.z });
      }
    };

    return (
        <mesh 
          rotation={[-Math.PI / 2, 0, 0]} 
          position={[0, -0.15, 0]} 
          receiveShadow
          onPointerDown={handlePointerDown}
        >
            <planeGeometry args={[1200, 1200, 256, 256]} />
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
                <PerspectiveCamera makeDefault position={[45, 35, 45]} fov={45} />
                <Sky sunPosition={[100, 15, 100]} turbidity={0.05} rayleigh={0.4} />
                <Environment preset="night" />
                <ambientLight intensity={0.15} />
                <pointLight position={[0, 60, 0]} intensity={1.5} color={ARL_COLORS.teal} />
                <Terrain civilizationIndex={civilizationIndex} />
                {localAgent && <LocalPlayerController agent={localAgent} />}
                {otherAgents.map(agent => <AgentModel key={agent.id} agent={agent} />)}
                {worldContent.pois.map(poi => <POIModel key={poi.id} poi={poi} />)}
                <ContactShadows resolution={1024} scale={60} blur={2.5} opacity={0.6} far={15} color="#000000" />
                <OrbitControls 
                  enablePan={true} 
                  maxPolarAngle={Math.PI / 2.1} 
                  minDistance={15} 
                  maxDistance={300}
                  enableDamping={true}
                />
            </Canvas>
        </div>
    );
};
