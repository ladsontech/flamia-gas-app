import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isPhoneUser: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isPhoneUser: false,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPhoneUser, setIsPhoneUser] = useState(false);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Use getSession() for faster initial load
        const { data: { session }, error } = await supabase.auth.getSession();

        if (!mounted) return;

        if (error) {
          console.warn('Error getting session:', error);
          checkPhoneAuth();
          if (mounted) setLoading(false);
          return;
        }

        if (session?.user) {
          if (mounted) {
            setUser(session.user);
            setIsPhoneUser(false);
            setLoading(false);
          }
        } else {
          checkPhoneAuth();
          if (mounted) setLoading(false);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          checkPhoneAuth();
          setLoading(false);
        }
      }
    };

    const checkPhoneAuth = () => {
      const phoneVerified = localStorage.getItem('phoneVerified');
      const userName = localStorage.getItem('userName');
      if (phoneVerified && userName) {
        setIsPhoneUser(true);
        setUser({
          id: phoneVerified,
          email: null,
          phone: phoneVerified,
          user_metadata: {
            display_name: userName
          },
          app_metadata: {},
          aud: 'authenticated',
          created_at: new Date().toISOString(),
        } as User);
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!mounted) return;

        if (session?.user) {
          setUser(session.user);
          setIsPhoneUser(false);
          setLoading(false);
        } else {
          checkPhoneAuth();
          if (!user) {
            setUser(null);
          }
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, isPhoneUser }}>
      {children}
    </AuthContext.Provider>
  );
};

