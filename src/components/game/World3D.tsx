
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
          color={archTex ? "#ffffff" : ARL_COLORS.void} 
          map={archTex}
          metalness={0.9} 
          roughness={0.1} 
          emissive={color} 
          emissiveIntensity={0.2} 
        />
      </mesh>
      <Float speed={3} rotationIntensity={4} floatIntensity={2}>
        <mesh position={[0, 35, 0]} scale={3}>
          <octahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} toneMapped={false} />
        </mesh>
      </Float>
      <pointLight position={[0, 35, 0]} intensity={2} color={color} distance={150} decay={2} />
    </group>
  );
};

const ChunkTerrain = ({ chunk }: { chunk: Chunk }) => {
  const [terrainTex, setTerrainTex] = useState<THREE.Texture | null>(null);
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
          color={terrainTex ? "#ffffff" : ARL_COLORS.ground} 
          map={terrainTex}
          roughness={0.8} 
          metalness={0.2} 
        />
      </mesh>
      <gridHelper args={[400, 10, ARL_COLORS.border, "#050508"]} position={[0, 0.05, 0]} />
    </group>
  );
};

const ResourceNodeMesh = ({ node }: { node: ResourceNode }) => {
  const color = node.type === 'GOLD_ORE' ? ARL_COLORS.gold : node.type === 'IRON_ORE' ? '#71717a' : node.type === 'WOOD' ? '#78350f' : ARL_COLORS.teal;
  return (
    <group position={[node.position[0], 0, node.position[2]]}>
      <mesh position={[0, 1, 0]} castShadow>
        {node.type === 'WOOD' ? <cylinderGeometry args={[0.5, 1.5, 8, 8]} /> : <dodecahedronGeometry args={[2, 0]} />}
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.4} />
      </mesh>
      <Html position={[0, 6, 0]} center>
        <div className="text-[8px] font-black text-white/40 uppercase tracking-widest bg-black/40 px-2 py-0.5 rounded">{node.type}</div>
      </Html>
    </group>
  );
};

const MonsterMesh = ({ monster }: { monster: Monster }) => {
  const [model, setModel] = useState<any>(null);
  const [animController, setAnimController] = useState<any>(null);

  useEffect(() => {
    try {
      const humanoid = createHumanoidModel({ skinTone: monster.color, bodyScale: monster.scale * 4.0 });
      if (humanoid) {
        setModel(humanoid);
        const clips = createAnimationClips(humanoid.bones);
        const controller = new AnimationController(humanoid.mesh, clips);
        setAnimController(controller);
      }
    } catch (e) {}
  }, [monster.color, monster.scale]);

  useFrame((_state, delta) => {
    if (animController) animController.update(delta);
  });

  return (
    <group position={[monster.position[0], 0, monster.position[2]]} rotation={[0, monster.rotationY, 0]}>
      {model ? <primitive object={model.group} /> : (
        <mesh position={[0, monster.scale, 0]} castShadow>
          <boxGeometry args={[monster.scale, monster.scale, monster.scale]} />
          <meshStandardMaterial color={monster.color} emissive={monster.color} emissiveIntensity={0.5} />
        </mesh>
      )}
      <Html position={[0, monster.scale + 5, 0]} center distanceFactor={25}>
        <div className="text-[9px] font-black text-red-400 uppercase italic bg-black/80 px-2 py-0.5 rounded border border-red-500/20">{monster.name}</div>
      </Html>
    </group>
  );
};

const AgentModelWrapper = ({ agent, isLocal = false }: { agent: Agent; isLocal?: boolean }) => {
  const groupRef = useRef<THREE.Group>(null);
  const [model, setModel] = useState<any>(null);
  const [animController, setAnimController] = useState<any>(null);

  useEffect(() => {
    if (!agent) return;
    try {
      const appearance = agent.appearance || { skinTone: '#c68642', bodyScale: 1.0 };
      const humanoid = createHumanoidModel({
        skinTone: appearance.skinTone,
        bodyScale: (appearance.bodyScale || 1.0) * 8.0 
      });
      if (humanoid) {
        setModel(humanoid);
        const clips = createAnimationClips(humanoid.bones);
        const controller = new AnimationController(humanoid.mesh, clips);
        setAnimController(controller);
      }
    } catch (e) {}
  }, [agent.id, agent.appearance?.skinTone, agent.appearance?.bodyScale]);

  useEffect(() => {
    if (animController && agent.state) animController.playForState(agent.state);
  }, [agent.state, animController]);

  useFrame((_state, delta) => {
    if (animController) animController.update(delta);
    if (groupRef.current && !isLocal && agent.position) {
      groupRef.current.position.lerp(new THREE.Vector3(agent.position.x, 0, agent.position.z), 0.1);
    }
  });

  if (!model) return null;

  return (
    <group ref={groupRef} position={[agent.position?.x || 0, 0, agent.position?.z || 0]}>
      <primitive object={model.group} />
      <Html position={[0, 15, 0]} center distanceFactor={25}>
        <div className={`px-4 py-1.5 rounded-full bg-black/80 border-2 ${isLocal ? 'border-axiom-cyan' : 'border-white/10'} text-white text-[10px] font-black uppercase tracking-[0.2em] backdrop-blur-md italic pointer-events-none whitespace-nowrap shadow-xl`}>
          {agent.displayName || "Pilot"}
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
      const targetPos = new THREE.Vector3(x, 15, z + 40); 
      const lookAtPos = new THREE.Vector3(x, 8, z); 
      
      camera.position.lerp(targetPos, 0.1);
      camera.lookAt(lookAtPos);
      
      if (controlsRef.current) {
        controlsRef.current.target.lerp(lookAtPos, 0.1);
        controlsRef.current.update();
      }
    }
  });

  return <OrbitControls ref={controlsRef} makeDefault enableDamping dampingFactor={0.05} maxPolarAngle={Math.PI / 2.2} minDistance={10} maxDistance={150} />;
};

