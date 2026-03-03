
"use client"

import { useFirestore, useDoc, useMemoFirebase, useCollection, useUser } from "@/firebase"
import { doc, collection, query, limit } from "firebase/firestore"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/AppSidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Globe, 
  Shield, 
  Activity, 
  Maximize2,
  Minimize2,
  RefreshCw,
  AlertCircle,
  Unplug,
  Gamepad2,
  Monitor,
  Smartphone,
  ShieldCheck,
  AlertTriangle,
  Key
} from "lucide-react"
import { useState, useEffect } from "react"
import { World3D } from "@/components/game/World3D"
import { useStore } from "@/store"
import { WorldBuildingService } from "@/services/WorldBuildingService"
import { MobileControls } from "@/components/game/MobileControls"
import { AxiomHandshakeModal } from "@/components/game/AxiomHandshakeModal"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function WorldPreviewPage() {
  const db = useFirestore()
  const { user, isUserLoading } = useUser()
  
  // Selector fixed to ensure correct function mapping
  const isMobile = useStore(state => state.device.isMobile);
  const setIsMobile = useStore(state => state.setIsMobile);
  const isAxiomAuthenticated = useStore(state => state.isAxiomAuthenticated);
  const userApiKey = useStore(state => state.userApiKey);
  const setUserApiKey = useStore(state => state.setUserApiKey);
  const setAgents = useStore(state => state.setAgents);
  const setUserState = useStore(state => state.setUser);
  const setChunks = useStore(state => state.setChunks);
  
  const worldRef = useMemoFirebase(() => db ? doc(db, "worldState", "global") : null, [db])
  const { data: worldState, isLoading: isWorldLoading } = useDoc(worldRef)
  
  const playersQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "players"), limit(50));
  }, [db]);
  const { data: liveAgents, isLoading: isAgentsLoading } = useCollection(playersQuery);

  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showHandshake, setShowHandshake] = useState(false)
  const [currentEra, setCurrentEra] = useState("Awaiting Logic Core")

  useEffect(() => {
    if (user && setUserState) {
      setUserState({ id: user.uid, name: user.displayName || 'Pilot', email: user.email || '' })
    }
  }, [user, setUserState]);

  useEffect(() => {
    if (!userApiKey && setUserApiKey) {
      setUserApiKey("MOCK_OUROBOROS_KEY");
    }
  }, [userApiKey, setUserApiKey]);

  useEffect(() => {
    if (user?.email === 'projectouroboroscollective@gmail.com' && !isAxiomAuthenticated) {
      setShowHandshake(true);
    }
  }, [user?.email, isAxiomAuthenticated]);

  useEffect(() => {
    const checkDevice = () => {
      const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      if (setIsMobile) {
        setIsMobile(isTouch || window.innerWidth < 1024);
      }
    };
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, [setIsMobile]);

  useEffect(() => {
    if (liveAgents && setAgents) {
      setAgents(liveAgents as any);
    }
  }, [liveAgents, setAgents]);

  useEffect(() => {
    if (worldState) {
      const ci = worldState.civilizationIndex || 0
      if (ci < 400) setCurrentEra("Primitive Frontier")
      else if (ci < 800) setCurrentEra("Industrial Hub")
      else setCurrentEra("Chrome Metropolis")

      const mockChunk = {
        id: "0_0", x: 0, z: 0, seed: 42, 
        biome: 'CITY',
        cellType: 'SANCTUARY',
        entropy: 0.1, stabilityIndex: 0.9, corruptionLevel: 0.05, resourceData: {},
        logicField: Array(8).fill(0).map(() => Array(8).fill(0).map(() => ({ vx: Math.random() * 0.1, vz: Math.random() * 0.1, magnitude: 0.1 }))),
        axiomaticData: Array(8).fill(0).map(() => Array(8).fill(0).map(() => 0.5 + Math.random() * 0.5))
      };
      
      const content = WorldBuildingService.generateAxiomaticContent(mockChunk as any);
      if (setChunks) {
        setChunks([mockChunk as any]);
      }
      useStore.setState({ monsters: content.monsters });
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
        {showHandshake && <AxiomHandshakeModal onClose={() => setShowHandshake(false)} />}

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
              <RefreshCw className={`h-3 w-3 ${(worldState as any)?.tick ? 'animate-spin text-accent' : 'text-muted-foreground'}`} />
              <span>{(worldState as any)?.tick ? 'DETERMINISTIC_SYNC_ACTIVE' : 'SYNC_IDLE'}</span>
            </div>
          </div>
        </header>

        <main className={`p-6 space-y-6 max-w-7xl mx-auto w-full h-full ${isFullscreen ? 'fixed inset-0 z-[100] bg-background p-0 m-0 max-w-none' : ''}`}>
          <div className="grid gap-6 lg:grid-cols-12 h-[calc(100vh-120px)]">
            <Card className={`lg:col-span-8 border-border bg-card overflow-hidden flex flex-col relative ${isFullscreen ? 'rounded-none border-0 h-full' : 'shadow-2xl shadow-accent/10'}`}>
              <div className="absolute top-4 right-4 z-20 flex gap-2">
                <button onClick={() => setIsFullscreen(!isFullscreen)} className="p-2 bg-black/60 backdrop-blur-xl rounded-xl border border-white/10 hover:bg-black/80 transition-all">
                  {isFullscreen ? <Minimize2 className="h-4 w-4 text-white" /> : <Maximize2 className="h-4 w-4 text-white" />}
                </button>
              </div>

              <div className="relative flex-1 bg-black overflow-hidden">
                {isMobile && <MobileControls />}
                {(isWorldLoading || isAgentsLoading) ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-30"><RefreshCw className="h-12 w-12 animate-spin text-accent" /></div>
                ) : (
                  <World3D tick={(worldState as any)?.tick || 0} civilizationIndex={(worldState as any)?.civilizationIndex || 0} localPlayerId={user.uid} />
                )}
                
                <div className="absolute inset-0 pointer-events-none p-10 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className={`h-3 w-3 rounded-full ${(worldState as any)?.tick ? 'bg-accent heartbeat-pulse shadow-[0_0_15px_rgba(96,212,255,1)]' : 'bg-muted-foreground'}`} />
                      <span className="text-[12px] font-black text-white/90 uppercase tracking-[0.4em] italic drop-shadow-md">Axiom Core Protocol // {(worldState as any)?.tick ? 'ONLINE' : 'BOOT_PENDING'}</span>
                    </div>
                    <h2 className="text-6xl font-headline font-black text-white uppercase italic tracking-tighter drop-shadow-2xl">{currentEra}</h2>
                  </div>
                </div>
              </div>
            </Card>

            <div className={`lg:col-span-4 space-y-6 ${isFullscreen ? 'hidden' : ''}`}>
              <Card className="border-border bg-card shadow-lg">
                <CardHeader className="bg-secondary/10 border-b border-border/50">
                  <CardTitle className="text-xs font-black uppercase italic tracking-[0.3em] flex items-center gap-3 text-accent text-white">
                    <Shield className="h-4 w-4" /> Logic Core Event Log
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                   <div className="space-y-0 divide-y divide-border/50">
                    {(worldState as any)?.tick ? (
                      <>
                        <div className="px-6 py-4 text-[10px] font-black uppercase italic tracking-widest flex justify-between items-center hover:bg-accent/5 transition-colors">
                          <span className="text-accent">Epoch Sync Detected</span>
                          <span className="text-white font-mono">T-{(worldState as any).tick}</span>
                        </div>
                        <div className="px-6 py-4 text-[10px] font-black uppercase italic tracking-widest flex justify-between items-center hover:bg-accent/5 transition-colors">
                          <span className="text-muted-foreground italic text-white/60">Current Era</span>
                          <Badge variant="outline" className="text-[9px] border-accent/20 text-accent uppercase tracking-tighter">{currentEra}</Badge>
                        </div>
                      </>
                    ) : (
                      <div className="p-12 text-center">
                        <AlertCircle className="h-8 w-8 text-muted-foreground/20 mx-auto mb-2" />
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest italic text-white/40">Awaiting Core Signal...</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </SidebarInset>
    </div>
  )
}
