import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import AuthService from '../services/auth.service';
import tripTypeService from '../services/tripType.service';
import { User, LoginCredentials, AuthContextType } from '../types/auth.types';
import { TripType } from '../types';
import { ROLES, getDefaultRoute, hasRole, getHighestRole } from '../utils/role.utils';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
        if (userData) {
          setUser(userData);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  useEffect(() => {
    const loadTripTypes = async () => {
      try {
        const types = await tripTypeService.getActiveTripTypes();
        setTripTypes(types);
      } catch (error) {
        console.error('Error loading trip types:', error);
      }
    };

    if (user) {
      loadTripTypes();
    }
  }, [user]);

  const login = async (credentials: LoginCredentials) => {
    const response = await AuthService.login(credentials);
    setUser(response.user);
  };

  const logout = async () => {
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
  const hasUserRole = useCallback((...roles: string[]) => hasRole(user, ...(roles as any)), [user]);

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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
