'use client';

import { useEffect, useRef } from 'react';
import YouTube from 'react-youtube';
import { doc, serverTimestamp } from 'firebase/firestore';
import { Play, Pause } from 'lucide-react';
import { useFirestore, setDocumentNonBlocking } from '@/firebase';
import { Track } from '@/lib/types';
import { Button } from '@/components/ui/button';

interface MusicPlayerProps {
  channelId: string;
  currentTrack: Track;
  className?: string;
  opts?: any;
  showPlayer?: boolean;
}

const YOUTUBE_REGEX = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(.+)/;

export default function MusicPlayer({ channelId, currentTrack, className, opts: customOpts, showPlayer = false }: MusicPlayerProps) {
  const firestore = useFirestore();
  const playerRef = useRef<any>(null);

  const videoIdMatch = currentTrack?.url.match(YOUTUBE_REGEX);
  const videoId = videoIdMatch ? videoIdMatch[1] : null;

  useEffect(() => {
    const player = playerRef.current;
    if (player && player.getPlayerState) {
        // If the track should be playing, call playVideo.
        if (currentTrack.isPlaying) {
            // Check if it's already playing to avoid unnecessary API calls.
            if (player.getPlayerState() !== 1) {
                player.playVideo();
            }
        } 
        // If the track should be paused, call pauseVideo.
        else {
             // Check if it's not already paused to avoid unnecessary calls.
            if (player.getPlayerState() !== 2) {
                player.pauseVideo();
            }
        }
    }
  }, [currentTrack, videoId]); // Depend on the whole track object and videoId to re-evaluate on any change.


  const handlePlayPause = async () => {
    if (!currentTrack) return;
    const currentTrackRef = doc(firestore, 'channels', channelId, 'currentTrack', 'singleton');
    setDocumentNonBlocking(currentTrackRef, {
      isPlaying: !currentTrack.isPlaying,
      playedAt: serverTimestamp(),
    }, { merge: true });
  };

  const onPlayerReady = (event: any) => {
    playerRef.current = event.target;
    // When the player is ready, explicitly check the isPlaying status and command the player.
    if (currentTrack?.isPlaying) {
      event.target.playVideo();
    }
  };

  if (!currentTrack || !videoId) {
    return null;
  }

  const defaultOpts = {
    height: '0',
    width: '0',
    playerVars: {
      autoplay: currentTrack.isPlaying ? 1 : 0,
    },
  };
  
  const opts = { ...defaultOpts, ...customOpts, playerVars: {...defaultOpts.playerVars, ...customOpts?.playerVars} };
  
  // By setting the `key` to the `videoId`, we are forcing React to create a new
  // instance of the YouTube component whenever the song changes. This is the
  // most reliable way to handle autoplaying a new track.
  const PlayerComponent = <YouTube videoId={videoId} opts={opts} onReady={onPlayerReady} className={!showPlayer ? 'hidden' : ''} key={videoId} />;

  return (
    <div className={className}>
      {PlayerComponent}
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
