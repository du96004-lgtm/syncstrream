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

interface ChatLayoutProps {
  selectedChannel: Channel | null;
  onChannelSelect: (channel: Channel) => void;
}

export default function ChatLayout({ selectedChannel, onChannelSelect }: ChatLayoutProps) {
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
          </header>
          <ChatView selectedChannel={selectedChannel} />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
