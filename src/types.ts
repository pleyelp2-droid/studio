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

export interface StoreProduct {
  id: string;
  name: string;
  description: string;
  priceEUR: number;
  energyAmount: number;
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