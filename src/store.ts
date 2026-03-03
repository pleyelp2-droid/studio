import { create } from 'zustand';
import { Agent, POI, Chunk } from './types';

interface GameState {
  serverStats: { uptime: number };
  agents: Agent[];
  loadedChunks: Chunk[];
  selectedPoiId: string | null;
  selectPoi: (id: string | null) => void;
}

export const useStore = create<GameState>((set) => ({
  serverStats: { uptime: 0 },
  agents: [],
  loadedChunks: [],
  selectedPoiId: null,
  selectPoi: (id) => set({ selectedPoiId: id }),
}));

export const skinHashToColors = (hash: string) => {
  return { skin: '#ffffff', eyes: '#000000', hair: '#333333' };
};
