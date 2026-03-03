
/**
 * @fileOverview Core type definitions for the Ouroboros MMO engine.
 * Unified with SQL schema parameters and Firestore blueprints.
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

export interface FacialParameters {
  jawWidth: number;
  cheekboneHeight: number;
  noseLength: number;
  eyeSpacing: number;
  browDepth: number;
  skinVariation: number;
  eyeColor: string;
  hasBeard: boolean;
  beardLength: number;
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
  facialParameters?: FacialParameters;
  lastUpdate?: any;
}

export interface Monster {
  id: string;
  type: 'SLIME' | 'GOBLIN' | 'VOID_STALKER';
  level: number;
  hp: number;
  maxHp: number;
  position: [number, number, number];
  color: string;
}

export interface Faction {
  id: string;
  name: string;
  entityType: 'GUILD' | 'NATION' | 'CULT';
  leaderUid: string;
  members: string[];
  influence: number;
  territory: string[];
  lastUpdate: any;
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

export interface EconomicSummary {
  id: string;
  tickNumber: number;
  totalSupply: Record<string, number>;
  totalDemand: Record<string, number>;
  gdp: number;
  inflationRate: number;
  tradeVolume: number;
  createdAt: any;
}
