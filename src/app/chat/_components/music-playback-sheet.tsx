'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Channel } from '@/lib/types';
import MusicPlayer from './music-player';
import Image from 'next/image';

interface MusicPlaybackSheetProps {
  channel: Channel;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const YOUTUBE_REGEX = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(.+)/;

export default function MusicPlaybackSheet({
  channel,
  isOpen,
  onOpenChange,
}: MusicPlaybackSheetProps) {
    
  if (!channel.currentTrack) {
    return null;
  }
  
  const videoIdMatch = channel.currentTrack.url.match(YOUTUBE_REGEX);
  const videoId = videoIdMatch ? videoIdMatch[1] : null;

  const playerOpts = {
    height: '195',
    width: '100%',
    playerVars: {
      autoplay: 0,
      controls: 1,
    },
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full max-w-sm p-0">
        <SheetHeader className="p-4">
          <SheetTitle>Music Playback</SheetTitle>
        </SheetHeader>
        <Separator />
        <div className="p-4">
            <MusicPlayer channel={channel} opts={playerOpts} />
        </div>
        <Separator />
        <div className="p-4">
          <h3 className="mb-4 text-lg font-semibold">Queue</h3>
          <div className="flex items-center gap-4 rounded-md p-2 hover:bg-muted">
            {videoId && (
                 <Image
                    src={`https://img.youtube.com/vi/${videoId}/0.jpg`}
                    alt={channel.currentTrack.title}
                    width={64}
                    height={48}
                    className="rounded-md object-cover"
                 />
            )}
            <div className="flex-1">
              <p className="truncate font-medium">{channel.currentTrack.title}</p>
              <p className="text-sm text-muted-foreground">Now Playing</p>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
