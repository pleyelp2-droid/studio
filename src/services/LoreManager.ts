
'use client';
/**
 * @fileOverview Axiom Frontier - Lore Management Service
 * Handles historical records and AI-assisted lore synthesis.
 */

import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  serverTimestamp 
} from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';
import { LoreEntry } from '@/types';

const { firestore: db } = initializeFirebase();

export const LoreManager = {
  /**
   * Generates a new lore entry using AI (Mocked for deterministic mode).
   */
  async generateLore(theme?: string, region?: string, faction?: string): Promise<Partial<LoreEntry>> {
    // In a production environment, this would call a Genkit flow.
    // Following "High Science" themes as requested.
    return {
      title: `${region || 'Axiom'} // Fragment ${Math.floor(Math.random() * 1000)}`,
      theme: theme || 'Deterministic Evolution',
      region: region || 'The Spire',
      faction: faction || 'System',
      content: "The Matrix was built upon the ruins of an old world. A whispering signal in the mountains speaks of the 'Great Recursion'. Stability is merely an illusion created by the Observers to maintain order in the data-streams.",
      npcBackground: "Petra Markgraf, the first Architect, encoded her consciousness into the core algorithms to preserve the Axioms.",
      conflictHook: "The corruption is spreading through the unmonitored sectors, threatening the integrity of the collective memory.",
      generatedBy: 'ai'
    };
  },

  /**
   * Saves a lore entry to the world chronicles.
   */
  async saveLore(data: Partial<LoreEntry>): Promise<string> {
    if (!db) throw new Error('Database disconnected');
    const docRef = await addDoc(collection(db, 'loreEntries'), {
      ...data,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  },

  /**
   * Retrieves lore entries with filters.
   */
  async getLore(theme?: string, region?: string, limitCount = 50): Promise<LoreEntry[]> {
    if (!db) return [];
    let q = query(collection(db, 'loreEntries'), orderBy('createdAt', 'desc'), limit(limitCount));
    
    if (theme) q = query(q, where('theme', '==', theme));
    if (region) q = query(q, where('region', '==', region));

    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as LoreEntry));
  },

  /**
   * Deletes a lore entry.
   */
  async deleteLore(id: string): Promise<void> {
    if (!db) return;
    await deleteDoc(doc(db, 'loreEntries', id));
  }
};
