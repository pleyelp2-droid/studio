/**
 * @fileOverview Axiom Frontier - Deterministic Math Engine
 * Provides the mathematical foundations for world generation, noise, and resource decay.
 */

export const CHUNK_SIZE = 80;
export const KAPPA = 0.01;

/**
 * Simple deterministic pseudo-random number generator
 */
export function pseudoRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

/**
 * Generates a unique seed for a chunk based on global seed and coordinates
 */
export function generateChunkSeed(worldSeed: number, x: number, z: number): number {
  return Math.abs((worldSeed ^ (x * 73856093) ^ (z * 19349663)) % 2147483647);
}

/**
 * 2D Gradient Noise (Perlin-like)
 */
export function perlinNoise(seed: number, x: number, z: number): number {
  const n = x + z * 57 + seed * 131;
  const h = (n << 13) ^ n;
  return (1.0 - ((h * (h * h * 15731 + 789221) + 1376312589) & 0x7fffffff) / 1073741824.0 + 1.0) / 2.0;
}

/**
 * Determines terrain height based on noise
 */
export function terrainHeight(seed: number, x: number, z: number): number {
  const n1 = perlinNoise(seed, x * 0.01, z * 0.01);
  const n2 = perlinNoise(seed + 1, x * 0.05, z * 0.05) * 0.2;
  return (n1 + n2) * 10;
}

/**
 * Selects a biome based on coordinates and entropy
 */
export function biomeSelection(x: number, z: number, seed: number): string {
  const v = perlinNoise(seed, x * 0.005, z * 0.005);
  if (v < 0.25) return 'DESERT';
  if (v < 0.5) return 'FOREST';
  if (v < 0.75) return 'WASTELAND';
  return 'CITY';
}

/**
 * Probability of a dungeon spawn based on terrain height
 */
export function dungeonProbability(height: number): number {
  // Dungeons are more likely in extreme heights/depths
  return Math.abs(height - 5) / 10 * 0.15;
}

/**
 * Generates initial resource distribution for a chunk
 */
export function chunkResources(seed: number, x: number, z: number): Record<string, number> {
  return {
    axiom: Math.floor(perlinNoise(seed + 10, x, z) * 1000),
    minerals: Math.floor(perlinNoise(seed + 20, x, z) * 2000),
    organic: Math.floor(perlinNoise(seed + 30, x, z) * 1500)
  };
}

/**
 * Natural resource decay/regeneration formula
 */
export function resourceDecay(current: number, rate: number, min: number): number {
  return Math.max(min, current * (1 - rate));
}

/**
 * Calculates market price based on supply and demand
 */
export function marketPrice(base: number, demand: number, supply: number): number {
  return base * (demand / (supply + KAPPA));
}
