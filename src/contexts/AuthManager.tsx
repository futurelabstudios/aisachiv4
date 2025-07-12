import { useEffect } from 'react';
import { useAuth } from './AuthContext';
import { apiClient } from '@/services/api';

const AuthManager = ({ children }) => {
  const { session } = useAuth();

  useEffect(() => {
    if (session) {
      apiClient.setTokenSource(() => session.access_token);
    } else {
      apiClient.setTokenSource(() => null);
    }
  }, [session]);

  return children;
};

export default AuthManager; 