
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
  logicField?: Array<Array<{ vx: number; vz: number; magnitude: number }>>;
  axiomaticData?: number[][];
  logicString?: string;
  dungeonProbability?: number;
  lastUpdate?: any;
}

export interface POI {
  id: string;
  type: 'SHRINE' | 'RUIN' | 'NEST' | 'DUNGEON' | 'MARKET_STALL' | 'TREE' | 'BUILDING';
  position: [number, number, number];
  isDiscovered: boolean;
  discoveryRadius?: number;
  rewardInsight?: number;
  loreFragment?: string;
  threatLevel?: number;
}

export interface ResourceNode {
  id: string;
  type: 'WOOD' | 'STONE' | 'IRON_ORE' | 'SILVER_ORE' | 'GOLD_ORE' | 'ANCIENT_RELIC' | 'SUNLEAF_HERB';
  position: [number, number, number];
  amount: number;
}

export interface Monster {
  id: string;
  type: string;
  name: string;
  position: [number, number, number];
  rotationY: number;
  stats: {
    hp: number;
    maxHp: number;
    str: number;
    agi: number;
    int: number;
    vit: number;
  };
  xpReward: number;
  state: string;
  targetId: string | null;
  color: string;
  scale: number;
}

export const MONSTER_TEMPLATES: Record<string, any> = {
  'SLIME': { hp: 30, str: 2, agi: 2, int: 1, vit: 5, xp: 10, scale: 0.8 },
  'GOBLIN': { hp: 50, str: 5, agi: 8, int: 3, vit: 4, xp: 25, scale: 1.0 },
  'ORC': { hp: 120, str: 15, agi: 5, int: 2, vit: 12, xp: 75, scale: 1.4 },
  'DRAGON': { hp: 500, str: 40, agi: 12, int: 25, vit: 30, xp: 500, scale: 3.5 }
};

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

export interface LiveEvent {
  id: string;
  adminId: string;
  eventType: 'INVASION' | 'ECONOMIC_SHOCK' | 'BIOME_SHIFT' | 'LORE_INJECTION';
  name: string;
  severity: number;
  parameters: any;
  status: 'ACTIVE' | 'RESOLVED' | 'CANCELLED';
  createdAt: any;
  resolvedAt?: any;
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

export interface AdminAuditLog {
  id: string;
  adminId: string;
  action: string;
  targetType: string;
  targetId: string;
  details: any;
  ipAddress: string;
  timestamp: any;
}

export interface GeneratedItem {
  name: string;
  type: string;
  rarity: string;
  stats: Record<string, number>;
  level: number;
  value: number;
}

export type ItemRarity = 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY' | 'AXIOMATIC';
export type ItemType = 'WEAPON' | 'SHIELD' | 'ARMOR' | 'ACCESSORY' | 'CONSUMABLE';

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  rarity: ItemRarity;
  stats: Record<string, number>;
  level: number;
  value: number;
}
