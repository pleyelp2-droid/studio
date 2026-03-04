'use client';

import { Agent } from './agent';
import { interactionLogger } from './interaction-logger';
import { InteractionManager } from './interaction-system';

export class WorldController {
  private agents: Agent[];

  constructor(agents: Agent[]) {
    this.agents = agents;
  }

  tick(): Agent[] {
    // 1. Update internal needs and trust decay
    this.agents.forEach(agent => {
      agent.decayTrust(0.05);
      agent.needs.hunger = Math.min(100, (agent.needs.hunger || 0) + 1);
      
      // Learn from interaction logs
      agent.learnFromLogs(interactionLogger.getLogs());
    });

    // 2. Autonomous Decision Making
    this.agents.forEach(agent => {
      const decision = agent.decideAction(this.agents);
      if (decision) {
        const manager = new InteractionManager(this.agents);
        manager.processInteraction(decision);
      }
    });

    return this.agents;
  }

  getAgents() {
    return this.agents;
  }
}
