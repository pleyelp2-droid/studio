
'use client';

import { Html, Sky, PerspectiveCamera, Environment, ContactShadows, Float, Instances, Instance, OrbitControls } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import React, { useMemo, useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { useStore } from '../../store';
import { POI, Agent, AgentState } from '../../types';
import { axiomFragmentShader, axiomVertexShader } from './AxiomShader';
import { createHumanoidModel, HumanoidModel } from './HumanoidModel';
import { AnimationController, createAnimationClips } from './AnimationSystem';
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

// Global shared geometries for performance
const SHARED_GEOS = {
  octahedron: new THREE.OctahedronGeometry(1, 0),
  torusSmall: new THREE.TorusGeometry(2.8, 0.04, 6, 12),
  torusLarge: new THREE.TorusGeometry(5.0, 0.06, 6, 12),
  spireBase: new THREE.CylinderGeometry(0.2, 1.2, 12, 6),
  spireBaseMajor: new THREE.CylinderGeometry(0.4, 2.5, 24, 6),
  foundation: new THREE.CylinderGeometry(2.5, 3.2, 1.5, 6),
  foundationMajor: new THREE.CylinderGeometry(5.0, 6.0, 1.5, 6),
  box: new THREE.BoxGeometry(1, 1, 1),
  houseGeo: new THREE.BoxGeometry(4, 4, 4),
  wallGeo: new THREE.BoxGeometry(20, 8, 2.5),
  gateGeo: new THREE.BoxGeometry(5, 8, 2.5),
  terrain: new THREE.PlaneGeometry(500, 500, 64, 64)
};

const SHARED_MATS = {
  void: new THREE.MeshStandardMaterial({ color: ARL_COLORS.void, metalness: 1, roughness: 0.1 }),
  border: new THREE.MeshStandardMaterial({ color: ARL_COLORS.border, metalness: 1, roughness: 0.1 }),
  house: new THREE.MeshStandardMaterial({ color: ARL_COLORS.void, metalness: 0.8, roughness: 0.2 }),
  wall: new THREE.MeshStandardMaterial({ color: ARL_COLORS.void, metalness: 1, roughness: 0.1, emissive: ARL_COLORS.teal, emissiveIntensity: 0.1 })
};

const HighScienceSpire = ({ position, rotationY, color, type }: { position: [number, number, number], rotationY: number, color: string, type: string }) => {
  const ring1Ref = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (ring1Ref.current) ring1Ref.current.rotation.y = t * 0.3;
    if (coreRef.current) {
      coreRef.current.position.y = Math.sin(t * 1.2) * 0.1 + 8.5;
      coreRef.current.rotation.z = t * 0.4;
    }
  });

  const isMajor = type === 'FORGE' || type === 'BANK_VAULT' || type === 'BUILDING';
  const height = isMajor ? 24 : 12;

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh geometry={isMajor ? SHARED_GEOS.foundationMajor : SHARED_GEOS.foundation} position={[0, 0.5, 0]} material={SHARED_MATS.void} receiveShadow />
      <mesh geometry={isMajor ? SHARED_GEOS.spireBaseMajor : SHARED_GEOS.spireBase} position={[0, height / 2, 0]} material={SHARED_MATS.border} />
      <mesh ref={coreRef} geometry={SHARED_GEOS.octahedron} position={[0, 8.5, 0]} scale={isMajor ? 1.2 : 0.6}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={6} />
      </mesh>
      <group position={[0, height * 0.8, 0]} ref={ring1Ref}>
        <mesh geometry={isMajor ? SHARED_GEOS.torusLarge : SHARED_GEOS.torusSmall} rotation={[Math.PI / 2, 0, 0]}>
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={4} transparent opacity={0.6} />
        </mesh>
      </group>
    </group>
  );
};

