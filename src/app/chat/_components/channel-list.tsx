'use client';

import { useState } from 'react';
import { collection, query, where, serverTimestamp, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { PlusCircle, Music2, UserPlus } from 'lucide-react';

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
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuthContext } from '@/components/providers/auth-provider';
import { useCollection, useFirestore, setDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import { Channel } from '@/lib/types';

interface ChannelListProps {
  onChannelSelect: (channel: Channel) => void;
}

export default function ChannelList({ onChannelSelect }: ChannelListProps) {
  const { user } = useAuthContext();
  const firestore = useFirestore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [joinChannelId, setJoinChannelId] = useState('');
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

    const channelsCollection = collection(firestore, 'channels');
    const newChannelRef = doc(channelsCollection);
    
    const channelData = {
      id: newChannelRef.id,
      name: newChannelName,
      createdBy: user.uid,
      createdAt: serverTimestamp(),
      members: [user.uid],
    };
    
    setDocumentNonBlocking(newChannelRef, channelData, {});
    
    toast({
      title: 'Channel created',
      description: `Channel "${newChannelName}" has been successfully created.`,
    });
    setNewChannelName('');
    setIsCreateModalOpen(false);
  };
  
  const handleJoinChannel = async () => {
    if (!joinChannelId.trim() || !user) return;

    try {
      const channelRef = doc(firestore, 'channels', joinChannelId.trim());
      await updateDoc(channelRef, {
        members: arrayUnion(user.uid),
      });

      toast({
        title: 'Channel Joined',
        description: 'You have successfully joined the channel.',
      });
      setJoinChannelId('');
      setIsJoinModalOpen(false);
    } catch (error) {
      console.error('Error joining channel:', error);
      toast({
        title: 'Error',
        description: 'Could not join channel. Please check the invite code and try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <SidebarHeader>
        <h2 className="font-headline text-2xl">SyncStream</h2>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Channels</SidebarGroupLabel>
          <SidebarMenu>
            {isLoading && <p className="p-2 text-sm text-muted-foreground">Loading channels...</p>}
            {channels?.map((channel) => (
              <SidebarMenuItem key={channel.id}>
                <SidebarMenuButton onClick={() => onChannelSelect(channel)}>
                  <Music2 />
                  <span>{channel.name}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="flex-col gap-2 !items-stretch">
        <Button variant="ghost" onClick={() => setIsJoinModalOpen(true)}>
          <UserPlus />
          <span>Join Channel</span>
        </Button>
        <Button variant="ghost" onClick={() => setIsCreateModalOpen(true)}>
          <PlusCircle />
          <span>Create Channel</span>
        </Button>
      </SidebarFooter>

      {/* Create Channel Dialog */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
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
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateChannel}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Join Channel Dialog */}
      <Dialog open={isJoinModalOpen} onOpenChange={setIsJoinModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Join a Channel</DialogTitle>
            <DialogDescription>
              Enter the invite code you received from a friend to join their channel.
            </DialogDescription>
          </DialogHeader>
          <Input
            placeholder="Paste invite code here"
            value={joinChannelId}
            onChange={(e) => setJoinChannelId(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsJoinModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleJoinChannel}>Join</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
