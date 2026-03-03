"use client"

import { useFirestore, useDoc, useMemoFirebase } from "@/firebase"
import { doc } from "firebase/firestore"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/AppSidebar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Globe, 
  Zap, 
  Shield, 
  Cpu, 
  Activity, 
  Maximize2,
  Minimize2,
  RefreshCw,
  Box
} from "lucide-react"
import { useState, useEffect } from "react"
import Image from "next/image"
import { PlaceHolderImages } from "@/lib/placeholder-images"

export default function WorldPreviewPage() {
  const db = useFirestore()
  const worldRef = useMemoFirebase(() => db ? doc(db, "worldState", "global") : null, [db])
  const { data: worldState, isLoading } = useDoc(worldRef)
  
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [currentEra, setCurrentEra] = useState("Initializing Engine")
  const [eraImage, setEraImage] = useState(PlaceHolderImages.find(img => img.id === "world-primitive"))

  useEffect(() => {
    if (worldState) {
      const ci = worldState.civilizationIndex || 0
      if (ci < 400) {
        setCurrentEra("Primitive Frontier")
        setEraImage(PlaceHolderImages.find(img => img.id === "world-primitive"))
      } else if (ci < 800) {
        setCurrentEra("Industrial Hub")
        setEraImage(PlaceHolderImages.find(img => img.id === "world-industrial"))
      } else {
        setCurrentEra("Chrome Metropolis")
        setEraImage(PlaceHolderImages.find(img => img.id === "world-chrome"))
      }
    }
  }, [worldState])

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <AppSidebar />
      <SidebarInset className="flex flex-col overflow-auto">
        <header className="flex h-16 items-center border-b border-border px-6 justify-between shrink-0 bg-background/50 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <h1 className="text-xl font-headline font-semibold italic uppercase tracking-tight">Live Render Preview</h1>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-[10px] font-black border border-border tracking-widest">
              <RefreshCw className="h-3 w-3 animate-spin text-accent" />
              <span>DETERMINISTIC_SYNC_ACTIVE</span>
            </div>
            <Badge variant="outline" className="text-accent border-accent font-black text-[10px] tracking-widest uppercase italic">Render_Layer_0</Badge>
          </div>
        </header>

        <main className={`p-6 space-y-6 max-w-7xl mx-auto w-full transition-all duration-500 ${isFullscreen ? 'fixed inset-0 z-[100] bg-background p-0 m-0 max-w-none' : ''}`}>
          <div className="grid gap-6 lg:grid-cols-12 h-full">
            {/* Viewport Card */}
            <Card className={`lg:col-span-8 border-border bg-card overflow-hidden flex flex-col relative group ${isFullscreen ? 'rounded-none border-0 h-full' : 'aspect-video shadow-2xl shadow-accent/5'}`}>
              <div className="absolute top-4 right-4 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="p-2 bg-black/60 backdrop-blur-xl rounded-xl border border-white/10 hover:bg-black/80 transition-all"
                >
                  {isFullscreen ? <Minimize2 className="h-4 w-4 text-white" /> : <Maximize2 className="h-4 w-4 text-white" />}
                </button>
              </div>

              <div className="relative flex-1 bg-black overflow-hidden group">
                {eraImage && (
                  <Image 
                    src={eraImage.imageUrl} 
                    alt={currentEra} 
                    fill 
                    className="object-cover opacity-70 transition-all duration-[30s] scale-105 group-hover:scale-110"
                    priority
                    data-ai-hint={eraImage.imageHint}
                  />
                )}
                
                {/* Overlay UI */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40 pointer-events-none" />
                
                <div className="absolute top-10 left-10 space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-accent heartbeat-pulse shadow-[0_0_15px_rgba(96,212,255,1)]" />
                    <span className="text-[12px] font-black text-white/90 uppercase tracking-[0.4em] italic drop-shadow-md">Axiom Core Protocol // v0.9.4</span>
                  </div>
                  <h2 className="text-6xl font-headline font-black text-white uppercase italic tracking-tighter drop-shadow-2xl">{currentEra}</h2>
                </div>

                <div className="absolute bottom-10 left-10 right-10 flex justify-between items-end">
                  <div className="space-y-6 max-w-md">
                    <div className="space-y-2">
                      <div className="flex justify-between text-[11px] text-white/70 font-black uppercase tracking-[0.2em]">
                        <span>Civilization Index</span>
                        <span>{worldState?.civilizationIndex?.toFixed(1) || "0.0"} / 1000</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden backdrop-blur-md">
                        <div 
                          className="h-full bg-accent heartbeat-pulse shadow-[0_0_20px_rgba(96,212,255,0.8)] transition-all duration-1000" 
                          style={{ width: `${((worldState?.civilizationIndex || 0) / 1000) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex gap-8">
                      <div className="flex items-center gap-3">
                        <Activity className="h-5 w-5 text-accent" />
                        <span className="text-sm font-black text-white uppercase italic tracking-widest">TICK: {worldState?.tick || 0}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Box className="h-5 w-5 text-emerald-500" />
                        <span className="text-sm font-black text-white uppercase italic tracking-widest">RENDER_READY</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-2">
                    <div className="text-[10px] text-white/50 font-black uppercase tracking-[0.4em] italic">Telemetry_Stream</div>
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/40 px-6 py-2 text-xs font-black italic tracking-widest uppercase">Persistent Sync Active</Badge>
                  </div>
                </div>
                
                {/* Scanlines / Retro Effect */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.05)_50%),linear-gradient(90deg,rgba(255,0,0,0.01),rgba(0,255,0,0.005),rgba(0,0,255,0.01))] bg-[length:100%_4px,3px_100%] pointer-events-none opacity-40" />
              </div>
            </Card>

            {/* Sidebar Telemetry */}
            <div className={`lg:col-span-4 space-y-6 ${isFullscreen ? 'hidden' : ''}`}>
              <Card className="border-border bg-card">
                <CardHeader className="bg-secondary/10 border-b border-border/50">
                  <CardTitle className="text-xs font-black uppercase italic tracking-[0.3em] flex items-center gap-3 text-accent">
                    <Activity className="h-4 w-4" />
                    Neural Telemetry
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  {[
                    { label: "Stability", value: worldState?.stability || 0, color: "bg-blue-500" },
                    { label: "Corruption", value: worldState?.corruption || 0, color: "bg-red-500" },
                    { label: "Economy", value: worldState?.economy || 0, color: "bg-emerald-500" },
                    { label: "Military", value: worldState?.military || 0, color: "bg-rose-500" },
                  ].map((stat) => (
                    <div key={stat.label} className="space-y-2">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                        <span className="text-muted-foreground italic">{stat.label}</span>
                        <span className="text-white">{stat.value}</span>
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

              <Card className="border-border bg-card">
                <CardHeader className="bg-secondary/10 border-b border-border/50">
                  <CardTitle className="text-xs font-black uppercase italic tracking-[0.3em] flex items-center gap-3 text-accent">
                    <Shield className="h-4 w-4" />
                    Logic Core Log
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                   <div className="space-y-0 divide-y divide-border/50">
                    {[
                      { msg: `Epoch Sync: ${worldState?.tick || 0}`, type: "success" },
                      { msg: `Primary Era: ${currentEra}`, type: "info" },
                      { msg: "Godot Connector: ONLINE", type: "success" },
                      { msg: "Deterministic Heartbeat Active", type: "info" },
                    ].map((log, i) => (
                      <div key={i} className="px-6 py-3 text-[10px] font-black uppercase italic tracking-widest flex justify-between items-center hover:bg-accent/5 transition-colors">
                        <span className="text-muted-foreground">{log.msg}</span>
                        <div className={`h-2 w-2 rounded-full ${
                          log.type === 'success' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 
                          log.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                        }`} />
                      </div>
                    ))}
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
