
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
import { Textarea } from "@/components/ui/textarea"
import { 
  Sparkles, 
  Loader2, 
  Fingerprint, 
  UserPlus, 
  Dna,
  ShieldCheck,
  BrainCircuit,
  Zap,
  Target,
  Pickaxe
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { AIService } from "@/services/AIService"

export default function CharacterCreatorPage() {
  const { user } = useUser()
  const db = useFirestore()
  const router = useRouter()
  const { toast } = useToast()
  
  const [loading, setLoading] = useState(false)
  const [isSynthesizing, setIsSynthesizing] = useState(false)
  const [name, setName] = useState("")
  const [neuralPrompt, setNeuralPrompt] = useState("")
  const [skinTone, setSkinTone] = useState("#d1a37c")
  const [stats, setStats] = useState({ str: 10, agi: 10, int: 10, vit: 10 })
  const [skills, setSkills] = useState({ mining: 1, smithing: 1, combat: 1, reflection: 1 })

  const handleSynthesize = async () => {
    if (!neuralPrompt) return
    setIsSynthesizing(true)
    try {
      // In a real scenario, this would call our Genkit flow
      // For now, we simulate the "Axiom Synthesis"
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setStats({
        str: 10 + Math.floor(Math.random() * 5),
        agi: 10 + Math.floor(Math.random() * 5),
        int: 10 + Math.floor(Math.random() * 5),
        vit: 10 + Math.floor(Math.random() * 5)
      })
      
      toast({ 
        title: "Neural Imprinting Successful", 
        description: "Your essence has been translated into starting attributes." 
      })
    } catch (e: any) {
      toast({ variant: "destructive", title: "Synthesis Failed", description: e.message })
    } finally {
      setIsSynthesizing(false)
    }
  }

  const handleCreate = async () => {
    if (!db || !user || !name) return
    setLoading(true)
    try {
      await setDoc(doc(db, "players", user.uid), {
        id: user.uid,
        displayName: name,
        level: 1,
        hp: stats.vit * 10,
        maxHp: stats.vit * 10,
        exp: 0,
        ...stats,
        skills,
        position: { x: Math.random() * 20, y: 0, z: Math.random() * 20 },
        visionRange: 50,
        state: 'IDLE',
        inventory: [],
        dnaHistory: [neuralPrompt],
        memoryCache: [],
        awakened: !!neuralPrompt,
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

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <AppSidebar />
      <SidebarInset className="flex flex-col overflow-auto">
        <header className="flex h-16 items-center border-b border-border px-6 justify-between shrink-0 bg-background/50 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <h1 className="text-xl font-headline font-semibold italic uppercase tracking-tight text-white">Neural Manifestation</h1>
          </div>
          <Badge variant="outline" className="text-accent border-accent font-black text-[10px] tracking-widest italic">CLASSLESS_SYSTEM_V1.2</Badge>
        </header>

        <main className="p-6 grid gap-8 lg:grid-cols-12 max-w-7xl mx-auto w-full">
          {/* AI Neural Imprinting */}
          <div className="lg:col-span-7 space-y-8">
            <Card className="border-border bg-card shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity">
                <BrainCircuit className="h-64 w-64" />
              </div>
              <CardHeader className="bg-secondary/10 border-b border-border/50 pb-8">
                <CardTitle className="font-headline text-3xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                  <Fingerprint className="h-8 w-8 text-accent" />
                  Neural Synthesis
                </CardTitle>
                <CardDescription className="text-xs uppercase font-bold tracking-widest mt-2 text-white/60">Define your essence. The Axiom Core will manifest your shell.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-10">
                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-[0.3em] italic text-accent">Entity Identifier</Label>
                  <Input 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    placeholder="Enter Pilot Name..." 
                    className="h-14 bg-secondary/20 border-border text-xl font-headline rounded-xl text-white italic"
                  />
                </div>

                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-[0.3em] italic text-accent">AI Neural Link (Concept Prompt)</Label>
                  <div className="relative">
                    <Textarea 
                      value={neuralPrompt}
                      onChange={(e) => setNeuralPrompt(e.target.value)}
                      placeholder="Describe your character's soul, origin, or purpose... (e.g. A weary miner from the Crystal Peaks seeking redemption)"
                      className="min-h-[120px] bg-secondary/20 border-border rounded-xl text-xs italic leading-relaxed text-white/80"
                    />
                    <Button 
                      onClick={handleSynthesize}
                      disabled={!neuralPrompt || isSynthesizing}
                      className="absolute bottom-3 right-3 axiom-gradient h-10 px-4 text-[10px] font-black uppercase tracking-widest italic rounded-lg"
                    >
                      {isSynthesizing ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <Sparkles className="h-3 w-3 mr-2" />}
                      Synthesize Essence
                    </Button>
                  </div>
                </div>

                <div className="space-y-6">
                  <Label className="text-[10px] font-black uppercase tracking-[0.3em] italic text-accent">Starting Pigmentation</Label>
                  <div className="flex gap-4">
                    {['#d1a37c', '#8d5524', '#c68642', '#e0ac69', '#3d1e11'].map(c => (
                      <button 
                        key={c} 
                        onClick={() => setSkinTone(c)}
                        className={`h-10 w-10 rounded-full border-4 transition-all ${skinTone === c ? 'border-accent scale-110 shadow-[0_0_15px_rgba(96,212,255,0.5)]' : 'border-transparent opacity-60 hover:opacity-100'}`}
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
                  <Zap className="h-4 w-4 text-accent" /> Manifested Attributes
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                {Object.entries(stats).map(([s, val]) => (
                  <div key={s} className="space-y-4">
                    <div className="flex justify-between items-center">
                      <Label className="uppercase font-black text-[10px] tracking-widest text-muted-foreground">{s}</Label>
                      <span className="text-sm font-headline font-bold text-white italic">{val}</span>
                    </div>
                    <Slider 
                      value={[val]} 
                      disabled
                      max={25} 
                      className="opacity-50"
                    />
                  </div>
                ))}
                
                <div className="pt-6 border-t border-border/50 space-y-4">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-accent mb-4">Initial Skill Imprints</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(skills).map(([skill, level]) => (
                      <div key={skill} className="p-3 rounded-xl bg-secondary/20 border border-border/50 flex flex-col items-center">
                        <div className="text-[8px] font-black text-muted-foreground uppercase mb-1">{skill}</div>
                        <div className="text-lg font-headline font-black text-white italic">LVL {level}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-8 pt-0">
                <Button 
                  onClick={handleCreate} 
                  disabled={loading || !name} 
                  className="w-full h-16 axiom-gradient text-white font-black text-xl italic uppercase tracking-widest shadow-2xl hover:scale-[1.02] transition-transform rounded-2xl"
                >
                  {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <><UserPlus className="h-6 w-6 mr-2" /> Commit to Ledger</>}
                </Button>
              </CardFooter>
            </Card>

            <div className="p-8 rounded-2xl bg-accent/5 border border-accent/10 space-y-4 shadow-xl">
              <div className="flex items-center gap-3 text-accent">
                <ShieldCheck className="h-5 w-5" />
                <span className="text-[10px] font-black uppercase tracking-widest italic">Axiomatic Persistence Verified</span>
              </div>
              <p className="text-[11px] text-muted-foreground italic leading-relaxed">
                By manifesting, you establish an immutable neural signature in the simulation. Every skill gained and resource gathered is permanent.
              </p>
            </div>
          </div>
        </main>
      </SidebarInset>
    </div>
  )
}
