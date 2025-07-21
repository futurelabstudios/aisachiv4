import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { supabase } from '@/services/supabase';
import { Session, User, AuthError, AuthResponse } from '@supabase/supabase-js';
import { userService, UserProfile } from '@/services/user';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  login: (email, password) => Promise<AuthResponse>;
  signup: (email, password) => Promise<AuthResponse>;
  logout: () => Promise<{ error: AuthError | null }>;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Function to fetch user profile from backend
  const fetchUserProfile = useCallback(async () => {
    try {
      const profile = await userService.getCurrentUser();
      setUserProfile(profile);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      setUserProfile(null);
    }
  }, []);

  // Function to refresh user profile 
  const refreshUserProfile = useCallback(async () => {
    if (session?.user) {
      await fetchUserProfile();
    }
  }, [session?.user, fetchUserProfile]);

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);

      // Don't fetch user profile here - let AuthManager handle it
      setLoading(false);
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        // Don't fetch user profile here - let AuthManager handle it
        if (!session?.user) {
          setUserProfile(null);
        }
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const value = {
    user,
    userProfile,
    session,
    loading,
    login: (email, password) =>
      supabase.auth.signInWithPassword({ email, password }),
    signup: (email, password) => supabase.auth.signUp({ email, password }),
    logout: () => supabase.auth.signOut(),
    refreshUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
