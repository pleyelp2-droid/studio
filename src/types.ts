
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

export type POIType = 'SHRINE' | 'RUIN' | 'NEST' | 'DUNGEON' | 'MARKET_STALL' | 'TREE' | 'BUILDING' | 'MINE' | 'FOREST' | 'BANK_VAULT' | 'FORGE' | 'WALL' | 'GATE' | 'HOUSE';

export interface POI {
  id: string;
  type: POIType;
  position: [number, number, number];
  rotationY?: number;
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
  name: string; // Used in UI code provided
  displayName: string;
  npcClass: string;
  race?: string;
  level: number;
  hp: number;
  maxHp: number;
  energy: number;
  maxEnergy: number;
  integrity: number; // 0 to 1
  xp: number; // Used in UI code provided
  exp: number; // For compatibility
  insightPoints: number;
  awakeningProgress: number; // 0 to 100
  consciousnessLevel: number; // 0 to 1
  stats: {
    str: number;
    agi: number;
    int: number;
    vit: number;
    hp: number;
    maxHp: number;
    mana?: number;
    maxMana?: number;
    stamina?: number;
    dexterity?: number;
    health?: number;
  };
  str: number;
  agi: number;
  int: number;
  vit: number;
  position: { x: number; y: number; z: number } | any; // Supports both formats
  visionRange: number;
  state: AgentState;
  inventory: (Item | null)[];
  bank: (Item | null)[];
  equipment: {
    head: Item | null;
    chest: Item | null;
    legs: Item | null;
    mainHand: Item | null;
    offHand: Item | null;
  };
  skills: Record<string, { level: number; xp: number }>;
  dnaHistory: any[];
  memoryCache: string[];
  awakened: boolean;
  isAwakened?: boolean;
  faction?: string;
  loreSnippet?: string;
  thinkingMatrix: ThinkingMatrix;
  appearance?: AppearanceConfig;
  lastUpdate?: any;
  lastScanTime: number;
  lastDecision?: { decision: string; justification: string };
  apiQuotaExceeded?: boolean;
  unspentStatPoints?: number;
  dna?: { hash: string };
  economicDesires?: {
    greedLevel: number;
    riskAppetite: number;
    marketRole: string;
    frugality: number;
  };
  emergentBehaviorLog?: Array<{ action: string; reasoning: string; timestamp: number }>;
}

export type SkillCategory = 'COMBAT' | 'GATHERING' | 'CRAFTING' | 'UTILITY';

export const GAME_SKILLS: Record<string, { name: string; category: SkillCategory; icon: string }> = {
  swords: { name: 'Sword Mastery', category: 'COMBAT', icon: 'Swords' },
  archery: { name: 'Archery', category: 'COMBAT', icon: 'Crosshair' },
  magic: { name: 'Neural Magic', category: 'COMBAT', icon: 'Sparkles' },
  defense: { name: 'Defense', category: 'COMBAT', icon: 'Shield' },
  mining: { name: 'Mining', category: 'GATHERING', icon: 'Pickaxe' },
  woodcutting: { name: 'Woodcutting', category: 'GATHERING', icon: 'Axe' },
  smithing: { name: 'Blacksmithing', category: 'CRAFTING', icon: 'Hammer' },
  thinking: { name: 'Deep Thinking', category: 'UTILITY', icon: 'Brain' },
};

export type StatName = 'strength' | 'dexterity' | 'agility' | 'stamina' | 'health' | 'mana' | 'intelligence';

export const STAT_DESCRIPTIONS: Record<StatName, string> = {
  strength: 'Increases physical damage and carrying capacity.',
  dexterity: 'Improves accuracy and critical strike chance.',
  agility: 'Enhances movement speed and evasion.',
  stamina: 'Allows for longer physical exertion cycles.',
  health: 'Increases total matrix integrity (HP).',
  mana: 'Expands neural energy pool for spells.',
  intelligence: 'Boosts magic damage and deep thinking logic.',
};

