
"use client"

import { useState } from "react"
import { useFirestore, useUser } from "@/firebase"
import { doc, setDoc, serverTimestamp } from "firebase/firestore"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/AppSidebar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { 
  Sparkles, 
  Loader2, 
  Fingerprint, 
  UserPlus, 
  Dna,
  ShieldCheck,
  ChevronRight,
  Monitor
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export default function CharacterCreatorPage() {
  const { user } = useUser()
  const db = useFirestore()
  const router = useRouter()
  const { toast } = useToast()
  
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState("")
  const [npcClass, setNpcClass] = useState("PILOT")
  const [race, setRace] = useState("HUMAN")
  const [skinTone, setSkinTone] = useState("#d1a37c")
  const [stats, setStats] = useState({ str: 10, agi: 10, int: 10, vit: 10 })

  const handleCreate = async () => {
    if (!db || !user || !name) return
    setLoading(true)
    try {
      await setDoc(doc(db, "players", user.uid), {
        id: user.uid,
        displayName: name,
        npcClass,
        race,
        level: 1,
        hp: stats.vit * 10,
        maxHp: stats.vit * 10,
        exp: 0,
        ...stats,
        position: { x: Math.random() * 20, y: 0, z: Math.random() * 20 },
        visionRange: 50,
        state: 'IDLE',
        inventory: [],
        dnaHistory: [],
        memoryCache: [],
        awakened: false,
        appearance: {
          skinTone,
          hairStyle: 'short',
          bodyScale: 1.0
        },
        lastUpdate: serverTimestamp(),
        createdAt: serverTimestamp()
      })
      toast({ title: "Neural Link Established", description: "Consciousness has been imprinted on the Ouroboros collective." })
      router.push("/pilot-hub")
    } catch (e: any) {
      toast({ variant: "destructive", title: "Imprint Failed", description: e.message })
    } finally {
      setLoading(false)
    }
  }

  const races = [
    { id: 'HUMAN', label: 'Human Signature', desc: 'Versatile neural architecture.' },
    { id: 'CYBORG', label: 'Augmented Shell', desc: 'Enhanced hardware compatibility.' },
    { id: 'ANOMALY', label: 'Void Manifest', desc: 'Unstable but high potential.' }
  ]

  const classes = [
    { id: 'PILOT', label: 'Standard Pilot', bonus: '+2 ALL' },
    { id: 'ENFORCER', label: 'Combat Enforcer', bonus: '+5 STR/VIT' },
    { id: 'TECH_WEAVER', label: 'Logic Weaver', bonus: '+5 INT/AGI' }
  ]

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <AppSidebar />
      <SidebarInset className="flex flex-col overflow-auto">
        <header className="flex h-16 items-center border-b border-border px-6 justify-between shrink-0 bg-background/50 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <h1 className="text-xl font-headline font-semibold italic uppercase tracking-tight">Neural Synthesis</h1>
          </div>
        </header>

        <main className="p-6 grid gap-8 lg:grid-cols-12 max-w-7xl mx-auto w-full">
          {/* Configuration */}
          <div className="lg:col-span-7 space-y-8">
            <Card className="border-border bg-card shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-12 opacity-5">
                <Dna className="h-64 w-64" />
              </div>
              <CardHeader className="bg-secondary/10 border-b border-border/50 pb-8">
                <CardTitle className="font-headline text-3xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                  <Fingerprint className="h-8 w-8 text-accent" />
                  Pilot Imprinting
                </CardTitle>
                <CardDescription className="text-xs uppercase font-bold tracking-widest mt-2">Specify character parameters for the Ouroboros physical layer.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-10">
                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-[0.3em] italic text-accent">Entity Identifier</Label>
                  <Input 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    placeholder="Enter Pilot Name..." 
                    className="h-14 bg-secondary/20 border-border text-xl font-headline rounded-xl"
                  />
                </div>

                <div className="space-y-6">
                  <Label className="text-[10px] font-black uppercase tracking-[0.3em] italic text-accent">Genetic Blueprint</Label>
                  <div className="grid gap-4 md:grid-cols-3">
                    {races.map(r => (
                      <button 
                        key={r.id} 
                        onClick={() => setRace(r.id)}
                        className={`text-left p-4 rounded-xl border transition-all duration-300 ${race === r.id ? 'border-accent bg-accent/5 ring-1 ring-accent' : 'border-border bg-secondary/10 hover:bg-secondary/20'}`}
                      >
                        <div className="text-xs font-black uppercase italic mb-1">{r.label}</div>
                        <div className="text-[10px] text-muted-foreground leading-tight">{r.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <Label className="text-[10px] font-black uppercase tracking-[0.3em] italic text-accent">Functional Archetype</Label>
                  <div className="grid gap-4 md:grid-cols-3">
                    {classes.map(c => (
                      <button 
                        key={c.id} 
                        onClick={() => setNpcClass(c.id)}
                        className={`text-left p-4 rounded-xl border transition-all duration-300 ${npcClass === c.id ? 'border-accent bg-accent/5 ring-1 ring-accent' : 'border-border bg-secondary/10 hover:bg-secondary/20'}`}
                      >
                        <div className="text-xs font-black uppercase italic mb-1">{c.label}</div>
                        <Badge variant="outline" className="text-[8px] border-accent/30 text-accent">{c.bonus}</Badge>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <Label className="text-[10px] font-black uppercase tracking-[0.3em] italic text-accent">Shell Pigmentation</Label>
                  <div className="flex gap-4">
                    {['#d1a37c', '#8d5524', '#c68642', '#e0ac69', '#3d1e11'].map(c => (
                      <button 
                        key={c} 
                        onClick={() => setSkinTone(c)}
                        className={`h-10 w-10 rounded-full border-4 ${skinTone === c ? 'border-accent scale-110 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats & Preview */}
          <div className="lg:col-span-5 space-y-8">
            <Card className="border-border bg-card shadow-2xl">
              <CardHeader className="bg-secondary/10 border-b border-border/50">
                <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-accent" /> Axiomatic Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                {Object.entries(stats).map(([s, val]) => (
                  <div key={s} className="space-y-4">
                    <div className="flex justify-between items-center">
                      <Label className="uppercase font-black text-xs tracking-widest text-muted-foreground">{s}</Label>
                      <span className="text-sm font-headline font-bold text-white">{val}</span>
                    </div>
                    <Slider 
                      value={[val]} 
                      min={5} max={25} step={1} 
                      onValueChange={([v]) => setStats(prev => ({ ...prev, [s]: v }))}
                    />
                  </div>
                ))}
                
                <div className="pt-6 border-t border-border/50 space-y-4">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                    <span className="text-muted-foreground">Neural Capacity</span>
                    <span className="text-emerald-500">OPTIMAL</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                    <span className="text-muted-foreground">Persistency Rating</span>
                    <span className="text-accent">HIGH</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-8 pt-0">
                <Button 
                  onClick={handleCreate} 
                  disabled={loading || !name} 
                  className="w-full h-16 axiom-gradient text-white font-black text-xl italic uppercase tracking-widest shadow-2xl hover:scale-[1.02] transition-transform"
                >
                  {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <><UserPlus className="h-6 w-6 mr-2" /> Manifest Neural Ghost</>}
                </Button>
              </CardFooter>
            </Card>

            <div className="p-8 rounded-2xl bg-accent/5 border border-accent/10 space-y-4 shadow-xl">
              <div className="flex items-center gap-3 text-accent">
                <ShieldCheck className="h-5 w-5" />
                <span className="text-[10px] font-black uppercase tracking-widest italic">Compliance Matrix Verified</span>
              </div>
              <p className="text-[11px] text-muted-foreground italic leading-relaxed font-bold">
                By manifesting your neural ghost, you agree to follow the Ouroboros Deterministic Protocols. Your shell will be persistent and visible to all global pilots.
              </p>
            </div>
          </div>
        </main>
      </SidebarInset>
    </div>
  )
}
