'use client';
/**
 * @fileOverview Axiom Frontier - Chunk Management Service
 * Handles the generation, loading, and persistence of world chunks in Firestore.
 */

import { doc, getDoc, setDoc, updateDoc, increment, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';
import {
  CHUNK_SIZE,
  KAPPA,
  terrainHeight,
  biomeSelection,
  dungeonProbability,
  chunkResources,
  generateChunkSeed,
  resourceDecay,
  perlinNoise
} from '@/lib/math-engine';

const { firestore: db } = initializeFirebase();
const WORLD_SEED = 42;

export interface ChunkData {
  id: string; // "x_z"
  x: number;
  z: number;
  seed: number;
  biome: string;
  terrainHeight: number;
  entropy: number;
  stabilityIndex: number;
  corruptionLevel: number;
  resourceData: Record<string, number>;
  logicField: Array<{ vx: number; vz: number; magnitude: number }>;
  dungeonProbability: number;
  entities: any[];
  lastUpdate?: any;
}

/**
 * Generates a new chunk data object using the deterministic math engine
 */
export function generateChunk(chunkX: number, chunkZ: number): ChunkData {
  const seed = generateChunkSeed(WORLD_SEED, chunkX, chunkZ);
  const height = terrainHeight(seed, chunkX, chunkZ);
  const biome = biomeSelection(chunkX, chunkZ, seed);
  const resources = chunkResources(seed, chunkX, chunkZ);
  const dungeonProb = dungeonProbability(height);

  const logicField: Array<{ vx: number; vz: number; magnitude: number }> = [];
  for (let lx = 0; lx < 4; lx++) {
    for (let lz = 0; lz < 4; lz++) {
      const px = chunkX * CHUNK_SIZE + lx * (CHUNK_SIZE / 4);
      const pz = chunkZ * CHUNK_SIZE + lz * (CHUNK_SIZE / 4);
      const vx = (perlinNoise(seed + 100, px, pz) - 0.5) * 2;
      const vz = (perlinNoise(seed + 200, px, pz) - 0.5) * 2;
      logicField.push({ vx, vz, magnitude: Math.sqrt(vx * vx + vz * vz) });
    }
  }

  const avgMagnitude = logicField.reduce((s, v) => s + v.magnitude, 0) / logicField.length;
  const entropy = 1 - avgMagnitude;
  const stability = Math.max(0, Math.min(1, 1 - entropy * 0.5));
  const corruption = Math.max(0, entropy - 0.5) * 2;

  return {
    id: `${chunkX}_${chunkZ}`,
    x: chunkX,
    z: chunkZ,
    seed,
    biome,
    terrainHeight: height,
    entropy,
    stabilityIndex: stability,
    corruptionLevel: corruption,
    resourceData: resources,
    logicField: logicField,
    dungeonProbability: dungeonProb,
    entities: []
  };
}

/**
 * Loads a chunk from Firestore or generates and saves it if it doesn't exist
 */
export async function loadOrGenerateChunk(chunkX: number, chunkZ: number): Promise<ChunkData> {
  if (!db) throw new Error("Firestore not initialized");
  
  const chunkId = `${chunkX}_${chunkZ}`;
  const chunkRef = doc(db, 'chunks', chunkId);
  const snap = await getDoc(chunkRef);

  if (snap.exists()) {
    return { ...snap.data(), id: snap.id } as ChunkData;
  }

  const chunk = generateChunk(chunkX, chunkZ);
  await setDoc(chunkRef, {
    ...chunk,
    lastUpdate: serverTimestamp()
  });

  return chunk;
}

/**
 * Extracts resources from a specific chunk
 */
export async function extractResource(
  chunkX: number, chunkZ: number,
  resourceType: string, amount: number
): Promise<{ success: boolean; extracted: number }> {
  if (!db) return { success: false, extracted: 0 };

  const chunkId = `${chunkX}_${chunkZ}`;
  const chunkRef = doc(db, 'chunks', chunkId);
  
  const snap = await getDoc(chunkRef);
  if (!snap.exists()) return { success: false, extracted: 0 };

  const data = snap.data() as ChunkData;
  const available = data.resourceData[resourceType] || 0;
  const extracted = Math.min(amount, available);

  if (extracted <= 0) return { success: false, extracted: 0 };

  const newResources = { ...data.resourceData };
  newResources[resourceType] = resourceDecay(available - extracted, 0.01, 1);

  const totalRes = Object.values(newResources).reduce((s: number, v: any) => s + (v as number), 0);
  const newEntropy = Math.min(1, (data.entropy || 0) + (extracted / (totalRes + extracted + KAPPA)) * 0.1);

  await updateDoc(chunkRef, {
    resourceData: newResources,
    entropy: newEntropy,
    lastUpdate: serverTimestamp()
  });

  return { success: true, extracted };
}

/**
 * Triggers a biome shift if entropy exceeds the threshold
 */
export async function applyBiomeShift(chunkX: number, chunkZ: number): Promise<void> {
  if (!db) return;

  const chunkId = `${chunkX}_${chunkZ}`;
  const chunkRef = doc(db, 'chunks', chunkId);
  const snap = await getDoc(chunkRef);

  if (!snap.exists()) return;

  const { entropy, seed } = snap.data() as ChunkData;
  if (entropy > 0.7) {
    const newBiome = biomeSelection(chunkX, chunkZ, seed + Math.floor(entropy * 1000));
    await updateDoc(chunkRef, {
      biome: newBiome,
      stabilityIndex: Math.max(0, 1 - entropy),
      corruptionLevel: Math.max(0, entropy - 0.5) * 2,
      lastUpdate: serverTimestamp()
    });
  }
}
