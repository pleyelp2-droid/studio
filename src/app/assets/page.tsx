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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { 
  Database, 
  Search, 
  Download, 
  Eye, 
  Filter, 
  FileCode, 
  Image as ImageIcon, 
  Box, 
  HardDrive,
  Activity,
  Terminal,
  Cpu,
  Fingerprint,
  Zap
} from "lucide-react"
import Image from "next/image"
import { PlaceHolderImages } from "@/lib/placeholder-images"
import { useToast } from "@/hooks/use-toast"

const authoritativeAssets = [
  { 
    id: "blueprint-spire-v2", 
    name: "Axiom_Core_Spire.glb", 
    type: "Model", 
    size: "18.4 MB", 
    image: PlaceHolderImages.find(i => i.id === 'asset-blueprint') || PlaceHolderImages[6], 
    tags: ["PBR_V1", "Multi-Stage", "Architecture"],
    details: "Master architectural model for CITY biomes. Features 3 logic-stages and rotating energy bands.",
    metadata: { primitives: 4250, bones: 0, drawCalls: 12, alphaMode: 'Opaque' }
  },
  { 
    id: "artifact-shrine-v1", 
    name: "Nexus_Shrine_Artifact.glb", 
    type: "Model", 
    size: "4.2 MB", 
    image: PlaceHolderImages.find(i => i.id === 'item-plasma-core') || PlaceHolderImages[1], 
    tags: ["Logic_Core", "Emissive", "Floating"],
    details: "Central deterministic shrine. 128-vertex octahedron with dynamic torus resonance.",
    metadata: { primitives: 128, bones: 4, drawCalls: 3, alphaMode: 'Blend' }
  },
  { 
    id: "shader-hex-kernel", 
    name: "Axiom_Terrain_Kernel.glsl", 
    type: "Shader", 
    size: "0.1 MB", 
    image: PlaceHolderImages.find(i => i.id === 'world-chrome') || PlaceHolderImages[9], 
    tags: ["Vertex", "Fragment", "Holographic"],
    details: "Authoritative ground shader. Handles tri-planar mapping and hex-grid displacement.",
    metadata: { passes: 2, uniforms: 14, supportsGpuInstancing: true }
  },
  { 
    id: "character-ghost-base", 
    name: "Neural_Ghost_V1.glb", 
    type: "Model", 
    size: "12.8 MB", 
    image: PlaceHolderImages.find(i => i.id === 'asset-robot') || PlaceHolderImages[5], 
    tags: ["Rigged", "Humanoid", "Skinned"],
    details: "Deterministic pilot shell. 16-bone skeleton with PBR skin-tone modulation.",
    metadata: { primitives: 8400, bones: 16, weightMapping: 'GPU', LODs: 3 }
  },
  { 
    id: "logic-aue-kernel", 
    name: "AUE_Utility_Engine.ts", 
    type: "Logic", 
    size: "0.5 MB", 
    image: PlaceHolderImages.find(i => i.id === 'item-cyber-deck') || PlaceHolderImages[0], 
    tags: ["AUE", "Deterministic", "Kappa"],
    details: "The universal constant logic kernel. Manages the 1.000 KAPPA variable and agent utility.",
    metadata: { complexity: 'O(log n)', cycleRate: '144Hz', persistence: 'Immutable' }
  },
  { 
    id: "asset-wall-perimeter", 
    name: "Axiom_Fortification_Wall.glb", 
    type: "Model", 
    size: "6.1 MB", 
    image: PlaceHolderImages.find(i => i.id === 'item-void-armor') || PlaceHolderImages[2], 
    tags: ["Fortification", "Metallic", "Segmented"],
    details: "High-gloss metallic boundary segment. Used for SANCTUARY-layer fortification.",
    metadata: { primitives: 1200, tileable: true, collision: 'Static' }
  }
]