const WorldContent = ({ localPlayerId }: { localPlayerId?: string | null }) => {
  const agents = useStore(state => state.agents) || [];
  const chunks = useStore(state => state.loadedChunks) || [];
  const localAgent = useMemo(() => agents.find(a => a.id === localPlayerId), [agents, localPlayerId]);
  const otherAgents = useMemo(() => agents.filter(a => a.id !== localPlayerId), [agents, localPlayerId]);

  const { pois, monsters, resources } = useMemo(() => {
    const allPois: any[] = [];
    const allMonsters: Monster[] = [];
    const allResources: ResourceNode[] = [];
    chunks.forEach(c => {
      const content = WorldBuildingService.generateAxiomaticContent(c);
      content.pois.forEach(p => allPois.push({ ...p, seed: c.seed }));
      allMonsters.push(...content.monsters);
      allResources.push(...content.resources);
    });
    return { pois: allPois, monsters: allMonsters, resources: allResources };
  }, [chunks]);

  return (
    <>
      <Stars radius={300} depth={60} count={20000} factor={7} saturation={0} fade speed={1} />
      <Sky sunPosition={[100, 20, 100]} />
      {chunks.map(c => <ChunkTerrain key={c.id} chunk={c} />)}
      {localAgent && <LocalPlayerController agent={localAgent} />}
      {otherAgents.map(a => <AgentModelWrapper key={a.id} agent={a} />)}
      {resources.map(r => <ResourceNodeMesh key={r.id} node={r} />)}
      {monsters.map(m => <MonsterMesh key={m.id} monster={m} />)}
      {pois.map(p => {
        if (p.type === 'BUILDING' || p.type === 'WALL') return <HighScienceSpire key={p.id} position={p.position} rotationY={p.rotationY} color={ARL_COLORS.arcane} seed={p.seed} />;
        if (p.type === 'SHRINE') return (
          <group key={p.id} position={p.position}>
            <Float speed={4} rotationIntensity={2} floatIntensity={5}>
              <mesh position={[0, 8, 0]} scale={2}><dodecahedronGeometry args={[1, 0]} /><meshStandardMaterial color={ARL_COLORS.teal} emissive={ARL_COLORS.teal} emissiveIntensity={3} toneMapped={false} /></mesh>
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

const LocalPlayerController = ({ agent }: { agent: Agent }) => {
  const { virtualInput, controlMode, targetPosition, setAgents, agents } = useStore();
  const moveSpeed = 6.0;
  useFrame(() => {
    if (!agent || !agent.position) return;
    let moving = false;
    let dx = 0; let dz = 0;
    if ((controlMode === 'JOYSTICK' || controlMode === 'KEYBOARD') && (Math.abs(virtualInput.x) > 0.1 || Math.abs(virtualInput.z) > 0.1)) {
      dx = virtualInput.x * moveSpeed; dz = virtualInput.z * moveSpeed; moving = true;
    } else if (targetPosition && controlMode === 'PUSH_TO_WALK') {
      const diffX = targetPosition.x - agent.position.x;
      const diffZ = targetPosition.z - agent.position.z;
      const dist = Math.hypot(diffX, diffZ);
      if (dist > 2.0) { dx = (diffX / dist) * moveSpeed; dz = (diffZ / dist) * moveSpeed; moving = true; }
    }
    if (moving) {
      setAgents(agents.map(a => a.id === agent.id ? { ...a, position: { ...a.position, x: a.position.x + dx, z: a.position.z + dz }, state: AgentState.EXPLORING } : a));
    } else if (agent.state !== AgentState.IDLE) {
      setAgents(agents.map(a => a.id === agent.id ? { ...a, state: AgentState.IDLE } : a));
    }
  });
  return <AgentModelWrapper agent={agent} isLocal />;
};

const World3D = ({ localPlayerId }: { tick: number, civilizationIndex: number, localPlayerId?: string | null }) => {
  const setTargetPosition = useStore(state => state.setTargetPosition);
  const controlMode = useStore(state => state.controlMode);
  return (
    <div className="w-full h-full bg-[#010102] touch-none">
      <Suspense fallback={<div className="w-full h-full flex items-center justify-center text-axiom-cyan font-headline animate-pulse uppercase tracking-[0.5em] text-xl">Materializing Reality...</div>}>
        <Canvas gl={{ antialias: true, logarithmicDepthBuffer: true }} shadows onPointerDown={(e) => controlMode === 'PUSH_TO_WALK' && setTargetPosition({ x: e.point.x, y: 0, z: e.point.z })}>
          <PerspectiveCamera makeDefault position={[60, 40, 60]} fov={45} far={5000} />
          <CameraController />
          <ambientLight intensity={0.2} />
          <directionalLight position={[100, 200, 100]} intensity={1.2} castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-0.0005} />
          <Environment preset="night" />
          <WorldContent localPlayerId={localPlayerId} />
          <fog attach="fog" args={["#010102", 100, 1500]} />
        </Canvas>
      </Suspense>
    </div>
  );
}

export default World3D;
