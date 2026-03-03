"use client"

import { useState } from "react"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/AppSidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sparkles, Loader2, Send, ScrollText } from "lucide-react"
import { generateDynamicQuest, type GenerateDynamicQuestOutput } from "@/ai/flows/generate-dynamic-quest"
import { useToast } from "@/hooks/use-toast"

export default function QuestsPage() {
  const [loading, setLoading] = useState(false)
  const [quest, setQuest] = useState<GenerateDynamicQuestOutput | null>(null)
  const { toast } = useToast()

  const handleGenerateQuest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    
    try {
      const result = await generateDynamicQuest({
        civilizationIndex: 1842,
        playerLevel: parseInt(formData.get("level") as string) || 10,
        availableRegions: ["Nebula Edge", "Iron Reach", "Void Sanctum", "Chrome Citadel"],
        availableNpcs: ["Elder Thorne", "Silo-X", "Commander Vane", "Axiom Prophet"],
        questType: formData.get("type") as string,
        currentGameLore: "The civilization has reached the Chrome Era. Resources are scarce, and the Axiom is expanding into the Outer Nebula.",
      })
      setQuest(result)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: "The AI was unable to synthesize the quest parameters."
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <AppSidebar />
      <SidebarInset className="flex flex-col overflow-auto">
        <header className="flex h-16 items-center border-b border-border px-6 gap-4 shrink-0 bg-background/50 backdrop-blur-md sticky top-0 z-10">
          <SidebarTrigger />
          <h1 className="text-xl font-headline font-semibold">Quest Engine</h1>
        </header>

        <main className="p-6 grid gap-6 lg:grid-cols-12 max-w-7xl mx-auto w-full">
          <div className="lg:col-span-4 space-y-6">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-accent" />
                  Quest Synthesis
                </CardTitle>
                <CardDescription>Leverage Gemini LLM to generate dynamic story content.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleGenerateQuest} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Quest Archetype</Label>
                    <Select name="type" defaultValue="exploration">
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="combat">Combat Engagement</SelectItem>
                        <SelectItem value="exploration">Reconnaissance</SelectItem>
                        <SelectItem value="fetch">Resource Acquisition</SelectItem>
                        <SelectItem value="puzzle">Data Decryption</SelectItem>
                        <SelectItem value="story">Lore Revelation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="level">Recommended Level</Label>
                    <Input id="level" name="level" type="number" defaultValue="25" min="1" max="100" />
                  </div>

                  <Button type="submit" className="w-full axiom-gradient text-white border-0" disabled={loading}>
                    {loading ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Synthesizing...</>
                    ) : (
                      "Generate Dynamic Quest"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-8">
            {quest ? (
              <Card className="border-accent/30 bg-card overflow-hidden">
                <CardHeader className="bg-secondary/20 border-b border-border">
                  <div className="flex justify-between items-start">
                    <div>
                      <Badge className="mb-2 bg-accent text-accent-foreground uppercase text-[10px] tracking-widest">{quest.difficulty} QUEST</Badge>
                      <CardTitle className="text-2xl font-headline text-accent">{quest.title}</CardTitle>
                    </div>
                    <ScrollText className="h-8 w-8 text-muted-foreground/30" />
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <section>
                    <Label className="text-xs uppercase text-muted-foreground tracking-widest mb-2 block">Intelligence Briefing</Label>
                    <p className="text-foreground/90 leading-relaxed italic border-l-2 border-accent pl-4">{quest.description}</p>
                  </section>

                  <div className="grid md:grid-cols-2 gap-6">
                    <section>
                      <Label className="text-xs uppercase text-muted-foreground tracking-widest mb-2 block">Operational Objectives</Label>
                      <ul className="space-y-2">
                        {quest.objectives.map((obj, i) => (
                          <li key={i} className="flex gap-2 text-sm text-foreground/80">
                            <span className="text-accent">•</span> {obj}
                          </li>
                        ))}
                      </ul>
                    </section>
                    <section>
                      <Label className="text-xs uppercase text-muted-foreground tracking-widest mb-2 block">Allocation of Rewards</Label>
                      <ul className="space-y-2">
                        {quest.rewards.map((reward, i) => (
                          <li key={i} className="flex gap-2 text-sm text-foreground/80">
                            <span className="text-emerald-500">+</span> {reward}
                          </li>
                        ))}
                      </ul>
                    </section>
                  </div>

                  <div className="flex flex-wrap gap-4 pt-4 border-t border-border">
                    <div className="flex-1">
                      <Label className="text-[10px] uppercase text-muted-foreground tracking-widest block">Quest Giver</Label>
                      <span className="text-sm font-medium">{quest.giverNpc}</span>
                    </div>
                    <div className="flex-1">
                      <Label className="text-[10px] uppercase text-muted-foreground tracking-widest block">Region Location</Label>
                      <span className="text-sm font-medium">{quest.region}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-secondary/10 border-t border-border flex justify-end gap-3 p-4">
                  <Button variant="outline" onClick={() => setQuest(null)}>Discard</Button>
                  <Button className="bg-accent hover:bg-accent/80 text-accent-foreground">Commit to Firestore</Button>
                </CardFooter>
              </Card>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-border rounded-xl">
                <ScrollText className="h-12 w-12 text-muted-foreground/20 mb-4" />
                <h3 className="text-lg font-headline font-medium text-muted-foreground">Awaiting Input</h3>
                <p className="text-sm text-muted-foreground max-w-sm mt-1">
                  Configure the synthesis parameters on the left to generate a new dynamic quest for the Godot client.
                </p>
              </div>
            )}
          </div>
        </main>
      </SidebarInset>
    </div>
  )
}