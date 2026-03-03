/**
 * @fileOverview Core type definitions for the Ouroboros MMO engine.
 */

export enum AgentState {
  IDLE = 'IDLE',
  THINKING = 'THINKING',
  BANKING = 'BANKING',
  MARKETING = 'MARKETING',
  TRADING = 'TRADING',
  CRAFTING = 'CRAFTING',
  ALLIANCE_FORMING = 'ALLIANCE_FORMING',
  GATHERING = 'GATHERING',
  EXPLORING = 'EXPLORING',
  QUESTING = 'QUESTING',
  BUILDING = 'BUILDING',
  COMBAT = 'COMBAT',
  ASCENDING = 'ASCENDING',
  DUNGEONEERING = 'DUNGEONEERING',
  MOUNTED = 'MOUNTED',
}

export interface Chunk {
  x: number;
  z: number;
  biome: 'FOREST' | 'DESERT' | 'CITY' | 'WASTELAND';
  cellType?: 'SANCTUARY' | 'WILDERNESS' | 'DUNGEON_ENTRANCE';
}

export interface POI {
  id: string;
  type: 'SHRINE' | 'RUIN' | 'NEST' | 'DUNGEON' | 'MARKET_STALL' | 'TREE' | 'BUILDING';
  position: [number, number, number];
  isDiscovered: boolean;
}

export interface Agent {
  id: string;
  position: [number, number, number];
  visionRange: number;
  state: AgentState;
}

export interface Monster {
  id: string;
  type: 'SLIME' | 'GOBLIN' | 'VOID_STALKER';
  position: [number, number, number];
  health: number;
}

export type ItemRarity = 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY' | 'AXIOMATIC';
export type ItemType = 'HELMET' | 'CHEST' | 'LEGS' | 'WEAPON' | 'SHIELD';

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  rarity: ItemRarity;
}
