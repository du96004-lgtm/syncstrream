'use server';

/**
 * @fileOverview Music suggestion flow that suggests songs based on channel members' listening history.
 *
 * - suggestMusic - A function that suggests music based on listening history.
 * - MusicSuggestionInput - The input type for the suggestMusic function.
 * - MusicSuggestionOutput - The return type for the suggestMusic function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MusicSuggestionInputSchema = z.object({
  channelId: z.string().describe('The ID of the channel.'),
  userTasteSummary: z.string().optional().describe('Summary of the user taste in this channel.'),
  request: z.string().describe('User request for music suggestion, e.g., a specific genre or mood.'),
});
export type MusicSuggestionInput = z.infer<typeof MusicSuggestionInputSchema>;

const MusicSuggestionOutputSchema = z.object({
  suggestion: z.string().describe('A suggested song or artist based on the input.'),
  reason: z.string().describe('The reason for the suggestion.'),
});
export type MusicSuggestionOutput = z.infer<typeof MusicSuggestionOutputSchema>;

export async function suggestMusic(input: MusicSuggestionInput): Promise<MusicSuggestionOutput> {
  return musicSuggestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'musicSuggestionPrompt',
  input: {schema: MusicSuggestionInputSchema},
  output: {schema: MusicSuggestionOutputSchema},
  prompt: `You are a music expert. Suggest a song or artist based on the user's request and the listening history of the channel members.

Channel ID: {{{channelId}}}

User Taste Summary: {{{userTasteSummary}}}

User Request: {{{request}}}

Suggestion:`,
});

const musicSuggestionFlow = ai.defineFlow(
  {
    name: 'musicSuggestionFlow',
    inputSchema: MusicSuggestionInputSchema,
    outputSchema: MusicSuggestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
