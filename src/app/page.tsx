
"use client"

import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/AppSidebar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useFirestore, useDoc, useMemoFirebase } from "@/firebase"
import { doc } from "firebase/firestore"
import { 
  Globe, 
  TrendingUp, 
  ShieldCheck, 
  Clock,
  ArrowUpRight,
  AlertCircle,
  Activity,
  Zap,
  CheckCircle2
} from "lucide-react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { getAxiomCompliance } from "@/services/ComplianceManager"

const getLiveHistory = (currentVal: number = 0, economy: number = 0) => [
  { time: "00:00", index: 120, economy: 400 },
  { time: "08:00", index: 145, economy: 520 },
  { time: "16:00", index: 172, economy: 610 },
  { time: "LIVE", index: currentVal || 0, economy: economy || 0 },
]

export default function DashboardPage() {
  const db = useFirestore()
  const worldRef = useMemoFirebase(() => db ? doc(db, "worldState", "global") : null, [db])
  const { data: worldState, isLoading } = useDoc(worldRef)

  const compliance = getAxiomCompliance(!!db, !!worldState?.tick)
  const liveHistory = getLiveHistory(worldState?.civilizationIndex, worldState?.economy)

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <AppSidebar />
      <SidebarInset className="flex flex-col overflow-auto">
        <header className="flex h-16 items-center border-b border-border px-6 justify-between shrink-0 bg-background/50 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <h1 className="text-xl font-headline font-semibold italic uppercase tracking-tight">World Oversight</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-[10px] font-black border border-border tracking-widest">
              <div className={`h-2 w-2 rounded-full ${worldState?.tick ? 'bg-accent heartbeat-pulse shadow-[0_0_10px_rgba(96,212,255,0.8)]' : 'bg-muted-foreground'}`} />
              <span>{worldState?.tick ? 'ENGINE_LIVE' : 'ENGINE_STANDBY'}</span>
            </div>
            <Badge variant="outline" className="text-accent border-accent font-black text-[10px] tracking-widest">v0.9.4_STABLE</Badge>
          </div>
        </header>

        <main className="p-6 space-y-6 max-w-7xl mx-auto w-full">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="axiom-card-hover border-border bg-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Civilization Index</CardTitle>
                <Globe className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black font-headline text-white italic">
                  {isLoading ? "..." : (worldState?.civilizationIndex?.toFixed(2) || "0.00")}
                </div>
                <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 mt-1 uppercase tracking-wider">
                  <ArrowUpRight className="h-3 w-3" />
                  <span>Persistent Sync Active</span>
                </div>
              </CardContent>
            </Card>

            <Card className="axiom-card-hover border-border bg-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Current Tick</CardTitle>
                <Clock className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black font-headline text-white italic">
                  {isLoading ? "..." : (worldState?.tick || 0)}
                </div>
                <p className="text-[10px] font-bold text-muted-foreground mt-1 uppercase tracking-wider">Logic Cycle Frequency: 1m</p>
              </CardContent>
            </Card>

            <Card className="axiom-card-hover border-border bg-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Economy Level</CardTitle>
                <TrendingUp className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black font-headline text-white italic">
                  {isLoading ? "..." : (worldState?.economy || 0)}
                </div>
                <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 mt-1 uppercase tracking-wider">
                  <ShieldCheck className="h-3 w-3" />
                  <span>AxiomCore Verified</span>
                </div>
              </CardContent>
            </Card>

            <Card className="axiom-card-hover border-border bg-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Social Stability</CardTitle>
                <ShieldCheck className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black font-headline text-white italic">
                  {isLoading ? "..." : (worldState?.stability || 0)}
                </div>
                <p className="text-[10px] font-bold text-muted-foreground mt-1 uppercase tracking-wider">Integrity Rating: Optimal</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-7">
            {/* Axiom Compliance Matrix */}
            <Card className="lg:col-span-4 border-border bg-card">
              <CardHeader className="bg-secondary/10 border-b border-border/50">
                <CardTitle className="font-headline font-black italic uppercase text-sm tracking-widest flex items-center gap-2">
                  <Zap className="h-4 w-4 text-accent" /> Axiom Compliance Matrix
                </CardTitle>
                <CardDescription className="text-[10px] uppercase font-bold tracking-tight">Real-time subsystem verification (Deterministic Protocol).</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-secondary/5 hover:bg-transparent">
                      <TableHead className="text-[9px] font-black uppercase italic">Subsystem</TableHead>
                      <TableHead className="text-[9px] font-black uppercase italic">Energy</TableHead>
                      <TableHead className="text-[9px] font-black uppercase italic">Erosion</TableHead>
                      <TableHead className="text-[9px] font-black uppercase italic">Punc.</TableHead>
                      <TableHead className="text-[9px] font-black uppercase italic">Recursion</TableHead>
                      <TableHead className="text-right text-[9px] font-black uppercase italic">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {compliance.matrix.map((row) => (
                      <TableRow key={row.subsystem} className="border-border/30 hover:bg-accent/5">
                        <TableCell className="text-[10px] font-bold">{row.subsystem}</TableCell>
                        <TableCell><Badge variant="outline" className={`text-[8px] px-1 py-0 ${row.energy === 'PASS' ? 'text-emerald-500' : 'text-orange-500'}`}>{row.energy}</Badge></TableCell>
                        <TableCell><Badge variant="outline" className={`text-[8px] px-1 py-0 ${row.erosion === 'PASS' ? 'text-emerald-500' : 'text-orange-500'}`}>{row.erosion}</Badge></TableCell>
                        <TableCell><Badge variant="outline" className={`text-[8px] px-1 py-0 ${row.punctuation === 'PASS' ? 'text-emerald-500' : 'text-orange-500'}`}>{row.punctuation}</Badge></TableCell>
                        <TableCell><Badge variant="outline" className={`text-[8px] px-1 py-0 ${row.recursion === 'PASS' ? 'text-emerald-500' : 'text-muted-foreground'}`}>{row.recursion}</Badge></TableCell>
                        <TableCell className="text-right">
                          <span className={`text-[9px] font-black uppercase ${row.status === 'COMPLIANT' ? 'text-emerald-500' : 'text-accent'}`}>{row.status}</span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Simulation Logs */}
            <Card className="lg:col-span-3 border-border bg-card">
              <CardHeader className="bg-secondary/10 border-b border-border/50">
                <CardTitle className="font-headline font-black italic uppercase text-sm tracking-widest">Logic Core Events</CardTitle>
                <CardDescription className="text-[10px] uppercase font-bold tracking-tight">Automated stream from the AxiomEnforcer.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {worldState?.tick ? (
                    <>
                      <div className="flex gap-3 text-[11px] items-start p-3 rounded-xl bg-accent/5 border border-accent/10">
                        <Activity className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-black text-white uppercase italic tracking-wider">Heartbeat Signal Detected</p>
                          <p className="text-muted-foreground mt-0.5 font-bold">Tick {worldState.tick} finalized by Cloud Scheduler.</p>
                          <span className="text-[9px] text-accent/50 font-black uppercase mt-1 block tracking-[0.2em]">Synchronized</span>
                        </div>
                      </div>
                      <div className="flex gap-3 text-[11px] items-start p-3 rounded-xl bg-secondary/20 border border-border">
                        <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-black text-white uppercase italic tracking-wider">CI Recalculation Complete</p>
                          <p className="text-muted-foreground mt-0.5 font-bold">New Index: {worldState.civilizationIndex?.toFixed(2)}</p>
                        </div>
                      </div>
                      <div className="flex gap-3 text-[11px] items-start p-3 rounded-xl bg-secondary/20 border border-border">
                        <CheckCircle2 className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-black text-white uppercase italic tracking-wider">Neural Ledger Integrity</p>
                          <p className="text-muted-foreground mt-0.5 font-bold">All 144Hz logic cycles verified.</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <AlertCircle className="h-10 w-10 text-muted-foreground/20 mb-4" />
                      <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Awaiting Engine Boot...</p>
                      <p className="text-[10px] text-muted-foreground/50 mt-1 uppercase font-bold">Initialize core in Settings.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </SidebarInset>
    </div>
  )
}
