
import { Chunk, POI, Monster, ResourceNode, MONSTER_TEMPLATES } from '../types';

export class WorldBuildingService {
  /**
   * Generates procedural buildings, monsters, and resources for a chunk.
   * Scales coordinates to match the 3D World view.
   */
  static generateAxiomaticContent(chunk: Chunk) {
    if (!chunk || isNaN(chunk.x) || isNaN(chunk.z)) return { pois: [], monsters: [], resources: [] };

    const pois: POI[] = [];
    const monsters: Monster[] = [];
    const resources: ResourceNode[] = [];

    const seed = chunk.seed || (chunk.x * 31 + chunk.z * 17);
    // Base scale matches World3D.tsx: 400 units per chunk
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
      for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2;
        const dist = 80 + pseudoRandom(i * 10) * 60;
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
      if (pseudoRandom(1) > 0.4) {
        pois.push({
          id: `shrine-${chunk.id}`,
          type: 'SHRINE',
          position: [
            chunkOffsetX + (pseudoRandom(2) - 0.5) * 200,
            0,
            chunkOffsetZ + (pseudoRandom(3) - 0.5) * 200
          ],
          rotationY: pseudoRandom(4) * Math.PI * 2,
          isDiscovered: false
        });
      }
    }

    // Generate Resources
    const resourceTypes = ['IRON_ORE', 'WOOD', 'STONE', 'GOLD_ORE'];
    const nodeCount = 4 + Math.floor(pseudoRandom(5) * 6);
    for (let i = 0; i < nodeCount; i++) {
      const type = resourceTypes[Math.floor(pseudoRandom(i + 15) * resourceTypes.length)];
      resources.push({
        id: `res-${chunk.id}-${i}`,
        type,
        position: [
          chunkOffsetX + (pseudoRandom(i + 25) - 0.5) * 300,
          0,
          chunkOffsetZ + (pseudoRandom(i + 35) - 0.5) * 300
        ],
        amount: 100 + Math.floor(pseudoRandom(i + 45) * 500)
      });
    }

    // Generate Autonomous Life (Monsters)
    const monsterKeys = Object.keys(MONSTER_TEMPLATES) as (keyof typeof MONSTER_TEMPLATES)[];
    const monsterCount = 2 + Math.floor(pseudoRandom(6) * 4);
    for (let i = 0; i < monsterCount; i++) {
      const typeKey = monsterKeys[Math.floor(pseudoRandom(i + 55) * monsterKeys.length)];
      const template = MONSTER_TEMPLATES[typeKey];
      if (!template) continue;
      
      monsters.push({
        id: `mob-${chunk.id}-${i}`,
        type: typeKey,
        name: `${typeKey} Sentinel`,
        position: [
          chunkOffsetX + (pseudoRandom(i + 65) - 0.5) * 250,
          0,
          chunkOffsetZ + (pseudoRandom(i + 75) - 0.5) * 250
        ],
        rotationY: pseudoRandom(i + 85) * Math.PI * 2,
        stats: template,
        xpReward: template.xp || 100,
        state: 'IDLE',
        color: typeKey === 'DRAGON' ? '#ff4d4d' : '#60D4FF',
        scale: (template.scale || 1) * 2.0,
        targetId: null
      });
    }

    return { pois, monsters, resources };
  }
}
