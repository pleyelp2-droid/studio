
"use client"

import { useState, useEffect, useRef } from "react"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/AppSidebar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { 
  Upload, 
  Zap, 
  ArrowRight, 
  Loader2, 
  FileArchive,
  ImageIcon,
  ShieldCheck
} from "lucide-react"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"
import { textureEngine, TextureSignature, TextureCategory } from "@/services/TextureEngine"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { initializeFirebase } from "@/firebase"
import JSZip from "jszip"

const { firestore: db } = initializeFirebase();

export default function AssetHubPage() {
  const [loading, setLoading] = useState(false)
  const [registry, setRegistry] = useState<Record<TextureCategory, TextureSignature[]>>({
    TERRAIN: [], ARCHITECTURE: [], CHARACTER: [], UI: [], VFX: [], UNKNOWN: []
  })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    const unsub = textureEngine.subscribe(() => {
      setRegistry(textureEngine.getSortedRegistry());
    });
    return unsub;
  }, []);

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const processFile = async (file: File) => {
    if (!db) return;

    // Handle ZIP files
    if (file.name.endsWith('.zip')) {
      try {
        setLoading(true);
        toast({ title: "Extracting Archive", description: "Ouroboros is parsing your texture pack..." });
        
        const zip = new JSZip();
        const content = await zip.loadAsync(file);
        let extractedCount = 0;

        for (const [filename, zipEntry] of Object.entries(content.files)) {
          if (zipEntry.dir) continue;
          
          const isImage = /\.(jpg|jpeg|png|webp)$/i.test(filename);
          if (isImage) {
            const blob = await zipEntry.async("blob");
            const reader = new FileReader();
            
            await new Promise((resolve) => {
              reader.onloadend = async () => {
                const base64 = reader.result as string;
                await addDoc(collection(db, 'worldAssets'), {
                  name: filename.split('/').pop(),
                  url: base64, // In production, upload to Firebase Storage first
                  tags: [filename.includes('terrain') ? 'terrain' : 'architecture', 'extracted'],
                  createdAt: serverTimestamp()
                });
                extractedCount++;
                resolve(null);
              };
              reader.readAsDataURL(blob);
            });
          }
        }

        toast({ 
          title: "Archive Deciphered", 
          description: `Successfully extracted and sorted ${extractedCount} neural textures.` 
        });
      } catch (e: any) {
        toast({ variant: "destructive", title: "Extraction Failed", description: e.message });
      } finally {
        setLoading(false);
      }
      return;
    }

    // Handle direct images
    const isImage = /\.(jpg|jpeg|png|webp)$/i.test(file.name);
    if (isImage) {
      setLoading(true);
      try {
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64 = reader.result as string;
          await addDoc(collection(db, 'worldAssets'), {
            name: file.name,
            url: base64,
            tags: ['direct_upload'],
            createdAt: serverTimestamp()
          });
          toast({ title: "Texture Manifested", description: "Asset has been synchronized with the core engine." });
          setLoading(false);
        };
        reader.readAsDataURL(file);
      } catch (e: any) {
        toast({ variant: "destructive", title: "Upload Failed", description: e.message });
        setLoading(false);
      }
    } else {
      toast({ variant: "destructive", title: "Protocol Violation", description: "Only .zip or image files are accepted by the Neural Engine." });
    }
  }

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <AppSidebar />
      <SidebarInset className="flex flex-col overflow-auto">
        <header className="flex h-16 items-center border-b border-border px-6 justify-between shrink-0 bg-background/50 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <h1 className="text-xl font-headline font-semibold italic uppercase tracking-tight text-white">Neural Asset Engine</h1>
          </div>
          <div className="flex items-center gap-4">
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".zip,image/*" 
              onChange={onFileChange}
            />
            <Button 
              onClick={handleUploadClick}
              disabled={loading}
              className="axiom-gradient text-white h-10 px-6 font-black italic uppercase text-[10px] tracking-widest shadow-lg hover:scale-105 transition-transform"
            >
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
              {loading ? "Processing..." : "Upload ZIP / Image"}
            </Button>
          </div>
        </header>

        <main className="p-6 space-y-8 max-w-7xl mx-auto w-full">
          {/* Engine Dashboard */}
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="bg-secondary/10 border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-[10px] font-black uppercase text-accent tracking-widest flex items-center gap-2">
                  <ImageIcon className="h-3 w-3" /> Terrain Layers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black font-headline text-white">{registry.TERRAIN.length}</div>
                <p className="text-[9px] text-muted-foreground uppercase mt-1">Active biome mapping signatures</p>
              </CardContent>
            </Card>
            <Card className="bg-secondary/10 border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-[10px] font-black uppercase text-axiom-purple tracking-widest flex items-center gap-2">
                  <FileArchive className="h-3 w-3" /> Archive Extraction
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black font-headline text-white">ZIP_READY</div>
                <p className="text-[9px] text-muted-foreground uppercase mt-1">JSZip Protocol v3.10 Stable</p>
              </CardContent>
            </Card>
            <Card className="bg-secondary/10 border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-[10px] font-black uppercase text-emerald-500 tracking-widest flex items-center gap-2">
                  <ShieldCheck className="h-3 w-3" /> Engine Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black font-headline text-emerald-500">LIVE</div>
                <p className="text-[9px] text-muted-foreground uppercase mt-1">Auto-sorting heuristics active</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="TERRAIN" className="w-full">
            <TabsList className="bg-secondary/50 border border-border mb-6 flex-wrap h-auto p-1">
              {Object.keys(registry).map(cat => (
                <TabsTrigger key={cat} value={cat} className="text-[9px] font-black tracking-widest uppercase italic px-4 py-2">
                  {cat} ({registry[cat as TextureCategory].length})
                </TabsTrigger>
              ))}
            </TabsList>

            {Object.entries(registry).map(([cat, assets]) => (
              <TabsContent key={cat} value={cat} className="mt-0">
                {assets.length === 0 ? (
                  <div className="py-20 text-center border-2 border-dashed border-border rounded-3xl opacity-20">
                    <Zap className="h-12 w-12 mx-auto mb-4" />
                    <p className="font-black uppercase tracking-widest text-xs">No signatures in {cat}</p>
                  </div>
                ) : (
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {assets.map((asset) => (
                      <Card key={asset.id} className="axiom-card-hover border-border bg-card overflow-hidden flex flex-col group relative">
                        <div className="aspect-square relative overflow-hidden bg-secondary/20">
                          <Image 
                            src={asset.url} 
                            alt={asset.name}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button 
                              size="sm" 
                              variant="secondary" 
                              className="rounded-full axiom-gradient border-0 text-white font-black italic uppercase text-[9px] tracking-widest"
                            >
                              Inject to World <ArrowRight className="h-3 w-3 ml-2" />
                            </Button>
                          </div>
                          <Badge className="absolute top-2 left-2 bg-black/80 backdrop-blur-md text-white border-white/10 text-[8px] font-black uppercase tracking-widest">
                            {cat}
                          </Badge>
                        </div>
                        <CardHeader className="p-4 space-y-1">
                          <CardTitle className="text-[11px] font-black truncate uppercase italic text-white">{asset.name}</CardTitle>
                          <CardDescription className="text-[9px] font-mono opacity-50 uppercase text-white/60">
                            Tags: {asset.tags.join(', ')}
                          </CardDescription>
                        </CardHeader>
                        <CardFooter className="p-4 pt-0 mt-auto border-t border-white/5 flex justify-between items-center bg-white/[0.02]">
                          <div className="flex items-center gap-1.5">
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[8px] font-black text-muted-foreground uppercase">Linked</span>
                          </div>
                          <span className="text-[8px] font-mono text-white/30">{asset.id.slice(0, 8)}...</span>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </main>
      </SidebarInset>
    </div>
  )
}
