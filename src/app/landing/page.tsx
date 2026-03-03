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
  Box,
  Fingerprint
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
        <section className="relative h-[110vh] flex items-center justify-center overflow-hidden">
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
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(96,212,255,0.2),transparent_70%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] pointer-events-none opacity-20" />
          </div>

          <div className="max-w-7xl mx-auto text-center space-y-12 relative z-10 px-6">
            <div className="inline-flex items-center gap-3 px-8 py-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-3xl mb-4 shadow-2xl">
              <span className="h-2 w-2 rounded-full bg-accent heartbeat-pulse" />
              <span className="text-[11px] font-black tracking-[0.4em] text-accent uppercase">Simulation Phase 0.9.4 // Deterministic Sync Active</span>
            </div>
            
            <h1 className="text-8xl md:text-[14rem] font-headline font-black tracking-tighter leading-[0.75] text-white italic drop-shadow-[0_0_50px_rgba(255,255,255,0.1)]">
              HIGH GAMING.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-white to-primary bg-300% animate-gradient">HIGH SCIENCE.</span>
            </h1>
            
            <p className="text-2xl md:text-5xl text-white/80 max-w-5xl mx-auto font-light leading-snug tracking-tight">
              Axiom Frontier presents the first <span className="text-white font-medium italic underline decoration-accent/50 decoration-4 underline-offset-[12px]">Emergent AI-MMORPG</span>. 
              A deterministic reality where every byte is persistent.
            </p>

            <div className="flex flex-wrap justify-center gap-10 pt-16">
              <Button size="lg" className="h-28 px-20 text-4xl font-black axiom-gradient text-white rounded-[2rem] shadow-[0_30px_60px_rgba(46,46,179,0.5)] hover:scale-105 hover:shadow-[0_30px_90px_rgba(46,46,179,0.7)] transition-all duration-700 gap-6 uppercase tracking-tighter italic">
                <Download className="h-12 w-12" /> Enter Collective
              </Button>
              <Button size="lg" variant="outline" className="h-28 px-20 text-4xl font-black border-white/10 bg-white/5 backdrop-blur-3xl text-white hover:bg-white/10 rounded-[2rem] transition-all duration-700 uppercase tracking-tighter italic">
                Lore_Archive
              </Button>
            </div>

            <div className="pt-32 grid grid-cols-2 md:grid-cols-4 gap-16 max-w-6xl mx-auto border-t border-white/5">
              {[
                { label: "Deterministic", val: "TRUE" },
                { label: "AI_Entities", val: "4.2M+" },
                { label: "Logic_Cycle", val: "144Hz" },
                { label: "World_Shards", val: "1:1" }
              ].map((stat, i) => (
                <div key={i} className="flex flex-col items-center group cursor-default">
                  <span className="text-6xl font-headline font-black text-white group-hover:text-accent transition-all duration-500 italic">{stat.val}</span>
                  <div className="h-[3px] w-12 bg-accent/20 my-4 group-hover:w-full transition-all duration-700" />
                  <span className="text-[12px] uppercase tracking-[0.4em] text-white/40 font-bold">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Neural Character Synthesis */}
        <section className="py-60 px-6 relative bg-[#030303] border-y border-white/5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_left,rgba(96,212,255,0.05),transparent_70%)]" />
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-40 items-center">
              <div className="relative group">
                <div className="absolute -inset-20 bg-accent/20 blur-[150px] opacity-20 group-hover:opacity-30 transition-opacity" />
                <div className="relative rounded-[56px] border border-white/10 bg-black p-6 shadow-[0_80px_150px_rgba(0,0,0,0.9)] overflow-hidden">
                  <div className="aspect-[3/4] relative rounded-[40px] overflow-hidden group">
                    <Image 
                      src={getImg('asset-robot')?.imageUrl || ""} 
                      alt="Next Gen AI Avatar" 
                      fill 
                      className="object-cover transition-transform duration-[30s] group-hover:scale-110"
                      data-ai-hint="futuristic robot"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                    
                    {/* UI HUD Overlays */}
                    <div className="absolute top-10 left-10 p-8 bg-black/70 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl">
                      <Fingerprint className="h-10 w-10 text-accent animate-pulse mb-4" />
                      <div className="text-[12px] font-black tracking-widest text-white/50 uppercase">Neural Integrity</div>
                      <div className="text-3xl font-headline font-black text-white">99.8%</div>
                    </div>

                    <div className="absolute bottom-16 left-16 right-16">
                      <div className="flex flex-col gap-4">
                        <div className="text-[12px] font-black tracking-[0.5em] text-accent uppercase">Unit Identifier</div>
                        <div className="text-6xl font-headline font-black text-white italic tracking-tighter">SYNTH_V1.img</div>
                        <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden backdrop-blur-md">
                          <div className="h-full w-[92%] bg-accent heartbeat-pulse shadow-[0_0_20px_rgba(96,212,255,0.8)]" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-16">
                <div className="space-y-6">
                  <Badge className="bg-accent/20 text-accent border-accent/40 px-8 py-3 text-sm font-black tracking-[0.3em] uppercase">The Neural Link</Badge>
                  <h2 className="text-8xl md:text-[11rem] font-headline font-black tracking-tighter text-white leading-[0.85] italic uppercase">
                    Import Your <br />
                    <span className="text-accent italic">Ghost.</span>
                  </h2>
                </div>
                
                <p className="text-3xl text-white/60 leading-relaxed font-light italic">
                  Character creation is archaic. In Ouroboros, you import your <span className="text-white font-medium italic underline decoration-accent/30 underline-offset-8">Consciousness</span>. Your shell inherits your logic, intent, and memories.
                </p>

                <div className="grid gap-12">
                  {[
                    { icon: Brain, title: "Neural Imprinting", desc: "Synthesis of character personality from uploaded neural patterns and behavioral history." },
                    { icon: Bot, title: "Autonomous Agency", desc: "Your ghost remains persistent. It lives, trades, and builds even when the pilot is offline." },
                    { icon: Layers, title: "Modular Shells", desc: "Real-time cybernetic evolution driven by deterministic world data streamed from the Singularity." }
                  ].map((item, i) => (
                    <div key={i} className="flex gap-10 group p-10 rounded-[2.5rem] bg-white/[0.03] hover:bg-white/[0.06] transition-all duration-500 border border-transparent hover:border-white/10 shadow-2xl">
                      <div className="h-24 w-24 rounded-3xl bg-secondary/50 flex items-center justify-center group-hover:axiom-gradient group-hover:text-black transition-all duration-700 shrink-0 shadow-lg">
                        <item.icon className="h-12 w-12" />
                      </div>
                      <div>
                        <h4 className="text-3xl font-black text-white mb-4 tracking-tight uppercase italic">{item.title}</h4>
                        <p className="text-2xl text-white/40 font-light leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Button size="lg" className="h-28 w-full text-3xl font-black bg-white/5 border border-white/10 hover:bg-accent hover:text-black hover:border-accent transition-all duration-700 rounded-[2rem] uppercase tracking-[0.3em] italic shadow-3xl">
                  Initialize Imprint
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* High Science Visual Showcase */}
        <section className="py-60 bg-[#050505] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
          <div className="max-w-7xl mx-auto px-6 space-y-40">
            <div className="text-center space-y-8">
              <h2 className="text-8xl md:text-[14rem] font-headline font-black tracking-tighter text-white italic drop-shadow-2xl">THE ENGINE</h2>
              <p className="text-4xl text-white/30 max-w-4xl mx-auto font-light leading-relaxed uppercase tracking-[0.4em] italic">Persistent. Deterministic. Absolute.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-20">
              {[
                { 
                  icon: Globe, 
                  title: "Singularity", 
                  desc: "A single persistent world instance. One 144Hz heartbeat for all global pilots.",
                  img: 'region-nebulas-edge',
                  hint: "nebula space"
                },
                { 
                  icon: ShieldCheck, 
                  title: "Logic Core", 
                  desc: "Deterministic verification ensures a 100% cheat-free economy and physics layer.",
                  img: 'item-cyber-deck',
                  hint: "cyberpunk technology"
                },
                { 
                  icon: Cpu, 
                  title: "Edge Sim", 
                  desc: "Every entity is an autonomous agent driven by high-context LLM reasoning.",
                  img: 'asset-blueprint',
                  hint: "blueprint"
                }
              ].map((feat, i) => (
                <Card key={i} className="group border-0 bg-white/[0.01] hover:bg-white/[0.04] transition-all duration-1000 rounded-[4rem] overflow-hidden shadow-2xl">
                  <div className="aspect-[16/11] relative overflow-hidden">
                    <Image 
                      src={getImg(feat.img)?.imageUrl || ""} 
                      alt={feat.title} 
                      fill 
                      className="object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-[2s]"
                      data-ai-hint={feat.hint}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />
                    <div className="absolute bottom-12 left-12 h-20 w-20 axiom-gradient rounded-[1.5rem] flex items-center justify-center shadow-2xl">
                      <feat.icon className="h-12 w-12 text-white" />
                    </div>
                  </div>
                  <CardHeader className="p-16">
                    <CardTitle className="text-5xl font-black mb-8 text-white tracking-tight uppercase italic">{feat.title}</CardTitle>
                    <CardDescription className="text-2xl text-white/50 leading-relaxed font-light italic">{feat.desc}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Enrollment Card */}
        <section className="py-60 px-6 relative overflow-hidden bg-black">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(96,212,255,0.1),transparent_70%)]" />
          
          <Card className="max-w-7xl mx-auto border-white/5 bg-white/[0.02] backdrop-blur-3xl rounded-[5rem] overflow-hidden relative z-10 shadow-[0_0_200px_rgba(0,0,0,1)]">
            <div className="grid lg:grid-cols-2">
              <div className="p-24 space-y-16">
                <div className="space-y-6">
                  <h2 className="text-8xl font-headline font-black text-white tracking-tighter uppercase italic leading-[0.85]">Join the <br /><span className="text-accent">Collective.</span></h2>
                  <p className="text-3xl text-white/40 leading-relaxed font-light italic">Neural linkage enrollment is active. Secure your position in the next cycle.</p>
                </div>
                
                <form onSubmit={handleSignUp} className="space-y-12">
                  <div className="grid gap-10">
                    <div className="relative group">
                      <Terminal className="absolute left-10 top-1/2 -translate-y-1/2 h-10 w-10 text-white/20 group-focus-within:text-accent transition-colors" />
                      <Input 
                        placeholder="Neural_Identifier (Email)" 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        className="bg-white/5 border-white/10 h-28 pl-24 pr-12 text-3xl focus:border-accent rounded-[2rem] placeholder:text-white/10 uppercase tracking-widest font-black transition-all"
                        required 
                      />
                    </div>
                    <div className="relative group">
                      <Unplug className="absolute left-10 top-1/2 -translate-y-1/2 h-10 w-10 text-white/20 group-focus-within:text-accent transition-colors" />
                      <Input 
                        placeholder="Security_Key (Password)" 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        className="bg-white/5 border-white/10 h-28 pl-24 pr-12 text-3xl focus:border-accent rounded-[2rem] placeholder:text-white/10 uppercase tracking-widest font-black transition-all"
                        required 
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full h-32 axiom-gradient text-white font-black text-5xl rounded-[2.5rem] shadow-2xl hover:shadow-accent/40 hover:scale-[1.02] transition-all duration-700 uppercase tracking-[0.3em] italic" disabled={loading}>
                    {loading ? "Establishing_Link..." : "Synchronize_Now"}
                  </Button>
                </form>

                <div className="flex items-center gap-12 pt-16 border-t border-white/10">
                  <div className="flex -space-x-8">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="h-20 w-20 rounded-full border-4 border-black bg-secondary overflow-hidden shadow-2xl scale-110 hover:z-50 transition-transform">
                        <Image src={`https://picsum.photos/seed/${i + 150}/200/200`} alt="Pilot" width={80} height={80} />
                      </div>
                    ))}
                  </div>
                  <span className="text-xl font-black text-white/40 uppercase tracking-[0.4em] italic">+24k Pilots Synced</span>
                </div>
              </div>

              <div className="relative bg-[#080808] p-24 flex flex-col items-center justify-center text-center gap-16 border-l border-white/5 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(96,212,255,0.08),transparent_70%)]" />
                <div className="relative group">
                  <div className="h-96 w-96 axiom-gradient rounded-[5rem] flex items-center justify-center shadow-[0_0_150px_rgba(96,212,255,0.5)] rotate-3 group-hover:rotate-0 transition-transform duration-1000 animate-float overflow-hidden">
                    <Gamepad2 className="h-48 w-48 text-white -rotate-3 group-hover:rotate-0 transition-transform duration-1000" />
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30" />
                  </div>
                  <Badge className="absolute -bottom-8 -right-8 bg-emerald-500 text-black font-black px-12 py-4 text-2xl border-0 shadow-[0_20px_40px_rgba(16,185,129,0.4)] uppercase tracking-[0.2em] italic rounded-2xl">v0.9.4_Stable</Badge>
                </div>
                
                <div className="space-y-8 relative">
                  <h3 className="text-6xl font-headline font-black text-white uppercase tracking-tighter italic">Ouroboros Client</h3>
                  <p className="text-2xl text-white/30 max-w-sm mx-auto font-light uppercase tracking-[0.4em] leading-none italic">Neural Optimized Interface.</p>
                </div>

                <div className="grid gap-8 w-full relative">
                  <Button variant="outline" className="h-28 w-full justify-between px-16 border-white/10 bg-white/5 hover:bg-white/10 text-white font-black rounded-[2.5rem] text-3xl transition-all uppercase italic shadow-2xl">
                    <span className="flex items-center gap-8"><Download className="h-10 w-10 text-accent" /> Android (.APK)</span>
                    <ChevronRight className="h-8 w-8 opacity-30" />
                  </Button>
                  <Button variant="outline" className="h-28 w-full justify-between px-16 border-white/10 bg-white/5 hover:bg-white/10 text-white font-black rounded-[2.5rem] text-3xl opacity-30 cursor-not-allowed uppercase italic">
                    <span className="flex items-center gap-8"><Monitor className="h-10 w-10" /> PC / Linux</span>
                    <span className="text-base bg-white/10 px-8 py-3 rounded-full italic tracking-[0.3em] uppercase font-bold">Q4 2025</span>
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </section>
      </main>

      <footer className="py-60 border-t border-white/5 bg-black relative">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-32">
          <div className="flex items-center gap-8 group cursor-pointer">
            <div className="h-16 w-16 axiom-gradient rounded-2xl flex items-center justify-center group-hover:rotate-180 transition-transform duration-[1.5s] shadow-2xl">
              <Infinity className="h-10 w-10 text-white" />
            </div>
            <span className="font-headline font-black text-5xl tracking-tighter text-white uppercase italic">Ouroboros</span>
          </div>
          
          <div className="flex flex-wrap justify-center gap-20 text-[14px] font-black tracking-[0.6em] text-white/30 uppercase">
            <Link href="#" className="hover:text-accent transition-colors duration-500">Discord</Link>
            <Link href="#" className="hover:text-accent transition-colors duration-500">Neural_Security</Link>
            <Link href="#" className="hover:text-accent transition-colors duration-500">Engine_Specs</Link>
            <Link href="#" className="hover:text-accent transition-colors duration-500">Terms_Collective</Link>
          </div>

          <div className="text-[14px] font-black text-white/10 tracking-[0.4em] uppercase italic">
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
          50% { transform: translateY(-30px) rotate(5deg); }
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
