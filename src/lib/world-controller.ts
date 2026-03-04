'use client';

import { Agent, AgentState } from '@/types';

/**
 * WorldController
 * Behandelt Simulationsschritte mit funktionalen Transformationen.
 * Verhindert "not a function" Fehler bei Zustand-Objekten.
 */
export class WorldController {
  private agents: Agent[];

  constructor(agents: Agent[]) {
    this.agents = agents;
  }

  /**
   * Berechnet einen Welt-Tick.
   * Gibt ein neues Array mit transformierten Agenten-Daten zurück.
   */
  tick(): Agent[] {
    return this.agents.map(agent => {
      // 1. Erstelle eine funktionale Kopie des Agenten
      const newAgent = { ...agent };

      // 2. Trust Decay (Funktional)
      if (newAgent.relationships) {
        const newRels = { ...newAgent.relationships };
        Object.keys(newRels).forEach(targetId => {
          const rel = newRels[targetId];
          newRels[targetId] = {
            ...rel,
            trust: Math.max(-100, (rel.trust || 0) - 0.1)
          };
        });
        newAgent.relationships = newRels;
      }

      // 3. Task Update (Funktional)
      if (newAgent.tasks) {
        newAgent.tasks = newAgent.tasks.map(task => {
          if (task.status === 'active' && Math.random() > 0.98) {
            return { ...task, status: 'done' as const };
          }
          return task;
        });
      }

      // 4. Update Needs (Funktional)
      if (newAgent.needs) {
        newAgent.needs = {
          ...newAgent.needs,
          hunger: Math.min(100, (newAgent.needs.hunger || 0) + 0.2),
          social: Math.max(0, (newAgent.needs.social || 50) - 0.1),
          wealth: newAgent.needs.wealth || 50
        };
      }

      return newAgent;
    });
  }

  getAgents() {
    return this.agents;
  }
}