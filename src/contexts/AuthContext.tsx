import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AuthService from '../services/auth.service';
import tripTypeService from '../services/tripType.service';
import { User, LoginCredentials, AuthContextType } from '../types/auth.types';
import { TripType } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tripTypes, setTripTypes] = useState<TripType[]>([]);

  const authService = new AuthService();
  useEffect(() => {
    // Check if user is already authenticated on mount
    const initAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const userData = authService.getUserData();
          if (userData) {
            setUser(userData);
            
            // Load trip types from localStorage or fetch
            const storedTypes = localStorage.getItem('trip_types');
            if (storedTypes) {
              try {
                setTripTypes(JSON.parse(storedTypes));
              } catch (e) {
                console.error('Failed to parse stored trip types:', e);
              }
            }
            
            // Fetch fresh trip types in background
            try {
              const types = await tripTypeService.getActiveTripTypes();
              setTripTypes(types);
              localStorage.setItem('trip_types', JSON.stringify(types));
            } catch (error) {
              console.error('Failed to fetch trip types:', error);
            }
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Clear invalid auth data
        await authService.logout();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    const response = await authService.login(credentials);
    setUser(response.user);
    
    // Fetch trip types after successful login
    try {
      const types = await tripTypeService.getActiveTripTypes();
      setTripTypes(types);
      // Store in localStorage for persistence
      localStorage.setItem('trip_types', JSON.stringify(types));
    } catch (error) {
      console.error('Failed to fetch trip types:', error);
      // Don't fail login if trip types fetch fails
    }
  };


  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
      setUser(null);
      setTripTypes([]);
      localStorage.removeItem('trip_types');
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear user state even if API call fails
      setUser(null);
      setTripTypes([]);
      localStorage.removeItem('trip_types');
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
    logout,
    updateUser,
    tripTypes,
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
