"use client"

import { useEffect, useRef } from "react"
import { useStore } from "@/store"
import { useFirestore, useDoc, useMemoFirebase, useUser } from "@/firebase"
import { doc } from "firebase/firestore"
import dynamic from 'next/dynamic'
import { AgentState } from "@/types"

const World3D = dynamic(() => import('@/components/game/World3D'), { 
  ssr: false,
  loading: () => <div className="w-full h-screen bg-black flex items-center justify-center text-axiom-cyan font-headline animate-pulse">LOADING WORLD ENGINE...</div>
})

export default function WorldPreviewPage() {
  const { user } = useUser()
  const db = useFirestore()
  const { setChunks, setAgents } = useStore()
  const initializedRef = useRef(false)
  
  const worldRef = useMemoFirebase(() => db ? doc(db, "worldState", "global") : null, [db])
  const { data: worldState } = useDoc(worldRef)

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    // Initialize with a mock chunk if none exists
    const mockChunk = {
      id: "0_0", 
      x: 0, 
      z: 0, 
      seed: 1337, 
      biome: 'CITY' as const,
      entropy: 0.05, 
      stabilityIndex: 0.95, 
      corruptionLevel: 0.01, 
      resourceData: {},
      logicField: [],
      lastUpdate: new Date()
    };
    
    setChunks([mockChunk]);

    // Ensure there is at least one agent (the player)
    if (user) {
      setAgents([{
        id: user.uid,
        displayName: user.displayName || user.email?.split('@')[0] || "Pilot",
        npcClass: "PILOT",
        level: 1,
        hp: 100,
        maxHp: 100,
        exp: 0,
        str: 10,
        agi: 10,
        int: 10,
        vit: 10,
        position: { x: 0, y: 0, z: 0 },
        visionRange: 100,
        state: AgentState.IDLE,
        inventory: [],
        dnaHistory: [],
        memoryCache: [],
        awakened: false,
        lastUpdate: new Date(),
        appearance: {
          skinTone: '#c68642',
          hairStyle: 'short',
          bodyScale: 1.0
        }
      }]);
    }
  }, [user, setChunks, setAgents]);

  return (
    <div className="w-full h-screen bg-black overflow-hidden relative">
      <World3D 
        tick={worldState?.tick || 0} 
        civilizationIndex={worldState?.civilizationIndex || 0} 
        localPlayerId={user?.uid} 
      />
      
      {/* HUD Overlay */}
      <div className="absolute top-8 left-8 z-10 pointer-events-none">
        <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-6 rounded-2xl space-y-2">
          <div className="text-[10px] font-black text-axiom-cyan uppercase tracking-[0.3em] italic">Simulation Status</div>
          <div className="text-3xl font-headline font-black text-white italic tracking-tighter uppercase">
            CI: {worldState?.civilizationIndex?.toFixed(2) || "0.00"}
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] font-bold text-white/60 uppercase">Sync Active: Tick {worldState?.tick || 0}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
