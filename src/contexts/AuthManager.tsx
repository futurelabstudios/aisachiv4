import { useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { apiClient } from '@/services/api';

const AuthManager = ({ children }) => {
  const { session, userProfile, refreshUserProfile } = useAuth();
  const lastSessionId = useRef<string | null>(null);

  useEffect(() => {
    console.log('AuthManager - Session changed:', session ? 'Session exists' : 'No session');
    console.log('AuthManager - Access token:', session?.access_token ? 'Token exists' : 'No token');
    
    if (session) {
      // Set the token source first
      apiClient.setTokenSource(() => session.access_token);
      
      // Only fetch user profile if session changed or we don't have a profile
      const sessionId = session.user.id;
      if (lastSessionId.current !== sessionId || !userProfile) {
        lastSessionId.current = sessionId;
        refreshUserProfile();
      }
    } else {
      lastSessionId.current = null;
      apiClient.setTokenSource(() => null);
    }
  }, [session, userProfile, refreshUserProfile]);

  return children;
};

export default AuthManager; 