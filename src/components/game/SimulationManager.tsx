'use client';

import { useEffect, useRef } from 'react';
import { useStore } from '@/store';
import { AIService } from '@/services/AIService';
import { syncAgentsBatch } from '@/services/AgentManager';
import { summarizeNeurologicChoice, generateDialogue } from '@/lib/axiomatic-engine';

/**
 * WorldEngine / SimulationManager (Master Plan)
 * Zentraler Ticker, der Bedürfnisse und Agenten-Entscheidungen steuert.
 */
export const SimulationManager = () => {
  const addLog = useStore(state => state.addLog);
  const tickIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const cleanup = () => {
      if (tickIntervalRef.current) clearInterval(tickIntervalRef.current);
    };

    cleanup();

    // Zentraler Tick-Loop (Master Plan)
    tickIntervalRef.current = setInterval(async () => {
      const state = useStore.getState();
      const updatedAgents = state.agents.map(agent => {
        if (!agent || agent.npcClass === 'SYSTEM') return agent;

        // 1. Bedürfnisse verfallen lassen (Hunger steigt, Social sinkt)
        const needs = {
          hunger: Math.min(100, (agent.needs?.hunger || 0) + 1),
          social: Math.max(0, (agent.needs?.social || 50) - 0.5),
          wealth: agent.needs?.wealth || 50
        };

        // 2. Heuristische Entscheidung treffen
        const decision = summarizeNeurologicChoice({ ...agent, needs }, [], [], [], []);
        
        // 3. Gedanken aktualisieren (Master Plan)
        const memory = [...(agent.memory || [])];
        const newThought = `Status: ${decision.choice} (Grund: ${decision.reason})`;
        if (memory[memory.length - 1] !== newThought) {
          memory.push(newThought);
        }

        // 4. Gelegentliche Kommunikation (Master Plan)
        if (Math.random() > 0.95 && state.agents.length > 1) {
          const target = state.agents.find(a => a.id !== agent.id);
          if (target) {
            const chat = generateDialogue(agent, target, needs.hunger > 50 ? 'trade' : 'social');
            addLog(`[CHAT] ${agent.displayName} -> ${target.displayName}: ${chat}`, 'LOCAL');
          }
        }

        return {
          ...agent,
          needs,
          state: decision.choice,
          memory: memory.slice(-10) // Nur die letzten 10 Gedanken behalten
        };
      });

      // 5. State in den Store schreiben
      state.setAgents(updatedAgents);

      // Alle 100 Ticks: Firestore Persistenz
      if (Math.random() > 0.9) {
        try {
          await syncAgentsBatch(updatedAgents);
        } catch (e) {}
      }

    }, 5000); // 5s Tick Intervall für die Simulation

    return cleanup;
  }, [addLog]);

  return null;
};
