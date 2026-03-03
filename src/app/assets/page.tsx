"use client"

import { useState } from "react"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/AppSidebar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { 
  Database, 
  Search, 
  Download, 
  Eye, 
  Filter, 
  Plus, 
  FileCode, 
  Image as ImageIcon, 
  Box, 
  HardDrive,
  Cpu,
  Layers,
  Activity,
  Terminal,
  Unplug
} from "lucide-react"
import Image from "next/image"
import { PlaceHolderImages } from "@/lib/placeholder-images"

const authoritativeAssets = [
  { 
    id: "blueprint-spire-v2", 
    name: "Axiom_Core_Spire.glb", 
    type: "Model", 
    size: "18.4 MB", 
    image: PlaceHolderImages.find(i => i.id === 'asset-blueprint') || PlaceHolderImages[6], 
    tags: ["PBR_V1", "Multi-Stage", "Architecture"],
    details: "Master architectural model for CITY biomes. Features 3 logic-stages and rotating energy bands."
  },
  { 
    id: "artifact-shrine-v1", 
    name: "Nexus_Shrine_Artifact.glb", 
    type: "Model", 
    size: "4.2 MB", 
    image: PlaceHolderImages.find(i => i.id === 'item-plasma-core') || PlaceHolderImages[1], 
    tags: ["Logic_Core", "Emissive", "Floating"],
    details: "Central deterministic shrine. 128-vertex octahedron with dynamic torus resonance."
  },
  { 
    id: "shader-hex-kernel", 
    name: "Axiom_Terrain_Kernel.glsl", 
    type: "Shader", 
    size: "0.1 MB", 
    image: PlaceHolderImages.find(i => i.id === 'world-chrome') || PlaceHolderImages[9], 
    tags: ["Vertex", "Fragment", "Holographic"],
    details: "Authoritative ground shader. Handles tri-planar mapping and hex-grid displacement."
  },
  { 
    id: "character-ghost-base", 
    name: "Neural_Ghost_V1.glb", 
    type: "Model", 
    size: "12.8 MB", 
    image: PlaceHolderImages.find(i => i.id === 'asset-robot') || PlaceHolderImages[5], 
    tags: ["Rigged", "Humanoid", "Skinned"],
    details: "Deterministic pilot shell. 16-bone skeleton with PBR skin-tone modulation."
  },
  { 
    id: "logic-aue-kernel", 
    name: "AUE_Utility_Engine.ts", 
    type: "Logic", 
    size: "0.5 MB", 
    image: PlaceHolderImages.find(i => i.id === 'item-cyber-deck') || PlaceHolderImages[0], 
    tags: ["AUE", "Deterministic", "Kappa"],
    details: "The universal constant logic kernel. Manages the 1.000 KAPPA variable and agent utility."
  },
  { 
    id: "asset-wall-perimeter", 
    name: "Axiom_Fortification_Wall.glb", 
    type: "Model", 
    size: "6.1 MB", 
    image: PlaceHolderImages.find(i => i.id === 'item-void-armor') || PlaceHolderImages[2], 
    tags: ["Fortification", "Metallic", "Segmented"],
    details: "High-gloss metallic boundary segment. Used for SANCTUARY-layer fortification."
  },
  { 
    id: "blueprint-dungeon-gate", 
    name: "Deterministic_Gate_V2.glb", 
    type: "Model", 
    size: "8.5 MB", 
    image: PlaceHolderImages.find(i => i.id === 'region-nebulas-edge') || PlaceHolderImages[3], 
    tags: ["Gate", "Logic_Field", "Inter-Biome"],
    details: "Entry portal blueprint. Manifests glowing logic fields for transit verification."
  },
  { 
    id: "script-enforcer-v1", 
    name: "AxiomEnforcer_System.js", 
    type: "Logic", 
    size: "0.3 MB", 
    image: PlaceHolderImages.find(i => i.id === 'asset-starship') || PlaceHolderImages[4], 
    tags: ["Security", "Validation", "Audit"],
    details: "The server-side validation layer. Monitors state-sync anomalies and level-jumps."
  }
]

