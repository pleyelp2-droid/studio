'use client';
/**
 * @fileOverview Ouroboros Procedural Quest Engine
 * Generates quests based on Civilization needs and world state.
 * Adapted from High-Performance blueprint.
 */

import { initializeFirebase } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { generateLoot } from './LootManager';
import { useStore } from '@/store';

const { firestore: db } = initializeFirebase();

export type QuestType = 'gather' | 'kill' | 'deliver' | 'explore' | 'diplomatic' | 'dungeon';

export interface ProceduralQuest {
  id: string;
  type: QuestType;
  title: string;
  description: string;
  lore: string;
  difficulty: number;
  rewards: {
    gold: number;
    xp: number;
    items?: any[];
  };
  objectives: Array<{
    type: string;
    target: string;
    required: number;
    current: number;
  }>;
}

const TEMPLATES: Record<QuestType, any> = {
  gather: {
    titles: ['Resource Requisition', 'Material Gathering', 'Supply Run'],
    resources: ['iron', 'gold', 'crystal', 'timber'],
    baseGold: 50,
    baseXp: 100
  },
  kill: {
    titles: ['Monster Extermination', 'Clear the Threat', 'Elimination Cycle'],
    enemies: ['corrupted_sentinel', 'data_wraith', 'void_spawn'],
    baseGold: 80,
    baseXp: 150
  },
  explore: {
    titles: ['Chart the Unknown', 'Survey the Frontier', 'Discovery Mission'],
    baseGold: 60,
    baseXp: 120
  },
  deliver: {
    titles: ['Urgent Delivery', 'Trade Caravan'],
    baseGold: 40,
    baseXp: 80
  },
  diplomatic: {
    titles: ['Peace Negotiations', 'Alliance Proposal'],
    baseGold: 100,
    baseXp: 200
  },
  dungeon: {
    titles: ['Dungeon Delve', 'Reclaim the Depths', 'Vault Breach'],
    baseGold: 200,
    baseXp: 500
  }
};

export const ProceduralQuestEngine = {
  /**
   * Generates a quest based on civilization state and difficulty.
   */
  generateQuest(type: QuestType, difficulty: number, civName: string = 'Axiom Core'): ProceduralQuest {
    const template = TEMPLATES[type] || TEMPLATES.explore;
    const title = template.titles[Math.floor(Math.random() * template.titles.length)];
    
    const gold = Math.floor(template.baseGold * difficulty * 0.5);
    const xp = Math.floor(template.baseXp * difficulty * 0.5);
    
    const objectives = [];
    if (type === 'gather') {
      const res = template.resources[Math.floor(Math.random() * template.resources.length)];
      objectives.push({ type: 'collect', target: res, required: 5 + difficulty * 2, current: 0 });
    } else if (type === 'kill') {
      const enemy = template.enemies[Math.floor(Math.random() * template.enemies.length)];
      objectives.push({ type: 'kill', target: enemy, required: 3 + Math.floor(difficulty / 2), current: 0 });
    } else {
      objectives.push({ type: 'reach', target: 'sector_alpha', required: 1, current: 0 });
    }

    // Logic: Harder quests get item rewards
    const items = difficulty > 5 ? generateLoot(Math.floor(difficulty * 5), Math.random() * 1000, 1) : [];

    return {
      id: `proc_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      type,
      title: `${title}: ${civName}`,
      description: `The ${civName} requires your assistance in the local sector.`,
      lore: `A recursive pulse from the core suggests this mission is critical for the next civilization phase.`,
      difficulty,
      rewards: { gold, xp, items },
      objectives
    };
  },

  /**
   * Commits a generated quest to the Firestore ledger.
   */
  async commitQuest(quest: ProceduralQuest, userId: string) {
    if (!db) return;
    return await addDoc(collection(db, 'questLines'), {
      ...quest,
      status: 'active',
      npc_id: 'axiom_orchestrator',
      createdBy: userId,
      createdAt: serverTimestamp(),
      quest_steps: quest.objectives.map(o => ({
        type: o.type,
        description: `Objective: ${o.target}`,
        target: o.target,
        count: o.required
      }))
    });
  }
};