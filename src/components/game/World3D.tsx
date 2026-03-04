
"use client"

import { Html, PerspectiveCamera, Float, OrbitControls } from "@react-three/drei"
import { Canvas, useFrame } from "@react-three/fiber"
import React, { useMemo, useRef, useState, useEffect, Suspense } from "react"
import * as THREE from "three"
import { useStore } from "../../store"
import { POI, Agent, AgentState } from "../../types"
import { createHumanoidModel } from "./HumanoidModel"
import { AnimationController, createAnimationClips } from "./AnimationSystem"
import { WorldBuildingService } from "@/services/WorldBuildingService"
import { textureEngine } from "@/services/TextureEngine"

const ARL_COLORS = {
  void: "#0a0d1a",
  arcane: "#9b6fff",
  teal: "#2fffff",
  gold: "#ffcc00",
  blood: "#ff4d4d",
  border: "#1e2a4a",
  white: "#ffffff",
  ground: "#020205"
}

const HighScienceSpire = ({ position, rotationY, color }: { position: [number, number, number], rotationY: number, color: string }) => {
  const safePos = useMemo(() => {
    return [
      Number.isFinite(position[0]) ? position[0] : 0,
      Number.isFinite(position[1]) ? position[1] : 0,
      Number.isFinite(position[2]) ? position[2] : 0
    ] as [number, number, number];
  }, [position]);

  return (
    <group position={safePos} rotation={[0, rotationY || 0, 0]}>
      <mesh position={[0, 5, 0]} castShadow receiveShadow>
        <boxGeometry args={[4, 10, 4]} />
        <meshStandardMaterial color={color} metalness={0.9} roughness={0.1} emissive={color} emissiveIntensity={0.1} />
      </mesh>
      <Float speed={2.5} rotationIntensity={2} floatIntensity={2}>
        <mesh position={[0, 15, 0]} scale={2}>
          <octahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
        </mesh>
      </Float>
      <pointLight position={[0, 15, 0]} intensity={0.5} color={color} distance={100} />
    </group>
  );
};

const Terrain = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [terrainTex, setTerrainTex] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    // Neural logic: Find the best ground texture in the engine registry
    const unsub = textureEngine.subscribe(async (registry) => {
      const terrainAssets = Array.from(registry.values()).filter(s => s.category === 'TERRAIN');
      if (terrainAssets.length > 0) {
        const tex = await textureEngine.getTexture(terrainAssets[0].id);
        if (tex) {
          tex.repeat.set(50, 50);
          setTerrainTex(tex);
        }
      }
    });
    return unsub;
  }, []);

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
      <planeGeometry args={[2000, 2000]} />
      <meshStandardMaterial 
        color={terrainTex ? "#ffffff" : "#020205"} 
        map={terrainTex}
        roughness={1} 
        metalness={0.1} 
      />
    </mesh>
  );
};

const AgentModelWrapper = ({ agent, isLocal = false }: { agent: Agent; isLocal?: boolean }) => {
  const groupRef = useRef<THREE.Group>(null);
  const [model, setModel] = useState<any>(null);
  const [animController, setAnimController] = useState<any>(null);

  useEffect(() => {
    if (!agent) return;
    let humanoid: any = null;
    let controller: any = null;

    try {
      const appearance = agent.appearance || { skinTone: '#c68642', bodyScale: 1.0 };
      const baseScale = Number.isFinite(appearance.bodyScale) && appearance.bodyScale > 0 ? appearance.bodyScale : 1.0;
      
      humanoid = createHumanoidModel({
        skinTone: appearance.skinTone,
        bodyScale: baseScale * 1.5
      });
      
      if (humanoid) {
        setModel(humanoid);
        const clips = createAnimationClips(humanoid.bones);
        controller = new AnimationController(humanoid.mesh, clips);
        setAnimController(controller);
      }
    } catch (e) {
      console.error("[WORLD_3D] Model creation failed", e);
    }

    return () => {
      if (controller) controller.dispose();
      if (humanoid?.mesh) {
        humanoid.mesh.geometry?.dispose();
        if (Array.isArray(humanoid.mesh.material)) humanoid.mesh.material.forEach((m: any) => m.dispose());
        else humanoid.mesh.material?.dispose();
      }
    };
  }, [agent.id, agent.appearance?.skinTone, agent.appearance?.bodyScale]);

  useEffect(() => {
    if (animController && agent.state) {
      animController.playForState(agent.state);
    }
  }, [agent.state, animController]);

  useFrame((_state, delta) => {
    if (animController && Number.isFinite(delta)) {
      animController.update(delta);
    }
    if (groupRef.current && !isLocal && agent.position) {
      const tx = Number.isFinite(agent.position.x) ? agent.position.x : 0;
      const tz = Number.isFinite(agent.position.z) ? agent.position.z : 0;
      groupRef.current.position.lerp(new THREE.Vector3(tx, 0, tz), 0.1);
    }
  });

  if (!model) return null;

  const px = Number.isFinite(agent.position?.x) ? agent.position.x : 0;
  const pz = Number.isFinite(agent.position?.z) ? agent.position.z : 0;

  return (
    <group ref={groupRef} position={[px, 0, pz]}>
      <primitive object={model.group} />
      <Html position={[0, 4, 0]} center distanceFactor={20}>
        <div className={`px-3 py-1 rounded-lg bg-black/95 border-2 ${isLocal ? 'border-axiom-cyan shadow-[0_0_15px_rgba(31,184,184,1)]' : 'border-white/20'} text-white text-[10px] font-black uppercase tracking-widest backdrop-blur-md italic pointer-events-none`}>
          {agent.displayName || "Pilot"}
        </div>
      </Html>
    </group>
  );
};

