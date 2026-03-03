"use client"

import { useState } from "react"
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
  Cpu, 
  Copy,
  Code,
  Eye,
  Zap
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { firebaseConfig } from "@/firebase/config"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

const SCRIPTS = [
  { name: 'FirebaseConnector.gd', path: '/godot/FirebaseConnector.gd' },
  { name: 'WorldSync.gd', path: '/godot/WorldSync.gd' },
  { name: 'TextureManager.gd', path: '/godot/TextureManager.gd' }
]

export default function GodotBridgePage() {
  const { toast } = useToast()
  const [viewingScript, setViewingScript] = useState<{name: string, content: string} | null>(null)
  const [loadingScript, setLoadingScript] = useState(false)

  const copyToClipboard = (text: string, label: string) => {
    if (!text) return
    navigator.clipboard.writeText(text)
    toast({ title: `${label} Copied`, description: "Ready to paste into Godot." })
  }

  const fetchScript = async (script: typeof SCRIPTS[0]) => {
    setLoadingScript(true)
    try {
      const res = await fetch(script.path)
      const content = await res.text()
      setViewingScript({ name: script.name, content })
    } catch (e) {
      toast({ variant: "destructive", title: "Error", description: "Could not load script." })
    } finally {
      setLoadingScript(false)
    }
  }

  const downloadScripts = () => {
    SCRIPTS.forEach(script => {
      const link = document.createElement('a')
      link.href = script.path
      link.download = script.name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    })
    toast({ title: "Downloading", description: "Godot scripts are being downloaded." })
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
                    <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Project Name</span>
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard("Ouroboros", "Project Name")} className="h-6 text-[9px] hover:text-accent">
                      <Copy className="h-3 w-3 mr-1" /> Copy
                    </Button>
                  </div>
                  <div className="text-xs font-mono text-white bg-black/40 p-2 rounded border border-white/5 truncate">
                    Ouroboros
                  </div>

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
                <Button onClick={downloadScripts} className="w-full h-12 axiom-gradient text-white font-black italic uppercase tracking-widest shadow-xl">
                  <HardDriveDownload className="h-4 w-4 mr-2" /> Download Setup Scripts
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
                <Code className="h-4 w-4 text-accent" /> Connection Scripts
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid gap-4 md:grid-cols-3">
                {SCRIPTS.map(script => (
                  <Button 
                    key={script.name} 
                    variant="outline" 
                    className="justify-start gap-3 h-14 font-black uppercase italic text-xs border-white/10"
                    onClick={() => fetchScript(script)}
                  >
                    <Code className="h-4 w-4 text-accent" />
                    {script.name}
                    <Eye className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>

        <Dialog open={!!viewingScript} onOpenChange={() => setViewingScript(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] bg-black border-border overflow-hidden flex flex-col text-white">
            <DialogHeader>
              <DialogTitle className="text-accent font-headline italic uppercase">{viewingScript?.name}</DialogTitle>
              <DialogDescription>Preview of the Godot GDScript file.</DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-auto bg-zinc-900 p-4 rounded-lg border border-white/5">
              <pre className="text-xs font-mono text-zinc-300 whitespace-pre-wrap">
                {viewingScript?.content}
              </pre>
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <Button 
                variant="outline" 
                onClick={() => setViewingScript(null)}
                className="font-black uppercase italic text-xs border-white/10"
              >
                Close
              </Button>
              <Button 
                className="axiom-gradient text-white border-0 font-black italic uppercase text-xs"
                onClick={() => {
                  if (viewingScript) copyToClipboard(viewingScript.content, viewingScript.name)
                }}
              >
                <Copy className="h-3 w-3 mr-2" /> Copy Code
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </SidebarInset>
    </div>
  )
}
