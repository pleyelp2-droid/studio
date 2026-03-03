
'use client';

import { useEffect } from 'react';
import { useStore } from '@/store';
import { AIService } from '@/services/AIService';
import { syncAgentsBatch } from '@/services/AgentManager';
import { useFirestore } from '@/firebase';
import { collection, query, limit, getDocs } from 'firebase/firestore';

export const SimulationManager = () => {
  const db = useFirestore();
  const { agents, addLog, userApiKey } = useStore();

  // Social Interaction Loop (Every 15s)
  useEffect(() => {
    const interval = setInterval(() => {
      const activeAgents = agents.filter(a => a.hp > 0);
      if (activeAgents.length > 1) {
        const a1 = activeAgents[Math.floor(Math.random() * activeAgents.length)];
        const a2 = activeAgents.find(a => a.id !== a1.id);
        if (a2) {
          addLog(`Neural Resonance: ${a1.displayName} acknowledge ${a2.displayName}.`, 'SYSTEM');
        }
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [agents, addLog]);

  // Emergent Behavior Loop (Every 30s)
  useEffect(() => {
    const interval = setInterval(async () => {
      if (!userApiKey) return;
      
      const activeAgents = agents.filter(a => a.npcClass !== 'SYSTEM');
      if (activeAgents.length > 0) {
        const agent = activeAgents[Math.floor(Math.random() * activeAgents.length)];
        try {
          const behavior = await AIService.generateEmergentAction(agent, activeAgents, []);
          addLog(`[EMERGENT] ${agent.displayName}: ${behavior.action}`, 'SYSTEM');
        } catch (e) {
          console.error('Emergent behavior fail', e);
        }
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [agents, addLog, userApiKey]);

  // World Events & Periodic Sync (Every 60s)
  useEffect(() => {
    const interval = setInterval(async () => {
      if (agents.length > 0) {
        await syncAgentsBatch(agents);
        addLog('Deterministic state committed to neural ledger.', 'SYSTEM');
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [agents, addLog]);

  return null; // Headless component
};
