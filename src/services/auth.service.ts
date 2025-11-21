import {jwtDecode, JwtPayload} from 'jwt-decode';
import apiService from './api.service';
import { cacheService, syncService, dataHashService } from './index';
import { API_CONFIG, STORAGE_KEYS } from '../config/api.config';
import { LoginCredentials, RegisterData, AuthResponse, User } from '../types';

class AuthService {
  // Login user
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await apiService.post<AuthResponse>(
        API_CONFIG.ENDPOINTS.AUTH.LOGIN,
        credentials
      );

      this.setAuthData(response);
      
      // Initialize cache service and perform hash-based sync
      try {
        await cacheService.initialize();
        
        // Perform hash-based data synchronization
        const syncResult = await dataHashService.performSync();
        
        if (syncResult.success) {
          console.log('Data sync completed successfully');
        } else {
          console.warn('Data sync completed with errors:', syncResult.errors);
        }
        
        if (syncResult.syncedEntities.length > 0) {
          console.log('Synced entities:', syncResult.syncedEntities);
        }
      } catch (syncError) {
        console.warn('Data sync failed, but login succeeded:', syncError);
        // Don't fail login if sync fails
      }
      
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      throw new Error(message);
    }
  }

  // Register new user
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await apiService.post<AuthResponse>(
        API_CONFIG.ENDPOINTS.AUTH.REGISTER,
        data
      );

      this.setAuthData(response);
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      throw new Error(message);
    }
  }

  // Logout user
  async logout(): Promise<void> {
    try {
      // Clear all local data
      await syncService.clearAllData();
      await dataHashService.clearHashes();
    } catch (error) {
      console.warn('Failed to clear local data during logout:', error);
    } finally {
      this.clearAuthData();
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = this.getAccessToken();
    if (!token) return false;

    try {
      const decoded: JwtPayload = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      if (!decoded.exp) {
        throw new Error('Token does not contain expiration time');
      }
      return decoded.exp > currentTime;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to send reset email';
      throw new Error(message);
      return false;
    }
  }

  // Get access token
  getAccessToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  }


  // Get stored user data
  getUserData(): User | null {
    const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
    return userData ? JSON.parse(userData) : null;
  }

  // Set authentication data
  private setAuthData(authResponse: AuthResponse): void {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, authResponse.accessToken);
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(authResponse.user));
    // Store refresh token if provided
    if (authResponse.refreshToken) {
      localStorage.setItem('refresh_token', authResponse.refreshToken);
    }
  }

  // Clear authentication data
  private clearAuthData(): void {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    localStorage.removeItem('refresh_token');
  }

  // Forgot password - Send reset email
  async forgotPassword(email: string, telemetry?: unknown): Promise<void> {
    try {
      await apiService.post(API_CONFIG.ENDPOINTS.AUTH.FORGOT_PASSWORD, { email, telemetry });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to send reset email';
      throw new Error(message);
    }
  }

  // Reset password with token
  async resetPassword(token: string, password: string, email?: string, telemetry?: unknown): Promise<void> {
    try {
      await apiService.post(API_CONFIG.ENDPOINTS.AUTH.RESET_PASSWORD, {
        token,
        password,
        email,
        telemetry,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to reset password';
      throw new Error(message);
    }
  }

  // Decode JWT token
  decodeToken(token: string): string {
    try {
      return jwtDecode(token);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to reset password';
      throw new Error(message);
    }
  }
}

// Export a singleton instance
const authServiceInstance = new AuthService();
export default authServiceInstance;