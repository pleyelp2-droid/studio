
import { create } from 'zustand';
import { Agent, Chunk, Language } from './types';

interface AppState {
  agents: Agent[];
  loadedChunks: Chunk[];
  user: { id: string; name: string; email: string } | null;
  isAxiomAuthenticated: boolean;
  isMatrixOverseerOpen: boolean;
  userApiKey: string | null;
  language: Language;
  githubConfig: {
    token: string;
    owner: string;
    repo: string;
    branch: string;
  };
  device: {
    isMobile: boolean;
    width: number;
    height: number;
    orientation: 'portrait' | 'landscape';
  };
  controlMode: 'JOYSTICK' | 'PUSH_TO_WALK' | 'KEYBOARD';
  virtualInput: { x: number; z: number };
  targetPosition: { x: number; y: number; z: number } | null;
  chatMessages: any[];
  
  setUser: (user: { id: string; name: string; email: string } | null) => void;
  setAxiomAuthenticated: (isAuth: boolean) => void;
  setMatrixOverseerOpen: (isOpen: boolean) => void;
  setUserApiKey: (key: string | null) => void;
  setLanguage: (lang: Language) => void;
  setGithubConfig: (config: Partial<AppState['githubConfig']>) => void;
  setIsMobile: (isMobile: boolean) => void;
  setControlMode: (mode: 'JOYSTICK' | 'PUSH_TO_WALK' | 'KEYBOARD') => void;
  setVirtualInput: (input: { x: number; z: number }) => void;
  setTargetPosition: (pos: { x: number; y: number; z: number } | null) => void;
  setAgents: (agents: Agent[]) => void;
  setChunks: (chunks: Chunk[]) => void;
  addLog: (message: string, logType: string) => void;
  clearChat: () => void;
}

export const useStore = create<AppState>((set) => ({
  agents: [],
  loadedChunks: [],
  user: null,
  isAxiomAuthenticated: false,
  isMatrixOverseerOpen: false,
  userApiKey: null,
  language: 'EN' as Language,
  githubConfig: {
    token: "",
    owner: "pleyelp2",
    repo: "areclient",
    branch: "main"
  },
  device: {
    isMobile: false,
    width: typeof window !== 'undefined' ? window.innerWidth : 1920,
    height: typeof window !== 'undefined' ? window.innerHeight : 1080,
    orientation: 'landscape'
  },
  controlMode: 'KEYBOARD' as const,
  virtualInput: { x: 0, z: 0 },
  targetPosition: null,
  chatMessages: [],

  setUser: (user) => set({ user }),
  setAxiomAuthenticated: (isAuth) => set({ isAxiomAuthenticated: isAuth }),
  setMatrixOverseerOpen: (isOpen) => set({ isMatrixOverseerOpen: isOpen }),
  setUserApiKey: (key) => set({ userApiKey: key }),
  setLanguage: (lang) => set({ language: lang }),
  setGithubConfig: (config) => set((state) => ({ githubConfig: { ...state.githubConfig, ...config } })),
  setIsMobile: (isMobile) => set((state) => ({ device: { ...state.device, isMobile } })),
  setControlMode: (mode) => set({ controlMode: mode }),
  setVirtualInput: (input) => set({ virtualInput: input }),
  setTargetPosition: (pos) => set({ targetPosition: pos }),
  setAgents: (agents) => set({ agents }),
  setChunks: (chunks) => set({ loadedChunks: chunks }),
  addLog: (message, logType) => set((state) => ({ 
    chatMessages: [{ id: Math.random().toString(), content: message, type: logType, timestamp: Date.now() }, ...state.chatMessages].slice(0, 100) 
  })),
  clearChat: () => set({ chatMessages: [] }),
}));
