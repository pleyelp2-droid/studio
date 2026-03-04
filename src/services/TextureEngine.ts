
'use client';
/**
 * @fileOverview Ouroboros Neural Texture Engine
 * Handles the registry, sorting, and mapping of uploaded textures to game subsystems.
 * Supports deterministic selection from a pool of active textures.
 */

import * as THREE from 'three';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';

const { firestore: db } = initializeFirebase();

export type TextureCategory = 'TERRAIN' | 'ARCHITECTURE' | 'CHARACTER' | 'UI' | 'VFX' | 'UNKNOWN';

export interface TextureSignature {
  id: string;
  name: string;
  url: string;
  category: TextureCategory;
  tags: string[];
  isActive: boolean;
  lastUpdate: number;
}

class TextureEngine {
  private loader = new THREE.TextureLoader();
  private registry: Map<string, TextureSignature> = new Map();
  private cache: Map<string, THREE.Texture> = new Map();
  private listeners: Set<(registry: Map<string, TextureSignature>) => void> = new Set();

  constructor() {
    this.init();
  }

  private async init() {
    if (typeof window === 'undefined' || !db) return;

    // Real-time sync with the global asset ledger
    onSnapshot(collection(db, 'worldAssets'), (snap) => {
      snap.docs.forEach(doc => {
        const data = doc.data();
        const signature: TextureSignature = {
          id: doc.id,
          name: data.name || 'Unknown_Signature',
          url: data.url || '',
          category: data.category || this.autoCategorize(data.name || '', data.tags || []),
          tags: data.tags || [],
          isActive: data.isActive || false,
          lastUpdate: data.createdAt?.toMillis() || Date.now()
        };
        this.registry.set(signature.id, signature);
      });
      this.notify();
    });
  }

  private autoCategorize(name: string, tags: string[]): TextureCategory {
    const combined = (name + tags.join(' ')).toLowerCase();
    if (combined.match(/grass|dirt|soil|sand|rock|terrain|ground|snow|biome|floor_g/)) return 'TERRAIN';
    if (combined.match(/wall|metal|architecture|structure|neon|door|concrete|tech_panel/)) return 'ARCHITECTURE';
    if (combined.match(/skin|eye|hair|clothes|armor|ghost|pilot|npc/)) return 'CHARACTER';
    if (combined.match(/icon|button|panel|border|hud|gui/)) return 'UI';
    if (combined.match(/particle|glow|fire|smoke|pulse|laser|magic/)) return 'VFX';
    return 'UNKNOWN';
  }

  async getTexture(idOrUrl: string): Promise<THREE.Texture | null> {
    const signature = Array.from(this.registry.values()).find(s => s.id === idOrUrl || s.url === idOrUrl);
    const url = signature ? signature.url : idOrUrl;

    if (this.cache.has(url)) return this.cache.get(url)!;

    return new Promise((resolve) => {
      this.loader.load(url, (tex) => {
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        tex.anisotropy = 16;
        this.cache.set(url, tex);
        resolve(tex);
      }, undefined, () => resolve(null));
    });
  }

  /**
   * Returns all active textures for a specific category.
   */
  getPoolForCategory(cat: TextureCategory): TextureSignature[] {
    return Array.from(this.registry.values()).filter(s => s.category === cat && s.isActive);
  }

  /**
   * Deterministically picks a texture from the active pool using a seed.
   */
  async getProceduralTexture(cat: TextureCategory, seed: number): Promise<THREE.Texture | null> {
    const pool = this.getPoolForCategory(cat);
    if (pool.length === 0) return null;
    const index = Math.abs(seed) % pool.length;
    return this.getTexture(pool[index].id);
  }

  getSortedRegistry(): Record<TextureCategory, TextureSignature[]> {
    const result: Record<TextureCategory, TextureSignature[]> = {
      TERRAIN: [],
      ARCHITECTURE: [],
      CHARACTER: [],
      UI: [],
      VFX: [],
      UNKNOWN: []
    };
    this.registry.forEach(s => result[s.category].push(s));
    return result;
  }

  subscribe(callback: (registry: Map<string, TextureSignature>) => void) {
    this.listeners.add(callback);
    callback(this.registry);
    return () => this.listeners.delete(callback);
  }

  private notify() {
    this.listeners.forEach(cb => cb(this.registry));
  }
}

export const textureEngine = new TextureEngine();
