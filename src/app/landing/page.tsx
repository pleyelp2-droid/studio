"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Zap, 
  Download, 
  ShieldCheck, 
  Gamepad2, 
  Globe, 
  Users, 
  Brain, 
  Cpu, 
  Sparkles, 
  Network,
  ChevronRight,
  Monitor,
  Bot
} from "lucide-react"
import { useAuth } from "@/firebase"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import { PlaceHolderImages } from "@/lib/placeholder-images"

export default function LandingPage() {
  const auth = useAuth()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!auth) return
    setLoading(true)
    try {
      await createUserWithEmailAndPassword(auth, email, password)
      toast({ title: "Neural Link Established", description: "Your consciousness has been registered in the Collective." })
    } catch (e: any) {
      toast({ variant: "destructive", title: "Registration Denied", description: e.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] text-foreground selection:bg-accent selection:text-accent-foreground font-body">
      {/* Dynamic Navigation */}
      <nav className="flex items-center justify-between p-6 border-b border-white/5 bg-black/80 backdrop-blur-xl sticky top-0 z-[100]">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 axiom-gradient rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(96,212,255,0.3)]">
            <Network className="h-6 w-6 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-headline font-bold text-xl tracking-tighter leading-none">OUROBOROS</span>
            <span className="text-[10px] text-accent tracking-[0.3em] font-bold">COLLECTIVE</span>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-accent transition-colors">LOGIC CORE</Link>
          <Link href="#synthesis" className="text-sm font-medium text-muted-foreground hover:text-accent transition-colors">AI SYNTHESIS</Link>
          <Link href="#download" className="text-sm font-medium text-muted-foreground hover:text-accent transition-colors">CLIENT ACCESS</Link>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" className="text-xs font-bold tracking-widest uppercase hover:text-accent" asChild>
            <Link href="/">ADMIN CONSOLE</Link>
          </Button>
          <Button className="axiom-gradient text-white border-0 px-6 font-bold shadow-[0_0_15px_rgba(46,46,179,0.4)]">
            SYNCHRONIZE
          </Button>
        </div>
      </nav>

      <main>
        {/* AAA Hero Section */}
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden px-6">
          <div className="absolute inset-0 z-0">
            <Image 
              src={PlaceHolderImages.find(img => img.id === 'world-chrome')?.imageUrl || ""} 
              alt="Background" 
              fill 
              className="object-cover opacity-30 grayscale-[0.5] contrast-125 scale-110"
              priority
              data-ai-hint="cyberpunk city"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-[#050505]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(96,212,255,0.1),transparent_70%)]" />
          </div>

          <div className="max-w-6xl mx-auto text-center space-y-8 relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 backdrop-blur-md">
              <Sparkles className="h-4 w-4 text-accent" />
              <span className="text-xs font-bold tracking-widest text-accent uppercase">Phase 4: Neural Integration Live</span>
            </div>
            
            <h1 className="text-7xl md:text-9xl font-headline font-extrabold tracking-tighter leading-[0.9] text-white">
              HIGH GAMING.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-primary animate-pulse">HIGH SCIENCE.</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto font-light leading-relaxed">
              Ouroboros is the first emergent AI-MMORPG. A persistent, deterministic universe where characters evolve through your neural input.
            </p>

            <div className="flex flex-wrap justify-center gap-6 pt-8">
              <Button size="lg" className="axiom-gradient text-white h-16 px-10 text-xl font-bold gap-3 rounded-xl shadow-[0_10px_40px_rgba(46,46,179,0.5)] transition-transform hover:scale-105">
                <Download className="h-6 w-6" /> ACCESS COLLECTIVE
              </Button>
              <Button size="lg" variant="outline" className="h-16 px-10 text-xl font-bold border-white/10 bg-white/5 backdrop-blur-md text-white hover:bg-white/10 rounded-xl transition-all">
                VIEW TECHNICAL DOCS
              </Button>
            </div>

            <div className="pt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto opacity-50">
              <div className="flex flex-col items-center">
                <span className="text-3xl font-headline font-bold">144Hz</span>
                <span className="text-[10px] uppercase tracking-widest">Logic Cycle</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-3xl font-headline font-bold">4K+</span>
                <span className="text-[10px] uppercase tracking-widest">Neural Assets</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-3xl font-headline font-bold">ZERO</span>
                <span className="text-[10px] uppercase tracking-widest">World Instancing</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-3xl font-headline font-bold">1:1</span>
                <span className="text-[10px] uppercase tracking-widest">Player Agency</span>
              </div>
            </div>
          </div>

          {/* Sci-fi Scroll Indicator */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
            <div className="h-12 w-[2px] bg-gradient-to-b from-accent to-transparent" />
            <span className="text-[10px] font-bold tracking-[0.4em] text-accent uppercase">Scroll to Initialize</span>
          </div>
        </section>

        {/* AI Synthesis Section */}
        <section id="synthesis" className="py-32 px-6 relative overflow-hidden">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-8">
              <Badge className="bg-primary/20 text-primary border-primary/30 py-1 px-4 text-sm">NEURAL CORE TECH</Badge>
              <h2 className="text-5xl md:text-6xl font-headline font-bold tracking-tight text-white leading-tight">
                Import Your <br />
                <span className="text-accent italic">Digital Ghost.</span>
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Using our proprietary **Gemini-Axiom Link**, players can import existing AI personas or synthesize entirely new identities. Your character is not a preset; it's a living neural network that learns from your gameplay.
              </p>
              
              <ul className="space-y-6">
                {[
                  { icon: Brain, title: "Neural Imprinting", desc: "Upload character backstories as raw text or JSON to shape AI personality." },
                  { icon: Bot, title: "Autonomous Agents", desc: "Your character continues to live, trade, and evolve even when you're offline." },
                  { icon: Sparkles, title: "Dynamic Dialogue", desc: "No pre-written scripts. Every interaction is unique, powered by high-context LLMs." }
                ].map((item, i) => (
                  <li key={i} className="flex gap-4 group">
                    <div className="h-12 w-12 rounded-lg bg-secondary flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                      <item.icon className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-white">{item.title}</h4>
                      <p className="text-muted-foreground">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative group">
              <div className="absolute -inset-4 bg-accent/20 blur-3xl opacity-20 group-hover:opacity-40 transition-opacity" />
              <Card className="border-white/10 bg-white/5 backdrop-blur-2xl p-8 relative overflow-hidden">
                <div className="aspect-[4/5] relative rounded-xl overflow-hidden border border-white/10 mb-6 bg-black">
                  <Image 
                    src={PlaceHolderImages.find(img => img.id === 'asset-robot')?.imageUrl || ""} 
                    alt="AI Synthesis" 
                    fill 
                    className="object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
                    data-ai-hint="futuristic robot"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-[10px] font-bold text-accent tracking-widest">SYNTHESIS IN PROGRESS</span>
                      <span className="text-xs font-mono text-white/50">84% COMPLETE</span>
                    </div>
                    <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full w-[84%] bg-accent heartbeat-pulse" />
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Neural Complexity</span>
                    <span className="font-mono text-white">Tier VII</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Behavioral Divergence</span>
                    <span className="font-mono text-white">1.24%</span>
                  </div>
                  <Button className="w-full bg-white text-black font-bold hover:bg-accent hover:text-white transition-all uppercase tracking-widest text-xs h-12">
                    Start Neural Linkage
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Feature Grid: High Science */}
        <section id="features" className="py-32 px-6 bg-gradient-to-b from-[#050505] to-[#0a0a0a] border-y border-white/5">
          <div className="max-w-6xl mx-auto space-y-20">
            <div className="text-center space-y-4">
              <h2 className="text-5xl font-headline font-bold tracking-tight text-white">The Ouroboros Architecture</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">Built on a foundation of deterministic logic and decentralized physics for true world persistence.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                { 
                  icon: Globe, 
                  title: "Singularity World", 
                  desc: "One shard. One world. No loading screens. Every player occupies the same physical space in a unified 144Hz logic cycle.",
                  image: PlaceHolderImages.find(img => img.id === 'region-nebulas-edge')
                },
                { 
                  icon: ShieldCheck, 
                  title: "Atomic Security", 
                  desc: "Every transaction, loot drop, and character update is secured by AxiomCore logic, ensuring a cheat-free economy.",
                  image: PlaceHolderImages.find(img => img.id === 'item-cyber-deck')
                },
                { 
                  icon: Cpu, 
                  title: "Edge Simulation", 
                  desc: "Deterministic heartbeat engine offloads complex physics to a serverless neural mesh, enabling millions of simultaneous entities.",
                  image: PlaceHolderImages.find(img => img.id === 'asset-blueprint')
                }
              ].map((feat, i) => (
                <Card key={i} className="axiom-card-hover border-white/5 bg-white/[0.02] overflow-hidden group">
                  <div className="aspect-video relative overflow-hidden">
                    <Image 
                      src={feat.image?.imageUrl || ""} 
                      alt={feat.title} 
                      fill 
                      className="object-cover opacity-40 group-hover:scale-110 transition-transform duration-500"
                      data-ai-hint={feat.image?.imageHint || ""}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
                    <feat.icon className="absolute bottom-4 left-4 h-8 w-8 text-accent" />
                  </div>
                  <CardHeader className="p-8">
                    <CardTitle className="text-2xl font-bold mb-2 text-white">{feat.title}</CardTitle>
                    <CardDescription className="text-muted-foreground leading-relaxed">{feat.desc}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Enrollment Section */}
        <section id="download" className="py-40 px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-accent/5 opacity-50" />
          <Card className="max-w-5xl mx-auto border-accent/20 bg-black/60 backdrop-blur-3xl overflow-hidden shadow-[0_0_100px_rgba(96,212,255,0.1)] relative z-10">
            <div className="grid lg:grid-cols-2">
              <div className="p-12 space-y-8">
                <div className="space-y-4">
                  <h2 className="text-4xl font-headline font-bold text-white">Join the Collective</h2>
                  <p className="text-muted-foreground">Register your neural frequency to secure priority access to the pre-alpha simulation.</p>
                </div>
                
                <form onSubmit={handleSignUp} className="space-y-6">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Input 
                        placeholder="Neural Address (Email)" 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        className="bg-white/5 border-white/10 h-14 text-lg focus:border-accent"
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Input 
                        placeholder="Security Key (Password)" 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        className="bg-white/5 border-white/10 h-14 text-lg focus:border-accent"
                        required 
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full h-14 axiom-gradient text-white font-bold text-lg rounded-xl shadow-[0_5px_20px_rgba(46,46,179,0.3)]" disabled={loading}>
                    {loading ? "ESTABLISHING LINK..." : "INITIALIZE SYNC"}
                  </Button>
                </form>

                <div className="flex items-center gap-6 pt-4 border-t border-white/10">
                  <div className="flex -space-x-3">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="h-10 w-10 rounded-full border-2 border-black bg-secondary overflow-hidden">
                        <Image src={`https://picsum.photos/seed/${i + 10}/100/100`} alt="Player" width={40} height={40} />
                      </div>
                    ))}
                  </div>
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">+12k PILOTS ONLINE</span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-secondary/50 to-black p-12 flex flex-col items-center justify-center text-center gap-8 border-l border-white/5">
                <div className="relative">
                  <div className="h-40 w-40 axiom-gradient rounded-full flex items-center justify-center shadow-[0_0_80px_rgba(96,212,255,0.4)] animate-pulse">
                    <Gamepad2 className="h-20 w-20 text-white" />
                  </div>
                  <Badge className="absolute -bottom-2 right-0 bg-emerald-500 text-white border-0 shadow-lg">v0.9.4 STABLE</Badge>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-2xl font-headline font-bold text-white uppercase tracking-tighter">Ouroboros Client</h3>
                  <p className="text-sm text-muted-foreground">The gateway to the Collective. Optimized for high-performance hardware and neural interfaces.</p>
                </div>

                <div className="grid gap-3 w-full">
                  <Button variant="outline" className="h-14 w-full justify-between px-6 border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold">
                    <span className="flex items-center gap-3"><Download className="h-5 w-5 text-accent" /> ANDROID (.APK)</span>
                    <ChevronRight className="h-4 w-4 opacity-30" />
                  </Button>
                  <Button variant="outline" className="h-14 w-full justify-between px-6 border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold opacity-40 cursor-not-allowed">
                    <span className="flex items-center gap-3"><Monitor className="h-5 w-5" /> WINDOWS / LINUX</span>
                    <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded italic">Q3 2025</span>
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </section>
      </main>

      <footer className="p-20 border-t border-white/5 bg-black">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 axiom-gradient rounded flex items-center justify-center">
              <Network className="h-4 w-4 text-white" />
            </div>
            <span className="font-headline font-bold text-lg tracking-tighter">OUROBOROS</span>
          </div>
          
          <div className="flex gap-12 text-[10px] font-bold tracking-[0.3em] text-muted-foreground uppercase">
            <Link href="#" className="hover:text-accent transition-colors">Discord</Link>
            <Link href="#" className="hover:text-accent transition-colors">Technical Specs</Link>
            <Link href="#" className="hover:text-accent transition-colors">Privacy Neural Data</Link>
            <Link href="#" className="hover:text-accent transition-colors">Terms of Collective</Link>
          </div>

          <div className="text-[10px] font-bold text-white/20 tracking-widest">
            &copy; 2025 OUROBOROS COLLECTIVE. POWERED BY AXIOM FRONTIER LOGIC CORE.
          </div>
        </div>
      </footer>
    </div>
  )
}
