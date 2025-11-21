'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { doc, serverTimestamp } from 'firebase/firestore';
import { RefreshCcw, Loader2 } from 'lucide-react';

import { useUser, useFirestore, setDocumentNonBlocking } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export default function SignupForm() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [displayName, setDisplayName] = useState('');
  const [avatarSeed, setAvatarSeed] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    setAvatarSeed(user?.uid || Date.now().toString());
  }, [user]);

  const generateNewAvatar = () => {
    setAvatarSeed(Date.now().toString());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !displayName.trim()) return;

    setLoading(true);
    try {
      const userRef = doc(firestore, 'users', user.uid);
      const userData = {
        id: user.uid, // Switched from uid to id
        displayName: displayName.trim(),
        avatarSeed,
        createdAt: serverTimestamp(),
      };
      setDocumentNonBlocking(userRef, userData, { merge: true });
      router.push('/chat');
    } catch (error) {
      console.error('Error creating user profile:', error);
      toast({
        title: 'Error',
        description: 'Could not create profile. Please try again.',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="text-center">
        <CardTitle className="font-headline text-2xl">Complete Your Profile</CardTitle>
        <CardDescription>Choose an avatar and a display name to get started.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <Image
                src={`https://api.dicebear.com/8.x/pixel-art/svg?seed=${avatarSeed}`}
                alt="User Avatar"
                width={128}
                height={128}
                className="rounded-lg bg-muted"
                unoptimized
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute -bottom-2 -right-2 rounded-full bg-card"
                onClick={generateNewAvatar}
              >
                <RefreshCcw className="h-5 w-5" />
              </Button>
            </div>
          </div>
          <Input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Praveen"
            required
            className="text-center text-lg"
          />
          <Button type="submit" className="w-full" disabled={loading || !displayName.trim()}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Start Chatting
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