export default function AssetHubPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredAssets = authoritativeAssets.filter(asset => 
    asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    asset.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <AppSidebar />
      <SidebarInset className="flex flex-col overflow-auto">
        <header className="flex h-16 items-center border-b border-border px-6 justify-between shrink-0 bg-background/50 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <h1 className="text-xl font-headline font-semibold italic uppercase tracking-tight text-white">Authoritative Asset Hub</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-lg bg-axiom-purple/10 border border-axiom-purple/20 text-[10px] font-black text-axiom-purple tracking-widest uppercase italic">
              <Terminal className="h-3 w-3" />
              <span>Dev_Mode: Enabled</span>
            </div>
            <div className="h-8 w-[1px] bg-border mx-2 hidden md:block" />
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              <HardDrive className="h-3 w-3 text-axiom-cyan" />
              <span>Simulation Volume: 64.8 GB / 1 PB</span>
            </div>
          </div>
        </header>

        <main className="p-6 space-y-6 max-w-7xl mx-auto w-full">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search engine blueprints..." 
                className="pl-10 bg-secondary/30 border-border italic text-xs text-white" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-accent/5 border border-accent/20 text-[9px] font-black text-axiom-cyan tracking-widest italic">
                <Activity className="h-3 w-3 animate-pulse" />
                <span>PBR_PIPELINE_STABLE</span>
              </div>
              <Button variant="secondary" size="sm" className="flex-1 md:flex-none gap-2 font-black text-[10px] tracking-widest uppercase italic border border-border">
                <Filter className="h-3 w-3" />
                Filter
              </Button>
            </div>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <TabsList className="bg-secondary/50 border border-border mb-6">
              <TabsTrigger value="all" className="text-[10px] font-black tracking-widest uppercase italic">All Master Assets</TabsTrigger>
              <TabsTrigger value="models" className="text-[10px] font-black tracking-widest uppercase italic">3D Blueprints</TabsTrigger>
              <TabsTrigger value="logic" className="text-[10px] font-black tracking-widest uppercase italic">Logic Kernels</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-0">
              {filteredAssets.map((asset) => (
                <Card key={asset.id} className="axiom-card-hover border-border bg-card overflow-hidden flex flex-col group relative">
                  <div className="aspect-video relative overflow-hidden bg-secondary/20">
                    <Image 
                      src={asset.image.imageUrl} 
                      alt={asset.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105 opacity-60 group-hover:opacity-100"
                      data-ai-hint={asset.image.imageHint}
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <Button size="icon" variant="secondary" className="rounded-full h-10 w-10 bg-black/60 backdrop-blur-xl border border-white/10 hover:bg-axiom-cyan hover:text-black">
                        <Eye className="h-5 w-5" />
                      </Button>
                      <Button size="icon" variant="secondary" className="rounded-full h-10 w-10 bg-black/60 backdrop-blur-xl border border-white/10 hover:bg-axiom-cyan hover:text-black">
                        <Download className="h-5 w-5" />
                      </Button>
                    </div>
                    <Badge className="absolute top-2 left-2 bg-black/80 backdrop-blur-md text-white border-white/10 text-[8px] font-black uppercase tracking-widest">
                      {asset.type === 'Model' && <Box className="h-2 w-2 mr-1 inline" />}
                      {asset.type === 'Shader' && <ImageIcon className="h-2 w-2 mr-1 inline" />}
                      {asset.type === 'Logic' && <FileCode className="h-2 w-2 mr-1 inline" />}
                      {asset.type}
                    </Badge>
                  </div>
                  <CardHeader className="p-4 space-y-1">
                    <CardTitle className="text-xs font-black truncate tracking-widest uppercase italic text-white group-hover:text-axiom-cyan transition-colors">{asset.name}</CardTitle>
                    <CardDescription className="text-[10px] font-mono opacity-50 uppercase text-white/60">
                      {asset.size} // {asset.details}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="flex flex-wrap gap-1">
                      {asset.tags.map(tag => (
                        <span key={tag} className="text-[8px] font-black bg-white/5 px-1.5 py-0.5 rounded text-axiom-cyan uppercase tracking-tighter border border-white/5">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0 mt-auto border-t border-white/5 flex justify-between items-center bg-white/[0.02]">
                    <div className="flex items-center gap-1.5">
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Live_Manifest: Tick 1842</span>
                    </div>
                    <Button variant="ghost" size="sm" className="h-7 text-[9px] font-black uppercase tracking-[0.2em] italic text-axiom-cyan hover:bg-axiom-cyan/10">Inspect_Source</Button>
                  </CardFooter>
                </Card>
              ))}
            </TabsContent>
          </Tabs>

          {filteredAssets.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <Database className="h-12 w-12 text-muted-foreground/20 mb-4" />
              <h3 className="text-lg font-headline font-medium text-muted-foreground uppercase italic tracking-widest">No matching blueprints</h3>
              <p className="text-xs text-muted-foreground max-w-sm mt-1 uppercase font-bold tracking-tight opacity-50">
                The neural link could not locate any authoritative assets with that signature.
              </p>
            </div>
          )}
        </main>
      </SidebarInset>
    </div>
  )
}
