'use client';

import Image from 'next/image';
import { Play, PlusSquare } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

interface MusicSearchSheetProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const dummyTracks = [
  {
    title: 'NF - FEAR',
    duration: '4:31',
    thumbnail: 'https://picsum.photos/seed/fear/64/64',
  },
  {
    title: 'NF - WASHED UP',
    duration: '3:22',
    thumbnail: 'https://picsum.photos/seed/washed/64/64',
  },
  {
    title: 'Crash Adams - New Heart Freestyle Feat. Sophie Powe...',
    duration: '2:11',
    thumbnail: 'https://picsum.photos/seed/newheart/64/64',
  },
  {
    title: 'Blueface - Baby Girl (OFFICIAL MUSIC VIDEO)...',
    duration: '2:40',
    thumbnail: 'https://picsum.photos/seed/babygirl/64/64',
  },
  {
    title: 'NF, mgk - WHO I WAS (Audio)',
    duration: '3:01',
    thumbnail: 'https://picsum.photos/seed/whoiwas/64/64',
  },
  {
    title: 'Desperado (feat. YoungBoy Never Broke Again)',
    duration: '2:27',
    thumbnail: 'https://picsum.photos/seed/desperado/64/64',
  },
];

export default function MusicSearchSheet({
  isOpen,
  onOpenChange,
}: MusicSearchSheetProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full max-w-sm p-0 sm:max-w-md">
        <SheetHeader className="p-4">
          <SheetTitle>Search Music</SheetTitle>
        </SheetHeader>
        <div className="p-4">
          <Input placeholder="Search for artists, tracks" />
        </div>
        <Separator />
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {dummyTracks.map((track, index) => (
              <div key={index} className="flex items-center gap-4 rounded-md p-2 hover:bg-muted">
                <div className="relative h-12 w-16 flex-shrink-0">
                  <Image
                    src={track.thumbnail}
                    alt={track.title}
                    layout="fill"
                    className="rounded-md object-cover"
                  />
                  <div className="absolute bottom-1 right-1 rounded-sm bg-black/70 px-1 py-0.5 text-xs text-white">
                    {track.duration}
                  </div>
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="truncate font-medium">{track.title}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="text-muted-foreground hover:text-foreground">
                    <Play className="h-5 w-5" />
                  </button>
                  <button className="text-muted-foreground hover:text-foreground">
                    <PlusSquare className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
