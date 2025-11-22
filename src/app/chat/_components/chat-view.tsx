'use client';

import { useRef, useEffect } from 'react';
import Image from 'next/image';
import { collection, query, orderBy } from 'firebase/firestore';

import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { Channel, Message } from '@/lib/types';
import MessageInput from './message-input';

interface ChatViewProps {
  selectedChannel: Channel | null;
}

export default function ChatView({ selectedChannel }: ChatViewProps) {
  const firestore = useFirestore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const messagesQuery = useMemoFirebase(() => {
    if (!selectedChannel) return null;
    return query(
      collection(firestore, `channels/${selectedChannel.id}/messages`),
      orderBy('createdAt', 'asc')
    );
  }, [firestore, selectedChannel]);

  const { data: messages, isLoading } = useCollection<Message>(messagesQuery);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!selectedChannel) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-muted-foreground">Select a channel to start chatting</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading && (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-muted-foreground">Loading messages...</p>
          </div>
        )}
        <div className="space-y-4">
          {messages?.map((msg) => {
            const displayName = msg.displayName || 'User';
            const avatarSeed = msg.avatarSeed || msg.userId;

            return (
              <div key={msg.id} className="flex items-start gap-4 rounded-lg bg-secondary/40 p-3">
                <Image
                  src={`https://api.dicebear.com/8.x/pixel-art/svg?seed=${avatarSeed}`}
                  alt={`${displayName}'s avatar`}
                  width={40}
                  height={40}
                  className="rounded-full bg-muted"
                  unoptimized
                />
                <div className="flex-1">
                  <p className="font-semibold">{displayName}</p>
                  {msg.type === 'youtube' ? (
                     <a href={msg.text} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      Shared a YouTube video: {msg.text}
                    </a>
                  ) : (
                    <div className="text-base text-foreground/80">{msg.text}</div>
                  )}
                </div>
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="border-t p-4 bg-background">
        <MessageInput channelId={selectedChannel.id} />
      </div>
    </div>
  );
}
