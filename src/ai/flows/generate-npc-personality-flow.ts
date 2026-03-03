'use server';
/**
 * @fileOverview A Genkit flow for generating unique NPC personalities and backstories.
 *
 * - generateNpcPersonality - A function that handles the NPC personality generation process.
 * - GenerateNpcPersonalityInput - The input type for the generateNpcPersonality function.
 * - GenerateNpcPersonalityOutput - The return type for the generateNpcPersonality function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateNpcPersonalityInputSchema = z.object({
  npcName: z.string().optional().describe('The name of the NPC, if known. If not provided, the AI should suggest one.'),
  gameWorldSetting: z.string().describe('A detailed description of the game world setting (e.g., "a medieval fantasy realm", "a dystopian cyberpunk city", "a bustling space station").'),
  role: z.string().describe('The primary role or occupation of the NPC within the game world (e.g., "village elder", "barkeep", "rebel leader", "data broker").'),
  additionalContext: z.string().optional().describe('Any additional specific context or requirements for the NPC (e.g., "must be suspicious of outsiders", "has a hidden magical ability").'),
});
export type GenerateNpcPersonalityInput = z.infer<typeof GenerateNpcPersonalityInputSchema>;

const GenerateNpcPersonalityOutputSchema = z.object({
  name: z.string().describe('The generated or confirmed name of the NPC.'),
  personalityTraits: z.array(z.string()).describe('A list of distinct personality traits for the NPC.'),
  backstory: z.string().describe('A detailed backstory explaining the NPC\'s past, experiences, and how they came to their current role.'),
  motivations: z.array(z.string()).describe('A list of the NPC\'s core motivations and goals.'),
  quirks: z.array(z.string()).optional().describe('Optional: A list of unique habits, mannerisms, or peculiarities that make the NPC memorable.'),
});
export type GenerateNpcPersonalityOutput = z.infer<typeof GenerateNpcPersonalityOutputSchema>;

export async function generateNpcPersonality(input: GenerateNpcPersonalityInput): Promise<GenerateNpcPersonalityOutput> {
  return generateNpcPersonalityFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateNpcPersonalityPrompt',
  input: { schema: GenerateNpcPersonalityInputSchema },
  output: { schema: GenerateNpcPersonalityOutputSchema },
  prompt: `You are an expert game master and narrative designer, skilled at creating compelling and immersive non-player characters (NPCs) for video games.\nYour task is to generate a unique NPC personality, backstory, and motivations based on the provided game world setting and role.\n\nGame World Setting: {{{gameWorldSetting}}}\nNPC Role: {{{role}}}\n{{#if npcName}}NPC Name (if provided): {{{npcName}}}{{/if}}\n{{#if additionalContext}}Additional Context/Requirements: {{{additionalContext}}}{{/if}}\n\nPlease create a detailed profile for this NPC, ensuring they have:\n1.  A compelling name (if not provided, generate one that fits the setting).\n2.  At least 3 distinct personality traits.\n3.  A rich backstory that explains their current situation and influences their personality.\n4.  At least 2 clear motivations or goals that drive their actions.\n5.  Optionally, some unique quirks or mannerisms.\n\nEnsure the output is in the specified JSON format.`,
});

const generateNpcPersonalityFlow = ai.defineFlow(
  {
    name: 'generateNpcPersonalityFlow',
    inputSchema: GenerateNpcPersonalityInputSchema,
    outputSchema: GenerateNpcPersonalityOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('Failed to generate NPC personality.');
    }
    return output;
  }
);
