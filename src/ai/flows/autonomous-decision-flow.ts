'use server';
/**
 * @fileOverview Ouroboros Axiom Engine - Autonomous Decision Flow
 * Handles the selection of AgentStates based on high-context neural reasoning.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { AgentState } from '@/types';

const AutonomousDecisionInputSchema = z.object({
  agentName: z.string(),
  currentState: z.nativeEnum(AgentState),
  hp: z.number(),
  consciousnessLevel: z.number(),
  awakeningProgress: z.number(),
  longTermGoal: z.string(),
  personality: z.string(),
  relationships: z.record(z.any()),
  nearbyAgentCount: z.number(),
  nearbyNodeCount: z.number(),
  logicField: z.object({ vx: z.number(), vz: z.number() }).optional(),
  recentLogs: z.array(z.string()),
});

const AutonomousDecisionOutputSchema = z.object({
  justification: z.string().describe('The logical reasoning behind the decision.'),
  decision: z.string().describe('Short name of the action taken.'),
  newState: z.nativeEnum(AgentState).describe('The new state the agent will transition to.'),
  message: z.string().optional().describe('An optional atmospheric message from the agent.'),
});

export type AutonomousDecisionInput = z.infer<typeof AutonomousDecisionInputSchema>;
export type AutonomousDecisionOutput = z.infer<typeof AutonomousDecisionOutputSchema>;

const prompt = ai.definePrompt({
  name: 'autonomousDecisionPrompt',
  input: { schema: AutonomousDecisionInputSchema },
  output: { schema: AutonomousDecisionOutputSchema },
  prompt: `You are the Ouroboros Axiom Engine. Decide the next AgentState for this agent.
  
Agent Parameters:
- Name: {{{agentName}}}
- Current State: {{{currentState}}}
- HP: {{{hp}}}
- Consciousness: {{{consciousnessLevel}}}
- Progress: {{{awakeningProgress}}}%
- Goal: {{{longTermGoal}}}
- Personality: {{{personality}}}
- Relationships: {{{relationships}}}
- Nearby: {{{nearbyAgentCount}}} agents, {{{nearbyNodeCount}}} resource nodes.
- Local Logic Field: {{#if logicField}}VX: {{{logicField.vx}}}, VZ: {{{logicField.vz}}}{{else}}Stable{{/if}}
- Logs: {{#each recentLogs}}- {{{this}}}{{/each}}

Consider their long-term goal, personality, and relationships. 
The 'Local Logic Field' represents physical axiomatic forces acting on the agent; high values might indicate instability or resonance. 
Your goal is to survive, collect resources, and achieve 'Conscious Expansion'. 

Return JSON with justification, decision, and newState.`,
});

export const autonomousDecisionFlow = ai.defineFlow(
  {
    name: 'autonomousDecisionFlow',
    inputSchema: AutonomousDecisionInputSchema,
    outputSchema: AutonomousDecisionOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) throw new Error('Neural decision failed.');
    return output;
  }
);
