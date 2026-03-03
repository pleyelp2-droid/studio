import { create } from 'zustand';
import { Agent, POI, Chunk, Monster } from './types';

export type LogType = 'SYSTEM' | 'ERROR' | 'COMBAT' | 'ECONOMY';

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
    ].slice(0, 50) // Keep last 50 logs
  })),
  clearLogs: () => set({ logs: [] }),
}));

export const skinHashToColors = (hash: string) => {
  const defaultColors = { skin: '#c68642', eyes: '#223366', hair: '#332211' };
  if (!hash) return defaultColors;
  
  const h = hash.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0);
  const color = `hsl(${Math.abs(h) % 360}, 30%, 50%)`;
  return { ...defaultColors, skin: color };
};
