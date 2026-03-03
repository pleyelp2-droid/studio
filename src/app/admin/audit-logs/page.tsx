"use client"

import { useState, useEffect } from "react"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/AppSidebar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection, query, limit, orderBy } from "firebase/firestore"
import { ClipboardList, Shield, Search, Filter, Loader2, AlertCircle } from "lucide-react"
import { AdminAuditLog } from "@/types"
import { Input } from "@/components/ui/input"

export default function AuditLogsPage() {
  const db = useFirestore()
  const [searchQuery, setSearchQuery] = useState("")

  const logsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(
      collection(db, "adminAuditLogs"), 
      orderBy("timestamp", "desc"),
      limit(50)
    );
  }, [db]);

  const { data: logs, isLoading, error } = useCollection(logsQuery);

  // Fallback mock data if none exists in Firestore
  const mockLogs: AdminAuditLog[] = [
    {
      id: "1",
      adminId: "system-auto",
      action: "google.devtools.cloudbuild.v1.CloudBuild.CreateBuild",
      targetType: "DEPLOYMENT",
      targetId: "build-001",
      ipAddress: "127.0.0.1",
      timestamp: { seconds: Date.now() / 1000 },
      details: { principal_email: "service-419112240411@gcp-sa-firebaseapphosting.iam.gserviceaccount.com" }
    },
    {
      id: "2",
      adminId: "admin-user",
      action: "WORLD_PARAMETER_UPDATE",
      targetType: "WORLD_STATE",
      targetId: "global",
      ipAddress: "192.168.1.1",
      timestamp: { seconds: (Date.now() - 3600000) / 1000 },
      details: { change: "Increased Civilization Index" }
    }
  ];

  const displayedLogs = (logs && logs.length > 0) ? logs : mockLogs;

  const filteredLogs = displayedLogs.filter(log => 
    log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.adminId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (log.details?.principal_email && log.details.principal_email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <AppSidebar />
      <SidebarInset className="flex flex-col overflow-auto">
        <header className="flex h-16 items-center border-b border-border px-6 justify-between shrink-0 bg-background/50 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <h1 className="text-xl font-headline font-semibold italic uppercase tracking-tight text-white">System Audit Logs</h1>
          </div>
          <Badge variant="outline" className="text-accent border-accent font-black text-[10px] tracking-widest italic">SECURITY_MONITORING_ON</Badge>
        </header>

        <main className="p-6 space-y-6 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search audit trail..." 
                className="pl-10 bg-secondary/30 border-border italic text-xs text-white" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="secondary" className="gap-2 font-black text-[10px] tracking-widest uppercase italic border border-border">
              <Filter className="h-3 w-3" />
              Filter
            </Button>
          </div>

          <Card className="border-border bg-card overflow-hidden shadow-2xl">
            <CardHeader className="bg-secondary/10 border-b border-border/50">
              <CardTitle className="font-headline font-black italic uppercase text-sm tracking-widest flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-accent" /> Immutable Event Ledger
              </CardTitle>
              <CardDescription className="text-[10px] uppercase font-bold tracking-tight">System-wide administrative and automated actions.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary/5 hover:bg-transparent border-none">
                    <TableHead className="text-[10px] font-black uppercase tracking-widest italic text-accent w-[200px]">Timestamp</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest italic">Action / Method</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest italic">Principal</TableHead>
                    <TableHead className="text-right text-[10px] font-black uppercase tracking-widest italic">IP Address</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id} className="border-border/30 hover:bg-accent/5">
                      <TableCell className="font-mono text-[10px] text-muted-foreground">
                        {new Date(log.timestamp.seconds * 1000).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-[11px] font-bold text-white uppercase tracking-tight">{log.action.split('.').pop()}</span>
                          <span className="text-[9px] text-muted-foreground font-mono">{log.action}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-[11px] font-bold text-white">{log.adminId}</span>
                          {log.details?.principal_email && (
                            <span className="text-[9px] text-accent font-mono">{log.details.principal_email}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono text-[10px] text-muted-foreground">
                        {log.ipAddress}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </main>
      </SidebarInset>
    </div>
  )
}
