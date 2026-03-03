'use client';
/**
 * @fileOverview Ouroboros AI Coordination Service
 * Orchestrates calls to Genkit flows with throttling, retries, and local heuristics.
 */

import { autonomousDecisionFlow } from '@/ai/flows/autonomous-decision-flow';
import { emergentBehaviorFlow } from '@/ai/flows/emergent-behavior-flow';
import { importAgentFlow } from '@/ai/flows/import-agent-flow';
import { projectDiagnosticsFlow } from '@/ai/flows/project-diagnostics-flow';
import { Agent, AgentState, ResourceNode } from '@/types';

const API_COOLDOWN_MS = 5000;
let lastApiCallTime = 0;

/**
 * Throttles API calls to prevent quota exhaustion.
 */
function isThrottled(): boolean {
  const now = Date.now();
  if (now - lastApiCallTime < API_COOLDOWN_MS) return true;
  lastApiCallTime = now;
  return false;
}

/**
 * Heuristic fallback for when the neural link is offline.
 */
function getLocalHeuristicDecision(agent: Agent): any {
  let newState = AgentState.IDLE;
  if (agent.hp < 30) newState = AgentState.BANKING;
  else if (agent.inventory.length > 5) newState = AgentState.TRADING;
  else newState = AgentState.EXPLORING;

  return {
    justification: "Neural link failure. Local survival heuristics engaged.",
    decision: "Local Protocol",
    newState,
    message: "Signal lost. Executing base logic."
  };
}

export const AIService = {
  async generateDecision(agent: Agent, nearbyAgents: Agent[], nearbyNodes: ResourceNode[], logs: string[]) {
    if (isThrottled()) return getLocalHeuristicDecision(agent);

    try {
      return await autonomousDecisionFlow({
        agentName: agent.displayName,
        currentState: agent.state,
        hp: agent.hp,
        consciousnessLevel: 1.0, // Default for prototype
        awakeningProgress: agent.awakened ? 100 : 0,
        longTermGoal: agent.thinkingMatrix?.currentLongTermGoal || 'Survive',
        personality: agent.thinkingMatrix?.personality || 'Neutral',
        relationships: {},
        nearbyAgentCount: nearbyAgents.length,
        nearbyNodeCount: nearbyNodes.length,
        recentLogs: logs.slice(-5),
      });
    } catch (e) {
      console.error('AI Decision Error:', e);
      return getLocalHeuristicDecision(agent);
    }
  },

  async generateEmergentAction(agent: Agent, nearby: Agent[], logs: string[]) {
    if (isThrottled()) return { action: "Internal Reflection", reasoning: "Processing..." };

    try {
      return await emergentBehaviorFlow({
        agentName: agent.displayName,
        personality: agent.thinkingMatrix?.personality || 'Neutral',
        economicDesires: {
          targetGold: 1000,
          greedLevel: agent.thinkingMatrix?.aggression || 0.5,
          riskAppetite: 0.5,
          frugality: 0.5,
          marketRole: 'TRADER',
          tradeFrequency: 0.5,
        },
        resources: {},
        gold: 100,
        relationships: {},
        memories: agent.memoryCache.slice(-5) as string[],
        nearbyAgents: nearby.map(a => ({ name: a.displayName, affinity: 0.5 })),
        activeTradeOffers: [],
        recentLogs: logs.slice(-5),
      });
    } catch (e) {
      console.error('Emergent AI Error:', e);
      return { action: "Stasis", reasoning: "Neural link error." };
    }
  },

  async importAgent(source: string, type: 'URL' | 'JSON') {
    return await importAgentFlow({ source, type });
  },

  async diagnose(context: string, logs?: string) {
    return await projectDiagnosticsFlow({ context, errorLog: logs });
  }
};
