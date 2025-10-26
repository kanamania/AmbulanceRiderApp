import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AuthService from '../services/auth.service';
import { User, LoginCredentials, RegisterData, AuthContextType } from '../types/auth.types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated on mount
    const initAuth = async () => {
      try {
        if (AuthService.isAuthenticated()) {
          const userData = AuthService.getUserData();
          if (userData) {
            setUser(userData);
          } else {
            // Try to fetch user data from API
            const currentUser = await AuthService.getCurrentUser();
            setUser(currentUser);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Clear invalid auth data
        await AuthService.logout();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      const response = await AuthService.login(credentials);
      setUser(response.user);
    } catch (error) {
      throw error;
    }
  };

  const register = async (data: RegisterData): Promise<void> => {
    try {
      const response = await AuthService.register(data);
      setUser(response.user);
    } catch (error) {
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await AuthService.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear user state even if API call fails
      setUser(null);
    }
  };

  const updateUser = (updatedUser: User): void => {
    setUser(updatedUser);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
