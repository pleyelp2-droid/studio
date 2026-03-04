"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Gamepad2, 
  Sword,
  Cpu,
  ArrowRight,
  Infinity,
  Menu,
  X,
  Layers,
  Activity,
  History,
  Play,
  Monitor,
  Globe,
  Zap,
  ChevronRight
} from "lucide-react"
import { useFirestore, useDoc, useMemoFirebase } from "@/firebase"
import { doc } from "firebase/firestore"
import Image from "next/image"
import { PlaceHolderImages } from "@/lib/placeholder-images"
import { motion, AnimatePresence } from "framer-motion"

export default function MMORPGPortal() {
  const db = useFirestore()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('landscape')
  
  const worldRef = useMemoFirebase(() => db ? doc(db, "worldState", "global") : null, [db])
  const { data: worldState } = useDoc(worldRef)

  useEffect(() => {
    const checkOrientation = () => {
      setOrientation(window.innerWidth > window.innerHeight ? 'landscape' : 'portrait')
    }
    checkOrientation()
    window.addEventListener('resize', checkOrientation)
    return () => window.removeEventListener('resize', checkOrientation)
  }, [])

  const getImg = (id: string) => PlaceHolderImages.find(img => img.id === id)

  return (
    <div className="min-h-screen bg-[#020203] text-[#e8dfc8] selection:bg-accent selection:text-accent-foreground font-body overflow-x-hidden">
      {/* Cinematic Background */}
      <div className="fixed inset-0 z-0">
        <Image 
          src={getImg('world-chrome')?.imageUrl || "https://images.unsplash.com/photo-1605142859862-978be7eba909"} 
          alt="Ouroboros Nexus" 
          fill 
          className="object-cover opacity-40 scale-105"
          priority
          data-ai-hint="cyberpunk city"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/95 via-[#020203]/80 to-[#020203]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(123,79,212,0.15),transparent_70%)]" />
      </div>

      {/* Persistent Navigation */}
      <nav className="fixed top-0 w-full z-[100] bg-black/80 backdrop-blur-2xl border-b border-white/5 px-6 lg:px-12 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4 group cursor-pointer">
            <div className="h-12 w-12 axiom-gradient rounded-2xl flex items-center justify-center shadow-2xl group-hover:rotate-180 transition-transform duration-1000">
              <Infinity className="h-7 w-7 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-headline font-black text-2xl tracking-tighter text-white uppercase italic leading-none">Ouroboros</span>
              <span className="text-[9px] text-accent font-black tracking-[0.5em] mt-1 uppercase">Axiom Nexus</span>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-12">
            {["THE WORLD", "ARCHETYPES", "PLAYER ECONOMY", "CHRONICLES"].map((item) => (
              <Link 
                key={item} 
                href={`#${item.toLowerCase().replace(' ', '-')}`} 
                className="text-[11px] font-black tracking-[0.3em] text-white/40 hover:text-accent transition-all uppercase hover:tracking-[0.4em]"
              >
                {item}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" className="hidden sm:flex text-[10px] font-black tracking-widest uppercase text-white/60 hover:text-white border border-white/5 hover:bg-white/5" asChild>
              <Link href="/dashboard">ADMIN_CONSOLE</Link>
            </Button>
            <Button className="axiom-gradient text-white border-0 px-8 h-12 font-black text-[11px] tracking-widest shadow-2xl rounded-xl uppercase italic group" asChild>
              <Link href="/character-creator">
                ESTABLISH_LINK <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <button className="lg:hidden p-2 text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile/Tablet Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed inset-0 z-[90] bg-black/98 backdrop-blur-3xl lg:hidden flex flex-col items-center justify-center gap-10"
          >
            {["WORLD", "CLASSES", "ECONOMY", "LORE", "DASHBOARD"].map((item) => (
              <Link 
                key={item} 
                href={item === 'DASHBOARD' ? '/dashboard' : `#${item.toLowerCase()}`} 
                onClick={() => setIsMenuOpen(false)} 
                className="text-3xl font-headline font-black text-white italic uppercase tracking-widest hover:text-accent transition-colors"
              >
                {item}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <main className="relative z-10 pt-32 lg:pt-48">
        {/* Hero Section - Optimized for Tablet aspect ratios */}
        <section className={`px-6 lg:px-12 pb-20 flex flex-col items-center text-center max-w-7xl mx-auto ${orientation === 'portrait' ? 'pt-10' : 'pt-0'}`}>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-4 px-6 py-2.5 rounded-full bg-accent/10 border border-accent/30 backdrop-blur-xl mb-12"
          >
            <div className="flex gap-1.5">
              <div className="h-2 w-2 rounded-full bg-accent heartbeat-pulse" />
              <div className="h-2 w-2 rounded-full bg-accent heartbeat-pulse delay-75" />
              <div className="h-2 w-2 rounded-full bg-accent heartbeat-pulse delay-150" />
            </div>
            <span className="text-[10px] font-black tracking-[0.4em] text-accent uppercase">
              Server Status: Online // Tick {worldState?.tick || 0} // Sync: Established
            </span>
          </motion.div>

          <h1 className="text-6xl md:text-9xl lg:text-[10rem] font-headline font-black leading-[0.85] text-white italic tracking-tighter mb-10 drop-shadow-[0_0_60px_rgba(31,184,184,0.4)] uppercase">
            Claim Your<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-white to-[#7b4fd4] animate-gradient">LEGACY.</span>
          </h1>

          <p className="text-lg md:text-2xl text-white/60 max-w-4xl mx-auto font-medium leading-relaxed mb-16 px-4 uppercase tracking-tight italic">
            Enter the infinite recursion. A persistent AI-MMORPG where every <span className="text-white font-black">Neural Ghost</span> possesses unique memories and every action is carved into the permanent world ledger.
          </p>

          <div className="flex flex-col sm:flex-row gap-8 w-full max-w-2xl justify-center px-4">
            <Button size="lg" className="h-20 lg:h-24 px-12 axiom-gradient text-white text-xl font-black italic uppercase tracking-widest rounded-2xl shadow-[0_20px_50px_rgba(31,184,184,0.3)] hover:scale-105 transition-all group flex-1" asChild>
              <Link href="/character-creator">
                <Play className="mr-3 h-7 w-7 group-hover:scale-110 fill-current" />
                Play Now
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-20 lg:h-24 px-12 border-white/10 bg-white/5 backdrop-blur-xl text-white text-xl font-black italic uppercase tracking-widest rounded-2xl hover:bg-white/10 transition-all flex-1 shadow-2xl" asChild>
              <Link href="/world-preview">
                <Monitor className="mr-3 h-6 w-6" />
                World Preview
              </Link>
            </Button>
          </div>
        </section>

        {/* Real-time Ticker */}
        <div className="w-full bg-accent/5 border-y border-accent/20 py-4 mb-20 overflow-hidden whitespace-nowrap">
          <div className="flex animate-marquee gap-20">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest italic">
                  Axiomatic Load: 64.2% // Memory Persistence: Active // Collective Yield: +2.1% // Sector 0_0: Stable
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Archetypes Showcase */}
        <section id="archetypes" className="px-6 lg:px-12 py-32 bg-black/40">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-24 gap-10">
              <div className="space-y-4">
                <Badge variant="outline" className="border-accent/30 text-accent font-black tracking-[0.5em] uppercase text-[10px] px-4 py-1">Choose Your Function</Badge>
                <h3 className="text-5xl lg:text-8xl font-headline font-black text-white italic uppercase tracking-tighter">The Classes.</h3>
              </div>
              <p className="text-white/40 text-sm max-w-md uppercase font-bold tracking-[0.2em] leading-loose border-l-2 border-accent pl-8">
                Your neural ghost is imprinted with a functional blueprint. This determines how you shape the simulation around you.
              </p>
            </div>

            <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
              {[
                { name: 'PILOT', icon: Gamepad2, color: 'text-accent', bg: 'bg-accent/5', desc: 'Masters of world-sync. They manifest reality through neural focus and logic calibration.' },
                { name: 'ENFORCER', icon: Sword, color: 'text-red-500', bg: 'bg-red-500/5', desc: 'Brute force stabilization. They purge corruption through dominance and combat protocols.' },
                { name: 'TECH_WEAVER', icon: Cpu, color: 'text-[#7b4fd4]', bg: 'bg-[#7b4fd4]/5', desc: 'Code manipulators. They craft the infrastructure of the High Science era using logic strings.' }
              ].map((cls) => (
                <motion.div 
                  key={cls.name}
                  whileHover={{ y: -10 }}
                  className={`group p-12 rounded-[3.5rem] border border-white/5 ${cls.bg} hover:border-accent/40 transition-all duration-700 flex flex-col gap-10 shadow-2xl relative overflow-hidden`}
                >
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                    <cls.icon className="h-32 w-32" />
                  </div>
                  <div className={`h-24 w-24 rounded-[2rem] ${cls.bg} border border-white/10 flex items-center justify-center ${cls.color} group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500 shadow-inner`}>
                    <cls.icon className="h-12 w-12" />
                  </div>
                  <div>
                    <h4 className="text-4xl font-headline font-black text-white italic uppercase mb-4 tracking-tighter">{cls.name}</h4>
                    <p className="text-base text-white/40 leading-relaxed font-bold uppercase tracking-tight">{cls.desc}</p>
                  </div>
                  <Button variant="ghost" className="mt-auto w-fit text-[11px] font-black uppercase tracking-[0.3em] text-accent p-0 hover:bg-transparent hover:translate-x-2 transition-transform">
                    View Specs <ArrowRight className="ml-3 h-4 w-4" />
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="px-6 lg:px-12 py-32 border-y border-white/5 bg-black/20">
          <div className="max-w-7xl mx-auto grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              { title: "Persistence", icon: Layers, val: "IMMUTABLE", desc: "Every trade, every kill, recorded forever.", color: "text-accent" },
              { title: "Neural NPC", icon: Zap, val: "AUTONOMOUS", desc: "Entities with unique memories and goals.", color: "text-axiom-purple" },
              { title: "Economy", icon: Globe, val: "DECENTRALIZED", desc: "Player-driven trade and resource flow.", color: "text-axiom-gold" },
              { title: "Latency", icon: Activity, val: "ZERO_LAG", desc: "Instant sync between React and Godot.", color: "text-emerald-500" }
            ].map((stat, i) => (
              <div key={i} className="p-10 rounded-[3rem] bg-secondary/10 border border-white/10 backdrop-blur-sm axiom-card-hover flex flex-col items-center text-center">
                <stat.icon className={`h-12 w-12 mb-8 ${stat.color}`} />
                <div className="text-3xl font-headline font-black text-white mb-2">{stat.val}</div>
                <div className="text-[10px] font-black text-accent tracking-[0.4em] uppercase mb-4 italic">{stat.title}</div>
                <p className="text-xs text-white/40 font-bold uppercase tracking-tight">{stat.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Narrative Section */}
        <section id="chronicles" className="px-6 lg:px-12 py-48 relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-full bg-accent/5 blur-[120px] rounded-full" />
          <div className="max-w-5xl mx-auto text-center space-y-12 relative z-10">
            <History className="h-20 w-20 text-accent mx-auto opacity-30 animate-pulse" />
            <h3 className="text-5xl lg:text-8xl font-headline font-black text-white italic uppercase tracking-tighter">Your Memory is Permanent.</h3>
            <p className="text-xl md:text-3xl text-white/60 leading-relaxed italic font-light">
              "The Spire does not reset. It absorbs the pulse of the collective. In Ouroboros, you are not just a player; you are a data-ghost in an infinite recursion of high science."
            </p>
            <div className="text-[10px] font-black text-accent tracking-[0.6em] uppercase">— THE ARCHITECTS // CHRONICLE X-42</div>
          </div>
        </section>
      </main>

      <footer className="py-48 px-6 lg:px-12 border-t border-white/5 bg-black relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-center gap-20">
          <div className="flex items-center gap-8 group cursor-pointer">
            <div className="h-20 w-20 axiom-gradient rounded-[2.5rem] flex items-center justify-center shadow-[0_0_50px_rgba(31,184,184,0.4)] transition-all group-hover:rotate-180 duration-1000">
              <Infinity className="h-10 w-10 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-headline font-black text-5xl tracking-tighter text-white uppercase italic leading-none">Ouroboros</span>
              <span className="text-[10px] text-accent font-black tracking-[0.6em] mt-2 uppercase">Axiom Frontier Core</span>
            </div>
          </div>
          
          <div className="flex flex-wrap justify-center gap-16 text-[13px] font-black tracking-[0.4em] text-white/20 uppercase italic">
            <Link href="#" className="hover:text-accent transition-colors">Discord</Link>
            <Link href="#" className="hover:text-accent transition-colors">Twitter_X</Link>
            <Link href="#" className="hover:text-accent transition-colors">Whitepaper</Link>
          </div>

          <div className="text-[11px] font-black text-white/10 tracking-[0.4em] uppercase italic text-center lg:text-right space-y-2">
            <div>&copy; 2025 Ouroboros Collective</div>
            <div className="text-accent/20">Deterministic Engine Stable v1.0.6</div>
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
          animation: gradient 8s ease infinite;
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: flex;
          width: 200%;
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </div>
  )
}
