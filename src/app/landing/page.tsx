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
  Bot,
  Layers,
  Activity,
  Infinity
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
    <div className="min-h-screen bg-[#020202] text-foreground selection:bg-accent selection:text-accent-foreground font-body overflow-x-hidden">
      {/* Cinematic Navigation */}
      <nav className="flex items-center justify-between px-8 py-6 border-b border-white/5 bg-black/40 backdrop-blur-2xl fixed top-0 w-full z-[100]">
        <div className="flex items-center gap-4 group cursor-pointer">
          <div className="h-12 w-12 axiom-gradient rounded-xl flex items-center justify-center shadow-[0_0_30px_rgba(96,212,255,0.4)] transition-transform group-hover:scale-110 duration-500">
            <Infinity className="h-7 w-7 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-headline font-black text-2xl tracking-tighter leading-none text-white">OUROBOROS</span>
            <span className="text-[10px] text-accent tracking-[0.4em] font-bold">COLLECTIVE</span>
          </div>
        </div>
        
        <div className="hidden lg:flex items-center gap-10">
          {["NEURAL CORE", "WORLD ENGINE", "COLLECTIVE LOGIC", "SYNCHRONIZE"].map((item) => (
            <Link key={item} href={`#${item.toLowerCase().replace(" ", "-")}`} className="text-[11px] font-black tracking-[0.2em] text-muted-foreground hover:text-accent transition-all duration-300">
              {item}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-6">
          <Button variant="ghost" className="hidden sm:flex text-[10px] font-black tracking-widest uppercase hover:text-accent" asChild>
            <Link href="/">ADMIN CONSOLE</Link>
          </Button>
          <Button className="axiom-gradient text-white border-0 px-8 py-6 rounded-xl font-black text-xs tracking-widest shadow-[0_0_20px_rgba(46,46,179,0.5)] hover:shadow-[0_0_40px_rgba(46,46,179,0.8)] transition-all">
            INITIALIZE SYNC
          </Button>
        </div>
      </nav>

      <main>
        {/* AAA Hyper-Hero */}
        <section className="relative h-screen flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image 
              src={PlaceHolderImages.find(img => img.id === 'world-chrome')?.imageUrl || ""} 
              alt="Next Gen City" 
              fill 
              className="object-cover opacity-60 scale-105 animate-pulse transition-transform duration-[10s] hover:scale-110"
              priority
              data-ai-hint="cyberpunk city"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#020202] via-[#020202]/40 to-transparent" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(96,212,255,0.15),transparent_60%)]" />
            
            {/* Moving Grid Overlay */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
          </div>

          <div className="max-w-7xl mx-auto text-center space-y-12 relative z-10 px-6">
            <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl mb-4">
              <span className="h-2 w-2 rounded-full bg-accent heartbeat-pulse" />
              <span className="text-[10px] font-black tracking-[0.3em] text-accent uppercase">Simulation Phase 0.9.4 Active</span>
            </div>
            
            <h1 className="text-6xl md:text-[10rem] font-headline font-black tracking-tighter leading-[0.85] text-white">
              HIGH GAMING.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-white to-primary bg-300% animate-gradient">HIGH SCIENCE.</span>
            </h1>
            
            <p className="text-lg md:text-3xl text-white/70 max-w-4xl mx-auto font-light leading-snug tracking-tight">
              Axiom Frontier presents the first <span className="text-white font-medium">Emergent AI-MMORPG</span>. 
              A deterministic reality where every byte is persistent and every player is a variable.
            </p>

            <div className="flex flex-wrap justify-center gap-8 pt-12">
              <Button size="lg" className="h-20 px-14 text-2xl font-black axiom-gradient text-white rounded-2xl shadow-[0_20px_50px_rgba(46,46,179,0.4)] hover:scale-105 hover:shadow-[0_20px_80px_rgba(46,46,179,0.6)] transition-all duration-500 gap-4">
                <Download className="h-8 w-8" /> ENTER COLLECTIVE
              </Button>
              <Button size="lg" variant="outline" className="h-20 px-14 text-2xl font-black border-white/10 bg-white/5 backdrop-blur-2xl text-white hover:bg-white/10 rounded-2xl transition-all duration-500">
                LORE ARCHIVE
              </Button>
            </div>

            <div className="pt-24 grid grid-cols-2 md:grid-cols-4 gap-12 max-w-5xl mx-auto">
              {[
                { label: "Logic Cycle", val: "144Hz" },
                { label: "AI Entities", val: "4.2M+" },
                { label: "World Shards", val: "1:1" },
                { label: "Deterministic", val: "TRUE" }
              ].map((stat, i) => (
                <div key={i} className="flex flex-col items-center group">
                  <span className="text-4xl font-headline font-black text-white group-hover:text-accent transition-colors">{stat.val}</span>
                  <span className="text-[11px] uppercase tracking-[0.3em] text-white/40 font-bold">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Visual Storytelling Section */}
        <section className="py-40 px-6 relative">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-32 items-center">
              <div className="space-y-12">
                <div className="space-y-4">
                  <Badge className="bg-accent/20 text-accent border-accent/30 px-6 py-2 text-xs font-black tracking-widest">NEURAL LINKAGE</Badge>
                  <h2 className="text-6xl md:text-8xl font-headline font-black tracking-tighter text-white leading-none">
                    Import Your <br />
                    <span className="text-accent italic">Ghost.</span>
                  </h2>
                </div>
                
                <p className="text-2xl text-white/60 leading-relaxed font-light">
                  Synthesis is not a character creator. It is an imprint. Using <span className="text-white font-medium">Gemini-Axiom Neural Link</span>, your character inherits your history, your logic, and your intent.
                </p>

                <div className="grid gap-8">
                  {[
                    { icon: Brain, title: "Deterministic Souls", desc: "No RNG. Character behavior is calculated by deep neural simulation." },
                    { icon: Bot, title: "Autonomous Agency", desc: "Your avatar operates in the open market and political arena 24/7." },
                    { icon: Layers, title: "Modular Evolution", desc: "Adapt your cybernetic shell based on live environmental CI data." }
                  ].map((item, i) => (
                    <div key={i} className="flex gap-6 group p-6 rounded-3xl hover:bg-white/5 transition-all border border-transparent hover:border-white/10">
                      <div className="h-16 w-16 rounded-2xl bg-secondary flex items-center justify-center group-hover:bg-accent group-hover:text-black transition-all duration-500">
                        <item.icon className="h-8 w-8" />
                      </div>
                      <div>
                        <h4 className="text-2xl font-black text-white mb-1 tracking-tight">{item.title}</h4>
                        <p className="text-lg text-white/40">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="absolute -inset-20 bg-accent/20 blur-[120px] opacity-20" />
                <div className="relative rounded-[40px] border border-white/10 bg-black p-4 shadow-[0_50px_100px_rgba(0,0,0,0.8)] overflow-hidden">
                  <div className="aspect-[3/4] relative rounded-[32px] overflow-hidden">
                    <Image 
                      src={PlaceHolderImages.find(img => img.id === 'asset-robot')?.imageUrl || ""} 
                      alt="Next Gen Model" 
                      fill 
                      className="object-cover group-hover:scale-110 transition-transform duration-[5s]"
                      data-ai-hint="futuristic robot"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                    
                    {/* UI HUD Overlays */}
                    <div className="absolute top-8 left-8 p-4 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10">
                      <Activity className="h-6 w-6 text-accent animate-pulse mb-2" />
                      <div className="text-[10px] font-black tracking-widest text-white/50">NEURAL STABILITY</div>
                      <div className="text-xl font-headline font-black text-white">99.8%</div>
                    </div>
                    
                    <div className="absolute bottom-10 left-10 right-10">
                      <div className="flex justify-between items-end mb-4">
                        <div>
                          <div className="text-[10px] font-black tracking-widest text-accent mb-1">UNIT: 00-AXIOM</div>
                          <div className="text-3xl font-headline font-black text-white italic">PROTOTYPE S-1</div>
                        </div>
                        <Badge className="bg-accent text-black font-black">LEGENDARY</Badge>
                      </div>
                      <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full w-[88%] bg-accent heartbeat-pulse" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Cinematic Feature Grid */}
        <section className="py-40 bg-[#050505]">
          <div className="max-w-7xl mx-auto px-6 space-y-32">
            <div className="text-center space-y-6">
              <h2 className="text-6xl md:text-8xl font-headline font-black tracking-tighter text-white">HIGH SCIENCE ARCHITECTURE</h2>
              <p className="text-2xl text-white/40 max-w-3xl mx-auto font-light leading-relaxed">The technology behind the collective is as complex as the world it creates.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-12">
              {[
                { 
                  icon: Globe, 
                  title: "Singularity Engine", 
                  desc: "One persistent world. Zero loading. One 144Hz heartbeat for all players.",
                  img: 'region-nebulas-edge',
                  hint: "nebula space"
                },
                { 
                  icon: ShieldCheck, 
                  title: "AxiomCore Security", 
                  desc: "Deterministic logic ensures 100% cheat-free economy and physics.",
                  img: 'item-cyber-deck',
                  hint: "cyberpunk technology"
                },
                { 
                  icon: Cpu, 
                  title: "Edge Simulation", 
                  desc: "High-context NPCs driven by a custom Gemini LLM layer.",
                  img: 'asset-blueprint',
                  hint: "blueprint"
                }
              ].map((feat, i) => (
                <Card key={i} className="group border-0 bg-white/[0.03] hover:bg-white/[0.06] transition-all duration-700 rounded-[32px] overflow-hidden">
                  <div className="aspect-[16/10] relative overflow-hidden">
                    <Image 
                      src={PlaceHolderImages.find(img => img.id === feat.img)?.imageUrl || ""} 
                      alt={feat.title} 
                      fill 
                      className="object-cover opacity-50 group-hover:opacity-80 group-hover:scale-110 transition-all duration-700"
                      data-ai-hint={feat.hint}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050505] to-transparent" />
                    <feat.icon className="absolute bottom-8 left-8 h-12 w-12 text-accent" />
                  </div>
                  <CardHeader className="p-10">
                    <CardTitle className="text-3xl font-black mb-4 text-white tracking-tight">{feat.title}</CardTitle>
                    <CardDescription className="text-xl text-white/50 leading-relaxed">{feat.desc}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* AAA Enrollment Section */}
        <section className="py-40 px-6 relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_top,rgba(96,212,255,0.05),transparent_70%)]" />
          
          <Card className="max-w-6xl mx-auto border-white/5 bg-black/40 backdrop-blur-3xl rounded-[48px] overflow-hidden relative z-10 shadow-[0_0_150px_rgba(0,0,0,1)]">
            <div className="grid lg:grid-cols-2">
              <div className="p-20 space-y-12">
                <div className="space-y-4">
                  <h2 className="text-6xl font-headline font-black text-white tracking-tighter">JOIN THE <br /><span className="text-accent italic">COLLECTIVE.</span></h2>
                  <p className="text-xl text-white/40 leading-relaxed">Priority neural linkage enrollment is now open. Secure your position in the upcoming Ouroboros alpha cycle.</p>
                </div>
                
                <form onSubmit={handleSignUp} className="space-y-8">
                  <div className="grid gap-6">
                    <Input 
                      placeholder="NEURAL IDENTIFIER (EMAIL)" 
                      type="email" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      className="bg-white/5 border-white/10 h-20 px-8 text-xl focus:border-accent rounded-2xl placeholder:text-white/20"
                      required 
                    />
                    <Input 
                      placeholder="SECURITY KEY (PASSWORD)" 
                      type="password" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      className="bg-white/5 border-white/10 h-20 px-8 text-xl focus:border-accent rounded-2xl placeholder:text-white/20"
                      required 
                    />
                  </div>
                  <Button type="submit" className="w-full h-20 axiom-gradient text-white font-black text-2xl rounded-2xl shadow-xl hover:shadow-accent/20 transition-all uppercase tracking-widest" disabled={loading}>
                    {loading ? "ESTABLISHING LINK..." : "SYNCHRONIZE NOW"}
                  </Button>
                </form>

                <div className="flex items-center gap-8 pt-8 border-t border-white/10">
                  <div className="flex -space-x-4">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="h-14 w-14 rounded-full border-4 border-black bg-secondary overflow-hidden shadow-xl">
                        <Image src={`https://picsum.photos/seed/${i + 50}/200/200`} alt="Pilot" width={56} height={56} />
                      </div>
                    ))}
                  </div>
                  <span className="text-sm font-black text-white/40 uppercase tracking-[0.2em]">+24k PILOTS SYNCHED</span>
                </div>
              </div>

              <div className="relative bg-[#080808] p-20 flex flex-col items-center justify-center text-center gap-10 border-l border-white/5 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(96,212,255,0.05),transparent_70%)]" />
                <div className="relative">
                  <div className="h-56 w-56 axiom-gradient rounded-[40px] flex items-center justify-center shadow-[0_0_100px_rgba(96,212,255,0.3)] rotate-3 animate-float">
                    <Gamepad2 className="h-28 w-28 text-white -rotate-3" />
                  </div>
                  <Badge className="absolute -bottom-4 -right-4 bg-emerald-500 text-black font-black px-6 py-2 text-sm border-0 shadow-2xl">v0.9.4 STABLE</Badge>
                </div>
                
                <div className="space-y-4 relative">
                  <h3 className="text-4xl font-headline font-black text-white uppercase tracking-tighter">OUROBOROS CLIENT</h3>
                  <p className="text-lg text-white/40 max-w-xs mx-auto">Optimized for high-performance neural interfaces and 4K logic rendering.</p>
                </div>

                <div className="grid gap-4 w-full relative">
                  <Button variant="outline" className="h-20 w-full justify-between px-10 border-white/10 bg-white/5 hover:bg-white/10 text-white font-black rounded-2xl text-xl">
                    <span className="flex items-center gap-4"><Download className="h-6 w-6 text-accent" /> ANDROID (.APK)</span>
                    <ChevronRight className="h-5 w-5 opacity-30" />
                  </Button>
                  <Button variant="outline" className="h-20 w-full justify-between px-10 border-white/10 bg-white/5 hover:bg-white/10 text-white font-black rounded-2xl text-xl opacity-40 cursor-not-allowed">
                    <span className="flex items-center gap-4"><Monitor className="h-6 w-6" /> PC / LINUX</span>
                    <span className="text-xs bg-white/10 px-4 py-1.5 rounded-full italic tracking-widest uppercase">Q4 2025</span>
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </section>
      </main>

      <footer className="py-32 border-t border-white/5 bg-black">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-16">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 axiom-gradient rounded-lg flex items-center justify-center">
              <Infinity className="h-6 w-6 text-white" />
            </div>
            <span className="font-headline font-black text-2xl tracking-tighter text-white">OUROBOROS</span>
          </div>
          
          <div className="flex flex-wrap justify-center gap-12 text-[10px] font-black tracking-[0.4em] text-white/40 uppercase">
            <Link href="#" className="hover:text-accent transition-colors">Discord</Link>
            <Link href="#" className="hover:text-accent transition-colors">Neural Security</Link>
            <Link href="#" className="hover:text-accent transition-colors">Engine Specs</Link>
            <Link href="#" className="hover:text-accent transition-colors">Collective Terms</Link>
          </div>

          <div className="text-[10px] font-black text-white/20 tracking-[0.2em] uppercase">
            &copy; 2025 OUROBOROS COLLECTIVE // AXIOM FRONTIER LOGIC CORE
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
          50% { transform: translateY(-20px) rotate(5deg); }
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
