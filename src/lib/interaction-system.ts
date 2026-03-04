
'use client';
/**
 * @fileOverview Central Interaction System for AI Agents.
 */

import { Agent } from './agent';
import { RobustnessEngine } from './axiomatic-engine';

export class InteractionManager {
  private agents: Agent[];

  constructor(agents: Agent[]) {
    this.agents = agents;
  }

  /**
   * Processes deterministic interactions between agents.
   */
  processInteraction(interaction: { type: string; senderId: string; receiverId: string; payload?: any }): string {
    return RobustnessEngine.wrap(() => {
      const sender = this.agents.find(a => a.id === interaction.senderId);
      const receiver = this.agents.find(a => a.id === interaction.receiverId);

      if (!sender || !receiver) return "[system] Signal lost.";

      if (interaction.type === 'talk') {
        return `[neutral] ${receiver.displayName} says: ${interaction.payload?.message || "..."}`;
      }

      return `[system] Interaction processed: ${interaction.type}`;
    }, "[system] Interaction failed.", "InteractionManager");
  }
}
