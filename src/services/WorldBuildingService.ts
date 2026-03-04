import { Chunk, POI, Monster, ResourceNode, MONSTER_TEMPLATES } from '../types';

export class WorldBuildingService {
  /**
   * Generates procedural buildings, monsters, and resources for a chunk.
   */
  static generateAxiomaticContent(chunk: Chunk) {
    if (!chunk || isNaN(chunk.x) || isNaN(chunk.z)) return { pois: [], monsters: [], resources: [] };

    const pois: POI[] = [];
    const monsters: Monster[] = [];
    const resources: ResourceNode[] = [];

    const seed = chunk.seed || (chunk.x * 31 + chunk.z * 17);
    // We use a base scale of 400 for visualization distance
    const chunkOffsetX = (chunk.x || 0) * 400;
    const chunkOffsetZ = (chunk.z || 0) * 400;

    if (isNaN(chunkOffsetX) || isNaN(chunkOffsetZ)) return { pois: [], monsters: [], resources: [] };

    const pseudoRandom = (offset: number) => {
      const x = Math.sin(seed + offset) * 10000;
      return x - Math.floor(x);
    };

    if (chunk.biome === 'CITY') {
      // Main architectural center
      pois.push({
        id: `city-center-${chunk.id}`,
        type: 'BUILDING',
        position: [chunkOffsetX, 0, chunkOffsetZ],
        rotationY: 0,
        isDiscovered: true
      });

      // Secondary modular structures
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const dist = 100 + pseudoRandom(i * 10) * 80;
        pois.push({
          id: `structure-${chunk.id}-${i}`,
          type: 'BUILDING',
          position: [
            chunkOffsetX + Math.cos(angle) * dist,
            0,
            chunkOffsetZ + Math.sin(angle) * dist
          ],
          rotationY: angle,
          isDiscovered: true
        });
      }
    } else if (['FOREST', 'PLAINS', 'MOUNTAIN', 'DESERT'].includes(chunk.biome)) {
      // Shrines and anomalous monuments
      if (pseudoRandom(1) > 0.3) {
        pois.push({
          id: `shrine-${chunk.id}`,
          type: 'SHRINE',
          position: [
            chunkOffsetX + (pseudoRandom(2) - 0.5) * 300,
            0,
            chunkOffsetZ + (pseudoRandom(3) - 0.5) * 300
          ],
          rotationY: pseudoRandom(4) * Math.PI * 2,
          isDiscovered: false
        });
      }
    }

    const resourceTypes = ['IRON_ORE', 'WOOD', 'STONE', 'GOLD_ORE'];
    const nodeCount = 8 + Math.floor(pseudoRandom(5) * 12);
    for (let i = 0; i < nodeCount; i++) {
      const type = resourceTypes[Math.floor(pseudoRandom(i + 15) * resourceTypes.length)];
      resources.push({
        id: `res-${chunk.id}-${i}`,
        type,
        position: [
          chunkOffsetX + (pseudoRandom(i + 25) - 0.5) * 350,
          0,
          chunkOffsetZ + (pseudoRandom(i + 35) - 0.5) * 350
        ],
        amount: 500 + Math.floor(pseudoRandom(i + 45) * 1000)
      });
    }

    const monsterKeys = Object.keys(MONSTER_TEMPLATES) as (keyof typeof MONSTER_TEMPLATES)[];
    const monsterCount = 5 + Math.floor(pseudoRandom(6) * 10);
    for (let i = 0; i < monsterCount; i++) {
      const typeKey = monsterKeys[Math.floor(pseudoRandom(i + 55) * monsterKeys.length)];
      const template = MONSTER_TEMPLATES[typeKey];
      if (!template) continue;
      
      monsters.push({
        id: `mob-${chunk.id}-${i}`,
        type: typeKey,
        name: `${typeKey} Sentinel`,
        position: [
          chunkOffsetX + (pseudoRandom(i + 65) - 0.5) * 320,
          0,
          chunkOffsetZ + (pseudoRandom(i + 75) - 0.5) * 320
        ],
        rotationY: pseudoRandom(i + 85) * Math.PI * 2,
        stats: template,
        xpReward: template.xp || 100,
        state: 'IDLE',
        color: typeKey === 'DRAGON' ? '#ff4d4d' : '#2fffff',
        scale: (template.scale || 1) * 3.0,
        targetId: null
      });
    }

    return { pois, monsters, resources };
  }
}