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
          // Set user directly - sync will happen on first data request
          setUser(userData);
          
          // Load trip types from cache (populated by previous sync)
          try {
            const types = await tripTypeService.getActiveTripTypes();
            setTripTypes(types);
          } catch (error) {
            console.log('Trip types will be loaded after sync');
            // Not critical - will be loaded when needed
          }
          
          // Initialize SignalR connection for real-time updates
          try {
            await signalRService.initialize();
            console.log('SignalR initialized on app start');
          } catch (signalRError) {
            console.error('Error initializing SignalR:', signalRError);
            // Don't fail auth if SignalR fails
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
    // AuthService.login() handles sync and cache population
    const response = await AuthService.login(credentials);
    setUser(response.user);
    
    // Load trip types from cache (already populated by sync in AuthService.login())
    try {
      const types = await tripTypeService.getActiveTripTypes();
      setTripTypes(types);
      console.log('[AuthContext] Trip types loaded from cache:', types.length);
    } catch (error) {
      console.log('[AuthContext] Trip types will be loaded when needed');
      // Not critical - components will load from cache when needed
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

