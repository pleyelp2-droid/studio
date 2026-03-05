"use client"

import { Html, PerspectiveCamera, Float, OrbitControls, Sky, Stars, Environment, ContactShadows } from "@react-three/drei"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import React, { useMemo, useRef, useState, useEffect, Suspense } from "react"
import * as THREE from "three"
import { useStore } from "../../store"
import { POI, Agent, AgentState, ResourceNode, Monster, Chunk } from "../../types"
import { createHumanoidModel } from "./HumanoidModel"
import { AnimationController, createAnimationClips } from "./AnimationSystem"
import { WorldBuildingService } from "@/services/WorldBuildingService"
import { textureEngine } from "@/services/TextureEngine"
import { RobustnessEngine } from "@/lib/axiomatic-engine"

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

const HighScienceSpire = ({ position, rotationY, color, seed }: { position: [number, number, number], rotationY: number, color: string, seed: number }) => {
  const [archTex, setArchTex] = useState<THREE.Texture | null>(null);
  const forceEmissive = useStore(state => state.shaderSettings.forceEmissive);

  useEffect(() => {
    const updateTex = async () => {
      const tex = await textureEngine.getProceduralTexture('ARCHITECTURE', seed);
      if (tex) {
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(2, 8);
        setArchTex(tex);
      }
    };
    const unsub = textureEngine.subscribe(updateTex);
    updateTex();
    return unsub;
  }, [seed]);

  return (
    <group position={position} rotation={[0, rotationY || 0, 0]}>
      <mesh position={[0, 15, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[2, 5, 30, 6]} />
        <meshStandardMaterial 
          color={archTex ? "#ffffff" : color} 
          map={archTex || undefined}
          metalness={0.8} 
          roughness={0.2} 
          emissive={forceEmissive ? (archTex ? "#ffffff" : color) : "#111111"} 
          emissiveIntensity={forceEmissive ? 1.0 : 0.5} 
        />
      </mesh>
      <Float speed={3} rotationIntensity={4} floatIntensity={2}>
        <mesh position={[0, 35, 0]} scale={3}>
          <octahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={15} toneMapped={false} />
        </mesh>
      </Float>
      <pointLight position={[0, 35, 0]} intensity={100} color={color} distance={500} decay={2} />
    </group>
  );
};

const ChunkTerrain = ({ chunk }: { chunk: Chunk }) => {
  const [terrainTex, setTerrainTex] = useState<THREE.Texture | null>(null);
  const forceEmissive = useStore(state => state.shaderSettings.forceEmissive);
  const chunkOffsetX = chunk.x * 400;
  const chunkOffsetZ = chunk.z * 400;

  useEffect(() => {
    const updateTex = async () => {
      const tex = await textureEngine.getProceduralTexture('TERRAIN', chunk.seed);
      if (tex) {
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(10, 10);
        setTerrainTex(tex);
      }
    };
    const unsub = textureEngine.subscribe(updateTex);
    updateTex();
    return unsub;
  }, [chunk.seed]);

  return (
    <group position={[chunkOffsetX, -0.1, chunkOffsetZ]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[400, 400]} />
        <meshStandardMaterial 
          color={terrainTex ? "#ffffff" : "#3a3a4a"} 
          map={terrainTex || undefined}
          roughness={0.7} 
          metalness={0.1} 
          emissive={forceEmissive ? (terrainTex ? "#ffffff" : "#222222") : "#000000"}
          emissiveIntensity={forceEmissive ? 0.5 : 0}
        />
      </mesh>
      <gridHelper args={[400, 20, ARL_COLORS.teal, "#1a1a24"]} position={[0, 0.05, 0]} />
    </group>
  );
};

const AgentModelWrapper = ({ agent, isLocal = false }: { agent: Agent; isLocal?: boolean }) => {
  const groupRef = useRef<THREE.Group>(null);
  const [model, setModel] = useState<any>(null);
  const [animController, setAnimController] = useState<any>(null);
  const forceEmissive = useStore(state => state.shaderSettings.forceEmissive);

  useEffect(() => {
    if (!agent) return;
    RobustnessEngine.wrap(() => {
      const appearance = agent.appearance || { skinTone: '#c68642', bodyScale: 1.0 };
      const humanoid = createHumanoidModel({
        skinTone: appearance.skinTone,
        bodyScale: (appearance.bodyScale || 1.0) * 1.5 
      });
      if (humanoid) {
        setModel(humanoid);
        const clips = createAnimationClips(humanoid.bones);
        const controller = new AnimationController(humanoid.mesh, clips);
        setAnimController(controller);
        
        if (humanoid.mesh.material instanceof THREE.MeshStandardMaterial) {
          if (forceEmissive) {
            humanoid.mesh.material.emissive = new THREE.Color(appearance.skinTone);
            humanoid.mesh.material.emissiveIntensity = 0.5;
          } else {
            humanoid.mesh.material.emissive = new THREE.Color(0x111111);
            humanoid.mesh.material.emissiveIntensity = 0.2;
          }
        }
      }
    }, null, "AgentModelCreation");
  }, [agent.id, agent.appearance?.skinTone, agent.appearance?.bodyScale, forceEmissive]);

  useEffect(() => {
    if (animController && agent.state) animController.playForState(agent.state);
  }, [agent.state, animController]);

  useFrame((_state, delta) => {
    if (animController) animController.update(delta);
    if (groupRef.current && agent.position) {
      const targetPos = new THREE.Vector3(agent.position.x, 0, agent.position.z);
      groupRef.current.position.lerp(targetPos, isLocal ? 0.3 : 0.1);
    }
  });

  if (!model) return null;

  const lastThought = agent.memoryCache && agent.memoryCache.length > 0 
    ? agent.memoryCache[agent.memoryCache.length - 1] 
    : agent.state === AgentState.IDLE ? "Calculating Cycle..." : `Status: ${agent.state}`;

  return (
    <group ref={groupRef}>
      <primitive object={model.group} />
      {isLocal && <pointLight position={[0, 3, 0]} intensity={50} color="#60D4FF" distance={100} />}
      <Html position={[0, 4.0, 0]} center distanceFactor={15}>
        <div className="flex flex-col items-center gap-2 pointer-events-none">
          <div className="bg-black/80 backdrop-blur-md border border-axiom-cyan/40 px-3 py-1.5 rounded-2xl shadow-2xl animate-bounce">
            <p className="text-[9px] font-medium text-axiom-cyan italic whitespace-nowrap">{String(lastThought)}</p>
          </div>
          <div className={`px-4 py-1 rounded-full bg-black/60 border-2 ${isLocal ? 'border-axiom-cyan shadow-[0_0_15px_rgba(6,182,212,0.5)]' : 'border-white/10'} text-white text-[10px] font-black uppercase tracking-[0.2em] backdrop-blur-md italic whitespace-nowrap`}>
            {agent.displayName || agent.name || "Pilot"}
          </div>
        </div>
      </Html>
    </group>
  );
};

const CameraController = () => {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);
  const controlledAgentId = useStore(state => state.controlledAgentId);
  const agents = useStore(state => state.agents);
  const controlledAgent = useMemo(() => agents.find(a => a.id === controlledAgentId), [agents, controlledAgentId]);

  useFrame(() => {
    if (controlledAgent && controlledAgent.position) {
      const { x, z } = controlledAgent.position;
      const targetPos = new THREE.Vector3(x, 20, z + 50); 
      const lookAtPos = new THREE.Vector3(x, 2, z); 
      
      camera.position.lerp(targetPos, 0.1);
      camera.lookAt(lookAtPos);
      
      if (controlsRef.current) {
        controlsRef.current.target.lerp(lookAtPos, 0.1);
        controlsRef.current.update();
      }
    }
  });

  return <OrbitControls ref={controlsRef} makeDefault enableDamping dampingFactor={0.05} maxPolarAngle={Math.PI / 2.1} minDistance={5} maxDistance={1500} />;
};

