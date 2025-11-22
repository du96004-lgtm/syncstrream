'use client';

import { useRef, useEffect } from 'react';
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
    if (!currentTrack) return;
    const currentTrackRef = doc(firestore, 'channels', channelId, 'currentTrack', 'singleton');
    setDocumentNonBlocking(currentTrackRef, {
      isPlaying: !currentTrack.isPlaying,
      playedAt: serverTimestamp(),
    }, { merge: true });
  };
  
  const onPlayerReady = (event: any) => {
    playerRef.current = event.target;
  };

  useEffect(() => {
    const player = playerRef.current;
    if (!player || !player.getPlayerState) return;

    if (currentTrack.isPlaying) {
      if (player.getPlayerState() !== 1) {
        player.playVideo();
      }
    } else {
      if (player.getPlayerState() !== 2) {
        player.pauseVideo();
      }
    }
  }, [currentTrack.isPlaying, videoId]); // videoId is included to re-run on song change


  if (!currentTrack || !videoId) {
    return null;
  }

  const opts = {
    height: '0',
    width: '0',
    playerVars: {
      autoplay: currentTrack.isPlaying ? 1 : 0,
    },
  };
  
  const PlayerComponent = (
    <YouTube 
      key={videoId} 
      videoId={videoId} 
      opts={opts} 
      onReady={onPlayerReady}
      className={'hidden'}
    />
  );

  return (
    <div className={className}>
      {PlayerComponent}
      <div className="flex items-center gap-4 border-t bg-card p-4">
        <div className="flex-1">
          <p className="font-semibold truncate text-sm">Now Playing: {currentTrack.title}</p>
          <p className="text-xs text-muted-foreground">Requested by {currentTrack.requestedByName}</p>
        </div>
        <Button size="icon" onClick={handlePlayPause}>
          {currentTrack.isPlaying ? <Pause /> : <Play />}
        </Button>
      </div>
    </div>
  );
}
