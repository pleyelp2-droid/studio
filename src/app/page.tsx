
"use client"

import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/AppSidebar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useFirestore, useDoc, useMemoFirebase } from "@/firebase"
import { doc } from "firebase/firestore"
import { 
  Activity, 
  Globe, 
  TrendingUp, 
  ShieldCheck, 
  Cpu, 
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Clock
} from "lucide-react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const worldHistory = [
  { time: "00:00", index: 120, economy: 400 },
  { time: "04:00", index: 132, economy: 450 },
  { time: "08:00", index: 145, economy: 520 },
  { time: "12:00", index: 158, economy: 480 },
  { time: "16:00", index: 172, economy: 610 },
  { time: "20:00", index: 185, economy: 680 },
  { time: "23:59", index: 198, economy: 720 },
]

export default function DashboardPage() {
  const db = useFirestore()
  const worldRef = useMemoFirebase(() => db ? doc(db, "worldState", "global") : null, [db])
  const { data: worldState } = useDoc(worldRef)

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <AppSidebar />
      <SidebarInset className="flex flex-col overflow-auto">
        <header className="flex h-16 items-center border-b border-border px-6 justify-between shrink-0 bg-background/50 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <h1 className="text-xl font-headline font-semibold">World Overview</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-xs font-medium border border-border">
              <div className={`h-2 w-2 rounded-full ${worldState?.tick ? 'bg-accent heartbeat-pulse' : 'bg-muted-foreground'}`} />
              <span>{worldState?.tick ? 'HEARTBEAT ACTIVE' : 'ENGINE STANDBY'}</span>
            </div>
            <Badge variant="outline" className="text-accent border-accent">v0.9.4-BETA</Badge>
          </div>
        </header>

        <main className="p-6 space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="axiom-card-hover border-border bg-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Civilization Index</CardTitle>
                <Globe className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-headline">
                  {worldState?.civilizationIndex?.toFixed(1) || "0.0"}
                </div>
                <div className="flex items-center gap-1 text-xs text-emerald-500 mt-1">
                  <ArrowUpRight className="h-3 w-3" />
                  <span>Tracking live pulse</span>
                </div>
              </CardContent>
            </Card>

            <Card className="axiom-card-hover border-border bg-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">System Tick</CardTitle>
                <Clock className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-headline">{worldState?.tick || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Global Deterministic Cycle</p>
              </CardContent>
            </Card>

            <Card className="axiom-card-hover border-border bg-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Economy Level</CardTitle>
                <TrendingUp className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-headline">{worldState?.economy || 0}</div>
                <div className="flex items-center gap-1 text-xs text-emerald-500 mt-1">
                  <ShieldCheck className="h-3 w-3" />
                  <span>Verified by AxiomCore</span>
                </div>
              </CardContent>
            </Card>

            <Card className="axiom-card-hover border-border bg-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Stability</CardTitle>
                <ShieldCheck className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-headline">{worldState?.stability || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Social Integrity Rating</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
            <Card className="lg:col-span-4 border-border bg-card">
              <CardHeader>
                <CardTitle className="font-headline">Axiom Civilization Progression</CardTitle>
                <CardDescription>Historical development of the Civilization Index across the current epoch.</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ChartContainer config={{
                  index: { label: "Civilization Index", color: "hsl(var(--accent))" },
                  economy: { label: "Global Economy", color: "hsl(var(--primary))" }
                }}>
                  <AreaChart data={worldHistory}>
                    <defs>
                      <linearGradient id="colorIndex" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area type="monotone" dataKey="index" stroke="hsl(var(--accent))" fillOpacity={1} fill="url(#colorIndex)" strokeWidth={2} />
                    <Area type="monotone" dataKey="economy" stroke="hsl(var(--primary))" fill="transparent" strokeWidth={2} strokeDasharray="5 5" />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card className="lg:col-span-3 border-border bg-card">
              <CardHeader>
                <CardTitle className="font-headline">Recent World Events</CardTitle>
                <CardDescription>Automated logs from the AxiomEnforcer.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { type: 'info', msg: `Tick ${worldState?.tick || 0} processed successfully`, time: 'Just now' },
                    { type: 'success', msg: `Civilization Index sync: ${worldState?.civilizationIndex?.toFixed(2) || '0.00'}`, time: '1m ago' },
                    { type: 'warning', msg: 'System awaiting parameter initialization', time: '15m ago' },
                  ].map((event, i) => (
                    <div key={i} className="flex gap-3 text-sm items-start p-2 rounded-lg bg-secondary/30">
                      {event.type === 'error' ? <AlertCircle className="h-4 w-4 text-destructive mt-0.5" /> : <Activity className="h-4 w-4 text-accent mt-0.5" />}
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{event.msg}</p>
                        <span className="text-xs text-muted-foreground">{event.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </SidebarInset>
    </div>
  )
}
