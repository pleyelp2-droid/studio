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
import { attachEquipment, EquipmentSlots } from './EquipmentRenderer';
import { WorldBuildingService } from '@/services/WorldBuildingService';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useFirestore } from '@/firebase';

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

  useEffect(() => {
    if (model) {
      const slots: EquipmentSlots = {
        head: agent.npcClass === 'SOVEREIGN' ? { id: 'h1', name: 'Crown', rarity: 'AXIOMATIC', type: 'ARMOR', stats: {}, level: 1, value: 0 } : null,
        chest: null,
        legs: null,
        mainHand: agent.npcClass === 'PILOT' || agent.npcClass === 'NEURAL_EMERGENT' ? { id: 'w1', name: 'Blade', rarity: 'RARE', type: 'WEAPON', stats: {}, level: 1, value: 0 } : null,
        offHand: null
      };
      attachEquipment(model.group, slots);
    }
  }, [model, agent.npcClass]);

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
          <div className={`px-2 py-0.5 rounded bg-black/80 border ${isLocal ? 'border-accent' : 'border-white/20'} text-white text-[10px] font-black uppercase tracking-widest whitespace-nowrap shadow-xl`}>
            {isLocal && <span className="text-accent mr-1">YOU //</span>}
            {agent.displayName} <span className="text-accent ml-1">LVL {agent.level}</span>
          </div>
          <div className="w-12 h-1 bg-secondary rounded-full overflow-hidden border border-white/10">
            <div className="h-full bg-emerald-500" style={{ width: `${((agent.hp || 100) / (agent.maxHp || 100)) * 100}%` }} />
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
  const moveSpeed = 0.35;
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
    } else if (controlMode === 'PUSH_TO_WALK' && targetPosition) {
      const dx = targetPosition.x - agent.position.x;
      const dz = targetPosition.z - agent.position.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      
      if (dist > 0.5) {
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
    } else if (agent.state !== AgentState.IDLE) {
      agent.state = AgentState.IDLE;
      const ref = doc(db, 'players', agent.id);
      updateDoc(ref, { state: AgentState.IDLE });
    }
  });

  return <AgentModel agent={agent} isLocal />;
};

