"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
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
  Bot,
  Layers,
  Activity,
  Infinity,
  Terminal,
  Unplug,
  Database,
  Search,
  Box
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

  const getImg = (id: string) => PlaceHolderImages.find(img => img.id === id)

  return (
    <div className="min-h-screen bg-[#020202] text-foreground selection:bg-accent selection:text-accent-foreground font-body overflow-x-hidden">
      {/* Cinematic Navigation */}
      <nav className="flex items-center justify-between px-8 py-6 border-b border-white/5 bg-black/40 backdrop-blur-2xl fixed top-0 w-full z-[100]">
        <div className="flex items-center gap-4 group cursor-pointer">
          <div className="h-12 w-12 axiom-gradient rounded-xl flex items-center justify-center shadow-[0_0_30px_rgba(96,212,255,0.4)] transition-transform group-hover:scale-110 duration-500">
            <Infinity className="h-7 w-7 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-headline font-black text-2xl tracking-tighter leading-none text-white uppercase italic">Ouroboros</span>
            <span className="text-[10px] text-accent tracking-[0.4em] font-bold">COLLECTIVE</span>
          </div>
        </div>
        
        <div className="hidden lg:flex items-center gap-10">
          {["WORLD_ENGINE", "NEURAL_CORE", "DETERMINISM", "SYNCHRONIZE"].map((item) => (
            <Link key={item} href={`#${item.toLowerCase()}`} className="text-[11px] font-black tracking-[0.2em] text-muted-foreground hover:text-accent transition-all duration-300">
              {item}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-6">
          <Button variant="ghost" className="hidden sm:flex text-[10px] font-black tracking-widest uppercase hover:text-accent" asChild>
            <Link href="/">ADMIN_CONSOLE</Link>
          </Button>
          <Button className="axiom-gradient text-white border-0 px-8 py-6 rounded-xl font-black text-xs tracking-widest shadow-[0_0_20px_rgba(46,46,179,0.5)] hover:shadow-[0_0_40px_rgba(46,46,179,0.8)] transition-all">
            BOOT_COLLECTIVE
          </Button>
        </div>
      </nav>

      <main>
        {/* AAA Hyper-Hero */}
        <section className="relative h-screen flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image 
              src={getImg('world-chrome')?.imageUrl || ""} 
              alt="Neon Metropolis" 
              fill 
              className="object-cover opacity-60 scale-105 transition-transform duration-[30s] hover:scale-110"
              priority
              data-ai-hint="cyberpunk city"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#020202] via-[#020202]/60 to-transparent" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(96,212,255,0.15),transparent_70%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] pointer-events-none opacity-20" />
          </div>

          <div className="max-w-7xl mx-auto text-center space-y-8 relative z-10 px-6">
            <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl mb-4">
              <span className="h-2 w-2 rounded-full bg-accent heartbeat-pulse" />
              <span className="text-[10px] font-black tracking-[0.3em] text-accent uppercase">Simulation Phase 0.9.4 // Deterministic Sync Active</span>
            </div>
            
            <h1 className="text-7xl md:text-[12rem] font-headline font-black tracking-tighter leading-[0.8] text-white italic">
              HIGH GAMING.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-white to-primary bg-300% animate-gradient">HIGH SCIENCE.</span>
            </h1>
            
            <p className="text-xl md:text-4xl text-white/80 max-w-4xl mx-auto font-light leading-snug tracking-tight">
              Axiom Frontier presents the first <span className="text-white font-medium italic underline decoration-accent/50 decoration-2 underline-offset-8">Emergent AI-MMORPG</span>. 
              A deterministic reality where every byte is persistent.
            </p>

            <div className="flex flex-wrap justify-center gap-8 pt-12">
              <Button size="lg" className="h-24 px-16 text-3xl font-black axiom-gradient text-white rounded-2xl shadow-[0_20px_50px_rgba(46,46,179,0.4)] hover:scale-105 hover:shadow-[0_20px_80px_rgba(46,46,179,0.6)] transition-all duration-500 gap-4 uppercase tracking-tighter italic">
                <Download className="h-10 w-10" /> Enter Collective
              </Button>
              <Button size="lg" variant="outline" className="h-24 px-16 text-3xl font-black border-white/10 bg-white/5 backdrop-blur-2xl text-white hover:bg-white/10 rounded-2xl transition-all duration-500 uppercase tracking-tighter">
                Lore_Archive
              </Button>
            </div>

            <div className="pt-24 grid grid-cols-2 md:grid-cols-4 gap-12 max-w-5xl mx-auto">
              {[
                { label: "Deterministic", val: "TRUE" },
                { label: "AI_Entities", val: "4.2M+" },
                { label: "Logic_Cycle", val: "144Hz" },
                { label: "World_Shards", val: "1:1" }
              ].map((stat, i) => (
                <div key={i} className="flex flex-col items-center group">
                  <span className="text-5xl font-headline font-black text-white group-hover:text-accent transition-colors italic">{stat.val}</span>
                  <div className="h-[2px] w-8 bg-accent/20 my-2 group-hover:w-full transition-all" />
                  <span className="text-[11px] uppercase tracking-[0.3em] text-white/40 font-bold">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Neural Character Synthesis */}
        <section className="py-40 px-6 relative bg-[#030303]">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-32 items-center">
              <div className="relative">
                <div className="absolute -inset-20 bg-accent/20 blur-[120px] opacity-10" />
                <div className="relative rounded-[40px] border border-white/10 bg-black p-4 shadow-[0_50px_100px_rgba(0,0,0,0.8)] overflow-hidden">
                  <div className="aspect-[3/4] relative rounded-[32px] overflow-hidden group">
                    <Image 
                      src={getImg('asset-robot')?.imageUrl || ""} 
                      alt="Next Gen AI Avatar" 
                      fill 
                      className="object-cover group-hover:scale-110 transition-transform duration-[20s]"
                      data-ai-hint="futuristic robot"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                    
                    {/* UI HUD Overlays */}
                    <div className="absolute top-8 left-8 p-6 bg-black/60 backdrop-blur-md rounded-2xl border border-white/10">
                      <Activity className="h-8 w-8 text-accent animate-pulse mb-3" />
                      <div className="text-[10px] font-black tracking-widest text-white/50 uppercase">Neural Stability</div>
                      <div className="text-2xl font-headline font-black text-white">99.8%</div>
                    </div>

                    <div className="absolute top-8 right-8 flex flex-col gap-2">
                       <Badge className="bg-emerald-500 text-black font-black px-4 py-1">SYNCED</Badge>
                       <Badge variant="outline" className="border-accent text-accent px-4 py-1">PROTOTYPE</Badge>
                    </div>
                    
                    <div className="absolute bottom-12 left-12 right-12">
                      <div className="flex justify-between items-end mb-6">
                        <div>
                          <div className="text-[10px] font-black tracking-widest text-accent mb-2 uppercase">Unit Identifier</div>
                          <div className="text-5xl font-headline font-black text-white italic">SYNTH_V1.img</div>
                        </div>
                      </div>
                      <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full w-[88%] bg-accent heartbeat-pulse" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-12">
                <div className="space-y-4">
                  <Badge className="bg-accent/20 text-accent border-accent/30 px-6 py-2 text-xs font-black tracking-widest uppercase">The Neural Link</Badge>
                  <h2 className="text-7xl md:text-9xl font-headline font-black tracking-tighter text-white leading-none italic uppercase">
                    Import Your <br />
                    <span className="text-accent italic">Ghost.</span>
                  </h2>
                </div>
                
                <p className="text-2xl text-white/60 leading-relaxed font-light italic">
                  Character creation is obsolete. In Ouroboros, you import your <span className="text-white font-medium">Consciousness</span>. Your avatar inherits your logic, your intent, and your past.
                </p>

                <div className="grid gap-10">
                  {[
                    { icon: Brain, title: "Neural Imprinting", desc: "Your avatar's personality is synthesized from your neural patterns and history." },
                    { icon: Bot, title: "Autonomous Agency", desc: "Your ghost remains active in the world even when you disconnect. It plots and builds." },
                    { icon: Layers, title: "Modular Evolution", desc: "Adapt your cybernetic shell based on real-time world data streamed from the engine." }
                  ].map((item, i) => (
                    <div key={i} className="flex gap-8 group p-8 rounded-3xl bg-white/[0.02] hover:bg-white/[0.05] transition-all border border-transparent hover:border-white/10">
                      <div className="h-20 w-20 rounded-2xl bg-secondary flex items-center justify-center group-hover:axiom-gradient group-hover:text-black transition-all duration-500 shrink-0">
                        <item.icon className="h-10 w-10" />
                      </div>
                      <div>
                        <h4 className="text-2xl font-black text-white mb-3 tracking-tight uppercase italic">{item.title}</h4>
                        <p className="text-xl text-white/40 font-light leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Button size="lg" className="h-24 w-full text-2xl font-black bg-white/5 border border-white/10 hover:bg-accent hover:text-black hover:border-accent transition-all duration-500 rounded-2xl uppercase tracking-[0.2em] italic shadow-2xl">
                  Initialize Neural Imprint
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* High Science Visual Showcase */}
        <section className="py-40 bg-[#050505] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
          <div className="max-w-7xl mx-auto px-6 space-y-32">
            <div className="text-center space-y-6">
              <h2 className="text-7xl md:text-[10rem] font-headline font-black tracking-tighter text-white italic">THE ENGINE</h2>
              <p className="text-3xl text-white/40 max-w-3xl mx-auto font-light leading-relaxed uppercase tracking-[0.3em]">Persistent. Deterministic. Absolute.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-16">
              {[
                { 
                  icon: Globe, 
                  title: "Singularity Engine", 
                  desc: "A single persistent world instance. One 144Hz heartbeat for all pilots globally.",
                  img: 'region-nebulas-edge',
                  hint: "nebula space"
                },
                { 
                  icon: ShieldCheck, 
                  title: "Axiom Logic", 
                  desc: "Deterministic verification ensures 100% cheat-free economy and physics simulation.",
                  img: 'item-cyber-deck',
                  hint: "cyberpunk technology"
                },
                { 
                  icon: Cpu, 
                  title: "Edge Simulation", 
                  desc: "Every entity is an autonomous agent driven by high-context LLM reasoning layers.",
                  img: 'asset-blueprint',
                  hint: "blueprint"
                }
              ].map((feat, i) => (
                <Card key={i} className="group border-0 bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-700 rounded-[48px] overflow-hidden">
                  <div className="aspect-[16/11] relative overflow-hidden">
                    <Image 
                      src={getImg(feat.img)?.imageUrl || ""} 
                      alt={feat.title} 
                      fill 
                      className="object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000"
                      data-ai-hint={feat.hint}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050505] to-transparent" />
                    <div className="absolute bottom-10 left-10 h-16 w-16 axiom-gradient rounded-2xl flex items-center justify-center">
                      <feat.icon className="h-10 w-10 text-white" />
                    </div>
                  </div>
                  <CardHeader className="p-12">
                    <CardTitle className="text-4xl font-black mb-6 text-white tracking-tight uppercase italic">{feat.title}</CardTitle>
                    <CardDescription className="text-2xl text-white/50 leading-relaxed font-light">{feat.desc}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Enrollment Card */}
        <section className="py-40 px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(96,212,255,0.08),transparent_70%)]" />
          
          <Card className="max-w-7xl mx-auto border-white/5 bg-black/40 backdrop-blur-3xl rounded-[64px] overflow-hidden relative z-10 shadow-[0_0_150px_rgba(0,0,0,1)]">
            <div className="grid lg:grid-cols-2">
              <div className="p-24 space-y-12">
                <div className="space-y-4">
                  <h2 className="text-7xl font-headline font-black text-white tracking-tighter uppercase italic leading-none">Join the <br /><span className="text-accent">Collective.</span></h2>
                  <p className="text-2xl text-white/40 leading-relaxed font-light italic">Neural linkage enrollment is now open. Secure your position in the next cycle.</p>
                </div>
                
                <form onSubmit={handleSignUp} className="space-y-10">
                  <div className="grid gap-8">
                    <div className="relative">
                      <Terminal className="absolute left-8 top-1/2 -translate-y-1/2 h-8 w-8 text-white/20" />
                      <Input 
                        placeholder="Neural_Identifier (Email)" 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        className="bg-white/5 border-white/10 h-24 pl-20 pr-10 text-2xl focus:border-accent rounded-3xl placeholder:text-white/20 uppercase tracking-widest font-black"
                        required 
                      />
                    </div>
                    <div className="relative">
                      <Unplug className="absolute left-8 top-1/2 -translate-y-1/2 h-8 w-8 text-white/20" />
                      <Input 
                        placeholder="Security_Key (Password)" 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        className="bg-white/5 border-white/10 h-24 pl-20 pr-10 text-2xl focus:border-accent rounded-3xl placeholder:text-white/20 uppercase tracking-widest font-black"
                        required 
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full h-28 axiom-gradient text-white font-black text-4xl rounded-3xl shadow-xl hover:shadow-accent/40 transition-all uppercase tracking-[0.2em] italic" disabled={loading}>
                    {loading ? "Establishing_Link..." : "Synchronize_Now"}
                  </Button>
                </form>

                <div className="flex items-center gap-10 pt-12 border-t border-white/10">
                  <div className="flex -space-x-6">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="h-16 w-16 rounded-full border-4 border-black bg-secondary overflow-hidden shadow-2xl">
                        <Image src={`https://picsum.photos/seed/${i + 120}/200/200`} alt="Pilot" width={64} height={64} />
                      </div>
                    ))}
                  </div>
                  <span className="text-lg font-black text-white/40 uppercase tracking-[0.3em] italic">+24k Pilots Synced</span>
                </div>
              </div>

              <div className="relative bg-[#080808] p-24 flex flex-col items-center justify-center text-center gap-12 border-l border-white/5 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(96,212,255,0.05),transparent_70%)]" />
                <div className="relative">
                  <div className="h-80 w-80 axiom-gradient rounded-[64px] flex items-center justify-center shadow-[0_0_120px_rgba(96,212,255,0.4)] rotate-3 animate-float overflow-hidden">
                    <Gamepad2 className="h-40 w-40 text-white -rotate-3" />
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                  </div>
                  <Badge className="absolute -bottom-6 -right-6 bg-emerald-500 text-black font-black px-8 py-3 text-lg border-0 shadow-2xl uppercase tracking-widest italic">v0.9.4_Stable</Badge>
                </div>
                
                <div className="space-y-6 relative">
                  <h3 className="text-5xl font-headline font-black text-white uppercase tracking-tighter italic">Ouroboros Client</h3>
                  <p className="text-xl text-white/40 max-w-xs mx-auto font-light uppercase tracking-widest leading-none italic">Optimized for high-performance neural interfaces.</p>
                </div>

                <div className="grid gap-6 w-full relative">
                  <Button variant="outline" className="h-24 w-full justify-between px-12 border-white/10 bg-white/5 hover:bg-white/10 text-white font-black rounded-3xl text-2xl transition-all uppercase italic">
                    <span className="flex items-center gap-6"><Download className="h-8 w-8 text-accent" /> Android (.APK)</span>
                    <ChevronRight className="h-6 w-6 opacity-30" />
                  </Button>
                  <Button variant="outline" className="h-24 w-full justify-between px-12 border-white/10 bg-white/5 hover:bg-white/10 text-white font-black rounded-3xl text-2xl opacity-40 cursor-not-allowed uppercase italic">
                    <span className="flex items-center gap-6"><Monitor className="h-8 w-8" /> PC / Linux</span>
                    <span className="text-sm bg-white/10 px-6 py-2 rounded-full italic tracking-widest uppercase font-bold">Q4 2025</span>
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </section>
      </main>

      <footer className="py-40 border-t border-white/5 bg-black">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-24">
          <div className="flex items-center gap-6 group cursor-pointer">
            <div className="h-14 w-14 axiom-gradient rounded-xl flex items-center justify-center group-hover:rotate-180 transition-transform duration-1000 shadow-2xl">
              <Infinity className="h-9 w-9 text-white" />
            </div>
            <span className="font-headline font-black text-4xl tracking-tighter text-white uppercase italic">Ouroboros</span>
          </div>
          
          <div className="flex flex-wrap justify-center gap-16 text-[12px] font-black tracking-[0.5em] text-white/40 uppercase">
            <Link href="#" className="hover:text-accent transition-colors">Discord</Link>
            <Link href="#" className="hover:text-accent transition-colors">Neural_Security</Link>
            <Link href="#" className="hover:text-accent transition-colors">Engine_Specs</Link>
            <Link href="#" className="hover:text-accent transition-colors">Terms_Collective</Link>
          </div>

          <div className="text-[12px] font-black text-white/20 tracking-[0.3em] uppercase italic">
            &copy; 2025 Ouroboros Collective // Axiom Frontier Logic Core
          </div>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          background-size: 200% auto;
          animation: gradient 5s ease infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(3deg); }
          50% { transform: translateY(-25px) rotate(5deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .bg-300% {
          background-size: 300% 300%;
        }
      `}</style>
    </div>
  )
}