export function getUnlockedActions(skill: string, level: number) {
  return []; // Mock for now
}

export interface AppearanceConfig {
  skinTone: string;
  hairStyle: 'bald' | 'short' | 'long' | 'mohawk' | 'ponytail';
  bodyScale: number;
  baseModel: 'humanoid' | 'slim' | 'bulky';
}

export const DEFAULT_APPEARANCE: AppearanceConfig = {
  skinTone: '#c68642',
  hairStyle: 'short',
  bodyScale: 1.0,
  baseModel: 'humanoid',
};

export interface ItemEffect {
  description: string;
  type: string;
  value: number;
}

export interface Item {
  id: string;
  name: string;
  type: 'WEAPON' | 'OFFHAND' | 'HELM' | 'CHEST' | 'LEGS' | 'RELIC' | 'CONSUMABLE';
  rarity: ItemRarity;
  stats: ItemStats;
  level: number;
  value: number;
  description?: string;
  setName?: string;
  emissiveGlow?: boolean;
  affixes?: Array<{ name: string; type: 'prefix' | 'suffix'; statBonuses: Record<string, number> }>;
}

export type ItemRarity = 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY' | 'AXIOMATIC' | 'SET';

export interface ItemStats {
  atk?: number;
  def?: number;
  agi?: number;
  int?: number;
  vit?: number;
  [key: string]: number | undefined;
}

export type ChatChannel = 'LOCAL' | 'GLOBAL' | 'THOUGHT' | 'SYSTEM';

export interface StoreProduct {
  id: string;
  name: string;
  description: string;
  priceEUR: number;
  energyAmount: number;
}

export const MATRIX_ENERGY_PRODUCTS: StoreProduct[] = [
  { id: 'me_100', name: '100 Matrix Energy', description: 'Standard logic fragment pack.', priceEUR: 0.99, energyAmount: 100 },
  { id: 'me_500', name: '500 Matrix Energy', description: 'Deep thinking buffer.', priceEUR: 3.99, energyAmount: 500 },
  { id: 'me_2000', name: '2000 Matrix Energy', description: 'Massive neural capacity.', priceEUR: 9.99, energyAmount: 2000 },
];

export const STRUCTURE_COSTS: Record<string, number> = {
  'HOUSE': 50,
  'FORGE': 150,
  'BANK': 200,
  'SHRINE': 500,
};

export const MAX_IMPORTED_AGENTS = 10;

export interface ComplianceMatrixEntry {
  subsystem: string;
  energy: 'PASS' | 'WARN' | 'FAIL';
  erosion: 'PASS' | 'WARN' | 'FAIL';
  punctuation: 'PASS' | 'WARN' | 'FAIL';
  recursion: 'PASS' | 'WARN' | 'FAIL' | 'N/A';
  duality: 'PASS' | 'WARN' | 'FAIL';
  status: 'COMPLIANT' | 'DEGRADED' | 'IDLE' | 'PARTIAL';
}

export interface LoreEntry {
  id: string;
  title: string;
  theme: string | null;
  region: string | null;
  faction: string | null;
  content: string;
  npcBackground: string;
  conflictHook: string;
  generatedBy: 'ai' | 'admin';
  createdAt: any;
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

export type TrustContext =
  | 'COMBAT_ATTACK'
  | 'COMBAT_KILL'
  | 'TRADE'
  | 'QUEST_TOGETHER'
  | 'GUILD_JOIN'
  | 'BETRAYAL'
  | 'HEAL'
  | 'GIFT';

export interface TrustRecord {
  id?: string;
  agentAId: string;
  agentBId: string;
  positiveInteractions: number;
  negativeInteractions: number;
  lastInteractionTick: number;
  lastInteractionType: TrustContext | 'NEUTRAL';
  trustScore: number;
  reputationWeight: number;
  updatedAt: any;
}

export interface TrustEffect {
  tradePriceModifier: number;
  combatAggressionModifier: number;
  questRewardModifier: number;
  label: string;
}
