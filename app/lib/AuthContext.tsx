'use client'

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';


interface User {
  userName: string;
  profilePictureUrl: string;
  createdAt: Date;
}

interface AuthContextType {
	isLoading: boolean;
  isAuthenticated: boolean;
  user: User | null;
  authError: string | null;
  checkAuthAndRefresh: () => Promise<boolean>;
  login: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(true);

  const login = (user: User) => {
    setUser(user);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    // Call the logout API to clear cookies
    await fetch('/api/logout', {
      method: 'GET',
      credentials: 'include',
    });

    setUser(null);
    setIsAuthenticated(false);
  };

  const checkAuthAndRefresh = async (): Promise<boolean> => {
		setIsLoading(true);
    try {
      const response = await fetch('/api/check-auth', {
        method: 'GET',
        credentials: 'include', // Include cookies in the request
      });

      if (response.ok) {
				const data = await response.json();
        setUser(data.user);
        setIsAuthenticated(true);
				setIsLoading(false);
        return true;
      } else {
        const refreshResponse = await fetch('/api/refresh-token', {
          method: 'POST',
          credentials: 'include',
        });

        if (refreshResponse.ok) {
					const data = await refreshResponse.json();
          setUser(data.user);
          setIsAuthenticated(true);
					setIsLoading(false);
          return true;
        } else {
					setUser(null);
          setIsAuthenticated(false);
					setAuthError('Вы не авторизованы!');
					setIsLoading(false);
          return false;
        }
      }
    } catch (error) {
			setUser(null);
      setIsAuthenticated(false);
      setAuthError('An error occurred while checking authentication');
			setIsLoading(false);
      return false;
    }
  };

  useEffect(() => {
    checkAuthAndRefresh();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, user, authError, checkAuthAndRefresh, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
