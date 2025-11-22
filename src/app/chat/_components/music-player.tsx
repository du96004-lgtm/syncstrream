'use client';

import { useRef } from 'react';
import YouTube from 'react-youtube';
import { doc, serverTimestamp } from 'firebase/firestore';
import { Play, Pause } from 'lucide-react';
import { useFirestore, setDocumentNonBlocking } from '@/firebase';
import { Track } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { YOUTUBE_REGEX } from './message-input';

interface MusicPlayerProps {
  channelId: string;
  currentTrack: Track;
  className?: string;
}

export default function MusicPlayer({ channelId, currentTrack, className }: MusicPlayerProps) {
  const firestore = useFirestore();
  const playerRef = useRef<any>(null);

  const videoIdMatch = currentTrack?.url.match(YOUTUBE_REGEX);
  const videoId = videoIdMatch ? videoIdMatch[1] : null;

  const handlePlayPause = () => {
    if (!currentTrack || !playerRef.current) return;
    
    const newIsPlaying = !currentTrack.isPlaying;
    if (newIsPlaying) {
      playerRef.current.playVideo();
    } else {
      playerRef.current.pauseVideo();
    }

    const currentTrackRef = doc(firestore, 'channels', channelId, 'currentTrack', 'singleton');
    setDocumentNonBlocking(currentTrackRef, {
      isPlaying: newIsPlaying,
      playedAt: serverTimestamp(),
    }, { merge: true });
  };
  
  const onPlayerReady = (event: any) => {
    playerRef.current = event.target;
    // When the player is ready, sync its state with Firestore
    if (currentTrack.isPlaying) {
      event.target.playVideo();
    } else {
      event.target.pauseVideo();
    }
  };
  
  const onPlayerStateChange = (event: any) => {
    // This function can be used to sync player state back to Firestore if needed
    // For example, if the user pauses directly from the YouTube player UI (if visible)
  };


  if (!currentTrack || !videoId) {
    return null;
  }

  const opts = {
    height: '0',
    width: '0',
    playerVars: {
      // Autoplay is handled by onPlayerReady to be more reliable
      autoplay: currentTrack.isPlaying ? 1: 0,
    },
  };

  return (
    <div className={className}>
      <YouTube 
        key={videoId} 
        videoId={videoId} 
        opts={opts} 
        onReady={onPlayerReady}
        onStateChange={onPlayerStateChange}
        className={'hidden'}
      />
      <div className="flex items-center gap-4 border-t bg-card p-4">
        <div className="flex-1 min-w-0">
          <p className="font-semibold truncate text-sm">Now Playing: {currentTrack.title}</p>
          <p className="text-xs text-muted-foreground truncate">Requested by {currentTrack.requestedByName}</p>
        </div>
        <Button size="icon" onClick={handlePlayPause}>
          {currentTrack.isPlaying ? <Pause /> : <Play />}
        </Button>
      </div>
    </div>
  );
}
