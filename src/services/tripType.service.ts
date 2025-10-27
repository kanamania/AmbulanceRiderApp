import apiService from './api.service';
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
      const response = await apiService.get<TripType[]>(API_CONFIG.ENDPOINTS.TRIP_TYPES.LIST);
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch trip types';
      throw new Error(message);
    }
  }

  // Get only active trip types
  async getActiveTripTypes(): Promise<TripType[]> {
    try {
      const response = await apiService.get<TripType[]>(API_CONFIG.ENDPOINTS.TRIP_TYPES.ACTIVE);
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch active trip types';
      throw new Error(message);
    }
  }

  // Get trip type by ID
  async getTripTypeById(id: number): Promise<TripType> {
    try {
      const response = await apiService.get<TripType>(API_CONFIG.ENDPOINTS.TRIP_TYPES.GET(id));
      return response;
    } catch (error) {
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
