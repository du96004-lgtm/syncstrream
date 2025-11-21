'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Track } from '@/lib/types';
import MusicPlayer from './music-player';
import Image from 'next/image';
import { YOUTUBE_REGEX } from './message-input';

interface MusicPlaybackSheetProps {
  channelId: string;
  currentTrack: Track;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}


export default function MusicPlaybackSheet({
  channelId,
  currentTrack,
  isOpen,
  onOpenChange,
}: MusicPlaybackSheetProps) {
    
  if (!currentTrack) {
    return null;
  }
  
  const videoIdMatch = currentTrack.url.match(YOUTUBE_REGEX);
  const videoId = videoIdMatch ? videoIdMatch[1] : null;

  const playerOpts = {
    height: '195',
    width: '100%',
    playerVars: {
      autoplay: 1, // Autoplay when sheet opens
      controls: 1,
    },
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full max-w-sm p-0 sm:max-w-md">
        <SheetHeader className="p-4">
          <SheetTitle>Music Playback</SheetTitle>
        </SheetHeader>
        <Separator />
        <div className="p-4">
            <MusicPlayer channelId={channelId} currentTrack={currentTrack} opts={playerOpts} showPlayer />
        </div>
        <Separator />
        <div className="p-4">
          <h3 className="mb-4 text-lg font-semibold">Queue</h3>
          <div className="flex items-center gap-4 rounded-md p-2 hover:bg-muted">
            {videoId && (
                 <Image
                    src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
                    alt={currentTrack.title}
                    width={64}
                    height={48}
                    className="rounded-md object-cover"
                 />
            )}
            <div className="flex-1">
              <p className="truncate font-medium">{currentTrack.title}</p>
              <p className="text-sm text-muted-foreground">Now Playing</p>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
