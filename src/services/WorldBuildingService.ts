import { Chunk, POI, Monster, ResourceNode, MONSTER_TEMPLATES } from '../types';

export class WorldBuildingService {
  static generateAxiomaticContent(chunk: Chunk): {
    pois: POI[],
    monsters: Monster[],
    resources: ResourceNode[]
  } {
    const pois: POI[] = [];
    const monsters: Monster[] = [];
    const resources: ResourceNode[] = [];
    
    // In a real app, this would use the chunk's seed and noise data
    // to procedurally generate content. Here we return mock data for the demo.
    
    const chunkWorldX = chunk.x * 80;
    const chunkWorldZ = chunk.z * 80;

    // Add a shrine to every chunk
    pois.push({
      id: `shrine-${chunk.id}`,
      type: 'SHRINE',
      position: [chunkWorldX + 10, 0, chunkWorldZ + 10],
      isDiscovered: false,
      discoveryRadius: 15,
      rewardInsight: 5,
      loreFragment: "A fragment of ancient knowledge persists here."
    });

    // Add some resources
    resources.push({
      id: `ore-${chunk.id}-1`,
      type: 'IRON_ORE',
      position: [chunkWorldX - 10, 0, chunkWorldZ - 10],
      amount: 50
    });

    // Add a monster
    const mType = 'GOBLIN';
    const template = MONSTER_TEMPLATES[mType];
    monsters.push({
      id: `monster-${chunk.id}-1`,
      type: mType,
      name: `${mType} Guard`,
      position: [chunkWorldX + 5, 0, chunkWorldZ - 5],
      rotationY: Math.random() * Math.PI * 2,
      stats: { ...template },
      xpReward: template.xp,
      state: 'IDLE',
      color: '#ff4444',
      scale: template.scale,
      targetId: null
    });

    return { pois, monsters, resources };
  }
}
