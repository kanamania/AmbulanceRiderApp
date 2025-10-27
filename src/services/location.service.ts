import apiService from './api.service';
import { API_CONFIG } from '../config/api.config';
import { Location, CreateLocationData, UpdateLocationData } from '../types';

class LocationService {
  // Get all locations
  async getAllLocations(): Promise<Location[]> {
    try {
      const response = await apiService.get<Location[]>(API_CONFIG.ENDPOINTS.LOCATIONS.LIST);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch locations');
    }
  }

  // Get location by ID
  async getLocationById(id: number): Promise<Location> {
    try {
      const response = await apiService.get<Location>(API_CONFIG.ENDPOINTS.LOCATIONS.GET(id));
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch location');
    }
  }

  // Create new location (Admin, Dispatcher)
  async createLocation(data: CreateLocationData): Promise<Location> {
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      
      if (data.image) {
        formData.append('image', data.image);
      }

      const response = await apiService.post<Location>(
        API_CONFIG.ENDPOINTS.LOCATIONS.CREATE,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create location');
    }
  }

  // Update location (Admin, Dispatcher)
  async updateLocation(id: number, data: UpdateLocationData): Promise<Location> {
    try {
      const formData = new FormData();
      
      if (data.name) formData.append('name', data.name);
      if (data.image) formData.append('image', data.image);
      if (data.removeImage !== undefined) formData.append('removeImage', data.removeImage.toString());

      const response = await apiService.put<Location>(
        API_CONFIG.ENDPOINTS.LOCATIONS.UPDATE(id),
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update location');
    }
  }

  // Delete location (Admin only)
  async deleteLocation(id: number): Promise<void> {
    try {
      await apiService.delete(API_CONFIG.ENDPOINTS.LOCATIONS.DELETE(id));
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete location');
    }
  }
}

export default new LocationService();
