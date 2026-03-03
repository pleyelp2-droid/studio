
"use client"

import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/AppSidebar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  HardDriveDownload, 
  Terminal, 
  Wifi, 
  ShieldCheck, 
  FileJson, 
  Cpu, 
  ExternalLink,
  Code,
  Copy,
  Zap
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { firebaseConfig } from "@/firebase/config"

export default function GodotBridgePage() {
  const { toast } = useToast()

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast({ title: `${label} Copied`, description: "Axiom parameters ready for Godot plugin." })
  }

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <AppSidebar />
      <SidebarInset className="flex flex-col overflow-auto">
        <header className="flex h-16 items-center border-b border-border px-6 justify-between shrink-0 bg-background/50 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <h1 className="text-xl font-headline font-semibold italic uppercase tracking-tight text-white">Godot Bridge Protocol</h1>
          </div>
          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/40 gap-2 font-black italic text-[10px]">
            <Wifi className="h-3 w-3 animate-pulse" /> REALTIME_SYNC_READY
          </Badge>
        </header>

        <main className="p-6 space-y-8 max-w-5xl mx-auto w-full">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-border bg-card shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <Cpu className="h-32 w-32" />
              </div>
              <CardHeader>
                <CardTitle className="text-xl font-headline font-black uppercase italic text-accent flex items-center gap-2">
                  <Terminal className="h-5 w-5" /> Axiom Configuration
                </CardTitle>
                <CardDescription>Master credentials for the Ouroboros Godot Firebase Plugin.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-xl bg-secondary/20 border border-border space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Project ID</span>
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(firebaseConfig.projectId, "Project ID")} className="h-6 text-[9px] hover:text-accent">
                      <Copy className="h-3 w-3 mr-1" /> Copy
                    </Button>
                  </div>
                  <div className="text-xs font-mono text-white bg-black/40 p-2 rounded border border-white/5 truncate">
                    {firebaseConfig.projectId}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">API Key</span>
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(firebaseConfig.apiKey, "API Key")} className="h-6 text-[9px] hover:text-accent">
                      <Copy className="h-3 w-3 mr-1" /> Copy
                    </Button>
                  </div>
                  <div className="text-xs font-mono text-white bg-black/40 p-2 rounded border border-white/5 truncate">
                    {firebaseConfig.apiKey}
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full h-12 axiom-gradient text-white font-black italic uppercase tracking-widest shadow-xl">
                  Download Setup Scripts
                </Button>
              </CardFooter>
            </Card>

            <Card className="border-border bg-card shadow-2xl overflow-hidden group">
              <CardHeader>
                <CardTitle className="text-xl font-headline font-black uppercase italic text-white flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-emerald-500" /> Synchronization Matrix
                </CardTitle>
                <CardDescription>Live telemetry stream status between React and Godot.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-1">
                    <div className="text-[8px] font-black text-muted-foreground uppercase">Firestore Stream</div>
                    <div className="text-sm font-bold text-emerald-500 italic">PASSIVE_LISTEN</div>
                  </div>
                  <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-1">
                    <div className="text-[8px] font-black text-muted-foreground uppercase">Auth State</div>
                    <div className="text-sm font-bold text-emerald-500 italic">SECURE_ACTIVE</div>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-accent/5 border border-accent/10 space-y-2">
                  <div className="text-[9px] font-black text-accent uppercase tracking-widest italic flex items-center gap-2">
                    <Zap className="h-3 w-3" /> Real-time Protocol Notes
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    The synchronization is now **fully automatic**. Any changes to Chunks, Quests, or NPC personalities in this dashboard are reflected in Godot the instant they are committed to the neural ledger.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border bg-card">
            <CardHeader className="bg-secondary/10 border-b border-border/50 p-6">
              <CardTitle className="text-sm font-black uppercase tracking-[0.3em] flex items-center gap-2">
                <HardDriveDownload className="h-4 w-4 text-accent" /> Integration Guide
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="flex gap-4 items-start">
                  <div className="h-8 w-8 rounded-lg bg-accent/20 border border-accent/30 flex items-center justify-center text-accent font-black italic text-xs shrink-0 mt-1">01</div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-widest text-white mb-1 italic">Install Firebase Plugin</h4>
                    <p className="text-[11px] text-muted-foreground">Download the **Godot Firebase Plugin** from the Asset Library. Enable it in your Project Settings.</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="h-8 w-8 rounded-lg bg-accent/20 border border-accent/30 flex items-center justify-center text-accent font-black italic text-xs shrink-0 mt-1">02</div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-widest text-white mb-1 italic">Configure Autoloads</h4>
                    <p className="text-[11px] text-muted-foreground">Add `FirebaseConnector.gd` and `WorldSync.gd` as Autoloads. These handle the neural handshake with Axiom Core.</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="h-8 w-8 rounded-lg bg-accent/20 border border-accent/30 flex items-center justify-center text-accent font-black italic text-xs shrink-0 mt-1">03</div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-widest text-white mb-1 italic">Map Civilization Index</h4>
                    <p className="text-[11px] text-muted-foreground">Attach `TextureManager.gd` to your 3D MeshInstance nodes. It will listen for CI updates and swap materials real-time.</p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-secondary/5 border-t border-border/50 p-6 flex justify-between gap-4">
              <Button variant="outline" className="border-white/10 text-white gap-2 font-black uppercase italic text-[10px] h-12 flex-1">
                <Code className="h-4 w-4" /> View Sample Scripts
              </Button>
              <Button className="axiom-gradient text-white border-0 gap-2 font-black uppercase italic text-[10px] h-12 flex-1">
                <FileJson className="h-4 w-4" /> Export Master Manifest
              </Button>
            </CardFooter>
          </Card>
        </main>
      </SidebarInset>
    </div>
  )
}
