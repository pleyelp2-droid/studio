'use client';

import { useEffect, useRef } from 'react';
import { useStore } from '@/store';
import { InteractionManager } from '@/services/InteractionManager';
import { WorldController } from '@/lib/world-controller';
import { syncAgentsBatch } from '@/services/AgentManager';

/**
 * WorldEngine / SimulationManager
 * Orchestriert den WorldController und autonome Interaktionen.
 */
export const SimulationManager = () => {
  const addLog = useStore(state => state.addLog);
  const tickIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const cleanup = () => {
      if (tickIntervalRef.current) clearInterval(tickIntervalRef.current);
    };

    cleanup();

    tickIntervalRef.current = setInterval(async () => {
      const state = useStore.getState();
      const currentAgents = state.agents;
      
      if (currentAgents.length === 0) return;

      // 1. Initialisiere WorldController & InteractionManager
      const worldController = new WorldController(currentAgents);
      const interactionManager = new InteractionManager(currentAgents);

      // 2. Berechne den nächsten Welt-Tick
      const updatedAgents = worldController.tick();

      // 3. Autonome Interaktionen triggern (Zufällig)
      updatedAgents.forEach(agent => {
        if (Math.random() > 0.92 && updatedAgents.length > 1) {
          const possibleTargets = updatedAgents.filter(a => a.id !== agent.id);
          const target = possibleTargets[Math.floor(Math.random() * possibleTargets.length)];
          
          if (target) {
            const dialogue = interactionManager.processInteraction({
              type: agent.needs.hunger > 60 ? 'trade' : 'talk',
              senderId: agent.id,
              receiverId: target.id
            });
            
            addLog(`${agent.displayName}: ${dialogue}`, 'LOCAL');
            state.updateTrust(agent.id, target.id, 1);
          }
        }
      });

      // 4. State aktualisieren
      state.setAgents(updatedAgents);

      // 5. Persistenz-Sync (Gelegentlich)
      if (Math.random() > 0.98) {
        try {
          await syncAgentsBatch(updatedAgents);
        } catch (e) {}
      }

    }, 5000); 

    return cleanup;
  }, [addLog]);

  return null;
};
