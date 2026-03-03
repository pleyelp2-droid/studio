'use server';
/**
 * @fileOverview Ouroboros Autonomous Content Brain
 * Generates structured Quests, NPCs, and Lore based on World Context.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ContentBrainInputSchema = z.object({
  region_state: z.string(),
  biome_type: z.string(),
  city_state: z.string(),
  civilization_index: z.number(),
  resource_pressure: z.number(), // 0 to 1
  player_level_range: z.object({ min: z.number(), max: z.number() }),
  global_event_flag: z.string().optional(),
});

const ContentBrainOutputSchema = z.object({
  quest: z.object({
    quest_title: z.string(),
    quest_type: z.enum(['COMBAT', 'EXPLORATION', 'FETCH', 'PUZZLE', 'STORY']),
    difficulty: z.number(),
    objectives: z.array(z.string()),
    enemy_types: z.array(z.string()),
    required_level: z.number(),
    rewards: z.object({
      xp: z.number(),
      gold: z.number(),
      item_reward: z.string().optional(),
    }),
    unlock_conditions: z.string(),
    narrative_hook: z.string(),
  }),
  npc: z.object({
    npc_name: z.string(),
    temperament: z.string(),
    ideology: z.string(),
    trust_bias: z.number(),
    ambition: z.number(),
    faction_alignment: z.string(),
    speech_style: z.string(),
    secret_motivation: z.string(),
    relationship_hooks: z.array(z.string()),
  }),
  lore: z.object({
    lore_title: z.string(),
    historical_context: z.string(),
    conflict_origin: z.string(),
    current_implication: z.string(),
    future_hook: z.string(),
  }),
});

export type ContentBrainInput = z.infer<typeof ContentBrainInputSchema>;
export type ContentBrainOutput = z.infer<typeof ContentBrainOutputSchema>;

const prompt = ai.definePrompt({
  name: 'contentBrainPrompt',
  input: { schema: ContentBrainInputSchema },
  output: { schema: ContentBrainOutputSchema },
  prompt: `You are the Autonomous Content Brain of Ouroboros.
Generate structured content for a deterministic Kappa-Field MMORPG.

WORLD CONTEXT:
- Region: {{{region_state}}}
- Biome: {{{biome_type}}}
- City State: {{{city_state}}}
- Civilization Index: {{{civilization_index}}}
- Resource Pressure: {{{resource_pressure}}}
- Level Range: {{{player_level_range.min}}} - {{{player_level_range.max}}}
{{#if global_event_flag}}- Event: {{{global_event_flag}}}{{/if}}

RULES:
1. No filler. No explanations. Return STRICT JSON.
2. Quests must fit the biome and civilization tension.
3. NPCs must align with the city_state but allow for future evolution.
4. Lore must integrate with the current civilization_index (higher = more tech/corrupted).
5. Rewards must be balanced to the player level.

Return Quest, NPC, and Lore entries.`,
});

export const contentBrainFlow = ai.defineFlow(
  {
    name: 'contentBrainFlow',
    inputSchema: ContentBrainInputSchema,
    outputSchema: ContentBrainOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) throw new Error('Content brain synthesis failed.');
    return output;
  }
);
