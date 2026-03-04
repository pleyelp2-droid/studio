
'use client';

import { useEffect, useRef } from 'react';
import { useStore } from '@/store';
import { InteractionManager } from '@/services/InteractionManager';
import { syncAgentsBatch } from '@/services/AgentManager';
import { summarizeNeurologicChoice, RobustnessEngine } from '@/lib/axiomatic-engine';
import { AgentState } from '@/types';

/**
 * WorldEngine / SimulationManager
 * Orchestrates needs, agent decisions, and autonomous interactions.
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

      const interactionManager = new InteractionManager(currentAgents);

      const updatedAgents = currentAgents.map(agent => {
        return RobustnessEngine.wrap(() => {
          if (!agent || agent.npcClass === 'SYSTEM') return agent;

          // 1. Decay Needs
          const needs = {
            hunger: Math.min(100, (agent.needs?.hunger || 0) + 1),
            social: Math.max(0, (agent.needs?.social || 50) - 0.5),
            wealth: agent.needs?.wealth || 50
          };

          // 2. Task Validation
          const tasks = [...(agent.tasks || [])];
          const activeTask = tasks.find(t => t.status === 'active');
          if (activeTask && Math.random() > 0.98) {
            activeTask.status = 'done';
            addLog(`[TASK] ${agent.displayName} completed objective: ${activeTask.goal}`, 'SYSTEM');
          }

          // 3. Heuristic Decision
          const decision = summarizeNeurologicChoice({ ...agent, needs }, [], [], [], []);
          
          // 4. Update Memory (Thoughts)
          const memory = [...(agent.memory || [])];
          const newThought = `Status: ${decision.choice} (${decision.reason})`;
          if (memory[memory.length - 1] !== newThought) {
            memory.push(newThought);
          }

          // 5. Autonomous Interaction (The "Talk" logic from Master Plan)
          if (Math.random() > 0.92 && currentAgents.length > 1) {
            const possibleTargets = currentAgents.filter(a => a.id !== agent.id);
            const target = possibleTargets[Math.floor(Math.random() * possibleTargets.length)];
            
            if (target) {
              const result = interactionManager.processInteraction({
                type: needs.hunger > 60 ? 'trade' : 'talk',
                senderId: agent.id,
                receiverId: target.id
              });
              
              addLog(`${agent.displayName}: ${result}`, 'LOCAL');
              
              // Trust feedback loop
              state.updateTrust(agent.id, target.id, 1);
            }
          }

          return {
            ...agent,
            needs,
            tasks,
            state: decision.choice,
            memory: memory.slice(-5) 
          };
        }, agent, "AgentSimulationTick");
      });

      state.setAgents(updatedAgents);

      // Persistence sync
      if (Math.random() > 0.95) {
        try {
          await syncAgentsBatch(updatedAgents);
        } catch (e) {}
      }

    }, 5000); 

    return cleanup;
  }, [addLog]);

  return null;
};
