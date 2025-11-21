import apiService from './api.service';
import cacheService from './cache.service';
import { API_CONFIG } from '../config/api.config';
import {
  TripType,
  TripTypeAttribute,
  CreateTripTypeRequest,
  UpdateTripTypeRequest,
  CreateTripTypeAttributeRequest,
  UpdateTripTypeAttributeRequest,
} from '../types';

class TripTypeService {
  // Get all trip types with their attributes
  async getAllTripTypes(): Promise<TripType[]> {
    try {
      // Check cache first
      const cachedTripTypes = await cacheService.getTripTypes();
      if (cachedTripTypes.length > 0) {
        console.log('Trip types loaded from cache:', cachedTripTypes.length);
        return cachedTripTypes;
      }
      
      // Fetch from API
      const response = await apiService.get<TripType[]>(API_CONFIG.ENDPOINTS.TRIP_TYPES.LIST);
      
      // Update cache
      if (response && response.length > 0) {
        await cacheService.upsertTripTypes(response);
        console.log('Trip types cached:', response.length);
      }
      
      return response;
    } catch (error) {
      console.error('Error in getAllTripTypes:', error);
      // Fallback to cache on error
      const cachedTripTypes = await cacheService.getTripTypes();
      if (cachedTripTypes.length > 0) {
        console.log('Using cached trip types due to API error');
        return cachedTripTypes;
      }
      const message = error instanceof Error ? error.message : 'Failed to fetch trip types';
      throw new Error(message);
    }
  }

  // Get only active trip types
  async getActiveTripTypes(): Promise<TripType[]> {
    try {
      // Check cache first and filter active
      const cachedTripTypes = await cacheService.getTripTypes();
      if (cachedTripTypes.length > 0) {
        const activeTripTypes = cachedTripTypes.filter(tt => tt.isActive);
        console.log('Active trip types loaded from cache:', activeTripTypes.length);
        return activeTripTypes;
      }
      
      // Fetch from API
      const response = await apiService.get<TripType[]>(API_CONFIG.ENDPOINTS.TRIP_TYPES.ACTIVE);
      
      // Update cache (merge with existing to keep inactive ones)
      if (response && response.length > 0) {
        await cacheService.upsertTripTypes(response);
        console.log('Active trip types cached:', response.length);
      }
      
      return response;
    } catch (error) {
      console.error('Error in getActiveTripTypes:', error);
      // Fallback to cache on error
      const cachedTripTypes = await cacheService.getTripTypes();
      if (cachedTripTypes.length > 0) {
        const activeTripTypes = cachedTripTypes.filter(tt => tt.isActive);
        console.log('Using cached active trip types due to API error');
        return activeTripTypes;
      }
      const message = error instanceof Error ? error.message : 'Failed to fetch active trip types';
      throw new Error(message);
    }
  }

  // Get trip type by ID
  async getTripTypeById(id: number): Promise<TripType> {
    try {
      // Check cache first
      const cachedTripType = await cacheService.getTripTypeById(id);
      if (cachedTripType) {
        console.log('Trip type loaded from cache:', id);
        return cachedTripType;
      }
      
      // Fetch from API
      const response = await apiService.get<TripType>(API_CONFIG.ENDPOINTS.TRIP_TYPES.GET(id));
      
      // Update cache
      await cacheService.upsertTripTypes([response]);
      console.log('Trip type cached:', id);
      
      return response;
    } catch (error) {
      console.error('Error in getTripTypeById:', error);
      // Fallback to cache on error
      const cachedTripType = await cacheService.getTripTypeById(id);
      if (cachedTripType) {
        console.log('Using cached trip type due to API error:', id);
        return cachedTripType;
      }
      const message = error instanceof Error ? error.message : 'Failed to fetch trip type';
      throw new Error(message);
    }
  }

  // Create trip type
  async createTripType(data: CreateTripTypeRequest): Promise<TripType> {
    try {
      const response = await apiService.post<TripType>(
        API_CONFIG.ENDPOINTS.TRIP_TYPES.CREATE,
        data
      );
      
      // Update cache
      await cacheService.upsertTripTypes([response]);
      console.log('New trip type cached:', response.id);
      
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create trip type';
      throw new Error(message);
    }
  }

  // Update trip type
  async updateTripType(id: number, data: UpdateTripTypeRequest): Promise<TripType> {
    try {
      const response = await apiService.put<TripType>(
        API_CONFIG.ENDPOINTS.TRIP_TYPES.UPDATE(id),
        data
      );
      
      // Update cache
      await cacheService.upsertTripTypes([response]);
      console.log('Updated trip type cached:', response.id);
      
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update trip type';
      throw new Error(message);
    }
  }

  // Delete trip type
  async deleteTripType(id: number): Promise<void> {
    try {
      await apiService.delete(API_CONFIG.ENDPOINTS.TRIP_TYPES.DELETE(id));
      
      // Remove from cache
      const tripTypes = await cacheService.getTripTypes();
      const updatedTripTypes = tripTypes.filter(tt => tt.id !== id);
      await cacheService.clearTripTypes();
      if (updatedTripTypes.length > 0) {
        await cacheService.upsertTripTypes(updatedTripTypes);
      }
      console.log('Trip type removed from cache:', id);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete trip type';
      throw new Error(message);
    }
  }

  // Create trip type attribute
  async createAttribute(data: CreateTripTypeAttributeRequest): Promise<TripTypeAttribute> {
    try {
      const response = await apiService.post<TripTypeAttribute>(
        API_CONFIG.ENDPOINTS.TRIP_TYPES.CREATE_ATTRIBUTE,
        data
      );
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create attribute';
      throw new Error(message);
    }
  }

  // Update trip type attribute
  async updateAttribute(id: number, data: UpdateTripTypeAttributeRequest): Promise<TripTypeAttribute> {
    try {
      const response = await apiService.put<TripTypeAttribute>(
        API_CONFIG.ENDPOINTS.TRIP_TYPES.UPDATE_ATTRIBUTE(id),
        data
      );
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update attribute';
      throw new Error(message);
    }
  }

  // Delete trip type attribute
  async deleteAttribute(id: number): Promise<void> {
    try {
      await apiService.delete(API_CONFIG.ENDPOINTS.TRIP_TYPES.DELETE_ATTRIBUTE(id));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete attribute';
      throw new Error(message);
    }
  }
}

export default new TripTypeService();
