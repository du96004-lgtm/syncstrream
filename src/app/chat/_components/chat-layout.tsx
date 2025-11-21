'use client';

import {
  Sidebar,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
import ChannelList from './channel-list';
import ChatView from './chat-view';
import { Channel } from '@/lib/types';
import { SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Music, Search, Settings } from 'lucide-react';

interface ChatLayoutProps {
  selectedChannel: Channel | null;
  onChannelSelect: (channel: Channel) => void;
}

export default function ChatLayout({ selectedChannel, onChannelSelect }: ChatLayoutProps) {
  return (
    <SidebarProvider>
      <Sidebar>
        <SheetTitle className="sr-only">Channels</SheetTitle>
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
              <Button variant="ghost" size="icon">
                <Music className="h-5 w-5" />
                <span className="sr-only">Suggest Music</span>
              </Button>
              <Button variant="ghost" size="icon">
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
      </SidebarInset>
    </SidebarProvider>
  );
}
