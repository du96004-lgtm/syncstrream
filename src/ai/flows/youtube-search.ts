'use server';

/**
 * @fileOverview A flow for searching YouTube videos.
 *
 * - youtubeSearch - A function that searches for YouTube videos based on a query.
 * - YouTubeSearchInput - The input type for the youtubeSearch function.
 * - YouTubeSearchOutput - The return type for the youtubeSearch function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const YouTubeVideoSchema = z.object({
  videoId: z.string().describe('The YouTube video ID.'),
  title: z.string().describe('The title of the YouTube video.'),
  thumbnail: z.string().describe('The URL of the video thumbnail.'),
  duration: z.string().describe('The duration of the video in MM:SS format.'),
});

const YouTubeSearchInputSchema = z.object({
  query: z.string().describe('The search query for YouTube videos.'),
});
export type YouTubeSearchInput = z.infer<typeof YouTubeSearchInputSchema>;

const YouTubeSearchOutputSchema = z.object({
  videos: z.array(YouTubeVideoSchema).describe('A list of YouTube video suggestions.'),
});
export type YouTubeSearchOutput = z.infer<typeof YouTubeSearchOutputSchema>;

export async function youtubeSearch(input: YouTubeSearchInput): Promise<YouTubeSearchOutput> {
  return youtubeSearchFlow(input);
}

const prompt = ai.definePrompt({
  name: 'youtubeSearchPrompt',
  input: { schema: YouTubeSearchInputSchema },
  output: { schema: YouTubeSearchOutputSchema },
  prompt: `You are a YouTube music search expert. Given a search query, find 5 relevant music videos on YouTube.

Search Query: {{{query}}}

Return the video ID, title, thumbnail URL (use the format https://i.ytimg.com/vi/<VIDEO_ID>/hqdefault.jpg), and duration for each video.`,
});


const youtubeSearchFlow = ai.defineFlow(
  {
    name: 'youtubeSearchFlow',
    inputSchema: YouTubeSearchInputSchema,
    outputSchema: YouTubeSearchOutputSchema,
  },
  async (input) => {
    if (!input.query) {
      return { videos: [] };
    }
    const { output } = await prompt(input);
    return output!;
  }
);
