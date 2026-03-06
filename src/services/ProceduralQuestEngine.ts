'use client';
/**
 * @fileOverview Ouroboros Procedural Quest Engine
 * Dynamically generates mission objectives based on Civilization Needs.
 */

import { initializeFirebase } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { generateLoot } from './LootManager';
import { QuestLine } from '@/types';

const { firestore: db } = initializeFirebase();

export type QuestArchetype = 'gather' | 'kill' | 'deliver' | 'explore' | 'diplomatic' | 'dungeon' | 'escort' | 'defend';

interface QuestTemplate {
  type: QuestArchetype;
  titlePatterns: string[];
  descriptionPatterns: string[];
  lorePatterns: string[];
  baseDifficulty: number;
}

const ARCHETYPES: Record<QuestArchetype, QuestTemplate> = {
  gather: {
    type: 'gather',
    titlePatterns: ['Resource Requisition', 'Supply the Core', '{resource} Collection'],
    descriptionPatterns: ['The collective requires {amount} {resource} for operations.', 'Gather {amount} {resource} from local sectors.'],
    lorePatterns: ['Expansion demands materials. Your contribution is vital.'],
    baseDifficulty: 2
  },
  kill: {
    type: 'kill',
    titlePatterns: ['Elimination Cycle', 'Clear the Threat', 'Hunt the {enemy}'],
    descriptionPatterns: ['Anomalies detected. Purge {amount} {enemy} signatures.', 'Hostile protocols active. Eradicate {enemy} units.'],
    lorePatterns: ['Corruption must be pruned from the matrix.'],
    baseDifficulty: 4
  },
  explore: {
    type: 'explore',
    titlePatterns: ['Chart the Unknown', 'Survey the Frontier', 'Reconnaissance'],
    descriptionPatterns: ['Explore {amount} undiscovered nodes.', 'Scan the perimeter for logic drifts.'],
    lorePatterns: ['Knowledge is the only shield against entropy.'],
    baseDifficulty: 3
  },
  deliver: {
    type: 'deliver',
    titlePatterns: ['Urgent Delivery', 'Trade Caravan', 'Data Packet Sync'],
    descriptionPatterns: ['Transport encrypted data to the target node.', 'Deliver physical shards to the extraction point.'],
    lorePatterns: ['Information flow must never be interrupted.'],
    baseDifficulty: 3
  },
  diplomatic: {
    type: 'diplomatic',
    titlePatterns: ['Peace Negotiations', 'Alliance Proposal', 'Embassy Mission'],
    descriptionPatterns: ['Establish a neutral link with the local faction.', 'Negotiate resource rights with Pilot leaders.'],
    lorePatterns: ['Words can stabilize what force cannot.'],
    baseDifficulty: 5
  },
  dungeon: {
    type: 'dungeon',
    titlePatterns: ['Void Delve', 'Reclaim the Depths', 'Vault Breach'],
    descriptionPatterns: ['Descend into the unstable sector and purge the core.', 'Retrieve the ancient data fragment from the depths.'],
    lorePatterns: ['In the deepest layers, the first code still whispers.'],
    baseDifficulty: 7
  },
  escort: {
    type: 'escort',
    titlePatterns: ['Safe Passage', 'Protect the Manifest', 'Guardian Duty'],
    descriptionPatterns: ['Ensure the transport reaches the spire center.', 'Guard the neural entity through the desert wastes.'],
    lorePatterns: ['Vulnerable data is a target for the Void.'],
    baseDifficulty: 6
  },
  defend: {
    type: 'defend',
    titlePatterns: ['Hold the Line', 'Defense Protocol', 'Repel the Drift'],
    descriptionPatterns: ['Defend the local node from 3 waves of corruption.', 'Ensure the sector stability remains above 80%.'],
    lorePatterns: ['The foundation must not crumble.'],
    baseDifficulty: 6
  }
};

export const ProceduralQuestEngine = {
  /**
   * Generates a quest based on civilization needs and player level.
   */
  generateQuest(archetype: QuestArchetype, level: number, civName: string = 'Axiom Core'): Partial<QuestLine> {
    const template = ARCHETYPES[archetype];
    const difficulty = Math.min(10, Math.max(1, template.baseDifficulty + Math.floor(level / 10)));
    
    const resource = ['Iron Shards', 'Axiom Fragments', 'Neon Timber', 'Neural Dust'][Math.floor(Math.random() * 4)];
    const enemy = ['Glitched Sentinel', 'Void Wraith', 'Corruption Golem'][Math.floor(Math.random() * 3)];
    const amount = 5 + level;

    const title = template.titlePatterns[Math.floor(Math.random() * template.titlePatterns.length)]
      .replace('{resource}', resource).replace('{enemy}', enemy);
    
    const description = template.descriptionPatterns[Math.floor(Math.random() * template.descriptionPatterns.length)]
      .replace('{resource}', resource).replace('{enemy}', enemy).replace('{amount}', amount.toString());

    const goldReward = difficulty * 50;
    const xpReward = difficulty * 100;

    return {
      title: `${title} [${civName}]`,
      description,
      requiredLevel: level,
      xpReward,
      goldReward,
      status: 'active',
      npc_id: 'axiom_orchestrator',
      quest_steps: [
        { type: 'task', description: `Finalize objective: ${archetype.toUpperCase()}`, count: amount }
      ]
    };
  },

  /**
   * Commits a generated quest to the neural ledger.
   */
  async commitQuest(quest: Partial<QuestLine>, userId: string) {
    if (!db) return;
    return await addDoc(collection(db, 'questLines'), {
      ...quest,
      createdBy: userId,
      createdAt: serverTimestamp()
    });
  }
};