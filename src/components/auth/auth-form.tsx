'use client';

import { useState } from 'react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { initiateAnonymousSignIn } from '@/firebase';

export default function AuthForm() {
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingAnon, setLoadingAnon] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();

  const handleGoogleSignIn = async () => {
    setLoadingGoogle(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      // The AuthProvider will handle redirection
    } catch (error) {
      console.error('Error signing in with Google:', error);
      toast({
        title: 'Sign-in failed',
        description: 'Could not sign in with Google. Please try again.',
        variant: 'destructive',
      });
      setLoadingGoogle(false);
    }
  };

  const handleAnonymousSignIn = async () => {
    setLoadingAnon(true);
    try {
      initiateAnonymousSignIn(auth);
      // The AuthProvider will handle redirection
    } catch (error) {
      console.error('Error signing in anonymously:', error);
      toast({
        title: 'Sign-in failed',
        description: 'Could not sign in anonymously. Please try again.',
        variant: 'destructive',
      });
    } finally {
      // setLoadingAnon(false); // AuthProvider handles redirects, so this might not be necessary
    }
  };

  const isLoading = loadingGoogle || loadingAnon;

  return (
    <div className="grid grid-cols-1 gap-4">
      <Button
        size="lg"
        onClick={handleGoogleSignIn}
        disabled={isLoading}
        variant="outline"
        className="bg-white/10 text-white hover:bg-white/20 border-white/20"
      >
        {loadingGoogle && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Sign in with Google
      </Button>
      <Button
        size="lg"
        variant="secondary"
        onClick={handleAnonymousSignIn}
        disabled={isLoading}
      >
        {loadingAnon && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Sign in anonymously
      </Button>
    </div>
  );
}
