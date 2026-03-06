'use client';
/**
 * @fileOverview Ouroboros Procedural Quest Engine
 * Generates quests based on Civilization needs and world state.
 */

import { initializeFirebase } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { generateLoot } from './LootManager';

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
    titles: ['Resource Requisition', 'Supply the Core', 'Material Gathering'],
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
  }
};

export const ProceduralQuestEngine = {
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

    const items = difficulty > 5 ? generateLoot('MONSTER') : [];

    return {
      id: `proc_${Date.now()}`,
      type,
      title: `${title}: ${civName}`,
      description: `The ${civName} requires your assistance in the local sector.`,
      lore: `A recursive pulse from the core suggests this mission is critical for the next phase.`,
      difficulty,
      rewards: { gold, xp, items: items ? [items] : [] },
      objectives
    };
  },

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