
'use server';
/**
 * @fileOverview Ouroboros Local Quest Synthesis
 * Returns deterministic mock quests while Genkit is disabled.
 */

export type GenerateDynamicQuestInput = {
  civilizationIndex: number;
  playerLevel: number;
  availableRegions: string[];
  availableNpcs: string[];
  questType: string;
  currentGameLore: string;
};

export type GenerateDynamicQuestOutput = {
  title: string;
  description: string;
  objectives: string[];
  rewards: string[];
  giverNpc: string;
  region: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'epic';
};

export async function generateDynamicQuest(input: GenerateDynamicQuestInput): Promise<GenerateDynamicQuestOutput> {
  return {
    title: `Local Calibration: ${input.questType}`,
    description: `The simulation requires a manual heartbeat at CI ${input.civilizationIndex}. Current state: ${input.currentGameLore}`,
    objectives: ["Travel to target sector", "Stabilize local logic field"],
    rewards: [`${input.playerLevel * 100} XP`, "10 AXM Energy"],
    giverNpc: input.availableNpcs[0] || "Axiom Core",
    region: input.availableRegions[0] || "Nebula Edge",
    difficulty: 'medium'
  };
}
