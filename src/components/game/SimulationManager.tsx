'use client';

import { useEffect, useRef } from 'react';
import { useStore } from '@/store';
import { AIService } from '@/services/AIService';
import { syncAgentsBatch } from '@/services/AgentManager';

/**
 * Handles background simulation loops like emergent behavior and persistence.
 * Uses stable references to prevent memory leaks and interval multiplication.
 */
export const SimulationManager = () => {
  const addLog = useStore(state => state.addLog);
  const socialIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const emergentIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Initial cleanup to be double sure
    const cleanup = () => {
      if (socialIntervalRef.current) clearInterval(socialIntervalRef.current);
      if (emergentIntervalRef.current) clearInterval(emergentIntervalRef.current);
      if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);
    };

    cleanup();

    // Neural Resonance Loop
    socialIntervalRef.current = setInterval(() => {
      const state = useStore.getState();
      const activeAgents = state.agents.filter(a => a && a.hp > 0);
      if (activeAgents.length > 1) {
        const a1 = activeAgents[Math.floor(Math.random() * activeAgents.length)];
        const a2 = activeAgents.find(a => a && a.id !== a1.id);
        if (a2) {
          addLog(`Neural Resonance: ${a1.displayName} acknowledge ${a2.displayName}.`, 'SYSTEM');
        }
      }
    }, 30000); // 30s

    // Emergent Behavior Loop
    emergentIntervalRef.current = setInterval(async () => {
      const state = useStore.getState();
      const activeAgents = state.agents.filter(a => a && a.npcClass !== 'SYSTEM');
      
      if (activeAgents.length > 0) {
        const agent = activeAgents[Math.floor(Math.random() * activeAgents.length)];
        try {
          const behavior = await AIService.generateEmergentAction(agent, activeAgents, []);
          addLog(`[EMERGENT] ${agent.displayName}: ${behavior.action}`, 'SYSTEM');
        } catch (e) {
          console.warn('[SIM_MANAGER] Emergent action failed', e);
        }
      }
    }, 60000); // 60s

    // Persistence Sync Loop
    syncIntervalRef.current = setInterval(async () => {
      const state = useStore.getState();
      if (state.agents.length > 0) {
        try {
          await syncAgentsBatch(state.agents.filter(a => !!a));
          addLog('Deterministic state committed to neural ledger.', 'SYSTEM');
        } catch (e) {
          console.error('[SIM_MANAGER] Sync failed', e);
        }
      }
    }, 120000); // 120s

    return cleanup;
  }, [addLog]);

  return null;
};