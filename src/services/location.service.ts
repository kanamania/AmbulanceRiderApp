import apiService from './api.service';
import cacheService from './cache.service';
import { API_CONFIG } from '../config/api.config';
import { LocationPlace, CreateLocationData, UpdateLocationData } from '../types';

class LocationService {
  // Get all locations
  async getAllLocations(): Promise<LocationPlace[]> {
    try {
      // Check cache first
      const cachedLocations = await cacheService.getLocations();
      if (cachedLocations.length > 0) {
        console.log('Locations loaded from cache:', cachedLocations.length);
        return cachedLocations;
      }
      
      // Fetch from API
      const response = await apiService.get<LocationPlace[]>(API_CONFIG.ENDPOINTS.LOCATIONS.LIST);
      
      // Update cache
      if (response && response.length > 0) {
        await cacheService.upsertLocations(response);
        console.log('Locations cached:', response.length);
      }
      
      return response;
    } catch (error) {
      console.error('Error in getAllLocations:', error);
      // Fallback to cache on error
      const cachedLocations = await cacheService.getLocations();
      if (cachedLocations.length > 0) {
        console.log('Using cached locations due to API error');
        return cachedLocations;
      }
      const message = error instanceof Error ? error.message : 'Failed to fetch locations';
      throw new Error(message);
    }
  }

  // Get location by ID
  async getLocationById(id: number): Promise<LocationPlace> {
    try {
      // Check cache first
      const cachedLocation = await cacheService.getLocationById(id);
      if (cachedLocation) {
        console.log('Location loaded from cache:', id);
        return cachedLocation;
      }
      
      // Fetch from API
      const response = await apiService.get<LocationPlace>(API_CONFIG.ENDPOINTS.LOCATIONS.GET(id));
      
      // Update cache
      await cacheService.upsertLocations([response]);
      console.log('Location cached:', id);
      
      return response;
    } catch (error) {
      console.error('Error in getLocationById:', error);
      // Fallback to cache on error
      const cachedLocation = await cacheService.getLocationById(id);
      if (cachedLocation) {
        console.log('Using cached location due to API error:', id);
        return cachedLocation;
      }
      const message = error instanceof Error ? error.message : 'Failed to fetch location';
      throw new Error(message);
    }
  }

  // Create new location (Admin, Dispatcher)
  async createLocation(data: CreateLocationData): Promise<LocationPlace> {
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      
      if (data.image) {
        formData.append('image', data.image);
      }

      const response = await apiService.post<LocationPlace>(
        API_CONFIG.ENDPOINTS.LOCATIONS.CREATE,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      // Update cache
      await cacheService.upsertLocations([response]);
      console.log('New location cached:', response.id);
      
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create location';
      throw new Error(message);
    }
  }

  // Update location (Admin, Dispatcher)
  async updateLocation(id: number, data: UpdateLocationData): Promise<LocationPlace> {
    try {
      const formData = new FormData();
      
      if (data.name) formData.append('name', data.name);
      if (data.image) formData.append('image', data.image);
      if (data.removeImage !== undefined) formData.append('removeImage', data.removeImage.toString());

      const response = await apiService.put<LocationPlace>(
        API_CONFIG.ENDPOINTS.LOCATIONS.UPDATE(id),
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      // Update cache
      await cacheService.upsertLocations([response]);
      console.log('Updated location cached:', response.id);
      
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update location';
      throw new Error(message);
    }
  }

  // Delete location (Admin only)
  async deleteLocation(id: number): Promise<void> {
    try {
      await apiService.delete(API_CONFIG.ENDPOINTS.LOCATIONS.DELETE(id));
      
      // Remove from cache
      const locations = await cacheService.getLocations();
      const updatedLocations = locations.filter(l => l.id !== id);
      await cacheService.clearLocations();
      if (updatedLocations.length > 0) {
        await cacheService.upsertLocations(updatedLocations);
      }
      console.log('Location removed from cache:', id);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete location';
      throw new Error(message);
    }
  }
}

export default new LocationService();