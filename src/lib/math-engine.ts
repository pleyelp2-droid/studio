/**
 * @fileOverview Axiom Frontier - Deterministic Math Engine (Axiomatic Edition)
 * Provides the mathematical foundations for world generation based on KAPPA = 1000
 * and the 5 Core Axioms of the Ouroboros simulation.
 */

export const KAPPA = 1000;
export const CHUNK_SIZE = 16;

/**
 * THE 5 AXIOMS OF OUROBOROS
 * These functions govern the deterministic manifestation of all world data.
 */
export const Axioms = {
  // Axiom 1: Continuity - Smooth transitions across coordinates
  Continuity: (x: number, z: number) => Math.sin(x / KAPPA) + Math.cos(z / KAPPA),
  
  // Axiom 2: Resource Density - Deterministic loot placement
  ResourceDensity: (x: number, z: number) => (Math.abs(x) + Math.abs(z)) % 100,
  
  // Axiom 3: Connectivity - Pathing and structural logic
  Connectivity: (x: number, z: number) => (x + z) % 2 === 0 ? "path" : "wall",
  
  // Axiom 4: Complexity - Entropy scaling based on distance from origin
  Complexity: (x: number, z: number) => Math.sqrt(x * x + z * z) / KAPPA,
  
  // Axiom 5: Determinism - Unique seed-based signature for every sector
  Determinism: (seed: number, x: number, z: number) => (x * 31 + z * 37 + seed) % 1000,
};

import { Chunk } from '@/types';

/**
 * Generates a chunk data object using the 5 Axioms and Field Theory
 */
export function generateChunk(x: number, z: number, seed: number): Chunk {
  const continuity = Axioms.Continuity(x, z);
  const resourceDensity = Axioms.ResourceDensity(x, z);
  const connectivity = Axioms.Connectivity(x, z);
  const complexity = Axioms.Complexity(x, z);
  const determinism = Axioms.Determinism(seed, x, z);

  // Field Theory Logic: Constructing the logical chunk string
  const fieldString = `F:${continuity.toFixed(2)}|R:${resourceDensity}|C:${connectivity}|X:${complexity.toFixed(2)}|D:${determinism}`;

  return {
    id: `${x}_${z}`,
    x,
    z,
    seed,
    biome: continuity > 0.5 ? 'CITY' : continuity > 0 ? 'FOREST' : continuity > -0.5 ? 'DESERT' : 'MOUNTAIN',
    entropy: complexity,
    stabilityIndex: 1 - complexity,
    corruptionLevel: Math.max(0, complexity - 0.5) * 2,
    resourceData: {
      GOLD: resourceDensity > 80 ? 10 : 0,
      WOOD: continuity > 0 ? 5 : 1,
      AXIOM_SHARDS: resourceDensity > 95 ? 2 : 0
    },
    logicField: [], // Populated by 3D Engine for visualization
    logicString: fieldString,
    lastUpdate: new Date()
  };
}
