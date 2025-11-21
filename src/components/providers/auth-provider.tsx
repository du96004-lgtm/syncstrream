'use client';

import { createContext, useState, useEffect, useContext, type ReactNode } from 'react';
import { onSnapshot, doc } from 'firebase/firestore';
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

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef);

  const loading = isUserLoading || isProfileLoading;

  useEffect(() => {
    if (loading) return;

    const protectedRoutes = ['/chat', '/signup'];
    const isProtectedRoute = protectedRoutes.some(p => pathname.startsWith(p));

    if (!user && isProtectedRoute) {
      router.replace('/');
      return;
    }
    
    if (user) {
      const hasProfile = !!userProfile?.displayName;
      if (!hasProfile && pathname !== '/signup') {
        router.replace('/signup');
      } else if (hasProfile && (pathname === '/signup' || pathname === '/')) {
        router.replace('/chat');
      }
    }
  }, [user, userProfile, loading, pathname, router]);
  
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, userProfile: userProfile || null, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  return useContext(AuthContext);
};
