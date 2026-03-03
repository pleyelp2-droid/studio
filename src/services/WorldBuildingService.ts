import { Chunk, POI, Monster, ResourceNode, MONSTER_TEMPLATES } from '../types';

export class WorldBuildingService {
  static generateAxiomaticContent(chunk: Chunk) {
    const pois: POI[] = [];
    const monsters: Monster[] = [];
    const resources: ResourceNode[] = [];

    const seed = chunk.seed;
    const chunkOffsetX = chunk.x * 80;
    const chunkOffsetZ = chunk.z * 80;

    const pseudoRandom = (offset: number) => {
      const x = Math.sin(seed + offset) * 10000;
      return x - Math.floor(x);
    };

    // Generate POIs based on biome
    if (chunk.biome === 'CITY') {
      pois.push({
        id: `city-center-${chunk.id}`,
        type: 'BUILDING',
        position: [chunkOffsetX, 0, chunkOffsetZ],
        rotationY: 0,
        isDiscovered: true
      });

      for (let i = 0; i < 3; i++) {
        const angle = (i / 3) * Math.PI * 2;
        const dist = 15 + pseudoRandom(i) * 10;
        pois.push({
          id: `structure-${chunk.id}-${i}`,
          type: 'HOUSE',
          position: [
            chunkOffsetX + Math.cos(angle) * dist,
            0,
            chunkOffsetZ + Math.sin(angle) * dist
          ],
          rotationY: angle,
          isDiscovered: true
        });
      }
    } else if (chunk.biome === 'FOREST') {
      pois.push({
        id: `shrine-${chunk.id}`,
        type: 'SHRINE',
        position: [
          chunkOffsetX + (pseudoRandom(1) - 0.5) * 40,
          0,
          chunkOffsetZ + (pseudoRandom(2) - 0.5) * 40
        ],
        rotationY: pseudoRandom(3) * Math.PI * 2,
        isDiscovered: false
      });
    }

    const resourceTypes = ['IRON_ORE', 'WOOD', 'STONE'];
    const nodeCount = 2 + Math.floor(pseudoRandom(4) * 3);
    for (let i = 0; i < nodeCount; i++) {
      const type = resourceTypes[Math.floor(pseudoRandom(i + 10) * resourceTypes.length)];
      resources.push({
        id: `res-${chunk.id}-${i}`,
        type,
        position: [
          chunkOffsetX + (pseudoRandom(i + 20) - 0.5) * 60,
          0,
          chunkOffsetZ + (pseudoRandom(i + 30) - 0.5) * 60
        ],
        amount: 50 + Math.floor(pseudoRandom(i + 40) * 100)
      });
    }

    const monsterKeys = Object.keys(MONSTER_TEMPLATES) as (keyof typeof MONSTER_TEMPLATES)[];
    const monsterCount = 1 + Math.floor(pseudoRandom(5) * 2);
    for (let i = 0; i < monsterCount; i++) {
      const typeKey = monsterKeys[Math.floor(pseudoRandom(i + 50) * monsterKeys.length)];
      const template = MONSTER_TEMPLATES[typeKey];
      monsters.push({
        id: `mob-${chunk.id}-${i}`,
        type: typeKey,
        name: `${typeKey} Alpha`,
        position: [
          chunkOffsetX + (pseudoRandom(i + 60) - 0.5) * 50,
          0,
          chunkOffsetZ + (pseudoRandom(i + 70) - 0.5) * 50
        ],
        rotationY: pseudoRandom(i + 80) * Math.PI * 2,
        stats: template,
        xpReward: template.xp,
        state: 'IDLE',
        color: typeKey === 'DRAGON' ? '#ff0000' : '#44ff44',
        scale: template.scale,
        targetId: null
      });
    }

    return { pois, monsters, resources };
  }
}
