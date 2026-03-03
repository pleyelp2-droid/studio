
'use client';
/**
 * @fileOverview Axiom Frontier - Quest Management Service
 * Handles CRUD for quest lines and NPC dialog trees in Firestore.
 */

import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
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
import { QuestLine, NPCDialog } from '@/types';

const { firestore: db } = initializeFirebase();

export const QuestManager = {
  /**
   * Creates a new quest line.
   */
  async createQuest(data: Partial<QuestLine>, adminId: string): Promise<string> {
    if (!db) throw new Error('Database disconnected');
    const questRef = collection(db, 'questLines');
    const docRef = await addDoc(questRef, {
      ...data,
      createdBy: adminId,
      createdAt: serverTimestamp(),
      status: data.status || 'draft'
    });
    return docRef.id;
  },

  /**
   * Retrieves quest lines based on status.
   */
  async getQuests(status?: string, limitCount = 50): Promise<QuestLine[]> {
    if (!db) return [];
    let q = query(collection(db, 'questLines'), orderBy('createdAt', 'desc'), limit(limitCount));
    if (status) {
      q = query(q, where('status', '==', status));
    }
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as QuestLine));
  },

  /**
   * Updates an existing quest line.
   */
  async updateQuest(id: string, data: Partial<QuestLine>): Promise<void> {
    if (!db) return;
    const docRef = doc(db, 'questLines', id);
    await updateDoc(docRef, { ...data, lastUpdate: serverTimestamp() });
  },

  /**
   * Deletes a quest line.
   */
  async deleteQuest(id: string): Promise<void> {
    if (!db) return;
    await deleteDoc(doc(db, 'questLines', id));
  },

  /**
   * Adds a dialog entry to a quest.
   */
  async createDialog(questId: string, data: Partial<NPCDialog>): Promise<string> {
    if (!db) throw new Error('Database disconnected');
    const dialogRef = collection(db, 'npcDialogs');
    const docRef = await addDoc(dialogRef, {
      ...data,
      questLineId: questId,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  },

  /**
   * Retrieves all dialogs for a specific quest.
   */
  async getDialogs(questId: string): Promise<NPCDialog[]> {
    if (!db) return [];
    const q = query(
      collection(db, 'npcDialogs'), 
      where('questLineId', '==', questId),
      orderBy('createdAt', 'asc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as NPCDialog));
  },

  /**
   * Returns quests available for a specific player level.
   */
  async getAvailableQuests(playerLevel: number): Promise<QuestLine[]> {
    if (!db) return [];
    const q = query(
      collection(db, 'questLines'),
      where('status', '==', 'active'),
      where('requiredLevel', '<=', playerLevel),
      orderBy('requiredLevel', 'asc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as QuestLine));
  }
};
