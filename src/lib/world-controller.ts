'use client';

import { Agent, AgentState } from '@/types';
import { InteractionManager } from './interaction-system';

/**
 * WorldController
 * Handles simulation steps using functional transformations to be compatible with plain data objects.
 */
export class WorldController {
  private agents: Agent[];
  private interactionManager: InteractionManager;

  constructor(agents: Agent[]) {
    this.agents = agents;
    this.interactionManager = new InteractionManager(agents as any);
  }

  /**
   * Processes one tick of simulation time.
   */
  tick(): Agent[] {
    const updatedAgents = this.agents.map(agent => {
      const newAgent = { ...agent };

      // 1. Decay Trust (Functional)
      if (newAgent.relationships) {
        const newRels = { ...newAgent.relationships };
        Object.keys(newRels).forEach(targetId => {
          const rel = newRels[targetId];
          newRels[targetId] = {
            ...rel,
            trust: Math.max(-100, rel.trust - 0.1)
          };
        });
        newAgent.relationships = newRels;
      }

      // 2. Update Tasks (Functional)
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

    // 4. Peer-to-Peer Interactions
    updatedAgents.forEach(agent => {
      if (Math.random() > 0.95) {
        const targets = updatedAgents.filter(a => a.id !== agent.id);
        const target = targets[Math.floor(Math.random() * targets.length)];
        
        if (target) {
          const interactionResult = this.interactionManager.processInteraction({
            type: 'talk',
            senderId: agent.id,
            receiverId: target.id,
            payload: { message: "The Spire rises today, doesn't it?" }
          } as any);
          
          console.log(`[Simulation] ${agent.displayName} -> ${target.displayName}: ${interactionResult}`);
        }
      }
    });

    return updatedAgents;
  }

  getAgents() {
    return this.agents;
  }
}