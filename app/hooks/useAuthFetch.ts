import { useState, useEffect, useCallback } from 'react';
import { fetchWithRefresh } from '../lib/fetchWithRefresh';

const useAuthFetch = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  // Type guard to check if the error is an instance of Error
  const isError = (error: unknown): error is Error => {
    return error instanceof Error;
  };

  const checkAuth = useCallback(async () => {
    try {
      const response = await fetchWithRefresh('/api/check-auth', {
        method: 'GET',
      });

      if (response.ok) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      setIsAuthenticated(false);
      if (isError(error)) {
        setAuthError(error.message);
      } else {
        setAuthError('An unknown error occurred');
      }
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const authFetch = useCallback(async (url: string, options: RequestInit = {}) => {
    try {
      const response = await fetchWithRefresh(url, options);

      if (response.status === 401) {
        setIsAuthenticated(false);
        setAuthError('Unauthorized');
      } else {
        setIsAuthenticated(true);
        setAuthError(null);
      }

      return response;
    } catch (error) {
      if (isError(error)) {
        setAuthError(error.message);
      } else {
        setAuthError('An unknown error occurred');
      }
      throw error;
    }
  }, []);

  return { authFetch, isAuthenticated, authError, checkAuth };
};

export default useAuthFetch;

