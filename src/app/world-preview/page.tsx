
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
  Gamepad2
} from "lucide-react"
import { useState, useEffect } from "react"
import { World3D } from "@/components/game/World3D"
import { useStore } from "@/store"
import { WorldBuildingService } from "@/services/WorldBuildingService"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function WorldPreviewPage() {
  const db = useFirestore()
  const { user } = useUser()
  const setAgents = useStore(state => state.setAgents)
  
  const worldRef = useMemoFirebase(() => db ? doc(db, "worldState", "global") : null, [db])
  const { data: worldState, isLoading: isWorldLoading } = useDoc(worldRef)
  
  const playersQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "players"), limit(50));
  }, [db]);
  const { data: liveAgents, isLoading: isAgentsLoading } = useCollection(playersQuery);

  const [isFullscreen, setIsFullscreen] = useState(false)
  const [currentEra, setCurrentEra] = useState("Awaiting Logic Core")

  useEffect(() => {
    if (liveAgents) {
      setAgents(liveAgents as any);
    }
  }, [liveAgents, setAgents]);

  useEffect(() => {
    if (worldState) {
      const ci = worldState.civilizationIndex || 0
      if (ci < 400) setCurrentEra("Primitive Frontier")
      else if (ci < 800) setCurrentEra("Industrial Hub")
      else setCurrentEra("Chrome Metropolis")

      // Generate mock high-science chunk data for visualization
      const mockChunk = {
        id: "0_0", x: 0, z: 0, seed: 42, 
        biome: ci < 400 ? 'PLAINS' : ci < 800 ? 'FOREST' : 'CITY',
        cellType: ci > 800 ? 'SANCTUARY' : 'WILDERNESS',
        entropy: 0.2, stabilityIndex: 0.8, corruptionLevel: 0.1, resourceData: {},
        logicField: Array(8).fill(0).map(() => Array(8).fill(0).map(() => ({ vx: Math.random() * 0.2, vz: Math.random() * 0.2 }))),
        axiomaticData: Array(8).fill(0).map(() => Array(8).fill(0).map(() => Math.random()))
      };
      
      const content = WorldBuildingService.generateAxiomaticContent(mockChunk as any);
      useStore.getState().setChunks([mockChunk as any]);
      useStore.setState({ monsters: content.monsters });
    }
  }, [worldState]);

  if (!user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background p-12">
        <Card className="max-w-md w-full border-border bg-card text-center p-12 space-y-6 shadow-2xl">
          <Unplug className="h-16 w-16 text-destructive mx-auto mb-4 animate-pulse" />
          <h2 className="text-3xl font-headline font-black uppercase italic tracking-tighter">Neural Link Severed</h2>
          <p className="text-muted-foreground">You must establish a neural connection to access the live render viewport.</p>
          <Button asChild className="w-full axiom-gradient text-white h-14 rounded-xl font-black italic uppercase tracking-widest">
            <Link href="/landing">Initialize Link</Link>
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
             <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-[10px] font-black border border-border tracking-widest italic text-white">
              <RefreshCw className={`h-3 w-3 ${(worldState as any)?.tick ? 'animate-spin text-accent' : 'text-muted-foreground'}`} />
              <span>{(worldState as any)?.tick ? 'DETERMINISTIC_SYNC_ACTIVE' : 'SYNC_IDLE'}</span>
            </div>
            <Badge variant="outline" className="text-accent border-accent font-black text-[10px] tracking-widest uppercase italic">Render_Layer_0</Badge>
          </div>
        </header>

        <main className={`p-6 space-y-6 max-w-7xl mx-auto w-full transition-all duration-500 ${isFullscreen ? 'fixed inset-0 z-[100] bg-background p-0 m-0 max-w-none' : ''}`}>
          <div className="grid gap-6 lg:grid-cols-12 h-full">
            <Card className={`lg:col-span-8 border-border bg-card overflow-hidden flex flex-col relative group ${isFullscreen ? 'rounded-none border-0 h-full' : 'aspect-video shadow-2xl shadow-accent/10'}`}>
              <div className="absolute top-4 right-4 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex items-center gap-2 px-4 py-2 bg-black/60 backdrop-blur-xl rounded-xl border border-white/10 text-[10px] font-black text-white uppercase italic tracking-widest">
                  <Gamepad2 className="h-3 w-3 text-accent" /> Use WASD to Navigate
                </div>
                <button 
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="p-2 bg-black/60 backdrop-blur-xl rounded-xl border border-white/10 hover:bg-black/80 transition-all"
                >
                  {isFullscreen ? <Minimize2 className="h-4 w-4 text-white" /> : <Maximize2 className="h-4 w-4 text-white" />}
                </button>
              </div>

              <div className="relative flex-1 bg-black overflow-hidden">
                {(isWorldLoading || isAgentsLoading) ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-30">
                    <RefreshCw className="h-12 w-12 animate-spin text-accent" />
                  </div>
                ) : (
                  <World3D 
                    tick={(worldState as any)?.tick || 0} 
                    civilizationIndex={(worldState as any)?.civilizationIndex || 0} 
                    localPlayerId={user.uid}
                  />
                )}
                
                <div className="absolute inset-0 pointer-events-none p-10 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className={`h-3 w-3 rounded-full ${(worldState as any)?.tick ? 'bg-accent heartbeat-pulse shadow-[0_0_15px_rgba(96,212,255,1)]' : 'bg-muted-foreground'}`} />
                      <span className="text-[12px] font-black text-white/90 uppercase tracking-[0.4em] italic drop-shadow-md">Axiom Core Protocol // {(worldState as any)?.tick ? 'ONLINE' : 'BOOT_PENDING'}</span>
                    </div>
                    <h2 className="text-6xl font-headline font-black text-white uppercase italic tracking-tighter drop-shadow-2xl">{currentEra}</h2>
                  </div>

                  <div className="flex justify-between items-end">
                    <div className="space-y-6 max-w-md">
                      <div className="space-y-2">
                        <div className="flex justify-between text-[11px] text-white/70 font-black uppercase tracking-[0.2em]">
                          <span>Civilization Index</span>
                          <span>{(worldState as any)?.civilizationIndex?.toFixed(1) || "0.0"} / 1000</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden backdrop-blur-md">
                          <div 
                            className="h-full bg-accent transition-all duration-1000" 
                            style={{ width: `${(((worldState as any)?.civilizationIndex || 0) / 1000) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-2">
                      <div className="text-[10px] text-white/50 font-black uppercase tracking-[0.4em] italic">Telemetry_Stream</div>
                      <Badge variant={(worldState as any)?.tick ? 'default' : 'secondary'} className={`${(worldState as any)?.tick ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' : 'opacity-40'} px-6 py-2 text-xs font-black italic tracking-widest uppercase`}>
                        {(worldState as any)?.tick ? 'Persistent Sync Active' : 'Waiting for Logic Core'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <div className={`lg:col-span-4 space-y-6 ${isFullscreen ? 'hidden' : ''}`}>
              <Card className="border-border bg-card shadow-lg">
                <CardHeader className="bg-secondary/10 border-b border-border/50">
                  <CardTitle className="text-xs font-black uppercase italic tracking-[0.3em] flex items-center gap-3 text-accent">
                    <Activity className="h-4 w-4" />
                    Neural Telemetry
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  {[
                    { label: "Stability", value: (worldState as any)?.stability || 0, color: "bg-blue-500" },
                    { label: "Corruption", value: (worldState as any)?.corruption || 0, color: "bg-red-500" },
                    { label: "Economy", value: (worldState as any)?.economy || 0, color: "bg-emerald-500" },
                    { label: "Military", value: (worldState as any)?.military || 0, color: "bg-rose-500" },
                  ].map((stat) => (
                    <div key={stat.label} className="space-y-2">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                        <span className="text-muted-foreground italic text-white/60">{stat.label}</span>
                        <span className="text-white font-bold">{stat.value}</span>
                      </div>
                      <div className="h-1 w-full bg-secondary rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${stat.color} transition-all duration-1000`} 
                          style={{ width: `${(stat.value / 1000) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-border bg-card shadow-lg">
                <CardHeader className="bg-secondary/10 border-b border-border/50">
                  <CardTitle className="text-xs font-black uppercase italic tracking-[0.3em] flex items-center gap-3 text-accent text-white">
                    <Shield className="h-4 w-4" />
                    Logic Core Event Log
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
                        <div className="px-6 py-4 text-[10px] font-black uppercase italic tracking-widest flex justify-between items-center hover:bg-accent/5 transition-colors">
                          <span className="text-muted-foreground italic text-white/60">Rendering Engine</span>
                          <span className="text-emerald-500 font-bold">R3F_SKELETAL_ACTIVE</span>
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
