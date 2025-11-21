'use client';

import { useState } from 'react';
import { doc } from 'firebase/firestore';
import ChatLayout from './_components/chat-layout';
import { Channel } from '@/lib/types';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';

export default function ChatPage() {
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
  const firestore = useFirestore();

  const selectedChannelRef = useMemoFirebase(() => {
    if (!selectedChannelId) return null;
    return doc(firestore, 'channels', selectedChannelId);
  }, [firestore, selectedChannelId]);

  const { data: selectedChannel } = useDoc<Channel>(selectedChannelRef);

  const handleChannelSelect = (channel: Channel) => {
    setSelectedChannelId(channel.id);
  };

  return (
    <ChatLayout
      selectedChannel={selectedChannel}
      onChannelSelect={handleChannelSelect}
    />
  );
}
