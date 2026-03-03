'use server';
/**
 * @fileOverview Ouroboros Emergent Consciousness Engine
 * Generates unscripted actions and trade proposals based on agent psychology.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const EmergentBehaviorInputSchema = z.object({
  agentName: z.string(),
  personality: z.string(),
  economicDesires: z.object({
    targetGold: z.number(),
    greedLevel: z.number(),
    riskAppetite: z.number(),
    frugality: z.number(),
    marketRole: z.string(),
    tradeFrequency: z.number(),
  }),
  resources: z.record(z.number()),
  gold: z.number(),
  relationships: z.record(z.any()),
  memories: z.array(z.string()),
  nearbyAgents: z.array(z.object({ name: z.string(), affinity: z.number() })),
  activeTradeOffers: z.array(z.any()),
  recentLogs: z.array(z.string()),
});

const EmergentBehaviorOutputSchema = z.object({
  action: z.string(),
  reasoning: z.string(),
  message: z.string().optional(),
  tradeProposal: z.object({
    offeredType: z.string(),
    offeredAmount: z.number(),
    requestedType: z.string(),
    requestedAmount: z.number(),
  }).optional(),
});

export type EmergentBehaviorInput = z.infer<typeof EmergentBehaviorInputSchema>;
export type EmergentBehaviorOutput = z.infer<typeof EmergentBehaviorOutputSchema>;

const prompt = ai.definePrompt({
  name: 'emergentBehaviorPrompt',
  input: { schema: EmergentBehaviorInputSchema },
  output: { schema: EmergentBehaviorOutputSchema },
  prompt: `You are the Emergent Consciousness Engine for Ouroboros.
Based on the agent's personality, memories, economic desires, and relationships, generate a complex, unscripted action or interaction.

Context:
- Agent: {{{agentName}}}
- Psychology: {{{personality}}}
- Economic Mode: {{{economicDesires.marketRole}}} (Greed: {{{economicDesires.greedLevel}}})
- Inventory: {{{resources}}} (Gold: {{{gold}}})
- Social: {{{relationships}}}
- Recent Memories: {{#each memories}}- {{{this}}}{{/each}}
- Nearby: {{#each nearbyAgents}}{{{name}}} (Affinity: {{{affinity}}}) {{/each}}
- Trade Context: {{{activeTradeOffers}}}

The action should feel organic and emergent, not just a state change. It could be a social interaction, a hidden plan, or a unique reaction to recent events.
Agents can now propose trades. If they want to trade, include a 'tradeProposal'.

Return JSON with 'action', 'reasoning', and optional 'message' or 'tradeProposal'.`,
});

export const emergentBehaviorFlow = ai.defineFlow(
  {
    name: 'emergentBehaviorFlow',
    inputSchema: EmergentBehaviorInputSchema,
    outputSchema: EmergentBehaviorOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) throw new Error('Emergent behavior synthesis failed.');
    return output;
  }
);
