
import { Chunk, POI, Monster, ResourceNode, MONSTER_TEMPLATES } from '../types';

export class WorldBuildingService {
  /**
   * Generates procedural buildings, monsters, and resources for a chunk.
   * Enhanced for dense cities and varied structures.
   */
  static generateAxiomaticContent(chunk: Chunk) {
    if (!chunk || isNaN(chunk.x) || isNaN(chunk.z)) return { pois: [], monsters: [], resources: [] };

    const pois: POI[] = [];
    const monsters: Monster[] = [];
    const resources: ResourceNode[] = [];

    const seed = chunk.seed || (chunk.x * 31 + chunk.z * 17);
    const chunkOffsetX = (chunk.x || 0) * 400;
    const chunkOffsetZ = (chunk.z || 0) * 400;

    const pseudoRandom = (offset: number) => {
      const x = Math.sin(seed + offset) * 10000;
      return x - Math.floor(x);
    };

    if (chunk.biome === 'CITY') {
      // Dense City Generation
      // Main Center Spire
      pois.push({
        id: `city-center-${chunk.id}`,
        type: 'BUILDING',
        position: [chunkOffsetX, 0, chunkOffsetZ],
        rotationY: 0,
        isDiscovered: true
      });

      // City Walls and Gates
      const wallCount = 8;
      for (let i = 0; i < wallCount; i++) {
        const angle = (i / wallCount) * Math.PI * 2;
        const dist = 180;
        pois.push({
          id: `wall-${chunk.id}-${i}`,
          type: 'WALL',
          position: [
            chunkOffsetX + Math.cos(angle) * dist,
            0,
            chunkOffsetZ + Math.sin(angle) * dist
          ],
          rotationY: angle + Math.PI / 2,
          isDiscovered: true
        });
      }

      // Procedural Houses / Units
      const houseCount = 12;
      for (let i = 0; i < houseCount; i++) {
        const angle = pseudoRandom(i) * Math.PI * 2;
        const dist = 60 + pseudoRandom(i * 2) * 80;
        pois.push({
          id: `house-${chunk.id}-${i}`,
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
    } else {
      // Wilderness Generation
      if (pseudoRandom(1) > 0.6) {
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

    // Generate Resources (Shared across all biomes but weighted)
    const resourceTypes = ['IRON_ORE', 'WOOD', 'STONE', 'GOLD_ORE'];
    const nodeCount = chunk.biome === 'CITY' ? 2 : 6 + Math.floor(pseudoRandom(5) * 8);
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
        amount: 100 + Math.floor(pseudoRandom(i + 45) * 500)
      });
    }

    // Generate Autonomous Life (Monsters / NPCs)
    const monsterKeys = Object.keys(MONSTER_TEMPLATES) as (keyof typeof MONSTER_TEMPLATES)[];
    const lifeCount = chunk.biome === 'CITY' ? 8 : 3 + Math.floor(pseudoRandom(6) * 5);
    for (let i = 0; i < lifeCount; i++) {
      const typeKey = monsterKeys[Math.floor(pseudoRandom(i + 55) * monsterKeys.length)];
      const template = MONSTER_TEMPLATES[typeKey];
      
      monsters.push({
        id: `mob-${chunk.id}-${i}`,
        type: typeKey,
        name: chunk.biome === 'CITY' ? `City Watch ${i+1}` : `${typeKey} Sentinel`,
        position: [
          chunkOffsetX + (pseudoRandom(i + 65) - 0.5) * 300,
          0,
          chunkOffsetZ + (pseudoRandom(i + 75) - 0.5) * 300
        ],
        rotationY: pseudoRandom(i + 85) * Math.PI * 2,
        stats: template,
        xpReward: template.xp || 100,
        state: 'IDLE',
        color: chunk.biome === 'CITY' ? '#60D4FF' : (typeKey === 'DRAGON' ? '#ff4d4d' : '#7b4fd4'),
        scale: (template.scale || 1) * 2.5,
        targetId: null
      });
    }

    return { pois, monsters, resources };
  }
}
