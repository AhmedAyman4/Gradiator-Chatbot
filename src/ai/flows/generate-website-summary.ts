// This is an autogenerated file from Firebase Studio.
'use server';

/**
 * @fileOverview A flow that generates a concise summary of a website's content.
 *
 * - generateWebsiteSummary - A function that triggers the website summary generation flow.
 * - GenerateWebsiteSummaryInput - The input type for the generateWebsiteSummary function.
 * - GenerateWebsiteSummaryOutput - The return type for the generateWebsiteSummary function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const GenerateWebsiteSummaryInputSchema = z.object({
  websiteContent: z.string().describe('The complete content of the website.'),
});
export type GenerateWebsiteSummaryInput = z.infer<typeof GenerateWebsiteSummaryInputSchema>;

const GenerateWebsiteSummaryOutputSchema = z.object({
  websiteSummary: z.string().describe('A concise summary of the website content.'),
});
export type GenerateWebsiteSummaryOutput = z.infer<typeof GenerateWebsiteSummaryOutputSchema>;

export async function generateWebsiteSummary(input: GenerateWebsiteSummaryInput): Promise<GenerateWebsiteSummaryOutput> {
  return generateWebsiteSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateWebsiteSummaryPrompt',
  input: {
    schema: z.object({
      websiteContent: z.string().describe('The complete content of the website.'),
    }),
  },
  output: {
    schema: z.object({
      websiteSummary: z.string().describe('A concise summary of the website content.'),
    }),
  },
  prompt: `You are an expert summarizer. Please provide a concise summary of the following website content:

  Website Content:
  {{websiteContent}}
  `,
});

const generateWebsiteSummaryFlow = ai.defineFlow<
  typeof GenerateWebsiteSummaryInputSchema,
  typeof GenerateWebsiteSummaryOutputSchema
>({
  name: 'generateWebsiteSummaryFlow',
  inputSchema: GenerateWebsiteSummaryInputSchema,
  outputSchema: GenerateWebsiteSummaryOutputSchema,
},
async input => {
  const {output} = await prompt(input);
  return output!;
});
