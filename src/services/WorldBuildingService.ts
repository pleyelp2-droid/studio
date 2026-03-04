
import { Chunk, POI, Monster, ResourceNode, MONSTER_TEMPLATES } from '../types';

export class WorldBuildingService {
  /**
   * Enhanced Procedural Content Generation
   * Generates dense cities, active monsters, and resource fields.
   */
  static generateAxiomaticContent(chunk: Chunk) {
    if (!chunk) return { pois: [], monsters: [], resources: [] };

    const pois: POI[] = [];
    const monsters: Monster[] = [];
    const resources: ResourceNode[] = [];

    const seed = chunk.seed || (chunk.x * 1337 + chunk.z * 7331);
    const chunkOffsetX = chunk.x * 400;
    const chunkOffsetZ = chunk.z * 400;

    const pseudoRandom = (offset: number) => {
      const x = Math.sin(seed + offset) * 10000;
      return x - Math.floor(x);
    };

    // 1. POI Manifestation
    if (chunk.biome === 'CITY') {
      // Main Spire
      pois.push({
        id: `spire-${chunk.id}`,
        type: 'BUILDING',
        position: [chunkOffsetX, 0, chunkOffsetZ],
        rotationY: 0,
        isDiscovered: true
      });

      // City Walls
      const wallCount = 8;
      for (let i = 0; i < wallCount; i++) {
        const angle = (i / wallCount) * Math.PI * 2;
        pois.push({
          id: `wall-${chunk.id}-${i}`,
          type: 'WALL',
          position: [
            chunkOffsetX + Math.cos(angle) * 180,
            0,
            chunkOffsetZ + Math.sin(angle) * 180
          ],
          rotationY: angle + Math.PI / 2,
          isDiscovered: true
        });
      }

      // Houses
      for (let i = 0; i < 10; i++) {
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
      // Wilderness POIs
      if (pseudoRandom(1) > 0.7) {
        pois.push({
          id: `shrine-${chunk.id}`,
          type: 'SHRINE',
          position: [
            chunkOffsetX + (pseudoRandom(2) - 0.5) * 200,
            0,
            chunkOffsetZ + (pseudoRandom(3) - 0.5) * 200
          ],
          isDiscovered: false
        });
      }
    }

    // 2. Resource Manifestation
    const resTypes = ['IRON_ORE', 'WOOD', 'GOLD_ORE', 'STONE'];
    const nodeCount = 5 + Math.floor(pseudoRandom(10) * 10);
    for (let i = 0; i < nodeCount; i++) {
      resources.push({
        id: `res-${chunk.id}-${i}`,
        type: resTypes[Math.floor(pseudoRandom(i + 20) * resTypes.length)],
        position: [
          chunkOffsetX + (pseudoRandom(i + 30) - 0.5) * 350,
          0,
          chunkOffsetZ + (pseudoRandom(i + 40) - 0.5) * 350
        ],
        amount: 100
      });
    }

    // 3. Autonomous Life (NPCs / Monsters)
    const lifeCount = chunk.biome === 'CITY' ? 6 : 3;
    for (let i = 0; i < lifeCount; i++) {
      const type = pseudoRandom(i + 50) > 0.8 ? 'DRAGON' : (pseudoRandom(i + 51) > 0.5 ? 'ORC' : 'GOBLIN');
      monsters.push({
        id: `mob-${chunk.id}-${i}`,
        type,
        name: chunk.biome === 'CITY' ? `City Watch ${i+1}` : `${type} Stalker`,
        position: [
          chunkOffsetX + (pseudoRandom(i + 60) - 0.5) * 300,
          0,
          chunkOffsetZ + (pseudoRandom(i + 70) - 0.5) * 300
        ],
        rotationY: pseudoRandom(i + 80) * Math.PI * 2,
        stats: MONSTER_TEMPLATES[type as keyof typeof MONSTER_TEMPLATES],
        xpReward: 100,
        state: 'IDLE',
        color: type === 'DRAGON' ? '#ff4d4d' : '#7b4fd4',
        scale: type === 'DRAGON' ? 5.0 : 1.2,
        targetId: null
      });
    }

    return { pois, monsters, resources };
  }
}
