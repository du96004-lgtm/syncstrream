'use server';

import { google } from 'googleapis';

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

const youtube = google.youtube({
  version: 'v3',
  auth: YOUTUBE_API_KEY,
});

export async function searchYoutubeVideos(query: string) {
    if (!YOUTUBE_API_KEY) {
        throw new Error('YouTube API key is not configured.');
    }
    
    const response = await youtube.search.list({
        part: ['snippet'],
        q: query,
        type: ['video'],
        maxResults: 5,
        videoCategoryId: '10', // Music
      });

    if (!response.data.items) {
        return [];
    }

    const videoIds = response.data.items.map(item => item.id?.videoId).filter((id): id is string => !!id);

    const videoDetailsResponse = await youtube.videos.list({
        part: ['contentDetails', 'snippet'],
        id: videoIds,
    });
    
    return videoDetailsResponse.data.items?.map(item => ({
        videoId: item.id!,
        title: item.snippet!.title!,
        thumbnail: item.snippet!.thumbnails!.high!.url!,
        duration: item.contentDetails!.duration!,
    })) || [];
}

export async function getVideoDetails(videoUrl: string) {
    if (!YOUTUBE_API_KEY) {
        console.warn('YouTube API key is not configured. Cannot fetch video details.');
        return null;
    }
    
    const YOUTUBE_REGEX = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

    const videoIdMatch = videoUrl.match(YOUTUBE_REGEX);
    const videoId = videoIdMatch ? videoIdMatch[1] : null;

    if (!videoId) {
        return null;
    }

    try {
        const response = await youtube.videos.list({
            part: ['snippet'],
            id: [videoId],
        });

        if (response.data.items && response.data.items.length > 0) {
            const item = response.data.items[0];
            return {
                title: item.snippet?.title || videoUrl,
            };
        }
        return null;
    } catch (error) {
        console.error('Error fetching video details from YouTube:', error);
        return null;
    }
}
