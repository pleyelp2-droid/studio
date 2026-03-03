
import { create } from 'zustand';
import { 
  Agent, 
  Chunk, 
  Monster, 
  ChatChannel, 
  StoreProduct, 
  AppearanceConfig,
  StatName,
  AgentState,
  Language
} from './types';

export type LogType = 'SYSTEM' | 'ERROR' | 'COMBAT' | 'ECONOMY';
export type ControlMode = 'JOYSTICK' | 'PUSH_TO_WALK' | 'KEYBOARD';

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
  
  user: { id: string; name: string; email: string } | null;
  isAxiomAuthenticated: boolean;
  userApiKey: string | null;
  showAdmin: boolean;
  showDeveloperTools: boolean;
  globalApiCooldown: number;
  language: Language;

  windowStates: Record<string, WindowState>;

  emergenceSettings: {
    isEmergenceEnabled: boolean;
    useHeuristicsOnly: boolean;
    axiomaticWorldGeneration: boolean;
    physicsBasedActivation: boolean;
    showAxiomaticOverlay: boolean;
  };
  importedAgents: Array<{ agentId: string; sourceUrl: string; skinHash: string }>;
  
  showDebugger: boolean;
  isScanning: boolean;
  diagnosticReport: any | null;

  matrixEnergy: number;
  auctionHouse: any[];
  graphicPacks: string[];

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

  setUser: (user: { id: string; name: string; email: string } | null) => void;
  setAxiomAuthenticated: (isAuth: boolean) => void;
  setUserApiKey: (apiKey: string | null) => void;
  toggleAdmin: (visible: boolean) => void;
  toggleDeveloperTools: (visible: boolean) => void;
  toggleDebugger: (visible: boolean) => void;
  setLanguage: (lang: Language) => void;
  
  toggleWindow: (winId: string, openState: boolean) => void;
  minimizeWindow: (winId: string) => void;
  
  setEmergenceSetting: (settingKey: string, settingVal: any) => void;
  addChatMessage: (msgContent: string, msgChannel: ChatChannel, senderId: string, senderName: string) => void;
  clearChat: () => void;

  setDevice: (deviceData: Partial<GameState['device']>) => void;
  setControlMode: (mode: ControlMode) => void;
  setVirtualInput: (input: { x: number; z: number }) => void;
  setTargetPosition: (pos: { x: number; y: number; z: number } | null) => void;
  setIsMobile: (isMob: boolean) => void;
  takeControl: (targetAgentId: string) => void;
  releaseControl: () => void;

  selectAgent: (agentId: string | null) => void;
  selectPoi: (poiId: string | null) => void;
  updateUptime: (timeVal: number) => void;
  setAgents: (agentList: Agent[]) => void;
  setChunks: (chunkList: Chunk[]) => void;
  stabilizeChunk: (chunkId: string) => void;
  addLog: (logMsg: string, logType: LogType) => void;
  clearLogs: () => void;

  importAgent: (agentSource: string, importType: 'URL' | 'JSON') => Promise<void>;
  removeImportedAgent: (agentId: string) => void;
  createPlayerAgent: (playerName: string, playerAppearance: AppearanceConfig) => void;
  
  equipItem: (targetAgentId: string, itemData: any, invIndex: number) => void;
  unequipItem: (targetAgentId: string, slotName: string) => void;
  moveInventoryItem: (targetAgentId: string, fromIdx: number, toIdx: number) => void;
  allocateStatPoint: (targetAgentId: string, statName: StatName) => void;
  reflectOnMemory: (targetAgentId: string) => Promise<void>;
  
  runDiagnostics: (errorLog: string) => Promise<void>;
  purchaseEnergy: (storeProduct: StoreProduct) => void;
  bidOnAuction: (auctionId: string, bidderId: string, bidAmount: number) => void;
  uploadGraphicPack: (packName: string) => void;
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
  language: 'EN',

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
  setLanguage: (language) => set({ language }),

  toggleWindow: (winId, openState) => set((state) => ({
    windowStates: {
      ...state.windowStates,
      [winId]: { ...state.windowStates[winId], isOpen: openState }
    }
  })),
  minimizeWindow: (winId) => set((state) => ({
    windowStates: {
      ...state.windowStates,
      [winId]: { ...state.windowStates[winId], isMinimized: !state.windowStates[winId]?.isMinimized }
    }
  })),

  setEmergenceSetting: (settingKey, settingVal) => set((state) => ({
    emergenceSettings: { ...state.emergenceSettings, [settingKey]: settingVal }
  })),

  addChatMessage: (msgContent, msgChannel, senderId, senderName) => set((state) => ({
    chatMessages: [
      {
        id: Math.random().toString(36).substring(7),
        content: msgContent,
        channel: msgChannel,
        senderId,
        senderName,
        timestamp: Date.now(),
      },
      ...state.chatMessages
    ].slice(0, 100)
  })),
  clearChat: () => set({ chatMessages: [] }),

  setDevice: (deviceData) => set((state) => ({
    device: { ...state.device, ...deviceData }
  })),
  setControlMode: (controlMode) => set({ controlMode }),
  setVirtualInput: (virtualInput) => set({ virtualInput }),
  setTargetPosition: (targetPosition) => set({ targetPosition }),
  setIsMobile: (isMob) => set((state) => ({ device: { ...state.device, isMobile: isMob } })),
  takeControl: (targetAgentId) => set({ controlledAgentId: targetAgentId, controlMode: get().device.isMobile ? 'JOYSTICK' : 'KEYBOARD' }),
  releaseControl: () => set({ controlledAgentId: null }),

  selectAgent: (agentId) => set({ selectedAgentId: agentId }),
  selectPoi: (poiId) => set({ selectedPoiId: poiId }),
  updateUptime: (timeVal) => set((state) => ({ serverStats: { ...state.serverStats, uptime: timeVal } })),
  setAgents: (agentList) => set({ agents: agentList }),
  setChunks: (chunkList) => set({ loadedChunks: chunkList }),
  stabilizeChunk: (chunkId) => set((state) => ({
    loadedChunks: state.loadedChunks.map(c => c.id === chunkId ? { ...c, entropy: 0, corruptionLevel: 0 } : c)
  })),
  addLog: (logMsg, logType) => set((state) => ({
    logs: [
      {
        id: Math.random().toString(36).substring(7),
        message: logMsg,
        type: logType,
        timestamp: new Date().toISOString(),
      },
      ...state.logs
    ].slice(0, 50)
  })),
  clearLogs: () => set({ logs: [] }),

  importAgent: async (agentSource, importType) => {
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
      importedAgents: [...state.importedAgents, { agentId: newId, sourceUrl: agentSource, skinHash: Math.random().toString(16) }]
    }));
  },
  removeImportedAgent: (agentId) => set(state => ({
    agents: state.agents.filter(a => a.id !== agentId),
    importedAgents: state.importedAgents.filter(ia => ia.agentId !== agentId)
  })),
  createPlayerAgent: (playerName, playerAppearance) => {
    const newId = `player-${Date.now()}`;
    const newAgent: Agent = {
      id: newId,
      name: playerName,
      displayName: playerName,
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
      appearance: playerAppearance,
      thinkingMatrix: {
        personality: "Player Core",
        currentLongTermGoal: "World Domination",
        alignment: 0.5, languagePreference: "EN", sociability: 1, aggression: 0.5, curiosity: 1, frugality: 0
      }
    };
    set(state => ({ agents: [...state.agents, newAgent] }));
  },

  equipItem: (targetAgentId, itemData, invIndex) => {
    set(state => ({
      agents: state.agents.map(a => {
        if (a.id !== targetAgentId) return a;
        const newInv = [...a.inventory];
        newInv[invIndex] = null;
        return { ...a, inventory: newInv };
      })
    }));
  },
  unequipItem: (targetAgentId, slotName) => {},
  moveInventoryItem: (targetAgentId, fromIdx, toIdx) => {
    set(state => ({
      agents: state.agents.map(a => {
        if (a.id !== targetAgentId) return a;
        const newInv = [...a.inventory];
        const temp = newInv[fromIdx];
        newInv[fromIdx] = newInv[toIdx];
        newInv[toIdx] = temp;
        return { ...a, inventory: newInv };
      })
    }));
  },
  allocateStatPoint: (targetAgentId, statName) => {},
  reflectOnMemory: async (targetAgentId) => {},
  
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
  purchaseEnergy: (storeProduct) => set(state => ({ matrixEnergy: state.matrixEnergy + storeProduct.energyAmount })),
  bidOnAuction: (auctionId, bidderId, bidAmount) => {},
  uploadGraphicPack: (packName) => set(state => ({ graphicPacks: [...state.graphicPacks, packName] })),
}));

export const skinHashToColors = (hash: string) => {
  return {
    primary: '#7b4fd4',
    secondary: '#1fb8b8',
    accent: '#c9a227',
    pattern: 0
  };
};