const POILayer = ({ pois }: { pois: POI[] }) => {
  const houses = useMemo(() => pois.filter(p => p.type === 'HOUSE'), [pois]);
  const walls = useMemo(() => pois.filter(p => p.type === 'WALL'), [pois]);
  const otherPois = useMemo(() => pois.filter(p => !['HOUSE', 'WALL'].includes(p.type)), [pois]);

  return (
    <>
      <Instances geometry={SHARED_GEOS.houseGeo} material={SHARED_MATS.house}>
        {houses.map(p => (
          <Instance key={p.id} position={[p.position[0], 2, p.position[2]]} rotation={[0, p.rotationY || 0, 0]} />
        ))}
      </Instances>

      <Instances geometry={SHARED_GEOS.wallGeo} material={SHARED_MATS.wall}>
        {walls.map(p => (
          <Instance key={p.id} position={[p.position[0], 4, p.position[2]]} rotation={[0, p.rotationY || 0, 0]} />
        ))}
      </Instances>

      {otherPois.map(poi => {
        if (poi.type === 'SHRINE') {
          return (
            <Float key={poi.id} speed={1.2} rotationIntensity={0.4} floatIntensity={0.4}>
              <group position={[poi.position[0], 3.0, poi.position[2]]}>
                <mesh geometry={SHARED_GEOS.octahedron} scale={1.8}>
                  <meshStandardMaterial color={ARL_COLORS.void} metalness={1} roughness={0.1} emissive={ARL_COLORS.teal} emissiveIntensity={5} />
                </mesh>
              </group>
            </Float>
          );
        }
        if (['BUILDING', 'FORGE', 'BANK_VAULT', 'MARKET_STALL'].includes(poi.type)) {
          const color = poi.type === 'FORGE' ? ARL_COLORS.blood : 
                        poi.type === 'BANK_VAULT' ? ARL_COLORS.gold : 
                        poi.type === 'MARKET_STALL' ? ARL_COLORS.teal : ARL_COLORS.arcane;
          return <HighScienceSpire key={poi.id} position={poi.position} rotationY={poi.rotationY || 0} color={color} type={poi.type} />;
        }
        if (poi.type === 'GATE') {
          return (
            <mesh key={poi.id} geometry={SHARED_GEOS.gateGeo} position={[poi.position[0], 4, poi.position[2]]} rotation={[0, poi.rotationY || 0, 0]} receiveShadow>
              <meshStandardMaterial color={ARL_COLORS.void} metalness={1} roughness={0.1} emissive={ARL_COLORS.teal} emissiveIntensity={1.2} />
            </mesh>
          );
        }
        return null;
      })}
    </>
  );
};

const AgentModel = ({ agent, isLocal = false }: { agent: Agent; isLocal?: boolean }) => {
  const groupRef = useRef<THREE.Group>(null);
  const [model, setModel] = useState<HumanoidModel | null>(null);
  const [animController, setAnimController] = useState<AnimationController | null>(null);

  useEffect(() => {
    // Safely create model and animation controller
    const humanoid = createHumanoidModel({
      skinTone: agent.appearance?.skinTone || '#c68642',
      bodyScale: (agent.appearance?.bodyScale || 1.0) + (agent.level * 0.01)
    });
    
    if (humanoid && humanoid.mesh) {
      setModel(humanoid);
      const clips = createAnimationClips(humanoid.bones);
      const controller = new AnimationController(humanoid.mesh, clips);
      setAnimController(controller);
      
      return () => {
        controller.dispose();
      };
    }
  }, [agent.id, agent.appearance?.skinTone, agent.appearance?.bodyScale, agent.level]);

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
      <Html position={[0, 3.5, 0]} center distanceFactor={15}>
        <div className={`px-2 py-0.5 rounded bg-black/80 border ${isLocal ? 'border-axiom-cyan shadow-[0_0_10px_rgba(31,184,184,0.5)]' : 'border-white/10'} text-[#e8dfc8] text-[8px] font-black uppercase tracking-widest whitespace-nowrap backdrop-blur-md`}>
          {agent.displayName}
        </div>
      </Html>
    </group>
  );
};

