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

  // Trust decay logic
  decayTrust(decayRate: number = 0.1) {
    for (const [id, rel] of this.relationships) {
      rel.trust = Math.max(-100, rel.trust - decayRate);
      this.relationships.set(id, rel);
    }
  }

  // Update trust level
  updateTrust(targetId: string, delta: number) {
    const rel = this.relationships.get(targetId) || { targetId, trust: 0, type: 'neutral' };
    rel.trust = Math.max(-100, Math.min(100, rel.trust + delta));
    this.relationships.set(targetId, rel);
  }

  // Helper to add memory entries
  addMemory(event: string, trustDelta: number) {
    this.memory.push({ event, timestamp: Date.now(), trustDelta });
    if (this.memory.length > 50) this.memory.shift();
  }

  // Task and Memory logic
  updateTasks() {
    this.tasks.forEach(task => {
      if (task.status === 'active') {
        task.status = 'done';
        this.addMemory(`Completed task: ${task.goal}`, 10);
      }
    });
  }

  // Learn from interaction logs
  learnFromLogs(logs: InteractionLog[]) {
    logs.forEach(log => {
      const rel = this.relationships.get(log.interaction.senderId);
      // If we trust the sender and it was a successful interaction
      if (rel && rel.trust > 20 && log.trustDelta > 0) {
        this.addMemory(`Learned from ${log.interaction.senderId}: ${log.interaction.type} was successful`, 1);
        // Heuristic adjustment: increase tendency to trade if trading was successful
        if (log.interaction.type === 'trade') {
          this.needs.hunger = Math.min(100, this.needs.hunger + 2);
        }
      }
    });
  }

  decideAction(allAgents: Agent[]): Interaction | null {
    // 1. Goal-driven behavior
    for (const goal of this.longTermGoals) {
      if (goal === 'gather_food' && this.needs.hunger > 40) {
        const targets = allAgents.filter(a => a.id !== this.id && a.inventory['food'] > 0);
        targets.sort((a, b) => (this.relationships.get(b.id)?.trust || 0) - (this.relationships.get(a.id)?.trust || 0));
        const target = targets[0];
        if (target) {
          return { type: 'trade', senderId: this.id, receiverId: target.id, payload: { item: 'food', amount: 1 } };
        }
      }
    }

    // 2. Propose group formation if trust is high
    const potentialPartner = allAgents.find(a => a.id !== this.id && (this.relationships.get(a.id)?.trust || 0) > 80);
    if (potentialPartner) {
        return {
            type: 'proposeGroup',
            senderId: this.id,
            receiverId: potentialPartner.id,
            payload: { groupName: `${this.name}'s Guild`, type: 'guild' }
        };
    }

    // 3. Socialize based on memory (seek out agents with positive history)
    const positiveInteractions = this.memory.filter(m => m.trustDelta > 0);
    if (positiveInteractions.length > 0) {
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
        return "I don't understand that interaction.";
    }
  }

  private handleTalk(interaction: Interaction): string {
    const rel = this.relationships.get(interaction.senderId) || { targetId: interaction.senderId, trust: 0, type: 'neutral' };
    const tone = rel.trust > 50 ? "warm" : rel.trust < -50 ? "kalt" : "neutral";
    return `[${tone}] ${this.name} says: ${interaction.payload.message}`;
  }

  private handleTrade(interaction: Interaction): string {
    const { item, amount } = interaction.payload;
    if (this.inventory[item] >= amount) {
      this.inventory[item] -= amount;
      this.updateTrust(interaction.senderId, 5);
      this.addMemory(`Traded ${item} to ${interaction.senderId}`, 5);
      interactionLogger.log(interaction, 5);
      return `${this.name} traded ${amount} ${item} to ${interaction.senderId}.`;
    }
    this.updateTrust(interaction.senderId, -5);
    interactionLogger.log(interaction, -5);
    return `${this.name} does not have enough ${item}.`;
  }
}