const POIModel = ({ poi }: { poi: POI }) => {
  const rotationY = poi.rotationY || 0;

  if (poi.type === 'SHRINE') {
    return (
      <Float speed={3} rotationIntensity={1} floatIntensity={2}>
        <group position={[poi.position[0], 2, poi.position[2]]}>
          <mesh castShadow>
            <octahedronGeometry args={[1.5, 0]} />
            <meshStandardMaterial color="#60D4FF" emissive="#60D4FF" emissiveIntensity={0.5} metalness={0.9} roughness={0.1} />
          </mesh>
          <mesh rotation={[Math.PI / 4, 0, 0]}>
            <torusGeometry args={[2.5, 0.05, 16, 100]} />
            <meshStandardMaterial color="#60D4FF" emissive="#60D4FF" emissiveIntensity={2} />
          </mesh>
        </group>
      </Float>
    );
  }

  // Generic High-Tech Building or Housing
  if (poi.type === 'BUILDING' || poi.type === 'HOUSE') {
    return (
      <group position={[poi.position[0], 0, poi.position[2]]} rotation={[0, rotationY, 0]}>
        <mesh position={[0, 3, 0]} castShadow>
          <cylinderGeometry args={[1.5, 2, 6, 6]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0, 6.5, 0]}>
          <coneGeometry args={[1.5, 2, 6]} />
          <meshStandardMaterial color="#333" />
        </mesh>
        <mesh position={[0, 3, 0]}>
          <torusGeometry args={[2.2, 0.05, 8, 32]} rotation={[Math.PI/2, 0, 0]} />
          <meshStandardMaterial color="#60D4FF" emissive="#60D4FF" emissiveIntensity={1} />
        </mesh>
      </group>
    );
  }

  if (poi.type === 'FORGE' || poi.type === 'BANK_VAULT' || poi.type === 'MARKET_STALL') {
    const color = poi.type === 'BANK_VAULT' ? '#FBBF24' : poi.type === 'FORGE' ? '#EF4444' : '#60D4FF';
    return (
      <group position={[poi.position[0], 0, poi.position[2]]} rotation={[0, rotationY, 0]}>
        <mesh position={[0, 5, 0]} castShadow>
          <cylinderGeometry args={[1.2, 2.5, 10, 6]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0, 10.5, 0]}>
          <coneGeometry args={[0.4, 2, 6]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} />
        </mesh>
        {poi.type === 'MARKET_STALL' && (
          <mesh position={[0, 2, 0]}>
            <torusGeometry args={[4, 0.1, 16, 32]} rotation={[Math.PI/2, 0, 0]} />
            <meshStandardMaterial color="#60D4FF" emissive="#60D4FF" />
          </mesh>
        )}
      </group>
    );
  }

  if (poi.type === 'WALL') {
    return (
      <group position={[poi.position[0], 0, poi.position[2]]} rotation={[0, rotationY, 0]}>
        <mesh position={[0, 4, 0]} castShadow>
          <boxGeometry args={[20, 8, 3]} />
          <meshStandardMaterial color="#111" metalness={0.5} roughness={0.5} />
        </mesh>
      </group>
    );
  }

  if (poi.type === 'GATE') {
    return (
      <group position={[poi.position[0], 0, poi.position[2]]} rotation={[0, rotationY, 0]}>
        <mesh position={[-6, 6, 0]} castShadow><boxGeometry args={[4, 12, 4]} /><meshStandardMaterial color="#111" /></mesh>
        <mesh position={[6, 6, 0]} castShadow><boxGeometry args={[4, 12, 4]} /><meshStandardMaterial color="#111" /></mesh>
        <mesh position={[0, 10, 0]}><boxGeometry args={[16, 4, 4]} /><meshStandardMaterial color="#111" /></mesh>
        <mesh position={[0, 4, 0]}>
          <planeGeometry args={[8, 8]} />
          <meshStandardMaterial color="#60D4FF" transparent opacity={0.3} emissive="#60D4FF" emissiveIntensity={1} side={THREE.DoubleSide} />
        </mesh>
      </group>
    );
  }

  if (poi.type === 'DUNGEON') {
    return (
      <group position={[poi.position[0], -0.4, poi.position[2]]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[4, 32]} /><meshStandardMaterial color="#000" emissive="#60D4FF" emissiveIntensity={2} /></mesh>
        <pointLight position={[0, 2, 0]} intensity={20} color="#60D4FF" distance={30} />
      </group>
    );
  }

  if (poi.type === 'RUIN') {
    return (
      <group position={[poi.position[0], 0, poi.position[2]]}>
        {[0, 1, 2].map(i => (
          <Float key={i} speed={1 + i} floatIntensity={1} position={[Math.sin(i) * 3, 2 + i * 2, Math.cos(i) * 3]}>
            <mesh castShadow rotation={[Math.random(), Math.random(), 0]}>
              <boxGeometry args={[1, 4, 1]} /><meshStandardMaterial color="#444" roughness={0.8} />
            </mesh>
          </Float>
        ))}
      </group>
    );
  }

  if (poi.type === 'TREE') {
    return (
      <group position={[poi.position[0], 0, poi.position[2]]}>
        <mesh position={[0, 1.5, 0]} castShadow><cylinderGeometry args={[0.1, 0.4, 3, 5]} /><meshStandardMaterial color="#2a1a0a" /></mesh>
        <Float speed={1} floatIntensity={0.5}>
          <mesh position={[0, 4, 0]} castShadow><dodecahedronGeometry args={[1.8, 0]} /><meshStandardMaterial color="#0a2a1a" emissive="#0a2a1a" emissiveIntensity={0.2} /></mesh>
        </Float>
      </group>
    );
  }

  return null;
};

const MonsterModel = ({ monster }: { monster: Monster }) => {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.2 + 0.5;
      groupRef.current.rotation.y += 0.01;
    }
  });
  return (
    <group ref={groupRef} position={[monster.position[0], 0.5, monster.position[2]]}>
      <mesh castShadow><icosahedronGeometry args={[monster.scale, 0]} /><meshStandardMaterial color={monster.color} emissive={monster.color} emissiveIntensity={0.8} wireframe /></mesh>
      <Html position={[0, 1.5, 0]} center distanceFactor={10}>
        <div className="px-1.5 py-0.5 rounded bg-red-900/80 border border-red-500 text-white text-[8px] font-black uppercase tracking-tighter whitespace-nowrap shadow-xl">{monster.name}</div>
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
    const dayFactor = THREE.MathUtils.clamp((sunHeight + 0.1) / 0.3, 0, 1);
    const fogColor = new THREE.Color('#05070a').lerp(new THREE.Color('#8ba4c4'), dayFactor);
    return (
        <>
            <Sky sunPosition={[sunX * 100, sunY * 100, 30]} turbidity={sunHeight <= -0.1 ? 20 : 2} />
            <ambientLight intensity={THREE.MathUtils.lerp(0.1, 0.5, dayFactor)} color={fogColor} />
            <directionalLight position={[sunX * 100, Math.max(sunY * 150, 5), 30]} intensity={THREE.MathUtils.lerp(0.05, 1.5, dayFactor)} castShadow />
            <fog attach="fog" args={[fogColor, 100, 400]} />
        </>
    );
};

