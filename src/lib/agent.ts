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
  needs: Record<string, number> = { hunger: 50, social: 50, wealth: 20 };
  longTermGoals: string[] = [];
  groups: SocialGroup[] = [];

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
    this.displayName = name;
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
        this.addMemory(`Erfülltes Ziel: ${task.goal}`, 10);
      }
    });
  }

  learnFromLogs(logs: InteractionLog[]) {
    logs.forEach(log => {
      if (log.interaction.senderId === this.id) return;
      const rel = this.relationships.get(log.interaction.senderId);
      if (rel && rel.trust > 20 && log.trustDelta > 0) {
        this.addMemory(`Gelernt von ${log.interaction.senderId}: ${log.interaction.type} war erfolgreich`, 1);
        if (log.interaction.type === 'trade') {
          this.needs.wealth = (this.needs.wealth || 0) + 2;
        }
      }
    });
  }

  decideAction(allAgents: Agent[]): Interaction | null {
    // 1. Hunger-Priorität
    if (this.needs.hunger > 70) {
      const targets = allAgents.filter(a => a.id !== this.id && (a.inventory['food'] || 0) > 0);
      if (targets.length > 0) {
        targets.sort((a, b) => (this.relationships.get(b.id)?.trust || 0) - (this.relationships.get(a.id)?.trust || 0));
        return { type: 'trade', senderId: this.id, receiverId: targets[0].id, payload: { item: 'food', amount: 1 } };
      }
    }

    // 2. Soziale Gruppenbildung
    const bestFriend = allAgents.find(a => a.id !== this.id && (this.relationships.get(a.id)?.trust || 0) > 80);
    if (bestFriend && Math.random() > 0.9) {
      return {
        type: 'proposeGroup',
        senderId: this.id,
        receiverId: bestFriend.id,
        payload: { groupName: `${this.name}'s Bündnis`, type: 'guild' }
      };
    }

    // 3. Ambient Socializing
    if (this.needs.social < 40 && allAgents.length > 1) {
      const target = allAgents[Math.floor(Math.random() * allAgents.length)];
      if (target && target.id !== this.id) {
        return {
          type: 'talk',
          senderId: this.id,
          receiverId: target.id,
          payload: { message: "Die Matrix fühlt sich heute stabil an." }
        };
      }
    }

    return null;
  }

  handleInteraction(interaction: Interaction): string {
    switch (interaction.type) {
      case 'talk':
        this.updateTrust(interaction.senderId, 2);
        this.addMemory(`Gespräch mit ${interaction.senderId}`, 2);
        interactionLogger.log(interaction, 2);
        return this.handleTalk(interaction);
      case 'trade':
        return this.handleTrade(interaction);
      case 'proposeGroup':
        this.updateTrust(interaction.senderId, 10);
        this.addMemory(`Bündnis akzeptiert von ${interaction.senderId}`, 10);
        interactionLogger.log(interaction, 10);
        return `${this.name} hat sich mit ${interaction.payload.groupName} synchronisiert.`;
      default:
        return "Neurales Signal nicht erkannt.";
    }
  }

  private handleTalk(interaction: Interaction): string {
    const rel = this.relationships.get(interaction.senderId) || { targetId: interaction.senderId, trust: 0, type: 'neutral' };
    const tone = rel.trust > 50 ? "warm" : rel.trust < -50 ? "kalt" : "neutral";
    return `[${tone}] ${this.name} antwortet: ${interaction.payload.message}`;
  }

  private handleTrade(interaction: Interaction): string {
    const { item, amount } = interaction.payload;
    if ((this.inventory[item] || 0) >= amount) {
      this.inventory[item] -= amount;
      this.updateTrust(interaction.senderId, 5);
      this.addMemory(`Erfolgreicher Handel: ${item} an ${interaction.senderId}`, 5);
      interactionLogger.log(interaction, 5);
      return `${this.name} hat ${amount} ${item} transferiert.`;
    }
    this.updateTrust(interaction.senderId, -5);
    interactionLogger.log(interaction, -5);
    return `${this.name} meldet: Unzureichende Ressourcen für ${item}.`;
  }
}
