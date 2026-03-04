/**
 * @fileOverview Axiom Frontier - Deterministic Math Engine
 * Based on KAPPA = 1000 and the 5 Core Axioms.
 */

export const KAPPA = 1000;

export interface ChunkData {
  id: string;
  x: number;
  y: number;
  biome: string;
  resources: Record<string, number>;
  fieldString: string;
}

export const Axioms = {
  Continuity: (x: number, y: number) => Math.sin(x / KAPPA) + Math.cos(y / KAPPA),
  ResourceDensity: (x: number, y: number) => (Math.abs(x) + Math.abs(y)) % 100,
  Connectivity: (x: number, y: number) => (x + y) % 2 === 0 ? "path" : "wall",
  Complexity: (x: number, y: number) => Math.sqrt(x * x + y * y) / KAPPA,
  Determinism: (seed: number, x: number, y: number) => (x * 31 + y * 37 + seed) % 1000,
};

export function generateChunk(x: number, y: number, seed: number): ChunkData {
  const continuity = Axioms.Continuity(x, y);
  const resourceDensity = Axioms.ResourceDensity(x, y);
  const connectivity = Axioms.Connectivity(x, y);
  const complexity = Axioms.Complexity(x, y);
  const determinism = Axioms.Determinism(seed, x, y);

  const fieldString = `F:${continuity.toFixed(2)}|R:${resourceDensity}|C:${connectivity}|X:${complexity.toFixed(2)}|D:${determinism}`;

  return {
    id: `${x}:${y}`,
    x,
    y,
    biome: continuity > 0 ? "forest" : "desert",
    resources: {
      gold: resourceDensity > 80 ? 10 : 0,
      wood: continuity > 0 ? 5 : 1,
    },
    fieldString,
  };
}
