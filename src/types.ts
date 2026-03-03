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

export type Language = 'EN' | 'DE' | 'RU' | 'TR' | 'FR' | 'ES' | 'ZH' | 'GR' | 'AR';

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
  hairStyle: 'bald' | 'short' | 'long' | 'mohawk' | 'ponytail';
  bodyScale: number;
  baseModel: 'humanoid' | 'slim' | 'bulky';
}

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

export interface Agent {
  id: string;
  name: string; 
  displayName: string;
  npcClass: string;
  race?: string;
  level: number;
  hp: number;
  maxHp: number;
  energy: number;
  maxEnergy: number;
  integrity: number;
  xp: number; 
  exp: number;
  insightPoints: number;
  awakeningProgress: number;
  consciousnessLevel: number;
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
  position: { x: number; y: number; z: number };
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

export interface Chunk {
  id: string;
  x: number;
  z: number;
  seed: number;
  biome: 'CITY' | 'FOREST' | 'MOUNTAIN' | 'DESERT' | 'TUNDRA';
  cellType: 'SANCTUARY' | 'WILDERNESS' | 'DUNGEON';
  entropy: number;
  stabilityIndex: number;
  corruptionLevel: number;
  resourceData: Record<string, any>;
  logicField: { vx: number; vz: number; magnitude: number }[][];
  axiomaticData: number[][];
  lastUpdate: any;
  logicString?: string;
}

export interface POI {
  id: string;
  type: 'SHRINE' | 'FORGE' | 'MARKET_STALL' | 'BANK_VAULT' | 'GATE' | 'WALL' | 'HOUSE' | 'TREE' | 'DUNGEON' | 'RUIN' | 'NEST';
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
  type: 'IRON_ORE' | 'SILVER_ORE' | 'GOLD_ORE' | 'WOOD' | 'STONE' | 'SUNLEAF_HERB';
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

export const MONSTER_TEMPLATES: Record<string, any> = {
  GOBLIN: { hp: 50, atk: 5, def: 2, xp: 100, scale: 0.8 },
  ORC: { hp: 150, atk: 15, def: 10, xp: 300, scale: 1.2 },
  DRAGON: { hp: 1000, atk: 50, def: 40, xp: 2000, scale: 5.0 },
};

export interface QuestLine {
  id: string;
  title: string;
  description: string;
  requiredLevel: number;
  xpReward: number;
  goldReward: number;
  status: 'active' | 'completed' | 'draft';
  npc_id: string;
  quest_steps: { type: string; description: string }[];
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
