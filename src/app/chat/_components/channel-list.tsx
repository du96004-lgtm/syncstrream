'use client';

import { useState } from 'react';
import { collection, query, where, serverTimestamp } from 'firebase/firestore';
import { PlusCircle, Hash } from 'lucide-react';

import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuthContext } from '@/components/providers/auth-provider';
import { useCollection, useFirestore, addDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import { Channel } from '@/lib/types';

interface ChannelListProps {
  onChannelSelect: (channel: Channel) => void;
}

export default function ChannelList({ onChannelSelect }: ChannelListProps) {
  const { user, userProfile } = useAuthContext();
  const firestore = useFirestore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const { toast } = useToast();

  const channelsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(firestore, 'channels'),
      where('members', 'array-contains', user.uid)
    );
  }, [firestore, user]);

  const { data: channels, isLoading } = useCollection<Channel>(channelsQuery);

  const handleCreateChannel = async () => {
    if (!newChannelName.trim() || !user) return;

    try {
      const channelData = {
        name: newChannelName,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        members: [user.uid],
      };
      const channelsCollection = collection(firestore, 'channels');
      addDocumentNonBlocking(channelsCollection, channelData);
      
      toast({
        title: 'Channel created',
        description: `Channel "${newChannelName}" has been successfully created.`,
      });
      setNewChannelName('');
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error creating channel:', error);
      toast({
        title: 'Error',
        description: 'Failed to create channel. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <h2 className="font-headline text-2xl">SyncStream</h2>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Channels</SidebarGroupLabel>
          <SidebarMenu>
            {isLoading && <p className="p-2 text-sm text-muted-foreground">Loading channels...</p>}
            {channels?.map((channel) => (
              <SidebarMenuItem key={channel.id}>
                <SidebarMenuButton onClick={() => onChannelSelect(channel)}>
                  <Hash />
                  <span>{channel.name}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <Button variant="ghost" onClick={() => setIsModalOpen(true)}>
          <PlusCircle />
          <span>Create Channel</span>
        </Button>
      </SidebarFooter>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create a new channel</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Enter channel name"
            value={newChannelName}
            onChange={(e) => setNewChannelName(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateChannel}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
