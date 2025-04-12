'use server';
import { readFileSync } from 'fs';
/**
 * @fileOverview A flow that answers questions about the website using RAG.
 *
 * - answerQuestionsAboutWebsite - A function that answers questions about the website.
 * - AnswerQuestionsAboutWebsiteInput - The input type for the answerQuestionsAboutWebsite function.
 * - AnswerQuestionsAboutWebsiteOutput - The return type for the answerQuestionsAboutWebsite function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';
import path from 'path';



const AnswerQuestionsAboutWebsiteInputSchema = z.object({
  question: z.string().describe('The question to answer about the website.'),
  websiteContent: z.string().describe('The content of the website to use for answering the question.'),
});
export type AnswerQuestionsAboutWebsiteInput = z.infer<typeof AnswerQuestionsAboutWebsiteInputSchema>;

const AnswerQuestionsAboutWebsiteOutputSchema = z.object({
  answer: z.string().describe('The answer to the question about the website.'),
});
export type AnswerQuestionsAboutWebsiteOutput = z.infer<typeof AnswerQuestionsAboutWebsiteOutputSchema>;

export async function answerQuestionsAboutWebsite(input: AnswerQuestionsAboutWebsiteInput): Promise<AnswerQuestionsAboutWebsiteOutput> {
    const knowledgeBasePath = path.join(process.cwd(), 'src/data/knowledge-base.txt');
    const knowledgeBaseContent = readFileSync(knowledgeBasePath, 'utf-8');
    return answerQuestionsAboutWebsiteFlow({
        ...input,
        websiteContent: `${knowledgeBaseContent} ${input.websiteContent}`,
    });
}

const prompt = ai.definePrompt({
  name: 'answerQuestionsAboutWebsitePrompt',
  input: {
    schema: z.object({
      question: z.string().describe('The question to answer about the website.'),
      websiteContent: z.string().describe('The content of the website to use for answering the question.'),
    }),
  },
  output: {
    schema: z.object({
      answer: z.string().describe('The answer to the question about the website.'),
    }),
  },
  prompt: `You are a chatbot answering questions about the content of a website.

  Website Content: {{{websiteContent}}}

  Question: {{{question}}}

  Answer: `,
});

const answerQuestionsAboutWebsiteFlow = ai.defineFlow<
  typeof AnswerQuestionsAboutWebsiteInputSchema,
  typeof AnswerQuestionsAboutWebsiteOutputSchema
>(
  {
    name: 'answerQuestionsAboutWebsiteFlow',
    inputSchema: AnswerQuestionsAboutWebsiteInputSchema,
    outputSchema: AnswerQuestionsAboutWebsiteOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
