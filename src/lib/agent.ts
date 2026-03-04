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
  needs: Record<string, number> = { hunger: 50 };
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
    
    if (rel.trust > 50) rel.type = 'friend';
    else if (rel.trust < -50) rel.type = 'enemy';
    else rel.type = 'neutral';

    this.relationships.set(targetId, rel);
  }

  addMemory(event: string, trustDelta: number) {
    this.memory.push({ event, timestamp: Date.now(), trustDelta });
    if (this.memory.length > 50) this.memory.shift();
  }

  updateTasks() {
    this.tasks.forEach(task => {
      if (task.status === 'active') {
        task.status = 'done';
        this.addMemory(`Completed task: ${task.goal}`, 10);
      }
    });
  }

  learnFromLogs(logs: InteractionLog[]) {
    logs.forEach(log => {
      if (log.interaction.senderId === this.id) return;
      const rel = this.relationships.get(log.interaction.senderId);
      if (rel && rel.trust > 20 && log.trustDelta > 0) {
        this.addMemory(`Learned from ${log.interaction.senderId}: ${log.interaction.type} successful`, 1);
        if (log.interaction.type === 'trade') {
          this.needs.hunger = Math.max(0, this.needs.hunger - 5);
        }
      }
    });
  }

  decideAction(allAgents: Agent[]): Interaction | null {
    for (const goal of this.longTermGoals) {
      if (goal === 'gather_food' && this.needs.hunger > 40) {
        const targets = allAgents.filter(a => a.id !== this.id && (a.inventory['food'] || 0) > 0);
        targets.sort((a, b) => (this.relationships.get(b.id)?.trust || 0) - (this.relationships.get(a.id)?.trust || 0));
        const target = targets[0];
        if (target) {
          return { type: 'trade', senderId: this.id, receiverId: target.id, payload: { item: 'food', amount: 1 } };
        }
      }
    }

    const potentialPartner = allAgents.find(a => a.id !== this.id && (this.relationships.get(a.id)?.trust || 0) > 80);
    if (potentialPartner && Math.random() > 0.9) {
      return {
        type: 'proposeGroup',
        senderId: this.id,
        receiverId: potentialPartner.id,
        payload: { groupName: `${this.name}'s Guild`, type: 'guild' }
      };
    }

    const positiveInteractions = this.memory.filter(m => m.trustDelta > 0);
    if (positiveInteractions.length > 0 && Math.random() > 0.7) {
      const target = allAgents[Math.floor(Math.random() * allAgents.length)];
      if (target && target.id !== this.id) {
        return {
          type: 'talk',
          senderId: this.id,
          receiverId: target.id,
          payload: { message: "It's good to see you again!" }
        };
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
        return this.handleTalk(interaction);
      case 'trade':
        return this.handleTrade(interaction);
      case 'proposeGroup':
        this.updateTrust(interaction.senderId, 10);
        this.addMemory(`Accepted group proposal from ${interaction.senderId}`, 10);
        interactionLogger.log(interaction, 10);
        return `${this.name} joined ${interaction.payload.groupName}.`;
      default:
        return "Unknown protocol.";
    }
  }

  private handleTalk(interaction: Interaction): string {
    const rel = this.relationships.get(interaction.senderId) || { targetId: interaction.senderId, trust: 0, type: 'neutral' };
    const tone = rel.trust > 50 ? "warm" : rel.trust < -50 ? "cold" : "neutral";
    return `[${tone}] ${this.name} says: ${interaction.payload.message}`;
  }

  private handleTrade(interaction: Interaction): string {
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
    return `${this.name} lacks ${item}.`;
  }
}