const LocalPlayerController = ({ agent }: { agent: Agent }) => {
  const { camera } = useThree();
  const db = useFirestore();
  const { virtualInput, controlMode, targetPosition, setTargetPosition } = useStore();
  const moveSpeed = 0.7;
  const updateInterval = 800;
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

  useFrame((state) => {
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

    if (moving && targetPosition) setTargetPosition(null);

    if (!moving && targetPosition && controlMode === 'PUSH_TO_WALK') {
      const dx = targetPosition.x - agent.position.x;
      const dz = targetPosition.z - agent.position.z;
      const dist = Math.hypot(dx, dz);
      if (dist > 0.8) {
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

      const now = Date.now();
      if (now - lastUpdateRef.current > updateInterval) {
        lastUpdateRef.current = now;
        if (db) {
          const ref = doc(db, 'players', agent.id);
          updateDoc(ref, { position: { x: newPos.x, y: 0, z: newPos.z }, state: AgentState.EXPLORING, lastUpdate: serverTimestamp() });
        }
      }
    } else if (agent.state === AgentState.EXPLORING) {
      agent.state = AgentState.IDLE;
    }

    // Follow Logic: Smoothly update the OrbitControls target
    const controls = (state as any).controls;
    if (controls) {
      controls.target.x = THREE.MathUtils.lerp(controls.target.x, agent.position.x, 0.15);
      controls.target.z = THREE.MathUtils.lerp(controls.target.z, agent.position.z, 0.15);
      controls.update();
    }
  });

  return <AgentModel agent={agent} isLocal />;
};

const Terrain = ({ civilizationIndex }: { civilizationIndex: number }) => {
    const materialRef = useRef<THREE.ShaderMaterial>(null);
    const setTargetPosition = useStore(state => state.setTargetPosition);
    const controlMode = useStore(state => state.controlMode);
    
    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uAwakeningDensity: { value: civilizationIndex / 1000 },
        uBiome: { value: civilizationIndex >= 800 ? 0.0 : civilizationIndex < 400 ? 1.0 : 2.0 },
        uCameraPosition: { value: new THREE.Vector3() },
        uFogColor: { value: new THREE.Color('#060810') },
        uFogNear: { value: 100.0 },
        uFogFar: { value: 350.0 }
    }), [civilizationIndex]);

    useFrame((state) => {
        if (materialRef.current) {
            materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
            materialRef.current.uniforms.uCameraPosition.value.copy(state.camera.position);
        }
    });

    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow onPointerDown={(e) => {
          if (controlMode === 'PUSH_TO_WALK') setTargetPosition({ x: e.point.x, y: 0, z: e.point.z });
        }}>
            <primitive object={SHARED_GEOS.terrain} attach="geometry" />
            <shaderMaterial ref={materialRef} vertexShader={axiomVertexShader} fragmentShader={axiomFragmentShader} uniforms={uniforms} side={THREE.DoubleSide} />
        </mesh>
    );
};

export const World3D: React.FC<{ tick: number; civilizationIndex: number; localPlayerId?: string | null }> = ({ civilizationIndex, localPlayerId }) => {
    const agents = useStore(state => state.agents);
    const chunks = useStore(state => state.loadedChunks);
    const otherAgents = useMemo(() => agents.filter(a => a.id !== localPlayerId), [agents, localPlayerId]);
    const localAgent = useMemo(() => agents.find(a => a.id === localPlayerId), [agents, localPlayerId]);

    const pois = useMemo(() => {
      const all: POI[] = [];
      chunks.forEach(c => all.push(...WorldBuildingService.generateAxiomaticContent(c).pois));
      return all;
    }, [chunks]);

    return (
        <div className="w-full h-full bg-black touch-none">
            <Canvas shadows dpr={[1, 2]} gl={{ antialias: false, powerPreference: 'high-performance' }}>
                <PerspectiveCamera makeDefault position={[50, 40, 50]} fov={45} />
                
                <OrbitControls 
                  makeDefault 
                  enableDamping 
                  dampingFactor={0.05} 
                  maxPolarAngle={Math.PI / 2.1} 
                  minDistance={15} 
                  maxDistance={150} 
                  enablePan={false}
                  rotateSpeed={0.8}
                />

                <Sky sunPosition={[100, 15, 100]} turbidity={0.02} rayleigh={0.2} />
                <Environment preset="night" />
                <ambientLight intensity={0.4} />
                
                <Terrain civilizationIndex={civilizationIndex} />
                {localAgent && <LocalPlayerController agent={localAgent} />}
                {otherAgents.map(a => <AgentModel key={a.id} agent={a} />)}
                <POILayer pois={pois} />
                
                <ContactShadows frames={1} resolution={512} scale={100} blur={2} opacity={0.35} far={10} color="#000000" />
            </Canvas>
        </div>
    );
};
