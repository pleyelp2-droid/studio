"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Download, 
  Gamepad2, 
  Globe, 
  Brain, 
  Cpu, 
  ChevronRight,
  Monitor,
  Bot,
  Layers,
  Infinity,
  Terminal,
  Unplug,
  Fingerprint,
  ShieldCheck,
  Sparkles
} from "lucide-react"
import { useAuth, useFirestore } from "@/firebase"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import { PlaceHolderImages } from "@/lib/placeholder-images"

export default function LandingPage() {
  const auth = useAuth()
  const db = useFirestore()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!auth || !db) return
    setLoading(true)
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Create LIVE player record in Firestore immediately upon signup
      await setDoc(doc(db, "players", user.uid), {
        id: user.uid,
        displayName: email.split('@')[0],
        level: 1,
        position: { x: Math.random() * 100, y: 0, z: Math.random() * 100 },
        createdAt: new Date().toISOString()
      })

      toast({ 
        title: "Neural Link Established", 
        description: "Your consciousness has been registered. Welcome to the Collective." 
      })
    } catch (e: any) {
      toast({ 
        variant: "destructive", 
        title: "Registration Denied", 
        description: e.message 
      })
    } finally {
      setLoading(false)
    }
  }

  const getImg = (id: string) => PlaceHolderImages.find(img => img.id === id)

  return (
    <div className="min-h-screen bg-[#020202] text-foreground selection:bg-accent selection:text-accent-foreground font-body overflow-x-hidden">
      {/* AAA Navigation */}
      <nav className="flex items-center justify-between px-12 py-8 border-b border-white/5 bg-black/40 backdrop-blur-3xl fixed top-0 w-full z-[100]">
        <div className="flex items-center gap-6 group cursor-pointer">
          <div className="h-14 w-14 axiom-gradient rounded-[1.25rem] flex items-center justify-center shadow-[0_0_40px_rgba(96,212,255,0.4)] transition-transform group-hover:scale-110 duration-700">
            <Infinity className="h-8 w-8 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-headline font-black text-3xl tracking-tighter leading-none text-white uppercase italic">Ouroboros</span>
            <span className="text-[10px] text-accent tracking-[0.5em] font-black">COLLECTIVE // v0.9.4</span>
          </div>
        </div>
        
        <div className="hidden lg:flex items-center gap-14">
          {["WORLD_CORE", "DETERMINISM", "SINGULARITY", "NEURAL_LINK"].map((item) => (
            <Link key={item} href={`#${item.toLowerCase()}`} className="text-[11px] font-black tracking-[0.3em] text-white/40 hover:text-accent transition-all duration-300 uppercase italic">
              {item}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-8">
          <Button variant="ghost" className="hidden sm:flex text-[11px] font-black tracking-widest uppercase hover:text-accent italic" asChild>
            <Link href="/">DASHBOARD</Link>
          </Button>
          <Button className="axiom-gradient text-white border-0 px-10 py-7 rounded-2xl font-black text-xs tracking-widest shadow-[0_0_30px_rgba(46,46,179,0.5)] hover:shadow-[0_0_60px_rgba(46,46,179,0.8)] transition-all uppercase italic">
            INIT_COLLECTIVE
          </Button>
        </div>
      </nav>

      <main>
        {/* AAA Hyper-Hero Section */}
        <section className="relative h-[115vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image 
              src={getImg('world-chrome')?.imageUrl || ""} 
              alt="Ouroboros Metropolis" 
              fill 
              className="object-cover opacity-60 scale-105 transition-transform duration-[40s] hover:scale-115"
              priority
              data-ai-hint="cyberpunk city"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#020202] via-[#020202]/50 to-transparent" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(96,212,255,0.15),transparent_70%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.15)_50%)] bg-[length:100%_4px] pointer-events-none opacity-25" />
          </div>

          <div className="max-w-7xl mx-auto text-center space-y-14 relative z-10 px-6">
            <div className="inline-flex items-center gap-4 px-10 py-4 rounded-full bg-white/5 border border-white/10 backdrop-blur-3xl mb-6 shadow-2xl">
              <span className="h-2.5 w-2.5 rounded-full bg-accent heartbeat-pulse shadow-[0_0_10px_rgba(96,212,255,0.8)]" />
              <span className="text-[12px] font-black tracking-[0.5em] text-accent uppercase italic">Simulation Phase 0.9.4 // Deterministic Sync Active</span>
            </div>
            
            <h1 className="text-9xl md:text-[16rem] font-headline font-black tracking-tighter leading-[0.75] text-white italic drop-shadow-[0_0_80px_rgba(255,255,255,0.1)]">
              HIGH GAMING.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-white to-primary bg-300% animate-gradient">HIGH SCIENCE.</span>
            </h1>
            
            <p className="text-3xl md:text-6xl text-white/80 max-w-6xl mx-auto font-light leading-snug tracking-tight italic">
              Axiom Frontier presents the first <span className="text-white font-medium italic underline decoration-accent/50 decoration-4 underline-offset-[16px]">Emergent AI-MMORPG</span>. 
              A deterministic reality where every byte is persistent.
            </p>

            <div className="flex flex-wrap justify-center gap-14 pt-20">
              <Button size="lg" className="h-32 px-24 text-5xl font-black axiom-gradient text-white rounded-[2.5rem] shadow-[0_40px_80px_rgba(46,46,179,0.5)] hover:scale-105 hover:shadow-[0_40px_100px_rgba(46,46,179,0.7)] transition-all duration-1000 gap-8 uppercase tracking-tighter italic">
                <Download className="h-16 w-16" /> Enter Collective
              </Button>
              <Button size="lg" variant="outline" className="h-32 px-24 text-5xl font-black border-white/10 bg-white/5 backdrop-blur-3xl text-white hover:bg-white/10 rounded-[2.5rem] transition-all duration-1000 uppercase tracking-tighter italic shadow-2xl">
                Lore_Archive
              </Button>
            </div>

            <div className="pt-40 grid grid-cols-2 md:grid-cols-4 gap-24 max-w-6xl mx-auto border-t border-white/5">
              {[
                { label: "Deterministic", val: "TRUE" },
                { label: "AI_Entities", val: "4.2M+" },
                { label: "Logic_Cycle", val: "144Hz" },
                { label: "World_Shards", val: "1:1" }
              ].map((stat, i) => (
                <div key={i} className="flex flex-col items-center group cursor-default">
                  <span className="text-7xl font-headline font-black text-white group-hover:text-accent transition-all duration-700 italic">{stat.val}</span>
                  <div className="h-[4px] w-14 bg-accent/20 my-6 group-hover:w-full transition-all duration-1000" />
                  <span className="text-[13px] uppercase tracking-[0.5em] text-white/40 font-black italic">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Neural Character Synthesis Section */}
        <section className="py-72 px-8 relative bg-[#030303] border-y border-white/5 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_left,rgba(96,212,255,0.08),transparent_70%)]" />
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-48 items-center">
              <div className="relative group">
                <div className="absolute -inset-24 bg-accent/20 blur-[180px] opacity-20 group-hover:opacity-40 transition-opacity duration-1000" />
                <div className="relative rounded-[64px] border border-white/10 bg-black p-8 shadow-[0_100px_200px_rgba(0,0,0,1)] overflow-hidden">
                  <div className="aspect-[3/4] relative rounded-[48px] overflow-hidden group">
                    <Image 
                      src={getImg('asset-robot')?.imageUrl || ""} 
                      alt="Next Gen AI Avatar" 
                      fill 
                      className="object-cover transition-transform duration-[40s] group-hover:scale-115"
                      data-ai-hint="futuristic robot"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                    
                    {/* UI HUD Overlays */}
                    <div className="absolute top-12 left-12 p-10 bg-black/80 backdrop-blur-3xl rounded-[2.5rem] border border-white/15 shadow-2xl">
                      <Fingerprint className="h-12 w-12 text-accent animate-pulse mb-6" />
                      <div className="text-[14px] font-black tracking-[0.6em] text-white/40 uppercase italic">Neural Integrity</div>
                      <div className="text-4xl font-headline font-black text-white italic">99.8%</div>
                    </div>

                    <div className="absolute bottom-20 left-16 right-16">
                      <div className="flex flex-col gap-6">
                        <div className="text-[14px] font-black tracking-[0.6em] text-accent uppercase italic">Unit Identifier</div>
                        <div className="text-7xl font-headline font-black text-white italic tracking-tighter uppercase">SYNTH_V1.img</div>
                        <div className="h-4 w-full bg-white/10 rounded-full overflow-hidden backdrop-blur-md">
                          <div className="h-full w-[92%] bg-accent heartbeat-pulse shadow-[0_0_30px_rgba(96,212,255,1)]" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-20">
                <div className="space-y-8">
                  <Badge className="bg-accent/20 text-accent border-accent/40 px-10 py-4 text-sm font-black tracking-[0.4em] uppercase italic">The Neural Link</Badge>
                  <h2 className="text-9xl md:text-[13rem] font-headline font-black tracking-tighter text-white leading-[0.8] italic uppercase">
                    Import Your <br />
                    <span className="text-accent italic">Ghost.</span>
                  </h2>
                </div>
                
                <p className="text-4xl text-white/60 leading-relaxed font-light italic">
                  Character creation is archaic. In Ouroboros, you import your <span className="text-white font-medium italic underline decoration-accent/30 underline-offset-8">Consciousness</span>. Your shell inherits your logic, intent, and memories.
                </p>

                <div className="grid gap-14">
                  {[
                    { icon: Brain, title: "Neural Imprinting", desc: "Synthesis of character personality from uploaded neural patterns and behavioral history." },
                    { icon: Bot, title: "Autonomous Agency", desc: "Your ghost remains persistent. It lives, trades, and builds even when the pilot is offline." },
                    { icon: Layers, title: "Modular Shells", desc: "Real-time cybernetic evolution driven by deterministic world data streamed from the Singularity." }
                  ].map((item, i) => (
                    <div key={i} className="flex gap-12 group p-12 rounded-[3rem] bg-white/[0.03] hover:bg-white/[0.07] transition-all duration-700 border border-transparent hover:border-white/10 shadow-3xl">
                      <div className="h-28 w-28 rounded-[2rem] bg-secondary/50 flex items-center justify-center group-hover:axiom-gradient group-hover:text-black transition-all duration-1000 shrink-0 shadow-2xl">
                        <item.icon className="h-14 w-14" />
                      </div>
                      <div>
                        <h4 className="text-4xl font-black text-white mb-5 tracking-tight uppercase italic">{item.title}</h4>
                        <p className="text-2xl text-white/40 font-light leading-relaxed italic">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Button size="lg" className="h-32 w-full text-4xl font-black bg-white/5 border border-white/15 hover:bg-accent hover:text-black hover:border-accent transition-all duration-1000 rounded-[2.5rem] uppercase tracking-[0.4em] italic shadow-3xl">
                  Initialize Imprint
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Persistent World Showcase */}
        <section className="py-72 bg-[#050505] relative overflow-hidden border-b border-white/5">
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
          <div className="max-w-7xl mx-auto px-8 space-y-48">
            <div className="text-center space-y-10">
              <h2 className="text-9xl md:text-[15rem] font-headline font-black tracking-tighter text-white italic drop-shadow-3xl uppercase">THE ENGINE</h2>
              <p className="text-5xl text-white/30 max-w-5xl mx-auto font-light leading-relaxed uppercase tracking-[0.5em] italic">Persistent. Deterministic. Absolute.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-24">
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
                <Card key={i} className="group border-0 bg-white/[0.01] hover:bg-white/[0.04] transition-all duration-1000 rounded-[5rem] overflow-hidden shadow-3xl">
                  <div className="aspect-[16/12] relative overflow-hidden">
                    <Image 
                      src={getImg(feat.img)?.imageUrl || ""} 
                      alt={feat.title} 
                      fill 
                      className="object-cover opacity-60 group-hover:opacity-100 group-hover:scale-115 transition-all duration-[3s]"
                      data-ai-hint={feat.hint}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />
                    <div className="absolute bottom-14 left-14 h-24 w-24 axiom-gradient rounded-[2rem] flex items-center justify-center shadow-3xl">
                      <feat.icon className="h-14 w-14 text-white" />
                    </div>
                  </div>
                  <CardHeader className="p-20">
                    <CardTitle className="text-6xl font-black mb-10 text-white tracking-tight uppercase italic">{feat.title}</CardTitle>
                    <CardDescription className="text-3xl text-white/50 leading-relaxed font-light italic">{feat.desc}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* High Science Enrollment Portal */}
        <section className="py-72 px-8 relative overflow-hidden bg-black">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(96,212,255,0.12),transparent_70%)]" />
          
          <Card className="max-w-7xl mx-auto border-white/5 bg-white/[0.03] backdrop-blur-3xl rounded-[6rem] overflow-hidden relative z-10 shadow-[0_0_250px_rgba(0,0,0,1)]">
            <div className="grid lg:grid-cols-2">
              <div className="p-28 space-y-20">
                <div className="space-y-8">
                  <h2 className="text-9xl font-headline font-black text-white tracking-tighter uppercase italic leading-[0.8]">Join the <br /><span className="text-accent">Collective.</span></h2>
                  <p className="text-4xl text-white/40 leading-relaxed font-light italic">Neural linkage enrollment is active. Secure your position in the next cycle.</p>
                </div>
                
                <form onSubmit={handleSignUp} className="space-y-14">
                  <div className="grid gap-12">
                    <div className="relative group">
                      <Terminal className="absolute left-12 top-1/2 -translate-y-1/2 h-12 w-12 text-white/20 group-focus-within:text-accent transition-colors duration-500" />
                      <Input 
                        placeholder="Neural_Identifier (Email)" 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        className="bg-white/5 border-white/10 h-32 pl-28 pr-14 text-4xl focus:border-accent rounded-[2.5rem] placeholder:text-white/10 uppercase tracking-widest font-black transition-all italic"
                        required 
                      />
                    </div>
                    <div className="relative group">
                      <Unplug className="absolute left-12 top-1/2 -translate-y-1/2 h-12 w-12 text-white/20 group-focus-within:text-accent transition-colors duration-500" />
                      <Input 
                        placeholder="Security_Key (Password)" 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        className="bg-white/5 border-white/10 h-32 pl-28 pr-14 text-4xl focus:border-accent rounded-[2.5rem] placeholder:text-white/10 uppercase tracking-widest font-black transition-all italic"
                        required 
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full h-36 axiom-gradient text-white font-black text-6xl rounded-[3rem] shadow-3xl hover:shadow-accent/50 hover:scale-[1.03] transition-all duration-1000 uppercase tracking-[0.4em] italic" disabled={loading}>
                    {loading ? "Establishing_Link..." : "Synchronize_Now"}
                  </Button>
                </form>

                <div className="flex items-center gap-14 pt-20 border-t border-white/10">
                  <div className="flex -space-x-10">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="h-24 w-24 rounded-full border-4 border-black bg-secondary overflow-hidden shadow-3xl scale-110 hover:z-50 transition-transform duration-500">
                        <Image src={`https://picsum.photos/seed/${i + 150}/300/300`} alt="Pilot" width={100} height={100} />
                      </div>
                    ))}
                  </div>
                  <span className="text-2xl font-black text-white/40 uppercase tracking-[0.5em] italic">+24k Pilots Synced</span>
                </div>
              </div>

              <div className="relative bg-[#080808] p-28 flex flex-col items-center justify-center text-center gap-20 border-l border-white/5 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(96,212,255,0.1),transparent_70%)]" />
                <div className="relative group">
                  <div className="h-[28rem] w-[28rem] axiom-gradient rounded-[6rem] flex items-center justify-center shadow-[0_0_200px_rgba(96,212,255,0.6)] rotate-3 group-hover:rotate-0 transition-transform duration-1000 animate-float overflow-hidden">
                    <Gamepad2 className="h-56 w-56 text-white -rotate-3 group-hover:rotate-0 transition-transform duration-1000" />
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30" />
                  </div>
                  <Badge className="absolute -bottom-10 -right-10 bg-emerald-500 text-black font-black px-14 py-5 text-3xl border-0 shadow-[0_30px_60px_rgba(16,185,129,0.5)] uppercase tracking-[0.3em] italic rounded-3xl">v0.9.4_Stable</Badge>
                </div>
                
                <div className="space-y-10 relative">
                  <h3 className="text-7xl font-headline font-black text-white uppercase tracking-tighter italic">Ouroboros Client</h3>
                  <p className="text-3xl text-white/30 max-w-sm mx-auto font-light uppercase tracking-[0.5em] leading-none italic">Neural Optimized Interface.</p>
                </div>

                <div className="grid gap-10 w-full relative">
                  <Button variant="outline" className="h-32 w-full justify-between px-20 border-white/10 bg-white/5 hover:bg-white/10 text-white font-black rounded-[3rem] text-4xl transition-all duration-700 uppercase italic shadow-3xl">
                    <span className="flex items-center gap-10"><Download className="h-12 w-12 text-accent" /> Android (.APK)</span>
                    <ChevronRight className="h-10 w-10 opacity-30" />
                  </Button>
                  <Button variant="outline" className="h-32 w-full justify-between px-20 border-white/10 bg-white/5 hover:bg-white/10 text-white font-black rounded-[3rem] text-4xl opacity-30 cursor-not-allowed uppercase italic">
                    <span className="flex items-center gap-10"><Monitor className="h-12 w-12" /> PC / Linux</span>
                    <span className="text-base bg-white/10 px-10 py-4 rounded-full italic tracking-[0.4em] uppercase font-bold">Q4 2025</span>
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </section>
      </main>

      <footer className="py-72 border-t border-white/5 bg-black relative">
        <div className="max-w-7xl mx-auto px-10 flex flex-col md:flex-row justify-between items-center gap-40">
          <div className="flex items-center gap-10 group cursor-pointer">
            <div className="h-20 w-20 axiom-gradient rounded-3xl flex items-center justify-center group-hover:rotate-180 transition-transform duration-[2s] shadow-3xl">
              <Infinity className="h-12 w-12 text-white" />
            </div>
            <span className="font-headline font-black text-6xl tracking-tighter text-white uppercase italic">Ouroboros</span>
          </div>
          
          <div className="flex flex-wrap justify-center gap-24 text-[16px] font-black tracking-[0.8em] text-white/30 uppercase italic">
            <Link href="#" className="hover:text-accent transition-colors duration-700">Discord</Link>
            <Link href="#" className="hover:text-accent transition-colors duration-700">Neural_Security</Link>
            <Link href="#" className="hover:text-accent transition-colors duration-700">Engine_Specs</Link>
            <Link href="#" className="hover:text-accent transition-colors duration-700">Terms_Collective</Link>
          </div>

          <div className="text-[14px] font-black text-white/10 tracking-[0.5em] uppercase italic">
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
          50% { transform: translateY(-40px) rotate(6deg); }
        }
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
        .bg-300% {
          background-size: 300% 300%;
        }
      `}</style>
    </div>
  )
}