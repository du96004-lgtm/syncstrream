'use client';

import { useState } from 'react';
import { collection, serverTimestamp, doc } from 'firebase/firestore';
import { Send } from 'lucide-react';
import { useAuthContext } from '@/components/providers/auth-provider';
import { useFirestore, addDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface MessageInputProps {
  channelId: string;
}

export default function MessageInput({ channelId }: MessageInputProps) {
  const { user, userProfile } = useAuthContext();
  const firestore = useFirestore();
  const [message, setMessage] = useState('');

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !user || !userProfile) return;

    const messagesCollection = collection(firestore, 'channels', channelId, 'messages');
    const newMessageRef = doc(messagesCollection);
    
    const messageData = {
      id: newMessageRef.id,
      text: message,
      userId: user.uid,
      displayName: userProfile.displayName,
      avatarSeed: userProfile.avatarSeed,
      createdAt: serverTimestamp(),
      type: 'text',
      channelId: channelId,
    };
    
    setDocumentNonBlocking(newMessageRef, messageData, {});

    setMessage('');
  };

  return (
    <form onSubmit={handleSendMessage} className="flex items-center gap-2">
      <Input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message..."
        autoComplete="off"
      />
      <Button type="submit" size="icon" disabled={!message.trim()}>
        <Send />
        <span className="sr-only">Send Message</span>
      </Button>
    </form>
  );
}
