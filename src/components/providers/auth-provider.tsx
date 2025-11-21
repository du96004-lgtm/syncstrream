'use client';

import { createContext, useState, useEffect, useContext, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import type { UserProfile } from '@/lib/types';
import type { User } from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const pathname = usePathname();

  const userDocRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile, isLoading: isProfileLoading, error: profileError } = useDoc<UserProfile>(userDocRef);

  const loading = isUserLoading || (user && isProfileLoading && !profileError);

  useEffect(() => {
    if (loading) return;

    const isAuthRoute = pathname === '/' || pathname === '/signup';

    if (!user) {
      if (!isAuthRoute) {
        router.replace('/');
      }
      return;
    }
    
    // User is authenticated
    const hasProfile = userProfile && userProfile.displayName;

    if (hasProfile) {
      // User has a profile, redirect from auth routes to chat
      if (isAuthRoute) {
        router.replace('/chat');
      }
    } else {
      // User does not have a profile, redirect to signup unless already there
      if (pathname !== '/signup') {
        router.replace('/signup');
      }
    }
  }, [user, userProfile, loading, pathname, router, profileError]);
  
  // Show loader while we are determining auth state and profile existence
  const isInitialRedirect = (isUserLoading || (user && isProfileLoading && !userProfile)) && pathname !== '/';
  if (isInitialRedirect) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, userProfile: userProfile || null, loading: isUserLoading || isProfileLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  return useContext(AuthContext);
};

    