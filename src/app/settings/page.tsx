"use client"

import { useState, useEffect } from "react"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/AppSidebar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Shield, Save, RefreshCw, Power, Loader2 } from "lucide-react"
import { useFirestore, useDoc, useMemoFirebase, useAuth, useUser } from "@/firebase"
import { doc, setDoc, serverTimestamp } from "firebase/firestore"
import { signInAnonymously } from "firebase/auth"
import { useToast } from "@/hooks/use-toast"

export default function SettingsPage() {
  const db = useFirestore()
  const auth = useAuth()
  const { user } = useUser()
  const { toast } = useToast()
  const worldRef = useMemoFirebase(() => db ? doc(db, "worldState", "global") : null, [db])
  const { data: worldState, isLoading: isDocLoading } = useDoc(worldRef)

  const [booting, setBooting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [params, setParams] = useState({
    economy: 500,
    military: 500,
    stability: 500,
    knowledge: 500,
    culture: 500,
    corruption: 100
  })

  useEffect(() => {
    if (worldState) {
      setParams({
        economy: worldState.economy || 500,
        military: worldState.military || 500,
        stability: worldState.stability || 500,
        knowledge: worldState.knowledge || 500,
        culture: worldState.culture || 500,
        corruption: worldState.corruption || 100
      })
    }
  }, [worldState])

  const calculateCI = () => {
    const { economy, military, stability, knowledge, culture, corruption } = params
    return (0.2 * economy) + (0.2 * military) + (0.15 * stability) + (0.15 * knowledge) + (0.15 * culture) - (0.15 * corruption)
  }

  const handleSave = async () => {
    if (!worldRef) return
    setSaving(true)
    const ci = calculateCI()
    try {
      if (!user && auth) await signInAnonymously(auth)
      await setDoc(worldRef, { 
        ...params, 
        civilizationIndex: ci, 
        tick: worldState?.tick || 0,
        updatedAt: serverTimestamp()
      }, { merge: true })
      toast({ title: "Settings Saved", description: `Civilization Index updated to ${ci.toFixed(2)}` })
    } catch (e: any) {
      toast({ variant: "destructive", title: "Save Error", description: e.message || "Failed to update world state." })
    } finally {
      setSaving(false)
    }
  }

  const handleBootEngine = async () => {
    if (!worldRef) return
    setBooting(true)
    const ci = calculateCI()
    try {
      // Ensure we are signed in to satisfy Security Rules
      if (!user && auth) {
        await signInAnonymously(auth)
      }
      
      await setDoc(worldRef, { 
        ...params, 
        civilizationIndex: ci, 
        tick: 1, 
        lastHeartbeat: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
      toast({ title: "Engine Booted", description: "Ouroboros core is now live at Tick 1." })
    } catch (e: any) {
      toast({ variant: "destructive", title: "Boot Failure", description: e.message || "Could not initialize core logic." })
    } finally {
      setBooting(false)
    }
  }

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <AppSidebar />
      <SidebarInset className="flex flex-col overflow-auto">
        <header className="flex h-16 items-center border-b border-border px-6 justify-between shrink-0 bg-background/50 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <h1 className="text-xl font-headline font-semibold">Global World Settings</h1>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleBootEngine} 
              disabled={booting}
              className="border-accent text-accent hover:bg-accent/10 gap-2"
            >
              {booting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Power className="h-4 w-4" />}
              Boot Engine
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={saving}
              className="axiom-gradient text-white gap-2"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Configuration
            </Button>
          </div>
        </header>

        <main className="p-6 space-y-6 max-w-4xl mx-auto w-full">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2">
                <Shield className="h-5 w-5 text-accent" />
                Civilization Parameters
              </CardTitle>
              <CardDescription>Adjust the core deterministic variables of the Ouroboros engine. Changes affect Godot environment real-time.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="p-10 bg-secondary/20 rounded-xl border border-border text-center relative overflow-hidden">
                <div className="absolute top-4 right-6 flex items-center gap-2">
                  <span className="text-[10px] font-mono text-muted-foreground uppercase">Global Tick</span>
                  <Badge variant="secondary" className="font-mono">{worldState?.tick || 0}</Badge>
                </div>
                <div className="text-xs text-muted-foreground uppercase tracking-[0.3em] mb-2">Projected Civilization Index</div>
                <div className="text-6xl font-bold font-headline text-accent drop-shadow-[0_0_15px_rgba(96,212,255,0.3)]">
                  {calculateCI().toFixed(2)}
                </div>
              </div>

              <div className="grid gap-8 md:grid-cols-2">
                {Object.entries(params).map(([key, value]) => (
                  <div key={key} className="space-y-4 p-5 border border-border/50 rounded-xl bg-background/30 axiom-card-hover">
                    <div className="flex justify-between items-center">
                      <Label className="capitalize font-bold text-sm tracking-wide">{key}</Label>
                      <span className="text-xs font-mono text-accent bg-accent/10 px-2 py-0.5 rounded-full">{value}</span>
                    </div>
                    <Slider
                      value={[value]}
                      min={0}
                      max={1000}
                      step={1}
                      onValueChange={([v]) => setParams(p => ({ ...p, [key]: v }))}
                      className="cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
      </SidebarInset>
    </div>
  )
}
