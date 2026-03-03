'use client';
/**
 * @fileOverview Axiom Frontier - World Building Service
 * Procedurally generates POIs, monsters, and resources for world chunks.
 * Handles City Layouts including Walls, Gates, and Houses.
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
    
    // Force (0,0) or high CI chunks to be cities
    const isSanctuary = (chunk.x === 0 && chunk.z === 0) || chunk.cellType === 'SANCTUARY' || chunk.biome === 'CITY';

    if (isSanctuary) {
      // 1. Perimeter Walls & Gates
      const wallSize = 20;
      const boundary = 38; 

      // Horizontal Edges (North/South)
      for (let x = -boundary; x <= boundary; x += wallSize) {
        if (Math.abs(x) < 10) {
          // Centered Gates
          pois.push({
            id: `gate-n-${chunk.id}`,
            type: 'GATE',
            position: [chunkWorldX, 0, chunkWorldZ - boundary],
            rotationY: 0,
            isDiscovered: true
          });
          pois.push({
            id: `gate-s-${chunk.id}`,
            type: 'GATE',
            position: [chunkWorldX, 0, chunkWorldZ + boundary],
            rotationY: Math.PI,
            isDiscovered: true
          });
        } else {
          pois.push({ id: `wall-tn-${chunk.id}-${x}`, type: 'WALL', position: [chunkWorldX + x, 0, chunkWorldZ - boundary], rotationY: 0, isDiscovered: true });
          pois.push({ id: `wall-ts-${chunk.id}-${x}`, type: 'WALL', position: [chunkWorldX + x, 0, chunkWorldZ + boundary], rotationY: 0, isDiscovered: true });
        }
      }

      // Vertical Edges (West/East)
      for (let z = -boundary; z <= boundary; z += wallSize) {
        if (Math.abs(z) < 10) {
          pois.push({
            id: `gate-w-${chunk.id}`,
            type: 'GATE',
            position: [chunkWorldX - boundary, 0, chunkWorldZ],
            rotationY: Math.PI / 2,
            isDiscovered: true
          });
          pois.push({
            id: `gate-e-${chunk.id}`,
            type: 'GATE',
            position: [chunkWorldX + boundary, 0, chunkWorldZ],
            rotationY: -Math.PI / 2,
            isDiscovered: true
          });
        } else {
          pois.push({ id: `wall-wl-${chunk.id}-${z}`, type: 'WALL', position: [chunkWorldX - boundary, 0, chunkWorldZ + z], rotationY: Math.PI / 2, isDiscovered: true });
          pois.push({ id: `wall-wr-${chunk.id}-${z}`, type: 'WALL', position: [chunkWorldX + boundary, 0, chunkWorldZ + z], rotationY: Math.PI / 2, isDiscovered: true });
        }
      }

      // 2. Hub Buildings (Strategic placement)
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
      pois.push({
        id: `city-forge-${chunk.id}`,
        type: 'FORGE',
        position: [chunkWorldX + 15, 0, chunkWorldZ + 15],
        isDiscovered: true,
        discoveryRadius: 10,
        rewardInsight: 2,
        threatLevel: 0
      });
      pois.push({
        id: `city-market-${chunk.id}`,
        type: 'MARKET_STALL',
        position: [chunkWorldX - 15, 0, chunkWorldZ + 15],
        isDiscovered: true,
        discoveryRadius: 10,
        rewardInsight: 2,
        threatLevel: 0
      });
      pois.push({
        id: `city-bank-${chunk.id}`,
        type: 'BANK_VAULT',
        position: [chunkWorldX + 15, 0, chunkWorldZ - 15],
        isDiscovered: true,
        discoveryRadius: 10,
        rewardInsight: 2,
        threatLevel: 0
      });

      // 3. Residential Blocks (Houses)
      for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
          const dataVal = chunk.axiomaticData[i][j];
          const posX = chunkWorldX + (i * 10 - 35);
          const posZ = chunkWorldZ + (j * 10 - 35);

          // Avoid central hub area
          const distToCenter = Math.hypot(posX - chunkWorldX, posZ - chunkWorldZ);
          if (distToCenter > 18 && distToCenter < 35 && dataVal > 0.45) {
            pois.push({
              id: `house-${chunk.id}-${i}-${j}`,
              type: 'HOUSE',
              position: [posX, 0, posZ],
              rotationY: Math.floor(dataVal * 4) * (Math.PI / 2),
              isDiscovered: true,
              threatLevel: 0
            });
          }
        }
      }
      
      return { pois, monsters, resources };
    }

    // Wilderness Manifestation (Standard logic for non-city chunks)
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const force = chunk.logicField[i][j];
        const dataVal = chunk.axiomaticData[i][j];
        const magnitude = Math.hypot(force.vx, force.vz);
        
        const posX = chunkWorldX + (i * 10 - 35);
        const posZ = chunkWorldZ + (j * 10 - 35);

        if (dataVal > 0.8 && magnitude < 0.1) {
          pois.push({
            id: `poi-${chunk.id}-${i}-${j}`,
            type: 'SHRINE',
            position: [posX, 0, posZ],
            isDiscovered: false,
            discoveryRadius: 15,
            rewardInsight: 10,
            threatLevel: 0.1
          });
        }

        if (magnitude > 0.12 && dataVal < 0.4) {
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

        if (magnitude > 0.05 && magnitude < 0.15 && dataVal > 0.4) {
          const rType = dataVal > 0.7 ? 'SILVER_ORE' : 'IRON_ORE';
          resources.push({
            id: `res-${chunk.id}-${i}-${j}`,
            type: rType as any,
            position: [posX, 0, posZ],
            amount: Math.floor(dataVal * 50)
          });
        }

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