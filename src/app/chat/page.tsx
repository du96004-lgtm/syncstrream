'use client';

import { useState } from 'react';
import ChatLayout from './_components/chat-layout';
import { Channel } from '@/lib/types';

export default function ChatPage() {
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);

  return (
    <ChatLayout
      selectedChannel={selectedChannel}
      onChannelSelect={setSelectedChannel}
    />
  );
}
