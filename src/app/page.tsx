
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
            <Link href="/dashboard">DASHBOARD</Link>
          </Button>
          <Button className="axiom-gradient text-white border-0 px-10 py-7 rounded-2xl font-black text-xs tracking-widest shadow-[0_0_30px_rgba(46,46,179,0.5)] hover:shadow-[0_0_60px_rgba(46,46,179,0.8)] transition-all uppercase italic">
            INIT_COLLECTIVE
          </Button>
        </div>
      </nav>

      <main>
        <section className="relative h-[115vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image 
              src={getImg('world-chrome')?.imageUrl || ""} 
              alt="Ouroboros Metropolis" 
              fill 
              className="object-cover opacity-60 scale-105 transition-transform duration-40000 hover:scale-110"
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
              <Button size="lg" className="h-32 px-24 text-5xl font-black axiom-gradient text-white rounded-[2.5rem] shadow-[0_40px_80px_rgba(46,46,179,0.5)] hover:scale-105 hover:shadow-[0_40px_100px_rgba(46,46,179,0.7)] transition-all duration-1000 gap-8 uppercase tracking-tighter italic" asChild>
                <Link href="/dashboard"><Download className="h-16 w-16" /> Enter Collective</Link>
              </Button>
              <Button size="lg" variant="outline" className="h-32 px-24 text-5xl font-black border-white/10 bg-white/5 backdrop-blur-3xl text-white hover:bg-white/10 rounded-[2.5rem] transition-all duration-1000 uppercase tracking-tighter italic shadow-2xl">
                Lore_Archive
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-72 border-t border-white/5 bg-black relative">
        <div className="max-w-7xl mx-auto px-10 flex flex-col md:flex-row justify-between items-center gap-40">
          <div className="flex items-center gap-10 group cursor-pointer">
            <div className="h-20 w-20 axiom-gradient rounded-3xl flex items-center justify-center group-hover:rotate-180 transition-transform duration-2000 shadow-3xl">
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
        .bg-300% {
          background-size: 300% 300%;
        }
      `}</style>
    </div>
  )
}
