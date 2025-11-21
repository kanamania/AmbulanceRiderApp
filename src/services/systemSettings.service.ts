import apiService from './api.service';
import { API_CONFIG } from '../config/api.config';

export interface SystemSettings {
  general: {
    siteName: string;
    siteUrl: string;
    adminEmail: string;
    timezone: string;
    dateFormat: string;
  };
  notifications: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
    tripStatusUpdates: boolean;
    newUserRegistrations: boolean;
  };
  email: {
    smtpHost: string;
    smtpPort: number;
    smtpUsername: string;
    smtpPassword: string;
    fromEmail: string;
    fromName: string;
  };
  security: {
    requireEmailVerification: boolean;
    passwordMinLength: number;
    sessionTimeout: number;
    maxLoginAttempts: number;
    enableTwoFactor: boolean;
  };
}

export interface BackupResponse {
  message: string;
  backupFile: string;
  timestamp: string;
}

class SystemSettingsService {
  /**
   * Get system settings
   */
  async getSettings(): Promise<SystemSettings> {
    try {
      const response = await apiService.get<SystemSettings>(
        API_CONFIG.ENDPOINTS.ADMIN.SYSTEM.SETTINGS
      );
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get system settings';
      throw new Error(message);
    }
  }

  /**
   * Update system settings
   */
  async updateSettings(settings: SystemSettings): Promise<{ message: string }> {
    try {
      const response = await apiService.put<{ message: string }>(
        API_CONFIG.ENDPOINTS.ADMIN.SYSTEM.SETTINGS,
        settings
      );
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update system settings';
      throw new Error(message);
    }
  }

  /**
   * Create system backup
   */
  async createBackup(): Promise<BackupResponse> {
    try {
      const response = await apiService.post<BackupResponse>(
        API_CONFIG.ENDPOINTS.ADMIN.SYSTEM.BACKUP,
        {}
      );
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create backup';
      throw new Error(message);
    }
  }

  /**
   * Restore from backup
   */
  async restoreBackup(backupFile: File): Promise<{ message: string }> {
    try {
      const formData = new FormData();
      formData.append('file', backupFile);

      const response = await apiService.post<{ message: string }>(
        `${API_CONFIG.ENDPOINTS.ADMIN.SYSTEM.BACKUP}/restore`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to restore backup';
      throw new Error(message);
    }
  }

  /**
   * Download backup file
   */
  downloadBackup(backupFile: string): void {
    const link = document.createElement('a');
    link.href = `${API_CONFIG.BASE_URL}/admin/system/backup/download?file=${encodeURIComponent(backupFile)}`;
    link.download = backupFile;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export default new SystemSettingsService();
