export enum AgentState {
  IDLE = 'IDLE',
  THINKING = 'THINKING',
  GATHERING = 'GATHERING',
  EXPLORING = 'EXPLORING',
  COMBAT = 'COMBAT',
  TRADING = 'TRADING'
}

export interface ThinkingMatrix {
  personality: string;
  currentLongTermGoal: string;
  alignment: number;
  languagePreference: string;
  sociability: number;
  aggression: number;
  curiosity: number;
  frugality: number;
}

export interface AppearanceConfig {
  skinTone: string;
  hairStyle: string;
  bodyScale: number;
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
  thinkingMatrix: ThinkingMatrix;
  appearance?: AppearanceConfig;
  lastUpdate: any;
}

export interface Chunk {
  id: string;
  x: number;
  z: number;
  seed: number;
  biome: 'CITY' | 'FOREST' | 'MOUNTAIN' | 'DESERT' | 'TUNDRA';
  entropy: number;
  stabilityIndex: number;
  corruptionLevel: number;
  resourceData: any;
  logicField: any[];
  lastUpdate: any;
}

export interface POI {
  id: string;
  type: 'SHRINE' | 'FORGE' | 'MARKET_STALL' | 'BANK_VAULT' | 'GATE' | 'WALL' | 'HOUSE' | 'TREE' | 'DUNGEON' | 'RUIN' | 'NEST' | 'BUILDING';
  position: [number, number, number];
  rotationY?: number;
  isDiscovered: boolean;
}

export interface ResourceNode {
  id: string;
  type: string;
  position: [number, number, number];
  amount: number;
}

export interface Monster {
  id: string;
  type: string;
  name: string;
  position: [number, number, number];
  rotationY: number;
  stats: any;
  xpReward: number;
  state: string;
  color: string;
  scale: number;
  targetId: string | null;
}

export const MONSTER_TEMPLATES = {
  GOBLIN: { hp: 50, atk: 5, def: 2, xp: 100, scale: 0.8 },
  ORC: { hp: 150, atk: 15, def: 10, xp: 300, scale: 1.2 },
  DRAGON: { hp: 1000, atk: 50, def: 40, xp: 2000, scale: 5.0 },
};

export interface AdminAuditLog {
  id: string;
  adminId: string;
  action: string;
  targetType: string;
  targetId: string;
  details: any;
  ipAddress: string;
  timestamp: { seconds: number; nanoseconds: number };
}

export interface LoreEntry {
  id: string;
  title: string;
  theme: string;
  region: string;
  faction: string;
  content: string;
  npcBackground: string;
  conflictHook: string;
  generatedBy: string;
  createdAt: any;
}

export type ItemRarity = 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY' | 'AXIOMATIC';
export type ItemType = 'WEAPON' | 'OFFHAND' | 'HELM' | 'CHEST' | 'LEGS' | 'RELIC';

export interface ItemStats {
  atk?: number;
  def?: number;
  hp?: number;
  mana?: number;
}

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  subtype?: string;
  rarity: ItemRarity;
  stats?: ItemStats;
  value?: number;
  description?: string;
  setName?: string;
  emissiveGlow?: boolean;
  affixes?: Array<{
    name: string;
    type: 'prefix' | 'suffix';
    statBonuses: ItemStats;
  }>;
}
