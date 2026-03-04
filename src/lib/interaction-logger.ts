
'use client';

import { Interaction } from './types';

export interface InteractionLog {
  interaction: Interaction;
  trustDelta: number;
  timestamp: number;
}

class InteractionLogger {
  private logs: InteractionLog[] = [];

  log(interaction: Interaction, trustDelta: number) {
    this.logs.push({
      interaction,
      trustDelta,
      timestamp: Date.now(),
    });
    // Limit log size for performance
    if (this.logs.length > 100) {
      this.logs.shift();
    }
  }

  getLogs(): InteractionLog[] {
    return this.logs;
  }
}

export const interactionLogger = new InteractionLogger();
