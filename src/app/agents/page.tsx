"use client"

import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/AppSidebar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ShieldAlert, Activity, Cpu, Zap, AlertTriangle } from "lucide-react"

const agents = [
  { id: "A-101", name: "AxiomSentinel", status: "Active", load: 42, integrity: 99, uptime: "142h" },
  { id: "A-205", name: "LogicGate", status: "Active", load: 78, integrity: 94, uptime: "12h" },
  { id: "A-003", name: "VoidWalker", status: "Warning", load: 92, integrity: 81, uptime: "4h" },
  { id: "A-999", name: "CoreBreach", status: "Offline", load: 0, integrity: 100, uptime: "0h" },
]

export default function AgentsPage() {
  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <AppSidebar />
      <SidebarInset className="flex flex-col overflow-auto">
        <header className="flex h-16 items-center border-b border-border px-6 justify-between shrink-0 bg-background/50 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <h1 className="text-xl font-headline font-semibold">Agent Oversight</h1>
          </div>
          <Badge variant="outline" className="text-accent border-accent">MODERATION LAYER ACTIVE</Badge>
        </header>

        <main className="p-6 space-y-6 max-w-7xl mx-auto w-full">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Agents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold font-headline">152</div>
                <p className="text-xs text-muted-foreground mt-1">Managed by Axiom Core</p>
              </CardContent>
            </Card>
            <Card className="border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">System Integrity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold font-headline text-emerald-500">98.2%</div>
                <p className="text-xs text-muted-foreground mt-1">Global average</p>
              </CardContent>
            </Card>
            <Card className="border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Processing Load</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold font-headline text-accent">64%</div>
                <p className="text-xs text-muted-foreground mt-1">Neural capacity used</p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-headline font-semibold flex items-center gap-2">
              <Cpu className="h-5 w-5 text-accent" />
              Active Surveillance Nodes
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {agents.map((agent) => (
                <Card key={agent.id} className="axiom-card-hover border-border bg-card overflow-hidden">
                  <CardHeader className="p-4 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-sm font-bold">{agent.name}</CardTitle>
                      <CardDescription className="text-[10px] uppercase tracking-tighter">{agent.id}</CardDescription>
                    </div>
                    <Badge variant={agent.status === 'Active' ? 'default' : agent.status === 'Warning' ? 'destructive' : 'secondary'} className="text-[10px]">
                      {agent.status}
                    </Badge>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 space-y-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-muted-foreground">
                        <span>CPU LOAD</span>
                        <span>{agent.load}%</span>
                      </div>
                      <Progress value={agent.load} className="h-1" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-muted-foreground">
                        <span>INTEGRITY</span>
                        <span>{agent.integrity}%</span>
                      </div>
                      <Progress value={agent.integrity} className="h-1 bg-secondary" />
                    </div>
                    <div className="flex justify-between items-center pt-2 text-[10px]">
                      <span className="text-muted-foreground">UPTIME</span>
                      <span className="font-mono text-accent">{agent.uptime}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </SidebarInset>
    </div>
  )
}
