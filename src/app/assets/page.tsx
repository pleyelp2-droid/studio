
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
  Music,
  HardDrive,
  Cpu,
  Layers,
  Activity
} from "lucide-react"
import Image from "next/image"
import { PlaceHolderImages } from "@/lib/placeholder-images"

const assets = [
  { 
    id: 1, 
    name: "Axiomatic_Spire_V2.glb", 
    type: "Model", 
    size: "12.4 MB", 
    image: PlaceHolderImages.find(i => i.id === 'asset-blueprint') || PlaceHolderImages[6], 
    tags: ["Procedural", "PBR_V1", "City"],
    details: "Multi-stage architecture used for city buildings."
  },
  { 
    id: 2, 
    name: "Nexus_Shrine_Core.glb", 
    type: "Model", 
    size: "8.2 MB", 
    image: PlaceHolderImages.find(i => i.id === 'item-plasma-core') || PlaceHolderImages[1], 
    tags: ["Artifact", "Emissive", "Floating"],
    details: "Deterministic central shrine with logic resonance."
  },
  { 
    id: 3, 
    name: "Holographic_Hex_Overlay.png", 
    type: "Texture", 
    size: "4.5 MB", 
    image: PlaceHolderImages.find(i => i.id === 'item-cyber-deck') || PlaceHolderImages[0], 
    tags: ["Shader", "Terrain", "Grid"],
    details: "Hexagonal displacement map for the Axiom terrain."
  },
  { 
    id: 4, 
    name: "Neural_Shell_Base.glb", 
    type: "Model", 
    size: "15.8 MB", 
    image: PlaceHolderImages.find(i => i.id === 'asset-robot') || PlaceHolderImages[5], 
    tags: ["Character", "Rigged", "Skeletal"],
    details: "Base humanoid model for all registered pilots."
  },
  { 
    id: 5, 
    name: "Axiom_Handshake_Logic.json", 
    type: "Script", 
    size: "0.2 MB", 
    image: PlaceHolderImages.find(i => i.id === 'world-chrome') || PlaceHolderImages[9], 
    tags: ["Engine", "Security", "Admin"],
    details: "Authoritative verification for Overseer access."
  },
  { 
    id: 6, 
    name: "Void_Perimeter_Wall.glb", 
    type: "Model", 
    size: "6.1 MB", 
    image: PlaceHolderImages.find(i => i.id === 'item-void-armor') || PlaceHolderImages[2], 
    tags: ["Fortification", "Metallic", "Modular"],
    details: "High-gloss metallic segments for city boundaries."
  },
]

export default function AssetHubPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredAssets = assets.filter(asset => 
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
            <h1 className="text-xl font-headline font-semibold italic uppercase tracking-tight">Authoritative Asset Hub</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="hidden md:flex gap-2 font-black text-[10px] tracking-widest uppercase italic border-white/10 text-white">
              <Plus className="h-3 w-3" />
              Upload Blueprint
            </Button>
            <div className="h-8 w-[1px] bg-border mx-2 hidden md:block" />
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              <HardDrive className="h-3 w-3 text-axiom-cyan" />
              <span>Matrix Storage: 42.5 GB / 100 GB</span>
            </div>
          </div>
        </header>

        <main className="p-6 space-y-6 max-w-7xl mx-auto w-full">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search engine blueprints..." 
                className="pl-10 bg-secondary/30 border-border italic text-xs" 
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
              <TabsTrigger value="all" className="text-[10px] font-black tracking-widest uppercase italic">All Blueprints</TabsTrigger>
              <TabsTrigger value="models" className="text-[10px] font-black tracking-widest uppercase italic">3D Models</TabsTrigger>
              <TabsTrigger value="textures" className="text-[10px] font-black tracking-widest uppercase italic">Textures</TabsTrigger>
              <TabsTrigger value="logic" className="text-[10px] font-black tracking-widest uppercase italic">Logic Units</TabsTrigger>
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
                      {asset.type === 'Texture' && <ImageIcon className="h-2 w-2 mr-1 inline" />}
                      {asset.type === 'Script' && <FileCode className="h-2 w-2 mr-1 inline" />}
                      {asset.type}
                    </Badge>
                  </div>
                  <CardHeader className="p-4 space-y-1">
                    <CardTitle className="text-xs font-black truncate tracking-widest uppercase italic text-white group-hover:text-axiom-cyan transition-colors">{asset.name}</CardTitle>
                    <CardDescription className="text-[10px] font-mono opacity-50 uppercase">{asset.size} // {asset.details}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="flex flex-wrap gap-1">
                      {asset.tags.map(tag => (
                        <span key={tag} className="text-[8px] font-black bg-white/5 px-1.5 py-0.5 rounded text-white/40 uppercase tracking-tighter border border-white/5">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0 mt-auto border-t border-white/5 flex justify-between items-center bg-white/[0.02]">
                    <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Sync: Tick 1842</span>
                    <Button variant="ghost" size="sm" className="h-7 text-[9px] font-black uppercase tracking-[0.2em] italic text-axiom-cyan hover:bg-axiom-cyan/10">Details</Button>
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
