import { create } from 'zustand';
import { Agent, Chunk, Monster, Language } from './types';

interface AppState {
  agents: Agent[];
  loadedChunks: Chunk[];
  monsters: Monster[];
  chatMessages: any[];
  user: { id: string; name: string; email: string } | null;
  isAxiomAuthenticated: boolean;
  userApiKey: string | null;
  language: Language;
  device: {
    isMobile: boolean;
  };
  controlMode: 'JOYSTICK' | 'PUSH_TO_WALK' | 'KEYBOARD';
  virtualInput: { x: number; z: number };
  targetPosition: { x: number; y: number; z: number } | null;
  
  setUser: (user: { id: string; name: string; email: string } | null) => void;
  setAxiomAuthenticated: (isAuth: boolean) => void;
  setUserApiKey: (key: string | null) => void;
  setLanguage: (lang: Language) => void;
  setIsMobile: (isMobile: boolean) => void;
  setControlMode: (mode: 'JOYSTICK' | 'PUSH_TO_WALK' | 'KEYBOARD') => void;
  setVirtualInput: (input: { x: number; z: number }) => void;
  setTargetPosition: (pos: { x: number; y: number; z: number } | null) => void;
  setAgents: (agents: Agent[]) => void;
  setChunks: (chunks: Chunk[]) => void;
  addLog: (message: string, type: string) => void;
  takeControl: (agentId: string) => void;
  releaseControl: () => void;
}

export const useStore = create<AppState>((set) => ({
  agents: [],
  loadedChunks: [],
  monsters: [],
  chatMessages: [],
  user: null,
  isAxiomAuthenticated: false,
  userApiKey: null,
  language: 'EN',
  device: {
    isMobile: false,
  },
  controlMode: 'KEYBOARD',
  virtualInput: { x: 0, z: 0 },
  targetPosition: null,

  setUser: (user) => set({ user }),
  setAxiomAuthenticated: (isAuth) => set({ isAxiomAuthenticated: isAuth }),
  setUserApiKey: (key) => set({ userApiKey: key }),
  setLanguage: (lang) => set({ language: lang }),
  setIsMobile: (isMobile) => set({ device: { isMobile } }),
  setControlMode: (mode) => set({ controlMode: mode }),
  setVirtualInput: (input) => set({ virtualInput: input }),
  setTargetPosition: (pos) => set({ targetPosition: pos }),
  setAgents: (agents) => set({ agents }),
  setChunks: (chunks) => set({ loadedChunks: chunks }),
  addLog: (message, type) => set((state) => ({ 
    chatMessages: [{ id: Math.random().toString(), content: message, type, timestamp: Date.now() }, ...state.chatMessages].slice(0, 100) 
  })),
  takeControl: (agentId) => set({ }),
  releaseControl: () => set({ }),
}));
