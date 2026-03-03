
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
  HardDrive
} from "lucide-react"
import Image from "next/image"
import { PlaceHolderImages } from "@/lib/placeholder-images"

const assets = [
  { id: 1, name: "Interceptor_MK4.fbx", type: "Model", size: "42.5 MB", image: PlaceHolderImages[4], tags: ["Ship", "VFX"] },
  { id: 2, name: "Droid_Rig_Main.blend", type: "Model", size: "18.2 MB", image: PlaceHolderImages[5], tags: ["Character", "Rigged"] },
  { id: 3, name: "Outpost_Layout.json", type: "Script", size: "1.2 MB", image: PlaceHolderImages[6], tags: ["Architecture", "JSON"] },
  { id: 4, name: "Plasma_Impact.wav", type: "Audio", size: "0.8 MB", image: PlaceHolderImages[1], tags: ["SFX", "Combat"] },
  { id: 5, name: "Axiom_Core_Texture.png", type: "Texture", size: "5.4 MB", image: PlaceHolderImages[0], tags: ["Material", "Emission"] },
  { id: 6, name: "Void_Armor_Set.fbx", type: "Model", size: "28.9 MB", image: PlaceHolderImages[2], tags: ["Armor", "Player"] },
]

export default function AssetHubPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredAssets = assets.filter(asset => 
    asset.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <AppSidebar />
      <SidebarInset className="flex flex-col overflow-auto">
        <header className="flex h-16 items-center border-b border-border px-6 justify-between shrink-0 bg-background/50 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <h1 className="text-xl font-headline font-semibold">Asset Hub</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="hidden md:flex gap-2">
              <Plus className="h-4 w-4" />
              Upload Asset
            </Button>
            <div className="h-8 w-[1px] bg-border mx-2 hidden md:block" />
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <HardDrive className="h-4 w-4" />
              <span>Storage: 42.5 GB / 100 GB</span>
            </div>
          </div>
        </header>

        <main className="p-6 space-y-6 max-w-7xl mx-auto w-full">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search game assets..." 
                className="pl-10 bg-secondary/30 border-border" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Button variant="secondary" size="sm" className="flex-1 md:flex-none gap-2">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
            </div>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <TabsList className="bg-secondary/50 border border-border mb-6">
              <TabsTrigger value="all">All Assets</TabsTrigger>
              <TabsTrigger value="models">Models</TabsTrigger>
              <TabsTrigger value="textures">Textures</TabsTrigger>
              <TabsTrigger value="scripts">Scripts</TabsTrigger>
              <TabsTrigger value="audio">Audio</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-0">
              {filteredAssets.map((asset) => (
                <Card key={asset.id} className="axiom-card-hover border-border bg-card overflow-hidden flex flex-col group">
                  <div className="aspect-video relative overflow-hidden bg-secondary/20">
                    <Image 
                      src={asset.image.imageUrl} 
                      alt={asset.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      data-ai-hint={asset.image.imageHint}
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button size="icon" variant="secondary" className="rounded-full h-8 w-8">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="secondary" className="rounded-full h-8 w-8">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                    <Badge className="absolute top-2 left-2 bg-background/80 backdrop-blur-md text-foreground border-border">
                      {asset.type === 'Model' && <Box className="h-3 w-3 mr-1 inline" />}
                      {asset.type === 'Texture' && <ImageIcon className="h-3 w-3 mr-1 inline" />}
                      {asset.type === 'Script' && <FileCode className="h-3 w-3 mr-1 inline" />}
                      {asset.type === 'Audio' && <Music className="h-3 w-3 mr-1 inline" />}
                      {asset.type}
                    </Badge>
                  </div>
                  <CardHeader className="p-4">
                    <CardTitle className="text-sm font-medium truncate">{asset.name}</CardTitle>
                    <CardDescription className="text-xs">{asset.size}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="flex flex-wrap gap-1">
                      {asset.tags.map(tag => (
                        <span key={tag} className="text-[10px] bg-secondary px-1.5 py-0.5 rounded text-muted-foreground">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0 mt-auto border-t border-border/50 flex justify-between items-center bg-secondary/5">
                    <span className="text-[10px] text-muted-foreground">Updated 2 days ago</span>
                    <Button variant="ghost" size="sm" className="h-7 text-[10px] uppercase tracking-wider text-accent">Details</Button>
                  </CardFooter>
                </Card>
              ))}
            </TabsContent>
          </Tabs>

          {filteredAssets.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <Database className="h-12 w-12 text-muted-foreground/20 mb-4" />
              <h3 className="text-lg font-headline font-medium text-muted-foreground">No assets found</h3>
              <p className="text-sm text-muted-foreground max-w-sm mt-1">
                Try adjusting your search or filters to find what you're looking for.
              </p>
            </div>
          )}
        </main>
      </SidebarInset>
    </div>
  )
}
