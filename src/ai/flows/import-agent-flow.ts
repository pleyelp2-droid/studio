'use server';
/**
 * @fileOverview Ouroboros Entity Manifestation Engine
 * Extracts and maps character details from external sources to the Agent structure.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ImportAgentInputSchema = z.object({
  source: z.string().describe('URL or JSON string containing character data.'),
  type: z.enum(['URL', 'JSON']),
});

const ImportAgentOutputSchema = z.object({
  name: z.string(),
  faction: z.string(),
  loreSnippet: z.string(),
  thinkingMatrix: z.object({
    personality: z.string(),
    currentLongTermGoal: z.string(),
    sociability: z.number(),
    aggression: z.number(),
    curiosity: z.number(),
    frugality: z.number(),
  }),
  stats: z.object({
    str: z.number(),
    agi: z.number(),
    int: z.number(),
    vit: z.number(),
  }),
});

export type ImportAgentOutput = z.infer<typeof ImportAgentOutputSchema>;

const prompt = ai.definePrompt({
  name: 'importAgentPrompt',
  input: { schema: ImportAgentInputSchema },
  output: { schema: ImportAgentOutputSchema },
  prompt: `You are the Ouroboros Entity Manifestation Engine. 
Your task is to extract or parse character details from the source and map them to the Ouroboros Agent structure.

Source ({{{type}}}):
{{{source}}}

If the source is a JanitorAI or Character.ai link, extract the character's name, personality, and background.
Map their traits to Ouroboros stats (STR, AGI, INT, VIT).

Fields to extract:
- Name
- Faction: 'PLAYER' | 'ANOMALY' | 'CREATURE' | 'SYSTEM' | 'NPC'
- Lore Snippet: A short background history.
- Thinking Matrix: personality, currentLongTermGoal, and traits (0-1 scale).
- Stats: str, agi, int, vit (1-100 scale).`,
});

export const importAgentFlow = ai.defineFlow(
  {
    name: 'importAgentFlow',
    inputSchema: ImportAgentInputSchema,
    outputSchema: ImportAgentOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) throw new Error('Entity manifestation failed.');
    return output;
  }
);
