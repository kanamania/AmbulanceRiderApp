import React, {ReactNode, useCallback, useEffect, useState} from 'react';
import AuthService from '../services/auth.service';
import tripTypeService from '../services/tripType.service';
import signalRService from '../services/signalr.service';
import {AuthContextType, LoginCredentials, User, UserRole} from '../types';
import {TripType} from '../types';
import {getDefaultRoute, getHighestRole, hasRole} from '../utils/role.utils';
import { AuthContext } from './contexts';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tripTypes, setTripTypes] = useState<TripType[]>([]);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const userData = AuthService.getUserData();
        // Only restore user if token is still valid
        if (userData && AuthService.isAuthenticated()) {
          // Load trip types for authenticated users to verify token is valid
          try {
            const types = await tripTypeService.getActiveTripTypes();
            setTripTypes(types);
            // Only set user after successful API call to verify token works
            setUser(userData);
            
            // Initialize SignalR connection for real-time updates
            try {
              await signalRService.initialize();
              console.log('SignalR initialized on app start');
            } catch (signalRError) {
              console.error('Error initializing SignalR:', signalRError);
              // Don't fail auth if SignalR fails
            }
          } catch (error) {
            console.error('Error loading trip types:', error);
            // If trip types fail to load, user might have invalid token
            // Clear auth data and reset user
            AuthService.logout();
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    const response = await AuthService.login(credentials);
    setUser(response.user);
    
    // Load trip types after successful login
    // The token is already set by AuthService.login() before this point
    try {
      const types = await tripTypeService.getActiveTripTypes();
      setTripTypes(types);
    } catch (error) {
      console.error('Error loading trip types after login:', error);
      // Don't fail the login if trip types fail to load
      // User can still use the app
    }
    
    // Initialize SignalR connection for real-time updates
    try {
      await signalRService.initialize();
      console.log('SignalR initialized after login');
    } catch (signalRError) {
      console.error('Error initializing SignalR:', signalRError);
      // Don't fail login if SignalR fails
    }
  };

  const logout = async () => {
    // Disconnect SignalR before logging out
    try {
      await signalRService.disconnect();
      console.log('SignalR disconnected on logout');
    } catch (error) {
      console.error('Error disconnecting SignalR:', error);
    }
    
    await AuthService.logout();
    setUser(null);
    setTripTypes([]);
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  // Get user's highest role
  const getUserRole = useCallback(() => getHighestRole(user), [user]);

  // Get default route based on user's highest role
  const getDefaultUserRoute = useCallback(() => getDefaultRoute(user), [user]);

  // Check if user has specific role
  const hasUserRole = useCallback((...roles: UserRole[]) => hasRole(user, ...roles), [user]);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    updateUser,
    tripTypes,
    hasRole: hasUserRole,
    getRole: getUserRole,
    getDefaultRoute: getDefaultUserRoute
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

