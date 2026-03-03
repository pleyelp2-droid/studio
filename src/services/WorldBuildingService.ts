
'use client';
/**
 * @fileOverview Axiom Frontier - World Building Service
 * Procedurally generates POIs, monsters, and resources for world chunks.
 */

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
    
    if (!chunk.logicField || !chunk.axiomaticData) return { pois, monsters, resources };

    const chunkWorldX = chunk.x * 80;
    const chunkWorldZ = chunk.z * 80;
    const isSanctuary = chunk.cellType === 'SANCTUARY' || chunk.biome === 'CITY';

    if (isSanctuary) {
      // Hub Manifestation
      pois.push({
        id: `city-forge-${chunk.id}`,
        type: 'BUILDING',
        position: [chunkWorldX + 15, 0, chunkWorldZ + 10],
        isDiscovered: true,
        discoveryRadius: 10,
        rewardInsight: 2,
        loreFragment: 'The Forge — repair and craft equipment here.',
        threatLevel: 0
      });
      pois.push({
        id: `city-market-${chunk.id}`,
        type: 'MARKET_STALL',
        position: [chunkWorldX - 12, 0, chunkWorldZ + 8],
        isDiscovered: true,
        discoveryRadius: 10,
        rewardInsight: 2,
        loreFragment: 'Central Market — trade resources and gear.',
        threatLevel: 0
      });
      pois.push({
        id: `city-bank-${chunk.id}`,
        type: 'BUILDING',
        position: [chunkWorldX + 20, 0, chunkWorldZ - 15],
        isDiscovered: true,
        discoveryRadius: 10,
        rewardInsight: 2,
        loreFragment: 'Axiom Bank — store your valuables safely.',
        threatLevel: 0
      });
      pois.push({
        id: `city-shrine-${chunk.id}`,
        type: 'SHRINE',
        position: [chunkWorldX, 0, chunkWorldZ],
        isDiscovered: true,
        discoveryRadius: 15,
        rewardInsight: 5,
        loreFragment: 'The Nexus Shrine — center of all axioms.',
        threatLevel: 0
      });
      
      return { pois, monsters, resources };
    }

    // Wilderness Manifestation - Optimized Thresholds for more content
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const force = chunk.logicField[i][j];
        const dataVal = chunk.axiomaticData[i][j];
        const magnitude = Math.hypot(force.vx, force.vz);
        
        const posX = chunkWorldX + (i * 10 - 35);
        const posZ = chunkWorldZ + (j * 10 - 35);

        // Shrines (Resonance POIs) - Threshold: High Density, Low Noise
        if (dataVal > 0.8 && magnitude < 0.1) {
          pois.push({
            id: `poi-${chunk.id}-${i}-${j}`,
            type: 'SHRINE',
            position: [posX, 0, posZ],
            isDiscovered: false,
            discoveryRadius: 15,
            rewardInsight: 10,
            loreFragment: `Axiomatic Resonance detected.`,
            threatLevel: 0.1
          });
        }

        // Monsters (Corrupted Entities) - Threshold: Higher Noise
        if (magnitude > 0.1 && dataVal < 0.4) {
          const mType = magnitude > 0.18 ? 'DRAGON' : magnitude > 0.14 ? 'ORC' : 'GOBLIN';
          const template = MONSTER_TEMPLATES[mType] || MONSTER_TEMPLATES['GOBLIN'];
          monsters.push({
            id: `m-${chunk.id}-${i}-${j}`,
            type: mType,
            name: `${mType} Signature`,
            position: [posX, 0, posZ],
            rotationY: Math.random() * Math.PI * 2,
            stats: { ...template, maxHp: template.hp },
            xpReward: template.xp,
            state: 'IDLE',
            targetId: null,
            color: '#ef4444',
            scale: template.scale
          });
        }

        // Resource Nodes
        if (magnitude > 0.05 && magnitude < 0.15 && dataVal > 0.4) {
          const rType = dataVal > 0.7 ? 'SILVER_ORE' : 'IRON_ORE';
          resources.push({
            id: `res-${chunk.id}-${i}-${j}`,
            type: rType as any,
            position: [posX, 0, posZ],
            amount: Math.floor(dataVal * 50)
          });
        }

        // Trees / Flora
        if (chunk.biome === 'FOREST' && dataVal > 0.3 && Math.random() < 0.2) {
           pois.push({
            id: `tree-${chunk.id}-${i}-${j}`,
            type: 'TREE',
            position: [posX, 0, posZ],
            isDiscovered: true,
            discoveryRadius: 5,
            rewardInsight: 1,
            threatLevel: 0
          });
        }

        // Dungeons / Ruins - Rare Emergence
        if (magnitude > 0.08 && Math.random() < 0.02) {
          pois.push({
            id: `poi-rare-${chunk.id}-${i}-${j}`,
            type: Math.random() > 0.5 ? 'DUNGEON' : 'RUIN',
            position: [posX, 0, posZ],
            isDiscovered: false,
            discoveryRadius: 20,
            rewardInsight: 25,
            threatLevel: 0.6
          });
        }
      }
    }

    return { pois, monsters, resources };
  }
}
