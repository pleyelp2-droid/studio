"use client"

import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/AppSidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Users, Search, MoreHorizontal, UserCheck, Shield } from "lucide-react"

const players = [
  { id: "P-882", name: "Nova_Drifter", level: 42, class: "Technomancer", status: "Online", lastActive: "Just now" },
  { id: "P-121", name: "VoidReaper", level: 28, class: "Interceptor", status: "Online", lastActive: "5m ago" },
  { id: "P-455", name: "ChromeBane", level: 15, class: "Smasher", status: "Offline", lastActive: "2h ago" },
  { id: "P-093", name: "AxiomProphet", level: 60, class: "Sage", status: "Away", lastActive: "24m ago" },
  { id: "P-231", name: "BinaryGhost", level: 31, class: "Infiltrator", status: "Online", lastActive: "Just now" },
]

export default function PlayersPage() {
  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <AppSidebar />
      <SidebarInset className="flex flex-col overflow-auto">
        <header className="flex h-16 items-center border-b border-border px-6 justify-between shrink-0 bg-background/50 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <h1 className="text-xl font-headline font-semibold">Player Database</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <UserCheck className="h-4 w-4" />
              Active Sessions: 2,412
            </Button>
          </div>
        </header>

        <main className="p-6 space-y-6 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search players by name, ID, or class..." className="pl-10 bg-secondary/30" />
            </div>
            <Button variant="secondary" className="gap-2">
              <Shield className="h-4 w-4" />
              Admin Actions
            </Button>
          </div>

          <Card className="border-border bg-card">
            <Table>
              <TableHeader className="bg-secondary/20">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead>Player Name</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {players.map((player) => (
                  <TableRow key={player.id} className="border-border/50">
                    <TableCell className="font-mono text-xs text-muted-foreground">{player.id}</TableCell>
                    <TableCell className="font-medium">{player.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-normal">{player.class}</Badge>
                    </TableCell>
                    <TableCell className="font-headline font-bold">{player.level}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${
                          player.status === 'Online' ? 'bg-emerald-500 heartbeat-pulse' : 
                          player.status === 'Away' ? 'bg-amber-500' : 'bg-muted-foreground'
                        }`} />
                        <span className="text-sm">{player.status}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{player.lastActive}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </main>
      </SidebarInset>
    </div>
  )
}
