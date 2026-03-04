'use client';

export interface Memory {
  event: string;
  timestamp: number;
  trustDelta: number;
}

export interface Relationship {
  targetId: string;
  trust: number;
  type: 'family' | 'friend' | 'neutral' | 'enemy';
}

export interface Task {
  id: string;
  goal: string;
  status: 'pending' | 'active' | 'done';
}

export interface EquipSlot {
  slot: 'head' | 'chest' | 'legs';
  itemId: string | null;
}

export interface SocialGroup {
  id: string;
  name: string;
  type: 'guild' | 'kingdom';
  members: string[];
}

export type InteractionType = 'talk' | 'trade' | 'proposeGroup';

export interface Interaction {
  type: InteractionType;
  senderId: string;
  receiverId: string;
  payload: any;
}
