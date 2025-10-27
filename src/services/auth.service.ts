import { jwtDecode } from 'jwt-decode';
import apiService from './api.service';
import { API_CONFIG, STORAGE_KEYS } from '../config/api.config';
import { LoginCredentials, RegisterData, AuthResponse, User } from '../types/auth.types';

export default class AuthService {
  // Login user
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await apiService.post<AuthResponse>(
        API_CONFIG.ENDPOINTS.AUTH.LOGIN,
        credentials
      );

      this.setAuthData(response);
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
    this.clearAuthData();
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = this.getAccessToken();
    if (!token) return false;

    try {
      const decoded: any = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp > currentTime;
    } catch (error) {
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
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, authResponse.token);
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(authResponse.user));
  }

  // Clear authentication data
  private clearAuthData(): void {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
  }

  // Forgot password - Send reset email
  async forgotPassword(email: string, telemetry?: any): Promise<void> {
    try {
      await apiService.post(API_CONFIG.ENDPOINTS.AUTH.FORGOT_PASSWORD, { email, telemetry });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to send reset email';
      throw new Error(message);
    }
  }

  // Reset password with token
  async resetPassword(token: string, password: string, email?: string, telemetry?: any): Promise<void> {
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
  decodeToken(token: string): any {
    try {
      return jwtDecode(token);
    } catch (error) {
      return null;
    }
  }
}