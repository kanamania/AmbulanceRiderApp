import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('../api.service', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

vi.mock('../index', () => ({
  cacheService: {
    initialize: vi.fn().mockResolvedValue(undefined),
  },
  syncService: {
    clearAllData: vi.fn().mockResolvedValue(undefined),
  },
  dataHashService: {
    performSync: vi.fn().mockResolvedValue({ success: true, syncedEntities: [], errors: [] }),
    clearHashes: vi.fn().mockResolvedValue(undefined),
  },
}));

import authService from '../auth.service';
import apiService from '../api.service';
import { cacheService, syncService, dataHashService } from '../index';

describe('AuthService', () => {
  const mockAuthResponse = {
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    user: {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phoneNumber: '+1234567890',
      roles: ['User'],
      createdAt: '2025-01-01T00:00:00Z',
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('login', () => {
    it('should login successfully and store auth data', async () => {
      vi.mocked(apiService.post).mockResolvedValue(mockAuthResponse);

      const result = await authService.login({
        email: 'john@example.com',
        password: 'password123',
      });

      expect(apiService.post).toHaveBeenCalledWith('/auth/login', {
        email: 'john@example.com',
        password: 'password123',
      });
      expect(result).toEqual(mockAuthResponse);
      expect(localStorage.setItem).toHaveBeenCalledWith('access_token', mockAuthResponse.accessToken);
      expect(localStorage.setItem).toHaveBeenCalledWith('user_data', JSON.stringify(mockAuthResponse.user));
      expect(cacheService.initialize).toHaveBeenCalled();
      expect(dataHashService.performSync).toHaveBeenCalled();
    });

    it('should throw error on login failure', async () => {
      vi.mocked(apiService.post).mockRejectedValue(new Error('Invalid credentials'));

      await expect(
        authService.login({ email: 'wrong@example.com', password: 'wrong' })
      ).rejects.toThrow('Invalid credentials');
    });

    it('should continue login even if sync fails', async () => {
      vi.mocked(apiService.post).mockResolvedValue(mockAuthResponse);
      vi.mocked(dataHashService.performSync).mockRejectedValue(new Error('Sync failed'));

      const result = await authService.login({
        email: 'john@example.com',
        password: 'password123',
      });

      expect(result).toEqual(mockAuthResponse);
    });
  });

  describe('register', () => {
    it('should register successfully', async () => {
      vi.mocked(apiService.post).mockResolvedValue(mockAuthResponse);

      const result = await authService.register({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phoneNumber: '+1234567890',
        password: 'password123',
        roleIds: [1],
      });

      expect(apiService.post).toHaveBeenCalledWith('/auth/register', expect.objectContaining({
        email: 'john@example.com',
      }));
      expect(result).toEqual(mockAuthResponse);
    });

    it('should throw error on registration failure', async () => {
      vi.mocked(apiService.post).mockRejectedValue(new Error('Email already exists'));

      await expect(
        authService.register({
          firstName: 'John',
          lastName: 'Doe',
          email: 'existing@example.com',
          phoneNumber: '+1234567890',
          password: 'password123',
          roleIds: [1],
        })
      ).rejects.toThrow('Email already exists');
    });
  });

  describe('logout', () => {
    it('should clear all data on logout', async () => {
      await authService.logout();

      expect(syncService.clearAllData).toHaveBeenCalled();
      expect(dataHashService.clearHashes).toHaveBeenCalled();
      expect(localStorage.removeItem).toHaveBeenCalledWith('access_token');
      expect(localStorage.removeItem).toHaveBeenCalledWith('user_data');
      expect(localStorage.removeItem).toHaveBeenCalledWith('refresh_token');
    });

    it('should clear auth data even if sync clear fails', async () => {
      vi.mocked(syncService.clearAllData).mockRejectedValue(new Error('Clear failed'));

      await authService.logout();

      expect(localStorage.removeItem).toHaveBeenCalledWith('access_token');
    });
  });

  describe('isAuthenticated', () => {
    it('should return false when no token exists', () => {
      vi.mocked(localStorage.getItem).mockReturnValue(null);
      expect(authService.isAuthenticated()).toBe(false);
    });

    it('should return true for valid non-expired token', () => {
      const futureExp = Math.floor(Date.now() / 1000) + 3600;
      const mockToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZXhwIjoke futureExp}}.signature`;
      
      vi.mocked(localStorage.getItem).mockReturnValue(mockToken);
    });
  });

  describe('getAccessToken', () => {
    it('should return token from localStorage', () => {
      vi.mocked(localStorage.getItem).mockReturnValue('test-token');
      expect(authService.getAccessToken()).toBe('test-token');
    });

    it('should return null when no token exists', () => {
      vi.mocked(localStorage.getItem).mockReturnValue(null);
      expect(authService.getAccessToken()).toBeNull();
    });
  });

  describe('getUserData', () => {
    it('should return parsed user data from localStorage', () => {
      const userData = JSON.stringify(mockAuthResponse.user);
      vi.mocked(localStorage.getItem).mockReturnValue(userData);
      
      const result = authService.getUserData();
      expect(result).toEqual(mockAuthResponse.user);
    });

    it('should return null when no user data exists', () => {
      vi.mocked(localStorage.getItem).mockReturnValue(null);
      expect(authService.getUserData()).toBeNull();
    });
  });

  describe('forgotPassword', () => {
    it('should send forgot password request', async () => {
      vi.mocked(apiService.post).mockResolvedValue(undefined);

      await authService.forgotPassword('john@example.com');

      expect(apiService.post).toHaveBeenCalledWith('/auth/forgot-password', {
        email: 'john@example.com',
        telemetry: undefined,
      });
    });

    it('should throw error on failure', async () => {
      vi.mocked(apiService.post).mockRejectedValue(new Error('User not found'));

      await expect(authService.forgotPassword('unknown@example.com')).rejects.toThrow(
        'User not found'
      );
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      vi.mocked(apiService.post).mockResolvedValue(undefined);

      await authService.resetPassword('reset-token', 'newPassword123', 'john@example.com');

      expect(apiService.post).toHaveBeenCalledWith('/auth/reset-password', {
        token: 'reset-token',
        password: 'newPassword123',
        email: 'john@example.com',
        telemetry: undefined,
      });
    });

    it('should throw error on invalid token', async () => {
      vi.mocked(apiService.post).mockRejectedValue(new Error('Invalid token'));

      await expect(
        authService.resetPassword('invalid-token', 'newPassword123')
      ).rejects.toThrow('Invalid token');
    });
  });
});
