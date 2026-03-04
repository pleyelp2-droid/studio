'use client';

import { Memory, Relationship, Task, Interaction, SocialGroup } from './types';
import { interactionLogger, InteractionLog } from './interaction-logger';

export class Agent {
  id: string;
  name: string;
  displayName: string;
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
    this.displayName = name;
  }

  // Trust decay logic: Relationships fade over time without interaction
  decayTrust(decayRate: number = 0.1) {
    for (const [id, rel] of this.relationships) {
      rel.trust = Math.max(-100, rel.trust - decayRate);
      this.relationships.set(id, rel);
    }
  }

  // Update trust level based on interaction outcome
  updateTrust(targetId: string, delta: number) {
    const rel = this.relationships.get(targetId) || { targetId, trust: 0, type: 'neutral' };
    rel.trust = Math.max(-100, Math.min(100, rel.trust + delta));
    this.relationships.set(targetId, rel);
  }

  // Helper to add internal memory entries
  addMemory(event: string, trustDelta: number) {
    this.memory.push({ event, timestamp: Date.now(), trustDelta });
    if (this.memory.length > 50) this.memory.shift();
  }

  // Processes active tasks and commits them to memory upon completion
  updateTasks() {
    this.tasks.forEach(task => {
      if (task.status === 'active') {
        task.status = 'done';
        this.addMemory(`Completed task: ${task.goal}`, 10);
      }
    });
  }

  // Heuristic learning: Adjusts internal needs/biases based on global interaction success
  learnFromLogs(logs: InteractionLog[]) {
    logs.forEach(log => {
      if (log.interaction.senderId === this.id) return; // Don't learn from yourself here

      const rel = this.relationships.get(log.interaction.senderId);
      // If we trust the entity and their action was positive, we mimic or value that behavior
      if (rel && rel.trust > 20 && log.trustDelta > 0) {
        this.addMemory(`Learned from ${log.interaction.senderId}: ${log.interaction.type} was successful`, 1);
        if (log.interaction.type === 'trade') {
          // Success in trading reduces our immediate social anxiety/resource pressure
          this.needs.hunger = Math.max(0, this.needs.hunger - 2);
        }
      }
    });
  }

  // Deterministic decision making based on needs, goals, and trust
  decideAction(allAgents: any[]): Interaction | null {
    // 1. Goal-driven behavior (Primary)
    for (const goal of this.longTermGoals) {
      if (goal === 'gather_food' && this.needs.hunger > 40) {
        const targets = allAgents.filter(a => a.id !== this.id && a.inventory && a.inventory['food'] > 0);
        // Sort by highest trust
        targets.sort((a, b) => (this.relationships.get(b.id)?.trust || 0) - (this.relationships.get(a.id)?.trust || 0));
        const target = targets[0];
        if (target) {
          return { type: 'trade', senderId: this.id, receiverId: target.id, payload: { item: 'food', amount: 1 } };
        }
      }
    }

    // 2. Social Emergence: Propose group formation if trust threshold is met
    const potentialPartner = allAgents.find(a => a.id !== this.id && (this.relationships.get(a.id)?.trust || 0) > 80);
    if (potentialPartner) {
        return {
            type: 'proposeGroup',
            senderId: this.id,
            receiverId: potentialPartner.id,
            payload: { groupName: `${this.name}'s Collective`, type: 'guild' }
        };
    }

    // 3. Ambient Socializing: Seek out agents with positive history
    const positiveHistory = this.memory.filter(m => m.trustDelta > 0);
    if (positiveHistory.length > 0 && Math.random() > 0.7) {
        const target = allAgents[Math.floor(Math.random() * allAgents.length)];
        if (target && target.id !== this.id) {
            return {
                type: 'talk',
                senderId: this.id,
                receiverId: target.id,
                payload: { message: "The Axiom feels strong today. How is your sector?" }
            };
        }
    }
    return null;
  }

  // Main interaction handler
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
        return `${this.name} synchronized with ${interaction.payload.groupName}.`;
      default:
        return "Neural signature not recognized.";
    }
  }

  private handleTalk(interaction: Interaction): string {
    const rel = this.relationships.get(interaction.senderId) || { targetId: interaction.senderId, trust: 0, type: 'neutral' };
    const tone = rel.trust > 50 ? "warm" : rel.trust < -50 ? "cold" : "neutral";
    return `[${tone}] ${this.name} says: ${interaction.payload.message}`;
  }

  private handleTrade(interaction: Interaction): string {
    const { item, amount } = interaction.payload;
    if (this.inventory[item] >= amount) {
      this.inventory[item] -= amount;
      this.updateTrust(interaction.senderId, 5);
      this.addMemory(`Successful trade: ${item} to ${interaction.senderId}`, 5);
      interactionLogger.log(interaction, 5);
      return `${this.name} transferred ${amount} ${item} to ${interaction.senderId}.`;
    }
    this.updateTrust(interaction.senderId, -5);
    interactionLogger.log(interaction, -5);
    return `${this.name} reports: Insufficient resources for ${item}.`;
  }
}
