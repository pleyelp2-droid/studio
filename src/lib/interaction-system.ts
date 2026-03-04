'use client';

import { Agent } from './agent';
import { Interaction } from './types';

/**
 * @fileOverview Central Interaction System for AI Agents.
 * Efficiently routes communications between neural entities using a Map-based lookup.
 */
export class InteractionManager {
  private agents: Map<string, Agent> = new Map();

  constructor(agents: Agent[]) {
    agents.forEach(agent => this.agents.set(agent.id, agent));
  }

  /**
   * Processes a deterministic interaction between agents.
   * Finds the receiver in the Map and delegates the handling to their internal logic.
   */
  processInteraction(interaction: Interaction): string {
    const receiver = this.agents.get(interaction.receiverId);
    if (!receiver) {
      return "Target neural signature not found.";
    }
    return receiver.handleInteraction(interaction);
  }
}
