'use client';

import { useEffect, useRef } from 'react';
import YouTube from 'react-youtube';
import { doc, serverTimestamp } from 'firebase/firestore';
import { Play, Pause } from 'lucide-react';
import { useFirestore, updateDocumentNonBlocking } from '@/firebase';
import { Channel } from '@/lib/types';
import { Button } from '@/components/ui/button';

interface MusicPlayerProps {
  channel: Channel;
  className?: string;
  opts?: any;
  showPlayer?: boolean;
}

const YOUTUBE_REGEX = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(.+)/;

export default function MusicPlayer({ channel, className, opts: customOpts, showPlayer = false }: MusicPlayerProps) {
  const firestore = useFirestore();
  const playerRef = useRef<any>(null);
  const { currentTrack } = channel;

  const videoIdMatch = currentTrack?.url.match(YOUTUBE_REGEX);
  const videoId = videoIdMatch ? videoIdMatch[1] : null;

  useEffect(() => {
    if (playerRef.current && currentTrack && videoId) {
      if (currentTrack.isPlaying) {
        playerRef.current.playVideo();
      } else {
        playerRef.current.pauseVideo();
      }
    }
  }, [currentTrack?.isPlaying, videoId, playerRef.current]);

  const handlePlayPause = async () => {
    if (!currentTrack) return;
    const channelRef = doc(firestore, 'channels', channel.id);
    updateDocumentNonBlocking(channelRef, {
      'currentTrack.isPlaying': !currentTrack.isPlaying,
      'currentTrack.playedAt': serverTimestamp(),
    });
  };

  const onPlayerReady = (event: any) => {
    playerRef.current = event.target;
    if (currentTrack?.isPlaying) {
      playerRef.current.playVideo();
    }
  };

  if (!currentTrack || !videoId) {
    return null;
  }

  const defaultOpts = {
    height: '0',
    width: '0',
    playerVars: {
      autoplay: 0,
    },
  };
  
  const opts = { ...defaultOpts, ...customOpts };

  return (
    <div className={className}>
      <YouTube videoId={videoId} opts={opts} onReady={onPlayerReady} className={!showPlayer ? 'hidden' : ''} />
      {!showPlayer && (
        <div className="flex items-center gap-4 border-t bg-card p-4">
          <div className="flex-1">
            <p className="font-semibold truncate text-sm">Now Playing: {currentTrack.title}</p>
            <p className="text-xs text-muted-foreground">Requested by {currentTrack.requestedByName}</p>
          </div>
          <Button size="icon" onClick={handlePlayPause}>
            {currentTrack.isPlaying ? <Pause /> : <Play />}
          </Button>
        </div>
      )}
    </div>
  );
}
