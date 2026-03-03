
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
  const ring3Ref = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (ring1Ref.current) ring1Ref.current.rotation.y = t * 0.8;
    if (ring2Ref.current) ring2Ref.current.rotation.y = -t * 1.2;
    if (ring3Ref.current) {
      ring3Ref.current.rotation.z = t * 0.5;
      ring3Ref.current.rotation.x = t * 0.3;
    }
    if (coreRef.current) {
      coreRef.current.position.y = Math.sin(t * 3.0) * 0.5 + 8.5;
      coreRef.current.rotation.z = t * 2.0;
      coreRef.current.rotation.y = t * 1.0;
    }
  });

  const isMajor = type === 'FORGE' || type === 'BANK_VAULT' || type === 'BUILDING';
  const height = isMajor ? 24 : 12;

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Heavy Hexagonal Foundation */}
      <mesh position={[0, 0.6, 0]} receiveShadow>
        <cylinderGeometry args={[isMajor ? 6.0 : 3.0, isMajor ? 7.0 : 3.8, 2.0, 6]} />
        <meshStandardMaterial color={ARL_COLORS.void} metalness={1} roughness={0.05} />
      </mesh>

      {/* Primary Tapered Spire */}
      <mesh position={[0, height / 2, 0]} castShadow>
        <cylinderGeometry args={[isMajor ? 0.6 : 0.3, isMajor ? 3.0 : 1.5, height, 6]} />
        <meshStandardMaterial color={ARL_COLORS.border} metalness={1} roughness={0.02} />
      </mesh>

      {/* Floating Energy Core */}
      <mesh ref={coreRef} position={[0, 8.5, 0]}>
        <octahedronGeometry args={[isMajor ? 1.8 : 0.9]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={30} />
      </mesh>

      {/* Multi-Stage Orbital Logic Rings */}
      <group position={[0, height * 0.85, 0]} ref={ring1Ref}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[isMajor ? 5.0 : 2.8, 0.1, 8, 48]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={20} transparent opacity={0.9} />
        </mesh>
        <mesh position={[isMajor ? 5.0 : 2.8, 0, 0]}>
          <boxGeometry args={[0.4, 0.4, 0.4]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={50} />
        </mesh>
      </group>

      <group position={[0, height * 0.5, 0]} ref={ring2Ref}>
        <mesh rotation={[Math.PI / 2, 0, Math.PI / 4]}>
          <torusGeometry args={[isMajor ? 5.8 : 3.5, 0.06, 8, 48]} />
          <meshStandardMaterial color={ARL_COLORS.teal} emissive={ARL_COLORS.teal} emissiveIntensity={10} transparent opacity={0.7} />
        </mesh>
      </group>

      {/* Translucent Logic Shield */}
      <group position={[0, height * 0.65, 0]} ref={ring3Ref}>
        <mesh>
          <sphereGeometry args={[isMajor ? 9.0 : 5.0, 16, 16]} />
          <meshStandardMaterial color={color} transparent opacity={0.05} wireframe />
        </mesh>
      </group>
    </group>
  );
};

const POIModel = ({ poi }: { poi: POI }) => {
  const rotationY = poi.rotationY || 0;

  if (poi.type === 'SHRINE') {
    return (
      <Float speed={4} rotationIntensity={2} floatIntensity={2}>
        <group position={[poi.position[0], 3.5, poi.position[2]]}>
          <mesh castShadow>
            <octahedronGeometry args={[2.5, 0]} />
            <meshStandardMaterial color={ARL_COLORS.void} metalness={1} roughness={0.01} emissive={ARL_COLORS.teal} emissiveIntensity={15} />
          </mesh>
          <mesh rotation={[Math.PI / 4, 0, 0]}>
            <torusGeometry args={[3.8, 0.1, 12, 64]} />
            <meshStandardMaterial color={ARL_COLORS.teal} emissive={ARL_COLORS.teal} emissiveIntensity={20} />
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
        <mesh position={[0, 4.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[isGate ? 6.0 : 20, 9, 3.2]} />
          <meshStandardMaterial color={ARL_COLORS.void} metalness={1} roughness={0.02} emissive={ARL_COLORS.teal} emissiveIntensity={isGate ? 3.0 : 0.8} />
        </mesh>
        <mesh position={[0, 9, 0]}>
          <boxGeometry args={[isGate ? 6.5 : 20.5, 0.2, 3.5]} />
          <meshStandardMaterial color={ARL_COLORS.teal} emissive={ARL_COLORS.teal} emissiveIntensity={10} />
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
      groupRef.current.position.lerp(targetPos, 0.15);
    }
  });

  if (!model) return null;

  return (
    <group ref={groupRef} position={[agent.position.x, agent.position.y || 0, agent.position.z]}>
      <primitive object={model.group} />
      <Html position={[0, 3.5, 0]} center distanceFactor={15}>
        <div className="flex flex-col items-center gap-1 pointer-events-none">
          <div className={`px-3 py-1.5 rounded-lg bg-black/95 border-2 ${isLocal ? 'border-axiom-cyan shadow-[0_0_20px_rgba(31,184,184,0.6)]' : 'border-white/30'} text-[#e8dfc8] text-[11px] font-black uppercase tracking-[0.2em] whitespace-nowrap backdrop-blur-xl transition-all`}>
            {isLocal && <span className="text-axiom-cyan mr-2 animate-pulse">PILOT //</span>}
            {agent.displayName} <span className="text-axiom-cyan ml-2 opacity-80 font-mono">LVL {agent.level}</span>
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
  const moveSpeed = 0.65;
  const updateInterval = 350;
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

      camera.position.x = newPos.x + 40;
      camera.position.z = newPos.z + 40;
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
            <planeGeometry args={[1200, 1200, 128, 128]} />
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
            <Canvas shadows dpr={1}>
                <PerspectiveCamera makeDefault position={[50, 40, 50]} fov={45} />
                <Sky sunPosition={[100, 15, 100]} turbidity={0.05} rayleigh={0.4} />
                <Environment preset="night" />
                <ambientLight intensity={0.4} />
                <pointLight position={[0, 100, 0]} intensity={3.0} color={ARL_COLORS.teal} />
                <Terrain civilizationIndex={civilizationIndex} />
                {localAgent && <LocalPlayerController agent={localAgent} />}
                {otherAgents.map(agent => <AgentModel key={agent.id} agent={agent} />)}
                {worldContent.pois.map(poi => <POIModel key={poi.id} poi={poi} />)}
                <ContactShadows resolution={512} scale={100} blur={2.5} opacity={0.7} far={20} color="#000000" />
                <OrbitControls 
                  enablePan={true} 
                  maxPolarAngle={Math.PI / 2.1} 
                  minDistance={20} 
                  maxDistance={400}
                  enableDamping={true}
                />
            </Canvas>
        </div>
    );
};
