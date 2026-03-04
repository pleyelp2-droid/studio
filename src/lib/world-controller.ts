'use client';

import { Agent } from './agent';
import { InteractionManager } from './interaction-system';
import { interactionLogger } from './interaction-logger';

export class WorldController {
  private agents: Agent[];
  private interactionManager: InteractionManager;

  constructor(agents: Agent[]) {
    this.agents = agents;
    this.interactionManager = new InteractionManager(agents);
  }

  tick() {
    // 1. Update all agents
    this.agents.forEach(agent => {
      agent.decayTrust();
      agent.updateTasks();
      agent.learnFromLogs(interactionLogger.getLogs());
    });

    // 2. Agents decide and initiate actions
    this.agents.forEach(agent => {
      const interaction = agent.decideAction(this.agents);
      if (interaction) {
        const result = this.interactionManager.processInteraction(interaction);
        console.log(`[Interaction] ${interaction.senderId} -> ${interaction.receiverId}: ${result}`);
      }
    });
  }

  getAgents() {
    return this.agents;
  }
}
