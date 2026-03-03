import { create } from 'zustand';
import { 
  Agent, 
  POI, 
  Chunk, 
  Monster, 
  ChatChannel, 
  StoreProduct, 
  AppearanceConfig,
  StatName,
  ThinkingMatrix,
  AgentState
} from './types';

export type LogType = 'SYSTEM' | 'ERROR' | 'COMBAT' | 'ECONOMY';
export type ControlMode = 'KEYBOARD' | 'JOYSTICK' | 'PUSH_TO_WALK';

interface LogEntry {
  id: string;
  message: string;
  type: LogType;
  timestamp: string;
}

interface ChatMessage {
  id: string;
  content: string;
  channel: ChatChannel;
  senderId: string;
  senderName: string;
  timestamp: number;
}

interface WindowState {
  isOpen: boolean;
  isMinimized: boolean;
}

interface GameState {
  serverStats: { uptime: number; tickRate: number; memoryUsage: number };
  agents: Agent[];
  monsters: Monster[];
  loadedChunks: Chunk[];
  logs: LogEntry[];
  chatMessages: ChatMessage[];
  selectedAgentId: string | null;
  selectedPoiId: string | null;
  
  // User & Auth State
  user: { id: string; name: string; email: string } | null;
  isAxiomAuthenticated: boolean;
  userApiKey: string | null;
  showAdmin: boolean;
  showDeveloperTools: boolean;
  globalApiCooldown: number;

  // Window Management
  windowStates: Record<string, WindowState>;

  // Emergence & AI
  emergenceSettings: {
    isEmergenceEnabled: boolean;
    useHeuristicsOnly: boolean;
    axiomaticWorldGeneration: boolean;
    physicsBasedActivation: boolean;
    showAxiomaticOverlay: boolean;
  };
  importedAgents: Array<{ agentId: string; sourceUrl: string; skinHash: string }>;
  
  // Simulation Debugger
  showDebugger: boolean;
  isScanning: boolean;
  diagnosticReport: any | null;

  // Economy & Shop
  matrixEnergy: number;
  auctionHouse: any[];
  graphicPacks: string[];

  // Control State
  isMobile: boolean;
  setIsMobile: (is: boolean) => void;
  device: {
    isMobile: boolean;
    isTablet: boolean;
    isAndroid: boolean;
    orientation: 'portrait' | 'landscape';
    width: number;
    height: number;
  };
  controlMode: ControlMode;
  virtualInput: { x: number; z: number };
  targetPosition: { x: number; y: number; z: number } | null;
  controlledAgentId: string | null;

  // Actions
  setUser: (user: { id: string; name: string; email: string } | null) => void;
  setAxiomAuthenticated: (is: boolean) => void;
  setUserApiKey: (key: string | null) => void;
  toggleAdmin: (show: boolean) => void;
  toggleDeveloperTools: (show: boolean) => void;
  toggleDebugger: (show: boolean) => void;
  
  toggleWindow: (id: string, isOpen: boolean) => void;
  minimizeWindow: (id: string) => void;
  
  setEmergenceSetting: (key: string, val: any) => void;
  addChatMessage: (content: string, channel: ChatChannel, senderId: string, senderName: string) => void;
  clearChat: () => void;

  setDevice: (device: Partial<GameState['device']>) => void;
  setControlMode: (mode: ControlMode) => void;
  setVirtualInput: (input: { x: number; z: number }) => void;
  setTargetPosition: (pos: { x: number; y: number; z: number } | null) => void;
  setIsMobile: (is: boolean) => void;
  takeControl: (agentId: string) => void;
  releaseControl: () => void;

  selectAgent: (id: string | null) => void;
  selectPoi: (id: string | null) => void;
  updateUptime: (time: number) => void;
  setAgents: (agents: Agent[]) => void;
  setChunks: (chunks: Chunk[]) => void;
  stabilizeChunk: (id: string) => void;
  addLog: (message: string, type: LogType) => void;
  clearLogs: () => void;

  importAgent: (source: string, type: 'URL' | 'JSON') => Promise<void>;
  removeImportedAgent: (id: string) => void;
  createPlayerAgent: (name: string, appearance: AppearanceConfig) => void;
  
  equipItem: (agentId: string, item: any, index: number) => void;
  unequipItem: (agentId: string, slot: string) => void;
  moveInventoryItem: (agentId: string, from: number, to: number) => void;
  allocateStatPoint: (agentId: string, stat: StatName) => void;
  reflectOnMemory: (agentId: string) => Promise<void>;
  
