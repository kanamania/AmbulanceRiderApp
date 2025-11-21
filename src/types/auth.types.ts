import { TripType } from './index';
import { TelemetryData } from './telemetry.types';

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  imagePath?: string;
  imageUrl?: string;
  roles: string[];
  isActive?: boolean;
  createdAt: string;
}

export type UserRole = 'Admin' | 'Dispatcher' | 'Driver' | 'User';

export interface LoginCredentials {
  email: string;
  password: string;
  telemetry?: TelemetryData;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  image?: File;
  roleIds: number[];
  telemetry?: TelemetryData;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  user: User;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
  tripTypes: TripType[];
  hasRole: (...roles: UserRole[]) => boolean;
  getRole: () => string | null;
  getDefaultRoute: () => string;
}
