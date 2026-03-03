
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

export interface ThinkingMatrix {
  personality: string;
  currentLongTermGoal: string;
  alignment: number; // 0 to 1
  languagePreference: string;
  sociability: number;
  aggression: number;
  curiosity: number;
  frugality: number;
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

export type POIType = 'SHRINE' | 'RUIN' | 'NEST' | 'DUNGEON' | 'MARKET_STALL' | 'TREE' | 'BUILDING' | 'MINE' | 'FOREST' | 'BANK_VAULT' | 'FORGE';

export interface POI {
  id: string;
  type: POIType;
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
    atk: number;
    def: number;
  };
  xpReward: number;
  state: string;
  targetId: string | null;
  color: string;
  scale: number;
}

export const MONSTER_TEMPLATES: Record<string, any> = {
  'SLIME': { hp: 30, str: 2, agi: 2, int: 1, vit: 5, xp: 10, scale: 0.8, atk: 5, def: 2 },
  'GOBLIN': { hp: 50, str: 5, agi: 8, int: 3, vit: 4, xp: 25, scale: 1.0, atk: 8, def: 4 },
  'ORC': { hp: 120, str: 15, agi: 5, int: 2, vit: 12, xp: 75, scale: 1.4, atk: 15, def: 8 },
  'DRAGON': { hp: 500, str: 40, agi: 12, int: 25, vit: 30, xp: 500, scale: 3.5, atk: 50, def: 30 }
};

export interface Agent {
  id: string;
  displayName: string;
  npcClass: string;
  race?: string;
  level: number;
  hp: number;
  maxHp: number;
  energy: number;
  maxEnergy: number;
  integrity: number; // 0 to 1
  exp: number;
  insightPoints: number;
  awakeningProgress: number; // 0 to 100
  consciousnessLevel: number; // 0 to 1
  str: number;
  agi: number;
  int: number;
  vit: number;
  position: { x: number; y: number; z: number };
  visionRange: number;
  state: AgentState;
  inventory: any[];
  bank: any[];
  skills: Record<string, { level: number; exp: number }>;
  dnaHistory: any[];
  memoryCache: any[];
  awakened: boolean;
  faction?: string;
  loreSnippet?: string;
  thinkingMatrix: ThinkingMatrix;
  appearance?: {
    skinTone: string;
    hairStyle: string;
    bodyScale: number;
  };
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
  graphics: 'PASS' | 'WARN' | 'FAIL';
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
export type ItemType = 'WEAPON' | 'SHIELD' | 'ARMOR' | 'ACCESSORY' | 'CONSUMABLE' | 'HELM' | 'CHEST' | 'LEGS' | 'RELIC';

export interface ItemStats {
  atk?: number;
  def?: number;
  agi?: number;
  int?: number;
  vit?: number;
  [key: string]: number | undefined;
}

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  subtype?: string;
  rarity: ItemRarity;
  stats: ItemStats;
  level: number;
  value: number;
  description?: string;
}
