import type { Timestamp } from 'firebase/firestore';

export interface UserProfile {
  id: string;
  displayName: string;
  avatarSeed: string;
  createdAt: Timestamp;
}

export interface Track {
  url: string;
  title: string;
  requestedBy: string;
  requestedByName: string;
  isPlaying: boolean;
  playedAt?: Timestamp;
}

export interface Channel {
  id: string;
  name: string;
  createdBy: string;
  createdAt: Timestamp;
  members: string[];
  currentTrack?: Track;
}

export interface Message {
  id: string;
  text: string;
  userId: string;
  createdAt: Timestamp;
  displayName: string;
  avatarSeed: string;
  type: 'text' | 'youtube';
  channelId: string;
}

export interface YouTubeVideo {
  videoId: string;
  title: string;
  thumbnail: string;
  duration: string;
}
