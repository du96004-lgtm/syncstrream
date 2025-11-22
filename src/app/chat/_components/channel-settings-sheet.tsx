'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Channel } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ChannelSettingsSheetProps {
  channel: Channel;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export default function ChannelSettingsSheet({
  channel,
  isOpen,
  onOpenChange,
}: ChannelSettingsSheetProps) {
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(channel.id);
    toast({
      title: 'Copied!',
      description: 'Invite code has been copied to your clipboard.',
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full max-w-sm p-0 sm:max-w-md">
        <SheetHeader className="p-4">
          <SheetTitle>Channel Settings</SheetTitle>
          <SheetDescription>
            Manage settings for &quot;{channel.name}&quot;.
          </SheetDescription>
        </SheetHeader>
        <Separator />
        <div className="p-4 space-y-4">
          <div>
            <h3 className="mb-2 text-sm font-medium text-muted-foreground">
              Invite Code
            </h3>
            <p className="mb-2 text-sm text-muted-foreground">
              Share this code with friends to invite them to this channel.
            </p>
            <div className="flex items-center gap-2">
              <Input value={channel.id} readOnly />
              <Button variant="outline" size="icon" onClick={handleCopy}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
