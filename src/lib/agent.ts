'use client';

import { Memory, Relationship, Task, Interaction, SocialGroup } from './types';
import { interactionLogger, InteractionLog } from './interaction-logger';

export class Agent {
  id: string;
  name: string;
  memory: Memory[] = [];
  relationships: Map<string, Relationship> = new Map();
  tasks: Task[] = [];
  inventory: Record<string, number> = {};
  needs: Record<string, number> = { hunger: 50, social: 50 };
  longTermGoals: string[] = [];
  groups: SocialGroup[] = [];

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }

  decayTrust(decayRate: number = 0.1) {
    for (const [id, rel] of this.relationships) {
      rel.trust = Math.max(-100, rel.trust - decayRate);
      this.relationships.set(id, rel);
    }
  }

  updateTrust(targetId: string, delta: number) {
    const rel = this.relationships.get(targetId) || { targetId, trust: 0, type: 'neutral' };
    rel.trust = Math.max(-100, Math.min(100, rel.trust + delta));
    this.relationships.set(targetId, rel);
  }

  updateTasks() {
    this.tasks.forEach(task => {
      if (task.status === 'active') {
        // Logic to potentially complete tasks based on world state
        // For prototype, we complete them randomly
        if (Math.random() > 0.95) {
          task.status = 'done';
          this.addMemory(`Completed task: ${task.goal}`, 10);
        }
      }
    });
  }

  addMemory(event: string, trustDelta: number) {
    this.memory.push({ event, timestamp: Date.now(), trustDelta });
    if (this.memory.length > 50) this.memory.shift();
  }

  learnFromLogs(logs: InteractionLog[]) {
    logs.forEach(log => {
      const rel = this.relationships.get(log.interaction.senderId);
      if (rel && rel.trust > 20 && log.trustDelta > 0) {
        this.addMemory(`Learned from ${log.interaction.senderId}: ${log.interaction.type} was successful`, 1);
        if (log.interaction.type === 'trade') {
          this.needs.hunger = Math.max(0, this.needs.hunger - 5);
        }
      }
    });
  }

  decideAction(allAgents: Agent[]): Interaction | null {
    // Basic heuristic decision making
    if (this.needs.hunger > 60) {
      const target = allAgents.find(a => a.id !== this.id && (a.inventory['food'] || 0) > 0);
      if (target) {
        return { type: 'trade', senderId: this.id, receiverId: target.id, payload: { item: 'food', amount: 1 } };
      }
    }

    if (this.needs.social < 40) {
      const target = allAgents[Math.floor(Math.random() * allAgents.length)];
      if (target && target.id !== this.id) {
        return { type: 'talk', senderId: this.id, receiverId: target.id, payload: { message: "The Spire rises today, doesn't it?" } };
      }
    }

    return null;
  }

  handleInteraction(interaction: Interaction): string {
    switch (interaction.type) {
      case 'talk':
        this.updateTrust(interaction.senderId, 2);
        this.addMemory(`Talked to ${interaction.senderId}`, 2);
        interactionLogger.log(interaction, 2);
        return `[warm] ${this.name} says: ${interaction.payload.message}`;
      case 'trade':
        const { item, amount } = interaction.payload;
        if ((this.inventory[item] || 0) >= amount) {
          this.inventory[item] -= amount;
          this.updateTrust(interaction.senderId, 5);
          this.addMemory(`Traded ${item} to ${interaction.senderId}`, 5);
          interactionLogger.log(interaction, 5);
          return `${this.name} traded ${amount} ${item} to ${interaction.senderId}.`;
        }
        this.updateTrust(interaction.senderId, -5);
        interactionLogger.log(interaction, -5);
        return `${this.name} does not have enough ${item}.`;
      default:
        return "Unknown interaction.";
    }
  }
}
