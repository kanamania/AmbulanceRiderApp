import apiService from './api.service';
import { API_CONFIG } from '../config/api.config';
import { FileUploadResponse } from '../types';

class FileUploadService {
  // Upload vehicle image
  async uploadVehicleImage(file: File): Promise<FileUploadResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiService.post<FileUploadResponse>(
        API_CONFIG.ENDPOINTS.FILE_UPLOAD.VEHICLE_IMAGE,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to upload vehicle image');
    }
  }

  // Delete vehicle image
  async deleteVehicleImage(filePath: string): Promise<void> {
    try {
      await apiService.delete(
        `${API_CONFIG.ENDPOINTS.FILE_UPLOAD.DELETE_VEHICLE_IMAGE}?filePath=${encodeURIComponent(filePath)}`
      );
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete vehicle image');
    }
  }

  // Validate file before upload
  validateImageFile(file: File): { valid: boolean; error?: string } {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Invalid file type. Only JPG, JPEG, PNG, and GIF are allowed.',
      };
    }

    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'File size exceeds 5MB limit.',
      };
    }

    return { valid: true };
  }
}

export default new FileUploadService();