const Terrain = ({ civilizationIndex, agents }: { civilizationIndex: number, agents: Agent[] }) => {
    const materialRef = useRef<THREE.ShaderMaterial>(null);
    const { setTargetPosition, controlMode } = useStore();
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
        uFogColor: { value: new THREE.Color('#05070a') },
        uFogNear: { value: 80.0 },
        uFogFar: { value: 400.0 },
        uAgentPositions: { value: new Array(10).fill(new THREE.Vector3()) },
        uAgentVisionRanges: { value: new Array(10).fill(0) },
        uExplorationLevel: { value: 1.0 } // Set to 1.0 to ensure terrain is always visible
    }), [civilizationIndex, camera]);

    useFrame((state) => {
        if (materialRef.current) {
            materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
            materialRef.current.uniforms.uCameraPosition.value.copy(state.camera.position);
            
            // Real-time uniform updates
            const positions = materialRef.current.uniforms.uAgentPositions.value;
            const ranges = materialRef.current.uniforms.uAgentVisionRanges.value;
            agents.slice(0, 10).forEach((agent, i) => {
              positions[i].set(agent.position.x, 0, agent.position.z);
              ranges[i] = agent.visionRange || 50;
            });
        }
    });

    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow onPointerDown={(e: any) => controlMode === 'PUSH_TO_WALK' && setTargetPosition({ x: e.point.x, z: e.point.z })}>
            <planeGeometry args={[1000, 1000, 128, 128]} />
            <shaderMaterial ref={materialRef} vertexShader={axiomVertexShader} fragmentShader={axiomFragmentShader} uniforms={uniforms} side={THREE.DoubleSide} />
        </mesh>
    );
};

export const World3D: React.FC<{ tick: number; civilizationIndex: number; localPlayerId?: string | null }> = ({ tick, civilizationIndex, localPlayerId }) => {
    const agents = useStore(state => state.agents);
    const monsters = useStore(state => state.monsters);
    const chunks = useStore(state => state.loadedChunks);

    const otherAgents = useMemo(() => agents.filter(a => a.id !== localPlayerId), [agents, localPlayerId]);
    const localAgent = useMemo(() => agents.find(a => a.id === localPlayerId), [agents, localPlayerId]);

    const worldContent = useMemo(() => {
      const allPois: POI[] = [];
      const allMonsters: Monster[] = [];
      const allResources: ResourceNode[] = [];
      chunks.forEach(chunk => {
        const content = WorldBuildingService.generateAxiomaticContent(chunk);
        allPois.push(...content.pois);
        allMonsters.push(...content.monsters);
        allResources.push(...content.resources);
      });
      return { pois: allPois, monsters: monsters.length > 0 ? monsters : allMonsters, resources: allResources };
    }, [chunks, monsters]);

    return (
        <div className="w-full h-full bg-black">
            <Canvas shadows dpr={[1, 2]}>
                <PerspectiveCamera makeDefault position={[40, 30, 40]} fov={50} />
                <DayNightSky tick={tick} />
                <Environment preset="night" />
                <Terrain civilizationIndex={civilizationIndex} agents={agents} />
                {localAgent && <LocalPlayerController agent={localAgent} />}
                {otherAgents.map(agent => <AgentModel key={agent.id} agent={agent} />)}
                {worldContent.monsters.map(monster => <MonsterModel key={monster.id} monster={monster} />)}
                {worldContent.pois.map(poi => <POIModel key={poi.id} poi={poi} />)}
                {worldContent.resources.map(res => (
                  <mesh key={res.id} position={[res.position[0], 0.2, res.position[2]]} castShadow>
                    <octahedronGeometry args={[0.4, 0]} /><meshStandardMaterial color={res.type === 'SILVER_ORE' ? '#C0C0C0' : '#FFD700'} metalness={1} roughness={0.1} emissive={res.type === 'SILVER_ORE' ? '#444' : '#440'} />
                  </mesh>
                ))}
                <ContactShadows resolution={1024} scale={50} blur={2} opacity={0.5} far={10} color="#000000" />
                <OrbitControls enablePan={true} maxPolarAngle={Math.PI / 2.1} minDistance={10} maxDistance={250} />
                <gridHelper args={[1000, 100, '#111', '#050505']} position={[0, -0.05, 0]} />
            </Canvas>
        </div>
    );
};
