'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Play, PlusSquare, Loader2 } from 'lucide-react';
import { useDebounce } from 'use-debounce';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { youtubeSearch } from '@/ai/flows/youtube-search';
import { useAuthContext } from '@/components/providers/auth-provider';
import { useFirestore, setDocumentNonBlocking } from '@/firebase';
import { collection, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { Channel, YouTubeVideo } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface MusicSearchSheetProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  channel: Channel | null;
}

export default function MusicSearchSheet({
  isOpen,
  onOpenChange,
  channel,
}: MusicSearchSheetProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<YouTubeVideo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [debouncedQuery] = useDebounce(searchQuery, 500);

  const { user, userProfile } = useAuthContext();
  const firestore = useFirestore();
  const { toast } = useToast();

  useEffect(() => {
    if (debouncedQuery) {
      setIsLoading(true);
      youtubeSearch({ query: debouncedQuery }).then((result) => {
        setSearchResults(result.videos || []);
        setIsLoading(false);
      });
    } else {
      setSearchResults([]);
    }
  }, [debouncedQuery]);

  const handleAddToQueue = (video: YouTubeVideo) => {
    if (!channel || !user || !userProfile) {
      toast({
        title: 'Error',
        description: 'You must be in a channel to add a song.',
        variant: 'destructive',
      });
      return;
    }

    const youtubeUrl = `https://www.youtube.com/watch?v=${video.videoId}`;

    const messagesCollection = collection(firestore, 'channels', channel.id, 'messages');
    const newMessageRef = doc(messagesCollection);

    const messageData = {
      id: newMessageRef.id,
      text: youtubeUrl,
      userId: user.uid,
      displayName: userProfile.displayName,
      avatarSeed: userProfile.avatarSeed,
      createdAt: serverTimestamp(),
      type: 'youtube' as const,
      channelId: channel.id,
    };

    setDocumentNonBlocking(newMessageRef, messageData, {});

    const channelRef = doc(firestore, 'channels', channel.id);
    updateDoc(channelRef, {
        'currentTrack.url': youtubeUrl,
        'currentTrack.title': video.title,
        'currentTrack.requestedBy': user.uid,
        'currentTrack.requestedByName': userProfile.displayName,
        'currentTrack.isPlaying': false,
    });

    toast({
      title: 'Track Added',
      description: `"${video.title}" has been added to the queue.`,
    });
  };


  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full max-w-sm p-0 sm:max-w-md">
        <SheetHeader className="p-4">
          <SheetTitle>Search Music</SheetTitle>
        </SheetHeader>
        <div className="p-4">
          <Input
            placeholder="Search for artists, tracks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Separator />
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading && (
            <div className="flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          )}
          <div className="space-y-2">
            {!isLoading && searchResults.map((track, index) => (
              <div key={index} className="flex items-center gap-4 rounded-md p-2 hover:bg-muted">
                <div className="relative h-12 w-16 flex-shrink-0">
                  <Image
                    src={track.thumbnail}
                    alt={track.title}
                    fill
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
                  <a href={`https://www.youtube.com/watch?v=${track.videoId}`} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                    <Play className="h-5 w-5" />
                  </a>
                  <Button variant="ghost" size="icon" className="h-auto w-auto p-0" onClick={() => handleAddToQueue(track)}>
                    <PlusSquare className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            ))}
             {!isLoading && !searchResults.length && debouncedQuery && (
                <p className="text-center text-muted-foreground">No results found.</p>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
