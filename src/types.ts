
/**
 * @fileOverview Core type definitions for the Ouroboros MMO engine.
 * Unified with SQL schema parameters.
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
  id: string;
  x: number;
  z: number;
  biome: string;
  cellType?: 'SANCTUARY' | 'WILDERNESS' | 'DUNGEON_ENTRANCE';
  entropy: number;
  stabilityIndex: number;
  corruptionLevel: number;
  resourceData: Record<string, number>;
  logicField?: Array<{ vx: number; vz: number; magnitude: number }>;
  dungeonProbability?: number;
}

export interface POI {
  id: string;
  type: 'SHRINE' | 'RUIN' | 'NEST' | 'DUNGEON' | 'MARKET_STALL' | 'TREE' | 'BUILDING';
  position: [number, number, number];
  isDiscovered: boolean;
}

export interface Agent {
  id: string;
  displayName: string;
  npcClass: string;
  level: number;
  hp: number;
  maxHp: number;
  exp: number;
  position: { x: number; y: number; z: number };
  visionRange: number;
  state: AgentState;
  inventory: any[];
  dnaHistory: any[];
  memoryCache: any[];
  awakened: boolean;
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

export interface CombatResult {
  attackerUid: string;
  defenderUid: string;
  defenderType: string;
  damageDealt: number;
  damageReceived: number;
  skillUsed: string;
  result: string;
  lootDropped: any[];
}

export interface CombatLog extends CombatResult {
  id: string;
  tickNumber: number;
  createdAt: any;
}
