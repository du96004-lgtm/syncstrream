'use client';

import { createContext, useState, useEffect, useContext, type ReactNode } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { usePathname, useRouter } from 'next/navigation';

import { auth, db } from '@/lib/firebase';
import type { UserProfile } from '@/lib/types';
import { Loader2 } from 'lucide-react';

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
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (!user) {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      const unsub = onSnapshot(doc(db, 'users', user.uid), (doc) => {
        if (doc.exists()) {
          setUserProfile(doc.data() as UserProfile);
        } else {
          setUserProfile(null);
        }
        setLoading(false);
      });
      return () => unsub();
    } else {
      setUserProfile(null);
    }
  }, [user]);

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
  
  const value = { user, userProfile, loading };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
