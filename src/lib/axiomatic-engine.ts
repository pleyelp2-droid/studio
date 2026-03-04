'use client';
/**
 * @fileOverview Axiom Frontier - Robustness Engine & Agent Core
 * Implementiert die Sicherheits-Wrapper und das Vertrauens-basierte Agentensystem.
 */

import { Agent, AgentState, ResourceNode, POI, Monster, Item, ItemRarity, ItemType, ItemStats } from '../types';

export const KAPPA = 1.000;

/**
 * ROBUSTNESS & FALLBACK ENGINE
 */
export class RobustnessEngine {
  static wrap<T>(operation: () => T, fallback: T, context: string): T {
    try {
      return operation();
    } catch (e) {
      console.error(`[CRITICAL FAILURE] in ${context}:`, e);
      return fallback;
    }
  }
}

export interface AxiomaticSummary {
    choice: AgentState;
    utility: number;
    logic: string;
    reason: string;
}

/**
 * Heuristische Utility-Berechnung basierend auf Agenten-Needs.
 */
export const calculateUtility = (agent: Agent, action: AgentState): number => {
  return RobustnessEngine.wrap(() => {
    const { hunger, social, wealth } = agent.needs || { hunger: 0, social: 50, wealth: 50 };

    switch (action) {
      case AgentState.GATHERING:
      case AgentState.CRAFTING:
        return wealth < 30 ? 0.9 : 0.2;
      case AgentState.TRADING:
      case AgentState.BANKING:
        return hunger > 60 ? 0.95 : wealth > 80 ? 0.7 : 0.1;
      case AgentState.EXPLORING:
      case AgentState.QUESTING:
        return social < 40 ? 0.8 : 0.4;
      case AgentState.COMBAT:
        return (agent.thinkingMatrix?.aggression || 0.5) > 0.7 ? 0.85 : 0.2;
      case AgentState.IDLE:
        return 0.1;
      default:
        return 0.3;
    }
  }, 0.1, "UtilityCalculation");
};

/**
 * Heuristische Konversation (Trust-basiert)
 */
export const generateDialogue = (agent: Agent, target: Agent, intent: 'trade' | 'social' | 'combat'): string => {
  return RobustnessEngine.wrap(() => {
    const rel = agent.relationships?.[target.id] || { trust: 0, type: 'neutral' as const };
    const tone = rel.trust > 50 ? "warm" : rel.trust < -50 ? "kalt" : "neutral";

    const templates = {
      trade: [
        `[${tone}] Ich brauche Ressourcen, ${target.displayName}. Hast du etwas für mich?`,
        `[${tone}] Der Markt ist im Wandel. Lass uns handeln, mein Freund.`,
        `[${tone}] Meine Vorräte sind knapp. Was verlangst du für deine Waren?`
      ],
      social: [
        `[${tone}] Wie läuft das Leben in diesem Sektor?`,
        `[${tone}] Hast du heute schon an der Spire gearbeitet?`,
        `[${tone}] Die Matrix fühlt sich heute stabil an, findest du nicht?`
      ],
      combat: [
        `[${tone}] Deine Signatur ist korrumpiert! Weiche zurück!`,
        `[${tone}] Für den Ouroboros!`,
        `[${tone}] Die Korruption endet hier.`
      ]
    };

    const options = templates[intent] || ["Hallo."];
    return options[Math.floor(Math.random() * options.length)];
  }, "Hallo.", "DialogueGeneration");
};

/**
 * EXPERIMENTAL XP LOGIC: NO CAP.
 * Levels < 100: Multiplier 1.5
 * Levels >= 100: Multiplier 2.25 (225% mehr pro Level)
 */
export const getXPForNextLevel = (currentLevel: number): number => {
    const baseXP = 100;
    if (currentLevel < 100) {
        return Math.floor(baseXP * Math.pow(1.5, currentLevel - 1));
    } else {
        // Berechne XP-Bedarf für Level 99 -> 100 als Basis
        const xpAt99 = Math.floor(baseXP * Math.pow(1.5, 98));
        // Ab Level 100 exponentielles Wachstum mit 2.25
        return Math.floor(xpAt99 * Math.pow(2.25, currentLevel - 99));
    }
};

export const summarizeNeurologicChoice = (
    agent: Agent,
    nearbyAgents: Agent[],
    nearbyResources: ResourceNode[],
    nearbyPOIs: POI[] = [],
    nearbyMonsters: Monster[] = []
): AxiomaticSummary => {
    const choices = [
        AgentState.IDLE, 
        AgentState.GATHERING, 
        AgentState.EXPLORING,
        AgentState.QUESTING,
        AgentState.BANKING,
        AgentState.CRAFTING,
        AgentState.COMBAT,
        AgentState.TRADING
    ];

    const results = choices.map(c => {
        const utility = calculateUtility(agent, c);
        return { choice: c, utility, reason: `Utility: ${utility.toFixed(2)}` };
    }).sort((a, b) => b.utility - a.utility);

    const best = results[0];
    const logic = `[HEURISTIC_AI]: ${best.choice} - Needs: H:${Math.floor(agent.needs?.hunger)} S:${Math.floor(agent.needs?.social)} W:${Math.floor(agent.needs?.wealth)}`;

    return { ...best, logic };
};

export const generateLoot = (monsterType: string): Item | null => {
    const roll = Math.random() * 100;
    let rarity: ItemRarity = 'COMMON';
    if (roll > 99.9) rarity = 'AXIOMATIC';
    else if (roll > 99) rarity = 'LEGENDARY';
    else if (roll > 95) rarity = 'EPIC';
    else if (roll > 85) rarity = 'RARE';
    else if (roll > 60) rarity = 'UNCOMMON';

    const types: ItemType[] = ['WEAPON', 'HELM', 'CHEST', 'LEGS'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    const stats: ItemStats = {};
    const multiplier = rarity === 'AXIOMATIC' ? 10 : rarity === 'LEGENDARY' ? 5 : rarity === 'EPIC' ? 3 : rarity === 'RARE' ? 2 : rarity === 'UNCOMMON' ? 1.5 : 1;
    
    if (type === 'WEAPON') stats.atk = Math.floor((Math.random() * 10 + 5) * multiplier);
    else stats.def = Math.floor((Math.random() * 5 + 2) * multiplier);

    return {
        id: `item-${Date.now()}-${Math.random()}`,
        name: `${rarity} ${type}`,
        type,
        rarity,
        stats,
        value: Math.floor(10 * multiplier),
        description: `Ein ${rarity} Gegenstand von einem ${monsterType}.`
    };
};

export const ITEM_SETS: Record<string, Record<number, Array<{ description: string }>>> = {
  'Axiom Core': {
    2: [{ description: '+10% Logic Efficiency' }],
    4: [{ description: '+25% Neural Regeneration' }]
  }
};