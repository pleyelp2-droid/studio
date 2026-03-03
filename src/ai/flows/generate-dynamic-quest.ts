'use server';
/**
 * @fileOverview A Genkit flow for dynamically generating quests based on game parameters.
 *
 * - generateDynamicQuest - A function that handles the dynamic quest generation process.
 * - GenerateDynamicQuestInput - The input type for the generateDynamicQuest function.
 * - GenerateDynamicQuestOutput - The return type for the generateDynamicQuest function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateDynamicQuestInputSchema = z.object({
  civilizationIndex: z
    .number()
    .describe(
      'The current civilization index of the game world, influencing quest complexity and theme.'
    ),
  playerLevel: z
    .number()
    .describe('The average player level, used to tailor quest difficulty.'),
  availableRegions: z
    .array(z.string())
    .describe('A list of available regions where quests can be set.'),
  availableNpcs: z
    .array(z.string())
    .describe('A list of available NPCs who can give quests.'),
  questType: z
    .string()
    .describe(
      'The desired type of quest (e.g., "fetch", "combat", "exploration", "puzzle", "story", "escort").'
    ),
  currentGameLore: z
    .string()
    .describe(
      'A summary of the current game state and lore to ensure quests are coherent and relevant.'
    ),
});
export type GenerateDynamicQuestInput = z.infer<
  typeof GenerateDynamicQuestInputSchema
>;

const GenerateDynamicQuestOutputSchema = z.object({
  title: z.string().describe('The title of the generated quest.'),
  description: z.string().describe('A detailed description of the quest.'),
  objectives: z
    .array(z.string())
    .describe('A list of objectives the player must complete.'),
  rewards: z.array(z.string()).describe('A list of rewards for completing the quest.'),
  giverNpc: z.string().describe('The name of the NPC who gives this quest.'),
  region: z.string().describe('The region where this quest primarily takes place.'),
  difficulty: z
    .enum(['easy', 'medium', 'hard', 'epic'])
    .describe('The estimated difficulty of the quest.'),
});
export type GenerateDynamicQuestOutput = z.infer<
  typeof GenerateDynamicQuestOutputSchema
>;

export async function generateDynamicQuest(
  input: GenerateDynamicQuestInput
): Promise<GenerateDynamicQuestOutput> {
  return generateDynamicQuestFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDynamicQuestPrompt',
  input: {schema: GenerateDynamicQuestInputSchema},
  output: {schema: GenerateDynamicQuestOutputSchema},
  prompt: `You are a Grand Game Master for an MMORPG called Axiom Frontier.
Your task is to generate a new, engaging quest based on the provided game parameters.
Ensure the quest is coherent with the current game lore and suitable for the player's level.

Game Parameters:
- Civilization Index: {{{civilizationIndex}}}
- Player Level: {{{playerLevel}}}
- Available Regions: {{#each availableRegions}}- {{{this}}}{{/each}}
- Available NPCs: {{#each availableNpcs}}- {{{this}}}{{/each}}
- Desired Quest Type: {{{questType}}}
- Current Game Lore Summary: {{{currentGameLore}}}

Generate a quest with a captivating title, a detailed description, clear objectives, suitable rewards, a quest-giver NPC from the available list, a primary region from the available list, and an appropriate difficulty. The NPC and region must be chosen from the provided lists.`,
});

const generateDynamicQuestFlow = ai.defineFlow(
  {
    name: 'generateDynamicQuestFlow',
    inputSchema: GenerateDynamicQuestInputSchema,
    outputSchema: GenerateDynamicQuestOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('Failed to generate quest.');
    }
    return output;
  }
);
