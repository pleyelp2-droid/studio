
"use client"

import { Html, PerspectiveCamera, Float, OrbitControls, Sky, Stars, Environment, ContactShadows } from "@react-three/drei"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import React, { useMemo, useRef, useState, useEffect, Suspense } from "react"
import * as THREE from "three"
import { useStore } from "../../store"
import { POI, Agent, AgentState } from "../../types"
import { createHumanoidModel } from "./HumanoidModel"
import { AnimationController, createAnimationClips } from "./AnimationSystem"
import { WorldBuildingService } from "@/services/WorldBuildingService"
import { textureEngine } from "@/services/TextureEngine"

const ARL_COLORS = {
  void: "#020203",
  arcane: "#7b4fd4",
  teal: "#1fb8b8",
  gold: "#c9a227",
  blood: "#c0392b",
  border: "#1e2a4a",
  white: "#ffffff",
  ground: "#050508"
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
      <mesh position={[0, 15, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[2, 5, 30, 6]} />
        <meshStandardMaterial 
          color={ARL_COLORS.void} 
          metalness={0.9} 
          roughness={0.1} 
          emissive={color} 
          emissiveIntensity={0.2} 
        />
      </mesh>
      
      <Float speed={3} rotationIntensity={4} floatIntensity={2}>
        <mesh position={[0, 35, 0]} scale={3}>
          <octahedronGeometry args={[1, 0]} />
          <meshStandardMaterial 
            color={color} 
            emissive={color} 
            emissiveIntensity={2} 
            toneMapped={false}
          />
        </mesh>
      </Float>

      <pointLight position={[0, 35, 0]} intensity={2} color={color} distance={150} decay={2} />
      
      <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[8, 10, 32]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1} transparent opacity={0.5} />
      </mesh>
    </group>
  );
};

const Terrain = () => {
  const [terrainTex, setTerrainTex] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    const unsub = textureEngine.subscribe(async (registry) => {
      const terrainAssets = Array.from(registry.values()).filter(s => s.category === 'TERRAIN');
      if (terrainAssets.length > 0) {
        const tex = await textureEngine.getTexture(terrainAssets[0].id);
        if (tex) {
          tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
          tex.repeat.set(100, 100);
          setTerrainTex(tex);
        }
      }
    });
    return unsub;
  }, []);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
        <planeGeometry args={[4000, 4000]} />
        <meshStandardMaterial 
          color={terrainTex ? "#ffffff" : ARL_COLORS.ground} 
          map={terrainTex}
          roughness={0.8} 
          metalness={0.2} 
        />
      </mesh>
      <gridHelper args={[4000, 100, ARL_COLORS.border, "#050508"]} position={[0, -0.05, 0]} />
    </group>
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
      // Significantly increased base scale for character presence
      humanoid = createHumanoidModel({
        skinTone: appearance.skinTone,
        bodyScale: (appearance.bodyScale || 1.0) * 8.0 
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

  return (
    <group ref={groupRef} position={[agent.position?.x || 0, 0, agent.position?.z || 0]}>
      <primitive object={model.group} />
      <Html position={[0, 15, 0]} center distanceFactor={25}>
        <div className={`px-4 py-1.5 rounded-full bg-black/80 border-2 ${isLocal ? 'border-axiom-cyan shadow-[0_0_20px_rgba(31,184,184,0.8)]' : 'border-white/10'} text-white text-[10px] font-black uppercase tracking-[0.2em] backdrop-blur-md italic pointer-events-none whitespace-nowrap shadow-xl`}>
          {agent.displayName || "Unknown Pilot"}
        </div>
      </Html>
    </group>
  );
};

const CameraController = ({ targetPosition }: { targetPosition: { x: number, z: number } | null }) => {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);
  const controlledAgentId = useStore(state => state.controlledAgentId);
  const agents = useStore(state => state.agents);
  
  const controlledAgent = useMemo(() => 
    agents.find(a => a.id === controlledAgentId), 
    [agents, controlledAgentId]
  );

  useFrame(() => {
    if (controlledAgent && controlledAgent.position) {
      const { x, z } = controlledAgent.position;
      const idealOffset = new THREE.Vector3(0, 15, 40); // Standard 3rd person height/distance
      const idealLookat = new THREE.Vector3(x, 8, z); // Look at character chest height

      // Camera Follow Logic
      const currentPos = camera.position.clone();
      const targetPos = new THREE.Vector3(x, 0, z).add(idealOffset);
      
      camera.position.lerp(targetPos, 0.1);
      camera.lookAt(idealLookat);

      if (controlsRef.current) {
        controlsRef.current.target.lerp(idealLookat, 0.1);
        controlsRef.current.update();
      }
    }
  });

  return (
    <OrbitControls 
      ref={controlsRef}
      makeDefault 
      enableDamping 
      dampingFactor={0.05} 
      maxPolarAngle={Math.PI / 2.2} 
      minDistance={10} 
      maxDistance={200} 
    />
  );
};