const WorldContent = ({ localPlayerId }: { localPlayerId?: string | null }) => {
  const agents = useStore(state => state.agents) || [];
  const chunks = useStore(state => state.loadedChunks) || [];
  const settings = useStore(state => state.shaderSettings);
  
  const localAgent = useMemo(() => agents.find(a => a.id === localPlayerId), [agents, localPlayerId]);
  const otherAgents = useMemo(() => agents.filter(a => a.id !== localPlayerId), [agents, localPlayerId]);

  const { pois } = useMemo(() => {
    const allPois: any[] = [];
    chunks.forEach(c => {
      const content = WorldBuildingService.generateAxiomaticContent(c);
      content.pois.forEach(p => allPois.push({ ...p, seed: c.seed }));
    });
    return { pois: allPois };
  }, [chunks]);

  return (
    <>
      {settings.enableStars && <Stars radius={400} depth={80} count={25000} factor={8} saturation={0} fade speed={1.5} />}
      {settings.enableSky && <Sky sunPosition={[100, 20, 100]} turbidity={0.1} rayleigh={0.5} />}
      {chunks.map(c => <ChunkTerrain key={c.id} chunk={c} />)}
      {localAgent && <LocalPlayerController agent={localAgent} />}
      {otherAgents.map(a => <AgentModelWrapper key={a.id} agent={a} />)}
      {pois.map(p => {
        if (p.type === 'BUILDING' || p.type === 'WALL') return <HighScienceSpire key={p.id} position={p.position} rotationY={p.rotationY} color={ARL_COLORS.arcane} seed={p.seed} />;
        return null;
      })}
      <ContactShadows resolution={1024} scale={150} blur={2.5} opacity={0.5} far={15} color="#000000" />
    </>
  );
}