const LocalPlayerController = ({ agent }: { agent: Agent }) => {
  const { virtualInput, controlMode, targetPosition, setAgents, agents } = useStore();
  const moveSpeed = 2.5;

  useFrame(() => {
    if (!agent || !agent.position) return;
    let moving = false;
    let deltaX = 0;
    let deltaZ = 0;

    if ((controlMode === 'JOYSTICK' || controlMode === 'KEYBOARD') && (Math.abs(virtualInput.x) > 0.1 || Math.abs(virtualInput.z) > 0.1)) {
      deltaX = virtualInput.x * moveSpeed;
      deltaZ = virtualInput.z * moveSpeed;
      moving = true;
    } else if (targetPosition && controlMode === 'PUSH_TO_WALK') {
      const dx = targetPosition.x - agent.position.x;
      const dz = targetPosition.z - agent.position.z;
      const dist = Math.hypot(dx, dz);
      if (dist > 1.5) {
        deltaX = (dx / dist) * moveSpeed;
        deltaZ = (dz / dist) * moveSpeed;
        moving = true;
      }
    }

    if (moving) {
      const nextX = agent.position.x + deltaX;
      const nextZ = agent.position.z + deltaZ;
      if (Number.isFinite(nextX) && Number.isFinite(nextZ)) {
        setAgents(agents.map(a => a.id === agent.id ? { 
          ...a, 
          position: { ...a.position, x: nextX, z: nextZ },
          state: AgentState.EXPLORING 
        } : a));
      }
    } else if (agent.state !== AgentState.IDLE) {
      setAgents(agents.map(a => a.id === agent.id ? { ...a, state: AgentState.IDLE } : a));
    }
  });

  return <AgentModelWrapper agent={agent} isLocal />;
};

const WorldContent = ({ localPlayerId }: { localPlayerId?: string | null }) => {
  const agents = useStore(state => state.agents) || [];
  const chunks = useStore(state => state.loadedChunks) || [];
  
  const otherAgents = useMemo(() => agents.filter(a => a && a.id !== localPlayerId), [agents, localPlayerId]);
  const localAgent = useMemo(() => agents.find(a => a && a.id === localPlayerId), [agents, localPlayerId]);

  const pois = useMemo(() => {
    const all: POI[] = [];
    chunks.forEach(c => {
      if (!c) return;
      const content = WorldBuildingService.generateAxiomaticContent(c);
      if (content?.pois) all.push(...content.pois);
    });
    return all;
  }, [chunks]);

  return (
    <>
      <Terrain />
      <gridHelper args={[2000, 100, "#1e2a4a", "#0a0d1a"]} position={[0, -0.05, 0]} />
      {localAgent && <LocalPlayerController agent={localAgent} />}
      {otherAgents.map(a => <AgentModelWrapper key={a.id} agent={a} />)}
      {pois.map(p => {
        const px = Number.isFinite(p.position[0]) ? p.position[0] : 0;
        const pz = Number.isFinite(p.position[2]) ? p.position[2] : 0;
        if (p.type === 'BUILDING') return <HighScienceSpire key={p.id} position={[px, 0, pz]} rotationY={p.rotationY || 0} color={ARL_COLORS.arcane} />;
        if (p.type === 'SHRINE') return (
          <Float key={p.id} speed={2} rotationIntensity={1} floatIntensity={1}>
            <mesh key={`shrine-mesh-${p.id}`} position={[px, 5, pz]} scale={1.5}>
              <octahedronGeometry args={[1, 0]} />
              <meshStandardMaterial color={ARL_COLORS.teal} emissive={ARL_COLORS.teal} emissiveIntensity={0.5} />
            </mesh>
          </Float>
        );
        return null;
      })}
    </>
  );
}

const World3D = ({ localPlayerId }: { tick: number, civilizationIndex: number, localPlayerId?: string | null }) => {
  return (
    <div className="w-full h-full bg-[#010102] touch-none">
        <Suspense fallback={<div className="w-full h-full flex items-center justify-center text-axiom-cyan font-headline animate-pulse uppercase tracking-widest">Synchronizing Matrix...</div>}>
          <Canvas gl={{ antialias: true, logarithmicDepthBuffer: false }} shadows>
              <PerspectiveCamera makeDefault position={[80, 80, 80]} fov={45} far={2000} />
              <OrbitControls makeDefault enableDamping dampingFactor={0.05} maxPolarAngle={Math.PI / 2.1} minDistance={10} maxDistance={600} />
              <ambientLight intensity={0.4} />
              <directionalLight 
                position={[50, 100, 50]} 
                intensity={0.8} 
                castShadow 
                shadow-mapSize={[1024, 1024]}
                shadow-bias={-0.0001}
              >
                <orthographicCamera attach="shadow-camera" args={[-150, 150, 150, -150, 0.1, 500]} />
              </directionalLight>
              <WorldContent localPlayerId={localPlayerId} />
          </Canvas>
        </Suspense>
    </div>
  );
}

export default World3D;
