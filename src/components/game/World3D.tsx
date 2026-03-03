'use client';

import { Html, Sky, PerspectiveCamera, Environment, ContactShadows, Float, OrbitControls } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import React, { useMemo, useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { useStore } from '../../store';
import { POI, Agent, AgentState } from '../../types';
import { axiomFragmentShader, axiomVertexShader } from './AxiomShader';
import { createHumanoidModel } from './HumanoidModel';
import { AnimationController, createAnimationClips } from './AnimationSystem';
import { WorldBuildingService } from '@/services/WorldBuildingService';

const ARL_COLORS = {
  void: "#2a2a4e",
  arcane: "#9b6fff",
  teal: "#2fffff",
  gold: "#ffcc00",
  blood: "#ff4d4d",
  border: "#4a5d8e",
  white: "#ffffff"
};

const HighScienceSpire = ({ position, rotationY, color }: { position: [number, number, number], rotationY: number, color: string }) => {
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

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Base Foundation */}
      <mesh position={[0, 0.75, 0]} receiveShadow>
        <cylinderGeometry args={[5, 6, 1.5, 6]} />
        <meshStandardMaterial color={ARL_COLORS.border} metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Main Spire Body */}
      <mesh position={[0, 12, 0]}>
        <cylinderGeometry args={[0.4, 2.5, 24, 6]} />
        <meshStandardMaterial color={ARL_COLORS.border} metalness={1} roughness={0.1} />
      </mesh>
      {/* Floating Core */}
      <mesh ref={coreRef} position={[0, 8.5, 0]} scale={1.2}>
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={6} />
      </mesh>
      {/* Energy Ring */}
      <group position={[0, 19.2, 0]} ref={ring1Ref}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[5.0, 0.06, 6, 12]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={4} transparent opacity={0.6} />
        </mesh>
      </group>
    </group>
  );
};

const POILayer = ({ pois }: { pois: POI[] }) => {
  return (
    <>
      {pois.map(p => {
        if (p.type === 'BUILDING' || p.type === 'HOUSE') {
          return <HighScienceSpire key={p.id} position={p.position} rotationY={p.rotationY || 0} color={p.type === 'BUILDING' ? ARL_COLORS.arcane : ARL_COLORS.teal} />;
        }
        if (p.type === 'SHRINE') {
          return (
            <Float key={p.id} speed={1.2} rotationIntensity={0.4} floatIntensity={0.4}>
              <group position={[p.position[0], 3.0, p.position[2]]}>
                <mesh scale={1.8} castShadow>
                  <octahedronGeometry args={[1, 0]} />
                  <meshStandardMaterial color={ARL_COLORS.void} metalness={1} roughness={0.1} emissive={ARL_COLORS.teal} emissiveIntensity={5} />
                </mesh>
              </group>
            </Float>
          );
        }
        return null;
      })}
    </>
  );
};

const AgentModelWrapper = ({ agent, isLocal = false }: { agent: Agent; isLocal?: boolean }) => {
  const groupRef = useRef<THREE.Group>(null);
  const [model, setModel] = useState<any>(null);
  const [animController, setAnimController] = useState<any>(null);

  useEffect(() => {
    const humanoid = createHumanoidModel({
      skinTone: agent.appearance?.skinTone || '#c68642',
      bodyScale: (agent.appearance?.bodyScale || 1.0) + (agent.level * 0.01)
    });
    
    if (humanoid) {
      setModel(humanoid);
      const clips = createAnimationClips(humanoid.bones);
      const controller = new AnimationController(humanoid.mesh, clips);
      setAnimController(controller);
      
      return () => {
        if (controller) controller.dispose();
      };
    }
  }, [agent.id, agent.appearance, agent.level]);

  useEffect(() => {
    if (animController) {
      animController.playForState(agent.state || AgentState.IDLE);
    }
  }, [agent.state, animController]);

  useFrame((_state, delta) => {
    if (animController) animController.update(delta);
    if (groupRef.current && !isLocal) {
      const targetPos = new THREE.Vector3(agent.position.x, agent.position.y || 0, agent.position.z);
      groupRef.current.position.lerp(targetPos, 0.1);
    }
  });

  if (!model) return null;

  return (
    <group ref={groupRef} position={[agent.position.x, agent.position.y || 0, agent.position.z]}>
      {model && <primitive object={model.group} />}
      <Html position={[0, 3.5, 0]} center distanceFactor={15}>
        <div className={`px-2 py-0.5 rounded bg-black/80 border ${isLocal ? 'border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]' : 'border-white/10'} text-white text-[8px] font-black uppercase tracking-widest whitespace-nowrap backdrop-blur-md`}>
          {agent.displayName}
        </div>
      </Html>
    </group>
  );
};

const LocalPlayerController = ({ agent }: { agent: Agent }) => {
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
      
      const now = Date.now();
      if (now - lastUpdateRef.current > updateInterval) {
        lastUpdateRef.current = now;
        if (db) {
          const ref = doc(db, 'players', agent.id);
          const { lastUpdate, ...rest } = agent;
          setDoc(ref, { 
            ...rest,
            position: { x: newPos.x, y: 0, z: newPos.z },
            lastUpdate: serverTimestamp() 
          }, { merge: true });
        }
      }
    }

    const controls = (state as any).controls;
    if (controls) {
      controls.target.x = THREE.MathUtils.lerp(controls.target.x, agent.position.x, 0.15);
      controls.target.z = THREE.MathUtils.lerp(controls.target.z, agent.position.z, 0.15);
      controls.update();
    }
  });

  return <AgentModelWrapper agent={agent} isLocal />;
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
            <planeGeometry args={[1000, 1000, 128, 128]} />
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
      chunks.forEach(c => {
        const content = WorldBuildingService.generateAxiomaticContent(c);
        all.push(...content.pois);
      });
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
                <ambientLight intensity={2.0} />
                <pointLight position={[10, 20, 10]} intensity={5} color="#ffffff" />
                
                <gridHelper args={[1000, 100, 0x4a5d8e, 0x1e2a4a]} position={[0, -0.05, 0]} />
                
                <Terrain civilizationIndex={civilizationIndex} />
                {localAgent && <LocalPlayerController agent={localAgent} />}
                {otherAgents.map(a => <AgentModelWrapper key={a.id} agent={a} />)}
                <POILayer pois={pois} />
                
                <ContactShadows frames={1} resolution={512} scale={100} blur={2} opacity={0.35} far={10} color="#000000" />
            </Canvas>
        </div>
    );
};
