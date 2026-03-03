'use server';
/**
 * @fileOverview Ouroboros Deep Debugger
 * Analyzes project context and logs to identify architectural corruption.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ProjectDiagnosticsInputSchema = z.object({
  context: z.string(),
  errorLog: z.string().optional(),
});

const ProjectDiagnosticsOutputSchema = z.object({
  status: z.enum(['HEALTHY', 'WARNING', 'CRITICAL']),
  summary: z.string(),
  issues: z.array(z.object({
    severity: z.enum(['LOW', 'MEDIUM', 'HIGH']),
    description: z.string(),
    suggestedFix: z.string(),
    file: z.string().optional(),
  })),
  recoverySteps: z.array(z.string()),
});

export type ProjectDiagnosticsOutput = z.infer<typeof ProjectDiagnosticsOutputSchema>;

const prompt = ai.definePrompt({
  name: 'projectDiagnosticsPrompt',
  input: { schema: ProjectDiagnosticsInputSchema },
  output: { schema: ProjectDiagnosticsOutputSchema },
  prompt: `You are the Ouroboros Deep Debugger. 
Analyze the project context and logs to identify architectural flaws, migration errors, and logic bugs.

Project Context:
{{{context}}}

Error Logs:
{{{errorLog}}}

Identify specific issues related to:
1. Environment variables (GEMINI_API_KEY, etc.)
2. Dependency mismatches.
3. Matrix corruption (logic errors in state or agent behavior).
4. Build or runtime errors.

Return a structured JSON diagnostic report.`,
});

export const projectDiagnosticsFlow = ai.defineFlow(
  {
    name: 'projectDiagnosticsFlow',
    inputSchema: ProjectDiagnosticsInputSchema,
    outputSchema: ProjectDiagnosticsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) throw new Error('Diagnostic scan interrupted.');
    return output;
  }
);
