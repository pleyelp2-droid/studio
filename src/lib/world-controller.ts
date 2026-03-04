'use client';

import { Agent } from './agent';
import { Interaction } from './types';
import { interactionLogger } from './interaction-logger';

export class WorldController {
  private agents: Agent[];
  private tickCount: number = 0;

  constructor(agents: Agent[]) {
    this.agents = agents;
  }

  tick(): Agent[] {
    this.tickCount++;

    // 1. Vertrauens-Erosion und Bedürfnisse anpassen
    this.agents.forEach(agent => {
      agent.decayTrust(0.05);
      agent.needs.hunger = Math.min(100, (agent.needs.hunger || 0) + 1);
      agent.needs.social = Math.max(0, (agent.needs.social || 50) - 0.5);
      
      // Lerne aus den Logs des letzten Ticks
      agent.learnFromLogs(interactionLogger.getLogs());
    });

    // 2. Autonome Entscheidungen treffen
    this.agents.forEach(agent => {
      const decision = agent.decideAction(this.agents);
      if (decision) {
        const manager = new (require('./interaction-system').InteractionManager)(this.agents);
        manager.processInteraction(decision);
      }
    });

    return this.agents;
  }

  getAgents() {
    return this.agents;
  }
}