const LocalPlayerController = ({ agent }: { agent: Agent }) => {
  const { virtualInput, controlMode, targetPosition, setAgents, agents } = useStore();
  const moveSpeed = 1.0; 
  
  useFrame(() => {
    if (!agent || !agent.position) return;
    let moving = false;
    let dx = 0; let dz = 0;
    
    if ((controlMode === 'JOYSTICK' || controlMode === 'KEYBOARD') && (Math.abs(virtualInput.x) > 0.05 || Math.abs(virtualInput.z) > 0.05)) {
      dx = virtualInput.x * moveSpeed; 
      dz = virtualInput.z * moveSpeed; 
      moving = true;
    } 
    else if (targetPosition && controlMode === 'PUSH_TO_WALK') {
      const diffX = targetPosition.x - agent.position.x;
      const diffZ = targetPosition.z - agent.position.z;
      const dist = Math.hypot(diffX, diffZ);
      if (dist > 0.5) { 
        dx = (diffX / dist) * moveSpeed; 
        dz = (diffZ / dist) * moveSpeed; 
        moving = true; 
      }
    }

    if (moving) {
      setAgents(agents.map(a => a.id === agent.id ? { 
        ...a, 
        position: { ...a.position, x: a.position.x + dx, z: a.position.z + dz }, 
        state: AgentState.EXPLORING 
      } : a));
    } else if (agent.state !== AgentState.IDLE) {
      setAgents(agents.map(a => a.id === agent.id ? { ...a, state: AgentState.IDLE } : a));
    }
  });
  return <AgentModelWrapper agent={agent} isLocal />;
};

const World3D = ({ localPlayerId }: { tick: number, civilizationIndex: number, localPlayerId?: string | null }) => {
  const setTargetPosition = useStore(state => state.setTargetPosition);
  const controlMode = useStore(state => state.controlMode);
  const settings = useStore(state => state.shaderSettings);

  return (
    <div className="w-full h-full bg-[#010102] touch-none">
      <Suspense fallback={<div className="w-full h-full flex items-center justify-center text-axiom-cyan font-headline animate-pulse uppercase tracking-[0.5em] text-xl">Initialisation...</div>}>
        <Canvas gl={{ antialias: true, logarithmicDepthBuffer: true }} shadows onPointerDown={(e) => controlMode === 'PUSH_TO_WALK' && setTargetPosition({ x: e.point.x, y: 0, z: e.point.z })}>
          <PerspectiveCamera makeDefault position={[100, 100, 100]} fov={45} far={5000} />
          <CameraController />
          {settings.enableAmbient && <ambientLight intensity={10.0} />}
          {settings.enableHemisphere && <hemisphereLight intensity={8.5} groundColor="#050508" color="#ffffff" />}
          {settings.enableDirectional && <directionalLight position={[100, 200, 100]} intensity={12.0} castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-0.0005} />}
          <pointLight position={[0, 50, 0]} intensity={50} color="#60D4FF" />
          {settings.enableEnvironment && <Environment preset="city" />}
          <WorldContent localPlayerId={localPlayerId} />
          {settings.enableFog && <fog attach="fog" args={["#010102", 200, 3000]} />}
        </Canvas>
      </Suspense>
    </div>
  );
}

export default World3D;