const LocalPlayerController = ({ agent }: { agent: Agent }) => {
  const { virtualInput, controlMode, targetPosition, setAgents, agents } = useStore();
  const moveSpeed = 6.0;

  useFrame((_state, delta) => {
    if (!agent || !agent.position) return;
    let moving = false;
    let dx = 0;
    let dz = 0;

    if ((controlMode === 'JOYSTICK' || controlMode === 'KEYBOARD') && (Math.abs(virtualInput.x) > 0.1 || Math.abs(virtualInput.z) > 0.1)) {
      dx = virtualInput.x * moveSpeed;
      dz = virtualInput.z * moveSpeed;
      moving = true;
    } else if (targetPosition && controlMode === 'PUSH_TO_WALK') {
      const diffX = targetPosition.x - agent.position.x;
      const diffZ = targetPosition.z - agent.position.z;
      const dist = Math.hypot(diffX, diffZ);
      if (dist > 2.0) {
        dx = (diffX / dist) * moveSpeed;
        dz = (diffZ / dist) * moveSpeed;
        moving = true;
      }
    }

    if (moving) {
      const nextX = agent.position.x + dx;
      const nextZ = agent.position.z + dz;
      setAgents(agents.map(a => a.id === agent.id ? { 
        ...a, 
        position: { ...a.position, x: nextX, z: nextZ },
        state: AgentState.EXPLORING 
      } : a));
    } else if (agent.state !== AgentState.IDLE) {
      setAgents(agents.map(a => a.id === agent.id ? { ...a, state: AgentState.IDLE } : a));
    }
  });

  return <AgentModelWrapper agent={agent} isLocal />;
};

const WorldContent = ({ localPlayerId }: { localPlayerId?: string | null }) => {
  const agents = useStore(state => state.agents) || [];
  const chunks = useStore(state => state.loadedChunks) || [];
  
  const localAgent = useMemo(() => agents.find(a => a.id === localPlayerId), [agents, localPlayerId]);
  const otherAgents = useMemo(() => agents.filter(a => a.id !== localPlayerId), [agents, localPlayerId]);

  const pois = useMemo(() => {
    const all: POI[] = [];
    chunks.forEach(c => {
      const content = WorldBuildingService.generateAxiomaticContent(c);
      if (content?.pois) all.push(...content.pois);
    });
    return all;
  }, [chunks]);

  return (
    <>
      <Terrain />
      <Stars radius={300} depth={60} count={20000} factor={7} saturation={0} fade speed={1} />
      <Sky sunPosition={[100, 20, 100]} />
      
      {localAgent && <LocalPlayerController agent={localAgent} />}
      {otherAgents.map(a => <AgentModelWrapper key={a.id} agent={a} />)}
      
      {pois.map(p => {
        const px = p.position[0] || 0;
        const pz = p.position[2] || 0;
        if (p.type === 'BUILDING') return <HighScienceSpire key={p.id} position={[px, 0, pz]} rotationY={p.rotationY || 0} color={ARL_COLORS.arcane} />;
        if (p.type === 'SHRINE') return (
          <group key={p.id} position={[px, 0, pz]}>
            <Float speed={4} rotationIntensity={2} floatIntensity={5}>
              <mesh position={[0, 8, 0]} scale={2}>
                <dodecahedronGeometry args={[1, 0]} />
                <meshStandardMaterial color={ARL_COLORS.teal} emissive={ARL_COLORS.teal} emissiveIntensity={3} toneMapped={false} />
              </mesh>
            </Float>
            <pointLight position={[0, 8, 0]} intensity={1.5} color={ARL_COLORS.teal} distance={80} />
          </group>
        );
        return null;
      })}
      
      <ContactShadows resolution={1024} scale={100} blur={2} opacity={0.4} far={10} color="#000000" />
    </>
  );
}

const World3D = ({ localPlayerId }: { tick: number, civilizationIndex: number, localPlayerId?: string | null }) => {
  const setTargetPosition = useStore(state => state.setTargetPosition);
  const controlMode = useStore(state => state.controlMode);
  const agents = useStore(state => state.agents);
  const controlledAgentId = useStore(state => state.controlledAgentId);
  
  const controlledAgent = useMemo(() => 
    agents.find(a => a.id === controlledAgentId), 
    [agents, controlledAgentId]
  );

  return (
    <div className="w-full h-full bg-[#010102] touch-none">
        <Suspense fallback={<div className="w-full h-full flex items-center justify-center text-axiom-cyan font-headline animate-pulse uppercase tracking-[0.5em] text-xl">Materializing Reality...</div>}>
          <Canvas 
            gl={{ antialias: true, logarithmicDepthBuffer: true }} 
            shadows
            onPointerDown={(e) => {
              if (controlMode === 'PUSH_TO_WALK') {
                setTargetPosition({ x: e.point.x, y: 0, z: e.point.z });
              }
            }}
          >
              <PerspectiveCamera makeDefault position={[60, 40, 60]} fov={45} far={5000} />
              
              <CameraController targetPosition={controlledAgent?.position || null} />
              
              <ambientLight intensity={0.2} />
              <directionalLight 
                position={[100, 200, 100]} 
                intensity={1.2} 
                castShadow 
                shadow-mapSize={[2048, 2048]}
                shadow-bias={-0.0005}
              />
              
              <Environment preset="night" />
              <WorldContent localPlayerId={localPlayerId} />
              
              <fog attach="fog" args={["#010102", 100, 1500]} />
          </Canvas>
        </Suspense>
    </div>
  );
}

export default World3D;
