
'use client';
/**
 * @fileOverview foundational Agent class for Ouroboros logic.
 */

import { AgentState, ThinkingMatrix, AgentNeeds } from '@/types';

export class Agent {
  id: string;
  displayName: string;
  inventory: Record<string, number> = {};
  needs: AgentNeeds = { hunger: 0, social: 50, wealth: 50 };
  state: AgentState = AgentState.IDLE;
  memory: string[] = [];
  relationships: Map<string, any> = new Map();

  constructor(id: string, name: string) {
    this.id = id;
    this.displayName = name;
  }

  // Implementation of the "Ultimate Solution" logic
  updateNeeds(delta: number) {
    this.needs.hunger = Math.min(100, this.needs.hunger + delta);
    this.needs.social = Math.max(0, this.needs.social - delta * 0.5);
  }
}
