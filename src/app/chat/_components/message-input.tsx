'use client';

import { useState } from 'react';
import { collection, serverTimestamp, doc } from 'firebase/firestore';
import { Send } from 'lucide-react';
import { useAuthContext } from '@/components/providers/auth-provider';
import { useFirestore, setDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface MessageInputProps {
  channelId: string;
}

const YOUTUBE_REGEX = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(.+)/;

export default function MessageInput({ channelId }: MessageInputProps) {
  const { user, userProfile } = useAuthContext();
  const firestore = useFirestore();
  const [message, setMessage] = useState('');

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !user || !userProfile) return;

    const youtubeMatch = message.match(YOUTUBE_REGEX);
    const messageType = youtubeMatch ? 'youtube' : 'text';

    const messagesCollection = collection(firestore, 'channels', channelId, 'messages');
    const newMessageRef = doc(messagesCollection);
    
    const messageData = {
      id: newMessageRef.id,
      text: message,
      userId: user.uid,
      displayName: userProfile.displayName,
      avatarSeed: userProfile.avatarSeed,
      createdAt: serverTimestamp(),
      type: messageType,
      channelId: channelId,
    };
    
    setDocumentNonBlocking(newMessageRef, messageData, {});

    if (messageType === 'youtube' && userProfile) {
        const channelRef = doc(firestore, 'channels', channelId);
        updateDocumentNonBlocking(channelRef, {
            currentTrack: {
                url: message,
                title: message, // Placeholder, can be improved with oEmbed
                requestedBy: user.uid,
                requestedByName: userProfile.displayName,
                isPlaying: false,
            }
        });
    }

    setMessage('');
  };

  return (
    <form onSubmit={handleSendMessage} className="flex items-center gap-2">
      <Input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message or paste a YouTube link..."
        autoComplete="off"
      />
      <Button type="submit" size="icon" disabled={!message.trim()}>
        <Send />
        <span className="sr-only">Send Message</span>
      </Button>
    </form>
  );
}
