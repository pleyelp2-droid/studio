"use client"

import { useFirestore, useDoc, useMemoFirebase, useUser } from "@/firebase"
import { doc } from "firebase/firestore"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/AppSidebar"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, Unplug, ShieldCheck, Key } from "lucide-react"
import { useState, useEffect } from "react"
import { World3D } from "@/components/game/World3D"
import { useStore } from "@/store"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function WorldPreviewPage() {
  const db = useFirestore()
  const { user, isUserLoading } = useUser()
  
  const isAxiomAuthenticated = useStore(state => state.isAxiomAuthenticated)
  const userApiKey = useStore(state => state.userApiKey)
  const setAgents = useStore(state => state.setAgents)
  const setUserState = useStore(state => state.setUser)
  const setChunks = useStore(state => state.setChunks)
  
  const worldRef = useMemoFirebase(() => db ? doc(db, "worldState", "global") : null, [db])
  const { data: worldState, isLoading: isWorldLoading } = useDoc(worldRef)
  
  const [currentEra, setCurrentEra] = useState("Awaiting Logic Core")

  useEffect(() => {
    if (user && setUserState) {
      setUserState({ id: user.uid, name: user.displayName || 'Pilot', email: user.email || '' })
    }
  }, [user, setUserState]);

  useEffect(() => {
    if (worldState) {
      const ci = worldState.civilizationIndex || 0
      if (ci < 400) setCurrentEra("Primitive Frontier")
      else if (ci < 800) setCurrentEra("Industrial Hub")
      else setCurrentEra("Chrome Metropolis")

      const mockChunk = {
        id: "0_0", x: 0, z: 0, seed: 42, 
        biome: 'CITY' as const,
        entropy: 0.1, stabilityIndex: 0.9, corruptionLevel: 0.05, resourceData: {},
        logicField: [],
        lastUpdate: new Date()
      };
      
      if (setChunks) {
        setChunks([mockChunk]);
      }
    }
  }, [worldState, setChunks]);

  if (isUserLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <RefreshCw className="h-12 w-12 animate-spin text-accent" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background p-12">
        <Card className="max-w-md w-full border-border bg-card text-center p-12 space-y-6 shadow-2xl">
          <Unplug className="h-16 w-16 text-destructive mx-auto mb-4 animate-pulse" />
          <h2 className="text-3xl font-headline font-black uppercase italic tracking-tighter">Neural Link Severed</h2>
          <p className="text-muted-foreground">You must establish a neural connection to access the live render viewport.</p>
          <Button asChild className="w-full axiom-gradient text-white h-14 rounded-xl font-black italic uppercase tracking-widest">
            <Link href="/">Initialize Link</Link>
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <AppSidebar />
      <SidebarInset className="flex flex-col overflow-auto">
        <header className="flex h-16 items-center border-b border-border px-6 justify-between shrink-0 bg-background/50 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <h1 className="text-xl font-headline font-semibold italic uppercase tracking-tight text-white">Live Render Viewport</h1>
          </div>
          <div className="flex items-center gap-4">
             {isAxiomAuthenticated && <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/40 gap-2"><ShieldCheck className="h-3 w-3" /> OVERSEER_ACTIVE</Badge>}
             {!isAxiomAuthenticated && userApiKey === "MOCK_OUROBOROS_KEY" && (
               <Badge variant="outline" className="text-orange-500 border-orange-500/30 gap-2">
                 <Key className="h-3 w-3" /> MOCK_AI_MODE
               </Badge>
             )}
             <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-[10px] font-black border border-border tracking-widest italic text-white">
              <RefreshCw className={`h-3 w-3 ${worldState?.tick ? 'animate-spin text-accent' : 'text-muted-foreground'}`} />
              <span>{worldState?.tick ? 'DETERMINISTIC_SYNC_ACTIVE' : 'SYNC_IDLE'}</span>
            </div>
          </div>
        </header>

        <main className="p-6 space-y-6 max-w-7xl mx-auto w-full h-full">
          <div className="grid gap-6 lg:grid-cols-12 h-full">
            <Card className="lg:col-span-12 border-border bg-card overflow-hidden flex flex-col relative shadow-2xl shadow-accent/10">
              <div className="relative flex-1 bg-black overflow-hidden">
                <World3D 
                  tick={worldState?.tick || 0} 
                  civilizationIndex={worldState?.civilizationIndex || 0} 
                  localPlayerId={user.uid} 
                />
                <div className="absolute inset-0 pointer-events-none p-10 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className={`h-3 w-3 rounded-full ${worldState?.tick ? 'bg-accent heartbeat-pulse shadow-[0_0_15px_rgba(96,212,255,1)]' : 'bg-muted-foreground'}`} />
                      <span className="text-[12px] font-black text-white/90 uppercase tracking-[0.4em] italic drop-shadow-md">Axiom Core Protocol // {worldState?.tick ? 'ONLINE' : 'BOOT_PENDING'}</span>
                    </div>
                    <h2 className="text-6xl font-headline font-black text-white uppercase italic tracking-tighter drop-shadow-2xl">{currentEra}</h2>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </main>
      </SidebarInset>
    </div>
  )
}
