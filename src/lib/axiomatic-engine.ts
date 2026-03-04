'use client';
/**
 * @fileOverview Axiom Frontier - Heuristische Agenten-Logik (Master Plan)
 * Implementiert die Utility-basierte KI und template-basierte Kommunikation.
 */

import { Agent, AgentState, ResourceNode, POI, Monster, Item, ItemRarity, ItemType, ItemStats } from '../types';

export const KAPPA = 1.000;

export interface AxiomaticSummary {
    choice: AgentState;
    utility: number;
    logic: string;
    reason: string;
}

/**
 * Heuristische Utility-Berechnung basierend auf Agenten-Needs.
 * Implementiert den Master Plan: Bedürfnisse steuern das Verhalten mathematisch.
 */
export const calculateUtility = (agent: Agent, action: AgentState): number => {
  const { hunger, social, wealth } = agent.needs || { hunger: 0, social: 50, wealth: 50 };

  switch (action) {
    case AgentState.GATHERING:
    case AgentState.CRAFTING:
      // Utility steigt, wenn Wealth niedrig ist
      return wealth < 30 ? 0.9 : 0.2;
    
    case AgentState.TRADING:
    case AgentState.BANKING:
      // Utility steigt bei Hunger (Handel für Nahrung) oder hohem Wealth (Logistik)
      return hunger > 60 ? 0.95 : wealth > 80 ? 0.7 : 0.1;
    
    case AgentState.EXPLORING:
    case AgentState.QUESTING:
      // Social Bedürfnis treibt Exploration zu bewohnten Gebieten
      return social < 40 ? 0.8 : 0.4;
    
    case AgentState.COMBAT:
      // Aggression (Teil der Thinking Matrix) erhöht Combat Utility
      return (agent.thinkingMatrix?.aggression || 0.5) > 0.7 ? 0.85 : 0.2;

    case AgentState.IDLE:
      return 0.1;

    default:
      return 0.3;
  }
};

/**
 * Heuristische Konversation (Master Plan)
 * Wählt Dialoge basierend auf Intent und Status ohne LLM.
 */
export const generateDialogue = (agent: Agent, target: Agent, intent: 'trade' | 'social' | 'combat'): string => {
  const templates = {
    trade: [
      `Ich brauche Ressourcen, ${target.displayName}. Hast du etwas für mich?`,
      `Der Markt ist im Wandel. Lass uns handeln, mein Freund.`,
      `Meine Vorräte sind knapp. Was verlangst du für deine Waren?`
    ],
    social: [
      `Wie läuft das Leben in diesem Sektor?`,
      `Hast du heute schon an der Spire gearbeitet?`,
      `Die Matrix fühlt sich heute stabil an, findest du nicht?`
    ],
    combat: [
      `Deine Signatur ist korrumpiert! Weiche zurück!`,
      `Für den Ouroboros!`,
      `Die Korruption endet hier.`
    ]
  };

  const options = templates[intent] || ["Hallo."];
  return options[Math.floor(Math.random() * options.length)];
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
        return { choice: c, utility, reason: `Heuristische Utility: ${utility.toFixed(2)}` };
    }).sort((a, b) => b.utility - a.utility);

    const best = results[0];
    const logic = `[HEURISTIC_AI]: ${best.choice} - Needs: H:${agent.needs?.hunger} S:${agent.needs?.social} W:${agent.needs?.wealth}`;

    return { ...best, logic };
};

export const getXPForNextLevel = (currentLevel: number): number => {
    return Math.floor(100 * Math.pow(1.5, currentLevel - 1));
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
