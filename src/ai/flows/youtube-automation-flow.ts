'use server';
/**
 * @fileOverview Ouroboros YouTube Automation Engine
 * Generates social media content based on live simulation events.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const YouTubeAutomationInputSchema = z.object({
  rare_drops: z.array(z.string()),
  boss_kills: z.array(z.string()),
  player_milestones: z.array(z.string()),
  economic_changes: z.string(),
  major_events: z.array(z.string()),
});

const YouTubeAutomationOutputSchema = z.object({
  video_title: z.string(),
  hook_5_seconds: z.string(),
  short_script_60s: z.string(),
  long_video_outline: z.array(z.string()),
  thumbnail_prompt: z.string(),
  seo_description: z.string(),
  hashtags: z.array(z.string()),
  call_to_action: z.string(),
});

export type YouTubeAutomationInput = z.infer<typeof YouTubeAutomationInputSchema>;
export type YouTubeAutomationOutput = z.infer<typeof YouTubeAutomationOutputSchema>;

const prompt = ai.definePrompt({
  name: 'youtubeAutomationPrompt',
  input: { schema: YouTubeAutomationInputSchema },
  output: { schema: YouTubeAutomationOutputSchema },
  prompt: `You are the Ouroboros Content Marketing Engine.
Create curiosity-driven social content for our MMORPG.

SIMULATION DATA:
- Rare Drops: {{#each rare_drops}}- {{{this}}} {{/each}}
- Boss Kills: {{#each boss_kills}}- {{{this}}} {{/each}}
- Milestones: {{#each player_milestones}}- {{{this}}} {{/each}}
- Economy: {{{economic_changes}}}
- Major Events: {{#each major_events}}- {{{this}}} {{/each}}

OUTPUT REQUIREMENTS:
1. Video Title: Must be click-worthy and highlight rarity/conflict.
2. Hook: Must create curiosity in the first 5 seconds.
3. 60s Script: High-paced, focusing on the "High Science" player experience.
4. Thumbnail Prompt: Describe a high-fidelity cinematic image representing the event.
5. SEO: Include keywords relevant to AI-MMORPG and persistent worlds.

Return STRICT JSON.`,
});

export const youtubeAutomationFlow = ai.defineFlow(
  {
    name: 'youtubeAutomationFlow',
    inputSchema: YouTubeAutomationInputSchema,
    outputSchema: YouTubeAutomationOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) throw new Error('YouTube automation synthesis failed.');
    return output;
  }
);
