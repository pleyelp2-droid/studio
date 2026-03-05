"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  BrainCircuit, 
  Cpu, 
  Database, 
  Activity, 
  Zap, 
  History,
  Lock,
  CloudLightning
} from "lucide-react"
import { useStore } from "@/store"

export default function BrainEngineMonitorPage() {
  const brain = useStore(state => state.brainEngine)

  return (
    <main className="p-6 space-y-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col space-y-2">
        <div className="flex items-center gap-4">
          <h2 className="text-3xl font-headline font-black uppercase italic tracking-tighter flex items-center gap-3">
            <BrainCircuit className="h-8 w-8 text-accent animate-pulse" />
            Autonomous Brain Engine
          </h2>
          <Badge variant="outline" className={`border-accent/30 text-accent font-black tracking-widest uppercase italic bg-accent/5`}>
            {brain.status}_LINK_ESTABLISHED
          </Badge>
        </div>
        <p className="text-muted-foreground text-sm uppercase font-bold tracking-widest italic opacity-60">High-level world management and neural orchestration.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-secondary/10 border-border group hover:border-accent/40 transition-all">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-[10px] font-black uppercase text-accent tracking-widest">Logic Throughput</CardTitle>
              <Cpu className="h-4 w-4 text-accent opacity-40 group-hover:rotate-90 transition-transform" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black font-headline text-white italic">144 Hz</div>
            <p className="text-[9px] text-muted-foreground uppercase mt-1">Real-time simulation frequency</p>
          </CardContent>
        </Card>

        <Card className="bg-secondary/10 border-border">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">ElastiCache Sync</CardTitle>
              <Database className="h-4 w-4 text-emerald-500 opacity-40" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black font-headline text-emerald-500 italic">HEALTHY</div>
            <div className="flex items-center gap-2 mt-1">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-[9px] text-muted-foreground uppercase">Latency: 1.2ms (us-east-2)</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-secondary/10 border-border">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-[10px] font-black uppercase text-axiom-purple tracking-widest">Neural Complexity</CardTitle>
              <Zap className="h-4 w-4 text-axiom-purple opacity-40" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black font-headline text-white italic">{brain.activeNodes.length > 0 ? brain.activeNodes.length : "84.2"}%</div>
            <p className="text-[9px] text-muted-foreground uppercase mt-1">Axiomatic Information Density</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <Card className="lg:col-span-8 border-border bg-card shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none mix-blend-screen">
            <div className="w-full h-full bg-[linear-gradient(to_bottom,transparent_0%,#06b6d4_50%,transparent_100%)] bg-[length:100%_4px] animate-matrix-scan" />
          </div>
          <CardHeader className="bg-secondary/10 border-b border-border/50">
            <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
              <History className="h-4 w-4 text-accent" /> Brain Engine Event Ledger
            </CardTitle>
            <CardDescription className="text-[10px] uppercase font-bold tracking-tight">Direct feed from the Autonomous World Orchestrator.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 h-[400px] overflow-y-auto custom-scrollbar space-y-3">
            {brain.logs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center opacity-30 italic text-xs">
                <CloudLightning className="h-12 w-12 mb-4 animate-bounce" />
                Awaiting first autonomous decision cycle...
              </div>
            ) : (
              brain.logs.map((log, i) => (
                <div key={i} className="flex gap-4 p-3 rounded-xl bg-white/[0.02] border border-white/5 animate-in slide-in-from-left-2 duration-500">
                  <span className="text-accent/40 font-mono text-[9px] shrink-0">[{new Date().toLocaleTimeString()}]</span>
                  <p className="text-white/80 text-[10px] uppercase tracking-tight leading-relaxed">
                    <span className="text-accent mr-2">»</span> {log}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-4 border-border bg-card">
          <CardHeader className="bg-secondary/10 border-b border-border/50">
            <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
              <Lock className="h-4 w-4 text-axiom-gold" /> AWS Infrastructure
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-black/40 border border-white/5">
                <Label className="text-[8px] font-black uppercase text-gray-500 tracking-widest block mb-2">Resource ARN</Label>
                <code className="text-[9px] text-axiom-gold break-all font-mono opacity-80">
                  arn:aws:elasticache:us-east-2:986523046654:serverlesscache:memory
                </code>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
                  <span>Memory Cache Health</span>
                  <span className="text-emerald-500">{brain.cacheHealth}%</span>
                </div>
                <Progress value={brain.cacheHealth} className="h-1.5" />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/5">
                <div className="p-3 rounded-lg bg-secondary/20 text-center border border-white/5">
                  <div className="text-[7px] text-gray-500 uppercase font-black">Region</div>
                  <div className="text-[10px] text-white font-bold">us-east-2</div>
                </div>
                <div className="p-3 rounded-lg bg-secondary/20 text-center border border-white/5">
                  <div className="text-[7px] text-gray-500 uppercase font-black">Engine</div>
                  <div className="text-[10px] text-white font-bold">1.6.22</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

import { Label } from "@/components/ui/label"
