
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
  id: string;
  x: number;
  z: number;
  seed: number;
  biome: string;
  cellType?: 'SANCTUARY' | 'WILDERNESS' | 'DUNGEON_ENTRANCE';
  entropy: number;
  stabilityIndex: number;
  corruptionLevel: number;
  resourceData: Record<string, number>;
  logicField?: Array<{ vx: number; vz: number; magnitude: number }>;
  dungeonProbability?: number;
  lastUpdate?: any;
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
  str: number;
  agi: number;
  int: number;
  vit: number;
  position: { x: number; y: number; z: number };
  visionRange: number;
  state: AgentState;
  inventory: any[];
  dnaHistory: any[];
  memoryCache: any[];
  awakened: boolean;
  lastUpdate?: any;
}

export interface Faction {
  id: string;
  name: string;
  entityType: 'GUILD' | 'NATION' | 'CULT';
  leaderUid: string;
  members: string[];
  level: number;
  influence: number;
  territory: string[];
  infrastructure: string[];
  lastUpdate: any;
}

export type ItemRarity = 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY' | 'AXIOMATIC';
export type ItemType = 'HELMET' | 'CHEST' | 'LEGS' | 'WEAPON' | 'SHIELD' | 'ACCESSORY' | 'CONSUMABLE' | 'ARMOR';

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  rarity: ItemRarity;
}

export interface GeneratedItem {
  name: string;
  type: string;
  rarity: string;
  stats: Record<string, number>;
  level: number;
  value: number;
}

export interface CombatResult {
  attackerUid: string;
  defenderUid: string;
  defenderType: string;
  damageDealt: number;
  damageReceived: number;
  skillUsed: string;
  result: string;
  lootDropped: GeneratedItem[];
}

export interface MatrixTransaction {
  id: string;
  fromUid: string | null;
  toUid: string | null;
  txType: string;
  amount: number;
  currency: string;
  description: string;
  tickNumber: number;
  createdAt: any;
}

export interface ComplianceMatrixEntry {
  subsystem: string;
  energy: 'PASS' | 'WARN' | 'FAIL';
  erosion: 'PASS' | 'WARN' | 'FAIL';
  punctuation: 'PASS' | 'WARN' | 'FAIL';
  recursion: 'PASS' | 'WARN' | 'FAIL' | 'N/A';
  duality: 'PASS' | 'WARN' | 'FAIL';
  status: 'COMPLIANT' | 'DEGRADED' | 'IDLE' | 'PARTIAL';
}