export default function AssetHubPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedAsset, setSelectedAsset] = useState<any>(null)
  const { toast } = useToast()

  const filteredAssets = authoritativeAssets.filter(asset => 
    asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    asset.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const handleDownload = (asset: any) => {
    const data = JSON.stringify({
      asset_id: asset.id,
      name: asset.name,
      manifest_tick: 1842,
      deterministic_hash: Math.random().toString(36).substring(7).toUpperCase(),
      technical_specs: asset.metadata,
      license: "OUROBOROS_COLLECTIVE_INTERNAL"
    }, null, 2);
    
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${asset.name.split('.')[0]}_metadata.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Blueprint Exported",
      description: `Manifest data for ${asset.name} has been synchronized to your local drive.`
    })
  }

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
              <span>Dev_Mode: Active</span>
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
                placeholder="Search master signatures..." 
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
                      <Button 
                        size="icon" 
                        variant="secondary" 
                        className="rounded-full h-10 w-10 bg-black/60 backdrop-blur-xl border border-white/10 hover:bg-axiom-cyan hover:text-black"
                        onClick={() => setSelectedAsset(asset)}
                      >
                        <Eye className="h-5 w-5" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="secondary" 
                        className="rounded-full h-10 w-10 bg-black/60 backdrop-blur-xl border border-white/10 hover:bg-axiom-cyan hover:text-black"
                        onClick={() => handleDownload(asset)}
                      >
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
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 text-[9px] font-black uppercase tracking-[0.2em] italic text-axiom-cyan hover:bg-axiom-cyan/10"
                      onClick={() => setSelectedAsset(asset)}
                    >
                      Inspect_Source
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </TabsContent>
          </Tabs>

          {filteredAssets.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <Database className="h-12 w-12 text-muted-foreground/20 mb-4" />
              <h3 className="text-lg font-headline font-medium text-muted-foreground uppercase italic tracking-widest">No matching signatures</h3>
              <p className="text-xs text-muted-foreground max-w-sm mt-1 uppercase font-bold tracking-tight opacity-50">
                The neural link could not locate any authoritative assets with that signature.
              </p>
            </div>
          )}
        </main>

        <Dialog open={!!selectedAsset} onOpenChange={() => setSelectedAsset(null)}>
          <DialogContent className="max-w-3xl bg-black/95 border-axiom-cyan/20 backdrop-blur-3xl p-0 overflow-hidden">
            {selectedAsset && (
              <div className="grid md:grid-cols-2">
                <div className="aspect-square relative bg-secondary/20 border-r border-white/10">
                  <Image 
                    src={selectedAsset.image.imageUrl} 
                    alt={selectedAsset.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                  <div className="absolute bottom-6 left-6 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl axiom-gradient flex items-center justify-center shadow-xl">
                      <Zap className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="text-[10px] font-black text-white/40 uppercase tracking-widest italic leading-none mb-1">Status</div>
                      <div className="text-sm font-headline font-bold text-white uppercase italic tracking-tighter">Verified_Authoritative</div>
                    </div>
                  </div>
                </div>
                <div className="p-8 space-y-8 flex flex-col">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-headline font-black uppercase italic tracking-tighter text-axiom-cyan">
                      Deep_Scan: {selectedAsset.name}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-white/60 leading-relaxed font-bold italic pt-2">
                      {selectedAsset.details}
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 flex-1">
                    <div className="text-[10px] font-black text-axiom-cyan uppercase tracking-[0.3em] italic border-b border-axiom-cyan/20 pb-2 flex items-center gap-2">
                      <Cpu className="h-3 w-3" /> Technical_Manifest
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(selectedAsset.metadata).map(([key, val]) => (
                        <div key={key} className="p-3 rounded-xl bg-white/5 border border-white/5">
                          <div className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-1">{key}</div>
                          <div className="text-xs font-mono font-bold text-white uppercase tracking-tighter">{String(val)}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4 pt-6 border-t border-white/10">
                    <div className="flex items-center gap-3 text-[10px] font-black text-white/40 uppercase tracking-widest italic">
                      <Fingerprint className="h-4 w-4 text-axiom-purple" />
                      Neural Signature: {selectedAsset.id.toUpperCase()}
                    </div>
                    <div className="flex gap-3">
                      <Button 
                        className="flex-1 axiom-gradient text-white h-12 font-black italic uppercase tracking-widest shadow-xl"
                        onClick={() => handleDownload(selectedAsset)}
                      >
                        <Download className="h-4 w-4 mr-2" /> Download_JSON
                      </Button>
                      <Button 
                        variant="outline" 
                        className="border-white/10 text-white hover:bg-white/5 h-12 font-black italic uppercase tracking-widest"
                        onClick={() => setSelectedAsset(null)}
                      >
                        Close
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </SidebarInset>
    </div>
  )
}
