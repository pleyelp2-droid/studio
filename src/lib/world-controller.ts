'use client';

import { Agent, AgentState } from '@/types';
import { interactionLogger } from './interaction-logger';

/**
 * WorldController
 * Handles simulation steps using functional transformations to ensure compatibility with plain store objects.
 */
export class WorldController {
  private agents: Agent[];

  constructor(agents: Agent[]) {
    this.agents = agents;
  }

  /**
   * Processes one tick of simulation time.
   * Returns a new array of updated agents.
   */
  tick(): Agent[] {
    return this.agents.map(agent => {
      const newAgent = { ...agent };

      // 1. Functional Trust Decay
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

      // 2. Functional Task Update & Learning
      if (newAgent.tasks) {
        newAgent.tasks = newAgent.tasks.map(task => {
          if (task.status === 'active' && Math.random() > 0.98) {
            return { ...task, status: 'done' as const };
          }
          return task;
        });
      }

      // 3. Update Needs
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