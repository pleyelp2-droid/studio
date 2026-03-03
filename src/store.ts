import { create } from 'zustand';
import { Agent, POI, Chunk, Monster } from './types';

export type LogType = 'SYSTEM' | 'ERROR' | 'COMBAT' | 'ECONOMY';
export type ControlMode = 'KEYBOARD' | 'JOYSTICK' | 'PUSH_TO_WALK';

interface LogEntry {
  id: string;
  message: string;
  type: LogType;
  timestamp: string;
}

interface GameState {
  serverStats: { uptime: number };
  agents: Agent[];
  monsters: Monster[];
  loadedChunks: Chunk[];
  logs: LogEntry[];
  selectedPoiId: string | null;
  
  // User & Auth State
  user: { id: string; name: string; email: string } | null;
  isAxiomAuthenticated: boolean;
  userApiKey: string | null;
  showAdmin: boolean;
  showDeveloperTools: boolean;

  // Control State
  isMobile: boolean;
  controlMode: ControlMode;
  virtualInput: { x: number; z: number };
  targetPosition: { x: number; y: number; z: number } | null;

  // Actions
  setUser: (user: { id: string; name: string; email: string } | null) => void;
  setAxiomAuthenticated: (is: boolean) => void;
  setUserApiKey: (key: string | null) => void;
  toggleAdmin: (show: boolean) => void;
  toggleDeveloperTools: (show: boolean) => void;
  setIsMobile: (is: boolean) => void;
  setControlMode: (mode: ControlMode) => void;
  setVirtualInput: (input: { x: number; z: number }) => void;
  setTargetPosition: (pos: { x: number; y: number; z: number } | null) => void;

  selectPoi: (id: string | null) => void;
  updateUptime: (time: number) => void;
  setAgents: (agents: Agent[]) => void;
  setChunks: (chunks: Chunk[]) => void;
  addLog: (message: string, type: LogType) => void;
  clearLogs: () => void;
}

export const useStore = create<GameState>((set) => ({
  serverStats: { uptime: 0 },
  agents: [],
  monsters: [],
  loadedChunks: [],
  logs: [],
  selectedPoiId: null,
  
  user: null,
  isAxiomAuthenticated: false,
  userApiKey: null,
  showAdmin: false,
  showDeveloperTools: false,

  isMobile: false,
  controlMode: 'KEYBOARD',
  virtualInput: { x: 0, z: 0 },
  targetPosition: null,

  setUser: (user) => set({ user }),
  setAxiomAuthenticated: (isAxiomAuthenticated) => set({ isAxiomAuthenticated }),
  setUserApiKey: (userApiKey) => set({ userApiKey }),
  toggleAdmin: (showAdmin) => set({ showAdmin }),
  toggleDeveloperTools: (showDeveloperTools) => set({ showDeveloperTools }),
  setIsMobile: (isMobile) => set({ isMobile, controlMode: isMobile ? 'JOYSTICK' : 'KEYBOARD' }),
  setControlMode: (controlMode) => set({ controlMode }),
  setVirtualInput: (virtualInput) => set({ virtualInput }),
  setTargetPosition: (targetPosition) => set({ targetPosition }),

  selectPoi: (id) => set({ selectedPoiId: id }),
  updateUptime: (time) => set((state) => ({ serverStats: { ...state.serverStats, uptime: time } })),
  setAgents: (agents) => set({ agents }),
  setChunks: (chunks) => set({ loadedChunks: chunks }),
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
}));