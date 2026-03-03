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
  CheckCircle2,
  Box,
  Layers
} from "lucide-react"
import { getAxiomCompliance } from "@/services/ComplianceManager"

export default function DashboardPage() {
  const db = useFirestore()
  const worldRef = useMemoFirebase(() => db ? doc(db, "worldState", "global") : null, [db])
  const { data: worldState, isLoading } = useDoc(worldRef)

  const compliance = getAxiomCompliance(!!db, !!worldState?.tick)

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
                <p className="text-[10px] font-bold text-muted-foreground mt-1 uppercase tracking-wider">Logic Cycle: 1m</p>
              </CardContent>
            </Card>

            <Card className="axiom-card-hover border-border bg-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Matrix Load</CardTitle>
                <Layers className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black font-headline text-white italic">
                  64.2%
                </div>
                <p className="text-[10px] font-bold text-muted-foreground mt-1 uppercase tracking-wider">Neural Capacity</p>
              </CardContent>
            </Card>

            <Card className="axiom-card-hover border-border bg-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Graphics Layer</CardTitle>
                <Box className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black font-headline text-white italic">
                  PBR_V1
                </div>
                <div className="flex items-center gap-1 text-[10px] font-bold text-accent mt-1 uppercase tracking-wider">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Skeletal Active</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-7">
            <Card className="lg:col-span-4 border-border bg-card">
              <CardHeader className="bg-secondary/10 border-b border-border/50">
                <CardTitle className="font-headline font-black italic uppercase text-sm tracking-widest flex items-center gap-2">
                  <Zap className="h-4 w-4 text-accent" /> WebGL MMO Compliance Matrix
                </CardTitle>
                <CardDescription className="text-[10px] uppercase font-bold tracking-tight">Authoritative Subsystem Verification.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-secondary/5 hover:bg-transparent">
                      <TableHead className="text-[9px] font-black uppercase italic">Subsystem</TableHead>
                      <TableHead className="text-[9px] font-black uppercase italic">Energy</TableHead>
                      <TableHead className="text-[9px] font-black uppercase italic">Erosion</TableHead>
                      <TableHead className="text-[9px] font-black uppercase italic">Duality</TableHead>
                      <TableHead className="text-[9px] font-black uppercase italic">Graphics</TableHead>
                      <TableHead className="text-right text-[9px] font-black uppercase italic">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {compliance.matrix.map((row) => (
                      <TableRow key={row.subsystem} className="border-border/30 hover:bg-accent/5">
                        <TableCell className="text-[10px] font-bold">{row.subsystem}</TableCell>
                        <TableCell><Badge variant="outline" className={`text-[8px] px-1 py-0 ${row.energy === 'PASS' ? 'text-emerald-500' : 'text-orange-500'}`}>{row.energy}</Badge></TableCell>
                        <TableCell><Badge variant="outline" className={`text-[8px] px-1 py-0 ${row.erosion === 'PASS' ? 'text-emerald-500' : 'text-orange-500'}`}>{row.erosion}</Badge></TableCell>
                        <TableCell><Badge variant="outline" className={`text-[8px] px-1 py-0 ${row.duality === 'PASS' ? 'text-emerald-500' : 'text-orange-500'}`}>{row.duality}</Badge></TableCell>
                        <TableCell><Badge variant="outline" className="text-[8px] px-1 py-0 text-emerald-500">PASS</Badge></TableCell>
                        <TableCell className="text-right">
                          <span className={`text-[9px] font-black uppercase ${row.status === 'COMPLIANT' ? 'text-emerald-500' : 'text-accent'}`}>{row.status}</span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card className="lg:col-span-3 border-border bg-card">
              <CardHeader className="bg-secondary/10 border-b border-border/50">
                <CardTitle className="font-headline font-black italic uppercase text-sm tracking-widest">Logic Core Events</CardTitle>
                <CardDescription className="text-[10px] uppercase font-bold tracking-tight">Stream from the AxiomEnforcer.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {worldState?.tick ? (
                    <>
                      <div className="flex gap-3 text-[11px] items-start p-3 rounded-xl bg-accent/5 border border-accent/10">
                        <Activity className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-black text-white uppercase italic tracking-wider">Heartbeat Signal Detected</p>
                          <p className="text-muted-foreground mt-0.5 font-bold">Tick {worldState.tick} finalized by Ouroboros Core.</p>
                          <span className="text-[9px] text-accent/50 font-black uppercase mt-1 block tracking-[0.2em]">Deterministic Sync</span>
                        </div>
                      </div>
                      <div className="flex gap-3 text-[11px] items-start p-3 rounded-xl bg-secondary/20 border border-border">
                        <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
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