  runDiagnostics: (errorLog: string) => Promise<void>;
  purchaseEnergy: (product: StoreProduct) => void;
  bidOnAuction: (auctionId: string, agentId: string, amount: number) => void;
  uploadGraphicPack: (name: string) => void;
}

export const useStore = create<GameState>((set, get) => ({
  serverStats: { uptime: 0, tickRate: 144, memoryUsage: 256 },
  agents: [],
  monsters: [],
  loadedChunks: [],
  logs: [],
  chatMessages: [],
  selectedAgentId: null,
  selectedPoiId: null,
  
  user: null,
  isAxiomAuthenticated: false,
  userApiKey: null,
  showAdmin: false,
  showDeveloperTools: false,
  globalApiCooldown: 0,

  windowStates: {
    CHARACTER: { isOpen: false, isMinimized: false },
    ADMIN: { isOpen: false, isMinimized: false },
    AGENT_MANAGER: { isOpen: false, isMinimized: false },
    AUCTION: { isOpen: false, isMinimized: false },
    CHAT: { isOpen: true, isMinimized: false },
    ENERGY_SHOP: { isOpen: false, isMinimized: false },
    QUESTS: { isOpen: false, isMinimized: false },
  },

  emergenceSettings: {
    isEmergenceEnabled: true,
    useHeuristicsOnly: false,
    axiomaticWorldGeneration: true,
    physicsBasedActivation: true,
    showAxiomaticOverlay: false,
  },
  importedAgents: [],
  
  showDebugger: false,
  isScanning: false,
  diagnosticReport: null,

  matrixEnergy: 100,
  auctionHouse: [],
  graphicPacks: ['CORE_V1', 'NEON_DISTRICT'],

  isMobile: false,
  device: {
    isMobile: false,
    isTablet: false,
    isAndroid: false,
    orientation: 'landscape',
    width: 1920,
    height: 1080,
  },
  controlMode: 'KEYBOARD',
  virtualInput: { x: 0, z: 0 },
  targetPosition: null,
  controlledAgentId: null,

  setUser: (user) => set({ user }),
  setAxiomAuthenticated: (isAxiomAuthenticated) => set({ isAxiomAuthenticated }),
  setUserApiKey: (userApiKey) => set({ userApiKey }),
  toggleAdmin: (showAdmin) => set({ showAdmin }),
  toggleDeveloperTools: (showDeveloperTools) => set({ showDeveloperTools }),
  toggleDebugger: (showDebugger) => set({ showDebugger }),

  toggleWindow: (id, isOpen) => set((state) => ({
    windowStates: {
      ...state.windowStates,
      [id]: { ...state.windowStates[id], isOpen }
    }
  })),
  minimizeWindow: (id) => set((state) => ({
    windowStates: {
      ...state.windowStates,
      [id]: { ...state.windowStates[id], isMinimized: !state.windowStates[id]?.isMinimized }
    }
  })),

  setEmergenceSetting: (key, val) => set((state) => ({
    emergenceSettings: { ...state.emergenceSettings, [key]: val }
  })),

  addChatMessage: (content, channel, senderId, senderName) => set((state) => ({
    chatMessages: [
      {
        id: Math.random().toString(36).substring(7),
        content,
        channel,
        senderId,
        senderName,
        timestamp: Date.now(),
      },
      ...state.chatMessages
    ].slice(0, 100)
  })),
  clearChat: () => set({ chatMessages: [] }),

  setDevice: (device) => set((state) => ({
    device: { ...state.device, ...device }
  })),
  setControlMode: (controlMode) => set({ controlMode }),
  setVirtualInput: (virtualInput) => set({ virtualInput }),
  setTargetPosition: (targetPosition) => set({ targetPosition }),
  setIsMobile: (isMobile) => set({ isMobile }),
  takeControl: (agentId) => set({ controlledAgentId: agentId, controlMode: get().device.isMobile ? 'JOYSTICK' : 'KEYBOARD' }),
  releaseControl: () => set({ controlledAgentId: null }),

  selectAgent: (id) => set({ selectedAgentId: id }),
  selectPoi: (id) => set({ selectedPoiId: id }),
  updateUptime: (time) => set((state) => ({ serverStats: { ...state.serverStats, uptime: time } })),
  setAgents: (agents) => set({ agents }),
  setChunks: (chunks) => set({ loadedChunks: chunks }),
  stabilizeChunk: (id) => set((state) => ({
    loadedChunks: state.loadedChunks.map(c => c.id === id ? { ...c, entropy: 0, corruptionLevel: 0 } : c)
  })),
  addLog: (message, type) => set((state) => ({
    logs: [
      {
        id: Math.random().toString(36).substring(7),
        message,
        type,
        timestamp: new Date().toISOString(),
      },
      ...state.logs
    ].slice(0, 50)
  })),
  clearLogs: () => set({ logs: [] }),

  importAgent: async (source, type) => {
    const newId = `imported-${Date.now()}`;
    const newAgent: Agent = {
      id: newId,
      name: "Neural Ghost",
      displayName: "Neural Ghost",
      npcClass: "IMPRINT",
      level: 1,
      hp: 100, maxHp: 100, energy: 100, maxEnergy: 100, integrity: 1, exp: 0, xp: 0,
      insightPoints: 0, awakeningProgress: 0, consciousnessLevel: 0,
      stats: { str: 10, agi: 10, int: 10, vit: 10, hp: 100, maxHp: 100 },
      str: 10, agi: 10, int: 10, vit: 10,
      position: { x: 0, y: 0, z: 0 },
      visionRange: 50,
      state: AgentState.IDLE,
      inventory: Array(10).fill(null),
      bank: Array(50).fill(null),
      equipment: { head: null, chest: null, legs: null, mainHand: null, offHand: null },
      skills: {},
      dnaHistory: [],
      memoryCache: [],
      awakened: false,
      lastScanTime: Date.now(),
      thinkingMatrix: {
        personality: "Analytical",
        currentLongTermGoal: "Self-stabilization",
        alignment: 0.5,
        languagePreference: "EN",
        sociability: 0.5,
        aggression: 0.1,
        curiosity: 0.8,
        frugality: 0.5
      }
    };
    set(state => ({
      agents: [...state.agents, newAgent],
      importedAgents: [...state.importedAgents, { agentId: newId, sourceUrl: source, skinHash: Math.random().toString(16) }]
    }));
  },
  removeImportedAgent: (id) => set(state => ({
    agents: state.agents.filter(a => a.id !== id),
    importedAgents: state.importedAgents.filter(ia => ia.agentId !== id)
  })),
  createPlayerAgent: (name, appearance) => {
    const newId = `player-${Date.now()}`;
    const newAgent: Agent = {
      id: newId,
      name,
      displayName: name,
      npcClass: "PLAYER",
      level: 1,
      hp: 100, maxHp: 100, energy: 100, maxEnergy: 100, integrity: 1, exp: 0, xp: 0,
      insightPoints: 0, awakeningProgress: 0, consciousnessLevel: 0,
      stats: { str: 10, agi: 10, int: 10, vit: 10, hp: 100, maxHp: 100 },
      str: 10, agi: 10, int: 10, vit: 10,
      position: { x: 0, y: 0, z: 0 },
      visionRange: 50,
      state: AgentState.IDLE,
      inventory: Array(10).fill(null),
      bank: Array(50).fill(null),
      equipment: { head: null, chest: null, legs: null, mainHand: null, offHand: null },
      skills: {},
      dnaHistory: [],
      memoryCache: [],
      awakened: false,
      lastScanTime: Date.now(),
      appearance,
      thinkingMatrix: {
        personality: "Player Core",
        currentLongTermGoal: "World Domination",
        alignment: 0.5, languagePreference: "EN", sociability: 1, aggression: 0.5, curiosity: 1, frugality: 0
      }
    };
    set(state => ({ agents: [...state.agents, newAgent] }));
  },

  equipItem: (agentId, item, index) => {},
  unequipItem: (agentId, slot) => {},
  moveInventoryItem: (agentId, from, to) => {},
  allocateStatPoint: (agentId, stat) => {},
  reflectOnMemory: async (agentId) => {},
  
  runDiagnostics: async (errorLog) => {
    set({ isScanning: true });
    await new Promise(r => setTimeout(r, 2000));
    set({ 
      isScanning: false, 
      diagnosticReport: {
        status: 'HEALTHY',
        summary: 'Axiom core stabilization complete. No critical anomalies detected.',
        issues: [],
        recoverySteps: ['Maintain neural link', 'Sync periodic cycles']
      }
    });
  },
  purchaseEnergy: (product) => set(state => ({ matrixEnergy: state.matrixEnergy + product.energyAmount })),
  bidOnAuction: (auctionId, agentId, amount) => {},
  uploadGraphicPack: (name) => set(state => ({ graphicPacks: [...state.graphicPacks, name] })),
}));

export const skinHashToColors = (hash: string) => {
  return {
    primary: '#7b4fd4',
    secondary: '#1fb8b8',
    accent: '#c9a227',
    pattern: 0
  };
};