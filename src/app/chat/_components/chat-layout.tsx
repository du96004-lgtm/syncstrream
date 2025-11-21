'use client';

import { useState } from 'react';
import {
  Sidebar,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
import ChannelList from './channel-list';
import ChatView from './chat-view';
import { Channel } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Music, Search, Settings } from 'lucide-react';
import MusicPlaybackSheet from './music-playback-sheet';
import MusicSearchSheet from './music-search-sheet';

interface ChatLayoutProps {
  selectedChannel: Channel | null;
  onChannelSelect: (channel: Channel) => void;
}

export default function ChatLayout({ selectedChannel, onChannelSelect }: ChatLayoutProps) {
  const [isMusicSheetOpen, setIsMusicSheetOpen] = useState(false);
  const [isSearchSheetOpen, setIsSearchSheetOpen] = useState(false);

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
              <Button variant="ghost" size="icon" onClick={() => setIsMusicSheetOpen(true)} disabled={!selectedChannel?.currentTrack}>
                <Music className="h-5 w-5" />
                <span className="sr-only">Suggest Music</span>
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setIsSearchSheetOpen(true)}>
                <Search className="h-5 w-5" />
                <span className="sr-only">Search</span>
              </Button>
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
                <span className="sr-only">Settings</span>
              </Button>
            </div>
          </header>
          <ChatView selectedChannel={selectedChannel} />
        </main>
        {selectedChannel && (
          <MusicPlaybackSheet
            channel={selectedChannel}
            isOpen={isMusicSheetOpen}
            onOpenChange={setIsMusicSheetOpen}
          />
        )}
        <MusicSearchSheet
          isOpen={isSearchSheetOpen}
          onOpenChange={setIsSearchSheetOpen}
          channel={selectedChannel}
        />
      </SidebarInset>
    </SidebarProvider>
  );
}
