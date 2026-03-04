'use client';
/**
 * @fileOverview Axiom Frontier - Chunk Management Service (Axiomatic Integration)
 * Handles the generation, loading, and persistence of world chunks based on Field Theory.
 */

import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';
import {
  CHUNK_SIZE,
  terrainHeight,
  biomeSelection,
  chunkResources,
  generateChunkSeed,
  perlinNoise,
  constructFieldString,
  Axioms
} from '@/lib/math-engine';
import { Chunk } from '@/types';

const { firestore: db } = initializeFirebase();
const WORLD_SEED = 42;

/**
 * Generates a new chunk data object using the 5 Axioms and Field Theory
 */
export function generateChunk(chunkX: number, chunkZ: number): Chunk {
  const seed = generateChunkSeed(WORLD_SEED, chunkX, chunkZ);
  const height = terrainHeight(seed, chunkX, chunkZ);
  const biome = biomeSelection(chunkX, chunkZ, seed);
  const resources = chunkResources(seed, chunkX, chunkZ);
  const fieldString = constructFieldString(chunkX, chunkZ, seed);

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

  const entropy = Axioms.Complexity(chunkX, chunkZ);
  const stability = 1 - entropy;

  return {
    id: `${chunkX}_${chunkZ}`,
    x: chunkX,
    z: chunkZ,
    seed,
    biome,
    entropy,
    stabilityIndex: stability,
    corruptionLevel: Math.max(0, entropy - 0.5) * 2,
    resourceData: resources,
    logicField: logicField,
    logicString: fieldString,
    lastUpdate: new Date()
  };
}

/**
 * Loads a chunk from Firestore or generates and saves it if it doesn't exist
 */
export async function loadOrGenerateChunk(chunkX: number, chunkZ: number): Promise<Chunk> {
  if (!db) throw new Error("Firestore not initialized");
  
  const chunkId = `${chunkX}_${chunkZ}`;
  const chunkRef = doc(db, 'chunks', chunkId);
  const snap = await getDoc(chunkRef);

  if (snap.exists()) {
    const data = snap.data();
    return { 
      ...data, 
      id: snap.id,
      lastUpdate: data.lastUpdate?.toDate() || new Date()
    } as Chunk;
  }

  const chunk = generateChunk(chunkX, chunkZ);
  await setDoc(chunkRef, {
    ...chunk,
    lastUpdate: serverTimestamp()
  });

  return chunk;
}
