'use client';
/**
 * @fileOverview Ouroboros World Controller
 * Zentraler Orchestrator für Ticks, Agenten-Updates und Ressourcen-Fluss.
 */

import { Agent, AgentState } from '@/types';
import { summarizeNeurologicChoice, RobustnessEngine } from '@/lib/axiomatic-engine';

export class WorldController {
  private agents: Agent[];
  private tickCount: number = 0;

  constructor(agents: Agent[]) {
    this.agents = agents;
  }

  /**
   * Führt einen Simulations-Tick für alle Agenten aus.
   */
  tick(): Agent[] {
    this.tickCount++;

    return this.agents.map(agent => {
      return RobustnessEngine.wrap(() => {
        // 1. Bedürfnisse verfallen (Deterministisch)
        const needs = {
          hunger: Math.min(100, (agent.needs?.hunger || 0) + 1),
          social: Math.max(0, (agent.needs?.social || 50) - 0.5),
          wealth: agent.needs?.wealth || 50
        };

        // 2. Ressourcen-Verbrauch (z.B. Food)
        const resourceInventory = { ...agent.resourceInventory };
        if (needs.hunger > 70 && resourceInventory['food'] > 0) {
          resourceInventory['food'] -= 1;
          needs.hunger -= 30;
          agent.memory.push(`[SYSTEM]: Nahrung konsumiert. Hunger sinkt.`);
        }

        // 3. KI-Entscheidung basierend auf Utility
        const decision = summarizeNeurologicChoice({ ...agent, needs, resourceInventory }, [], [], [], []);
        
        // 4. Memory-Update (Sichtbare Gedanken)
        const memory = [...(agent.memory || [])];
        const newThought = `[TICK_${this.tickCount}]: Plane ${decision.choice}`;
        if (memory[memory.length - 1] !== newThought) {
          memory.push(newThought);
        }

        return {
          ...agent,
          needs,
          resourceInventory,
          state: decision.choice,
          memory: memory.slice(-5) // Nur die letzten Gedanken behalten
        };
      }, agent, "WorldControllerTick");
    });
  }

  getAgents() {
    return this.agents;
  }
}
