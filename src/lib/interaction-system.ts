'use client';

import { Agent } from './agent';
import { Interaction } from './types';

export class InteractionManager {
  private agents: Map<string, Agent> = new Map();

  constructor(agents: Agent[]) {
    agents.forEach(agent => this.agents.set(agent.id, agent));
  }

  processInteraction(interaction: Interaction): string {
    const receiver = this.agents.get(receiverIdFromInteraction(interaction));
    if (!receiver) {
      return "Target not found.";
    }
    return receiver.handleInteraction(interaction);
  }
}

function receiverIdFromInteraction(interaction: Interaction): string {
  return interaction.receiverId;
}
