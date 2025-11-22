'use client';

import { useState } from 'react';
import { doc } from 'firebase/firestore';
import {
  Sidebar,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
import ChannelList from './channel-list';
import ChatView from './chat-view';
import { Channel, Track } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Music, Search, Settings } from 'lucide-react';
import MusicSearchSheet from './music-search-sheet';
import MusicPlaybackSheet from './music-playback-sheet';
import MusicPlayer from './music-player';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import ChannelSettingsSheet from './channel-settings-sheet';


interface ChatLayoutProps {
  selectedChannel: Channel | null;
  onChannelSelect: (channel: Channel) => void;
}

export default function ChatLayout({ selectedChannel, onChannelSelect }: ChatLayoutProps) {
  const [isSearchSheetOpen, setIsSearchSheetOpen] = useState(false);
  const [isPlaybackSheetOpen, setIsPlaybackSheetOpen] = useState(false);
  const [isSettingsSheetOpen, setIsSettingsSheetOpen] = useState(false);
  const firestore = useFirestore();

  const currentTrackRef = useMemoFirebase(() => {
    if (!selectedChannel) return null;
    return doc(firestore, `channels/${selectedChannel.id}/currentTrack/singleton`);
  }, [firestore, selectedChannel]);

  const { data: currentTrack } = useDoc<Track>(currentTrackRef);

  return (
    <SidebarProvider>
      <Sidebar>
        <ChannelList onChannelSelect={onChannelSelect} />
      </Sidebar>
      <SidebarInset>
        <main className="flex h-screen flex-col">
          <header className="flex h-14 items-center gap-4 border-b bg-card px-4">
            <SidebarTrigger />
            <h1 className="flex-1 text-xl font-semibold tracking-tight">
              {selectedChannel ? selectedChannel.name : 'Welcome'}
            </h1>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsPlaybackSheetOpen(true)}
                disabled={!currentTrack}
              >
                <Music className="h-5 w-5" />
                <span className="sr-only">Suggest Music</span>
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setIsSearchSheetOpen(true)}>
                <Search className="h-5 w-5" />
                <span className="sr-only">Search</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSettingsSheetOpen(true)}
                disabled={!selectedChannel}
              >
                <Settings className="h-5 w-5" />
                <span className="sr-only">Settings</span>
              </Button>
            </div>
          </header>
          <div className="flex flex-1 flex-col overflow-hidden">
            <ChatView selectedChannel={selectedChannel} />
            {selectedChannel && currentTrack && (
              <MusicPlayer channelId={selectedChannel.id} currentTrack={currentTrack} />
            )}
          </div>
        </main>
        <MusicSearchSheet
          isOpen={isSearchSheetOpen}
          onOpenChange={setIsSearchSheetOpen}
          channel={selectedChannel}
        />
        {selectedChannel && (
          <ChannelSettingsSheet
            isOpen={isSettingsSheetOpen}
            onOpenChange={setIsSettingsSheetOpen}
            channel={selectedChannel}
          />
        )}
        {selectedChannel && currentTrack && (
          <MusicPlaybackSheet
            isOpen={isPlaybackSheetOpen}
            onOpenChange={setIsPlaybackSheetOpen}
            channelId={selectedChannel.id}
            currentTrack={currentTrack}
          />
        )}
      </SidebarInset>
    </SidebarProvider>
  );
}
