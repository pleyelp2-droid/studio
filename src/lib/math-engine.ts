/**
 * @fileOverview Axiom Frontier - Deterministic Math Engine (Axiomatic Edition)
 * Provides the mathematical foundations for world generation based on KAPPA = 1000
 * and the 5 Core Axioms of the Ouroboros simulation.
 */

export const KAPPA = 1000;
export const CHUNK_SIZE = 16;
export const TICK_INTERVAL_MS = 600;

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

/**
 * Constructs the "Logical Chunk String" (Field String)
 */
export function constructFieldString(x: number, z: number, seed: number): string {
  const continuity = Axioms.Continuity(x, z);
  const resourceDensity = Axioms.ResourceDensity(x, z);
  const connectivity = Axioms.Connectivity(x, z);
  const complexity = Axioms.Complexity(x, z);
  const determinism = Axioms.Determinism(seed, x, z);

  return `F:${continuity.toFixed(2)}|R:${resourceDensity}|C:${connectivity}|X:${complexity.toFixed(2)}|D:${determinism}`;
}

let kappaOverride: number | null = null;
let kappaOverrideTicksLeft = 0;

export function getEffectiveKappa(): number {
  return kappaOverride ?? KAPPA;
}

export function setTemporaryKappa(newKappa: number, durationTicks: number): { success: boolean; message: string } {
  if (newKappa <= 0 || newKappa > 100000) {
    return { success: false, message: 'κ must be between 1 and 100000.' };
  }
  kappaOverride = newKappa;
  kappaOverrideTicksLeft = durationTicks;
  return { success: true, message: `κ set to ${newKappa} for ${durationTicks} ticks.` };
}

export function tickKappaOverride(): void {
  if (kappaOverride !== null && kappaOverrideTicksLeft > 0) {
    kappaOverrideTicksLeft--;
    if (kappaOverrideTicksLeft <= 0) {
      kappaOverride = null;
    }
  }
}

/**
 * Deterministic pseudo-random number generator
 */
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xFFFFFFFF;
    return (s >>> 0) / 0xFFFFFFFF;
  };
}

/**
 * Internal hash function for noise generation
 */
function perlinHash(x: number, y: number, seed: number): number {
  const rng = seededRandom(seed + x * 73856093 + y * 19349663);
  const n1 = rng();
  const n2 = rng();
  const n3 = rng();
  const n4 = rng();
  return (n1 + n2 + n3 + n4) / 4;
}

/**
 * Smoothed 2D noise
 */
function smoothNoise(x: number, y: number, seed: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const sx = fx * fx * (3 - 2 * fx);
  const sy = fy * fy * (3 - 2 * fy);

  const n00 = perlinHash(ix, iy, seed);
  const n10 = perlinHash(ix + 1, iy, seed);
  const n01 = perlinHash(ix, iy + 1, seed);
  const n11 = perlinHash(ix + 1, iy + 1, seed);

  const nx0 = n00 * (1 - sx) + n10 * sx;
  const nx1 = n01 * (1 - sx) + n11 * sy;
  return nx0 * (1 - sy) + nx1 * sy;
}

export function perlinNoise(seed: number, x: number, y: number, octaves = 4): number {
  let value = 0;
  let amplitude = 1;
  let frequency = 1;
  let maxVal = 0;

  for (let i = 0; i < octaves; i++) {
    value += smoothNoise(x * frequency * 0.1, y * frequency * 0.1, seed + i * 1000) * amplitude;
    maxVal += amplitude;
    amplitude *= 0.5;
    frequency *= 2;
  }

  return value / maxVal;
}

export function terrainHeight(seed: number, x: number, y: number): number {
  return perlinNoise(seed, x, y) * Math.log(getEffectiveKappa()) + (Axioms.Continuity(x, y) * 2);
}

export function biomeSelection(x: number, z: number, seed: number): 'CITY' | 'FOREST' | 'MOUNTAIN' | 'DESERT' | 'TUNDRA' | 'PLAINS' {
  const continuity = Axioms.Continuity(x, z);
  if (continuity > 0.8) return 'CITY';
  if (continuity > 0.3) return 'FOREST';
  if (continuity < -0.5) return 'MOUNTAIN';
  if (continuity < -0.2) return 'DESERT';
  return 'PLAINS';
}

export function generateChunkSeed(worldSeed: number, chunkX: number, chunkZ: number): number {
  return (worldSeed * 73856093 + chunkX * 19349663 + chunkZ * 83492791) & 0x7FFFFFFF;
}

export function chunkResources(seed: number, x: number, z: number): Record<string, number> {
  const density = Axioms.ResourceDensity(x, z);
  const biome = biomeSelection(x, z, seed);

  const resources: Record<string, number> = {
    WOOD: 0, STONE: 0, IRON_ORE: 0, SILVER_ORE: 0,
    GOLD_ORE: 0, DIAMOND: 0, ANCIENT_RELIC: 0, SUNLEAF_HERB: 0
  };

  if (density > 80) resources.GOLD_ORE = 10;
  if (density > 50) resources.IRON_ORE = 20;

  switch (biome) {
    case 'FOREST':
      resources.WOOD = 50;
      break;
    case 'CITY':
      resources.ANCIENT_RELIC = 5;
      break;
  }

  return resources;
}
