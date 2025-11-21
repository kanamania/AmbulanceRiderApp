import apiService from './api.service';
import cacheService from './cache.service';
import { API_CONFIG } from '../config/api.config';
import { Vehicle, VehicleType, VehicleFilters, VehicleFormData, PaginatedResponse } from '../types';

class VehicleService {
  async getVehicles(filters?: VehicleFilters): Promise<PaginatedResponse<Vehicle>> {
    try {
      // Always check cache first
      const cachedVehicles = await cacheService.getVehicles();
      
      // If we have cached data, use it and apply filters client-side
      if (cachedVehicles.length > 0) {
        console.log('Vehicles loaded from cache:', cachedVehicles.length);
        
        let filteredData = [...cachedVehicles];
        
        // Apply search filter
        if (filters?.search) {
          const searchLower = filters.search.toLowerCase();
          filteredData = filteredData.filter(v => 
            v.name?.toLowerCase().includes(searchLower) ||
            v.plateNumber?.toLowerCase().includes(searchLower)
          );
        }
        
        // Apply vehicle type filter
        if (filters?.vehicleTypeId) {
          filteredData = filteredData.filter(v => v.vehicleTypeId === filters.vehicleTypeId);
        }
        
        // Apply pagination
        const page = filters?.page || 1;
        const limit = filters?.limit || filteredData.length;
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedData = filteredData.slice(startIndex, endIndex);
        
        return {
          data: paginatedData,
          total: filteredData.length,
          page: page,
          pageSize: limit
        };
      }
      
      // No cache, fetch from API
      console.log('No cached vehicles, fetching from API');
      const params = new URLSearchParams();
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.search) params.append('search', filters.search);
      if (filters?.vehicleTypeId) params.append('vehicleTypeId', filters.vehicleTypeId.toString());
      
      const response = await apiService.get<PaginatedResponse<Vehicle>>(
        `${API_CONFIG.ENDPOINTS.VEHICLES.LIST}?${params.toString()}`
      );
      
      // Cache the fetched data
      if (response.data && response.data.length > 0) {
        await cacheService.upsertVehicles(response.data);
        console.log('Vehicles cached:', response.data.length);
      }
      
      return response;
    } catch (error) {
      console.error('Error in getVehicles:', error);
      // Fallback to cache on error
      const cachedVehicles = await cacheService.getVehicles();
      if (cachedVehicles.length > 0) {
        console.log('Using cached vehicles due to API error');
        
        // Apply filters even in error case
        let filteredData = [...cachedVehicles];
        if (filters?.search) {
          const searchLower = filters.search.toLowerCase();
          filteredData = filteredData.filter(v => 
            v.name?.toLowerCase().includes(searchLower) ||
            v.plateNumber?.toLowerCase().includes(searchLower)
          );
        }
        if (filters?.vehicleTypeId) {
          filteredData = filteredData.filter(v => v.vehicleTypeId === filters.vehicleTypeId);
        }
        
        const page = filters?.page || 1;
        const limit = filters?.limit || filteredData.length;
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        
        return {
          data: filteredData.slice(startIndex, endIndex),
          total: filteredData.length,
          page: page,
          pageSize: limit
        };
      }
      throw error;
    }
  }

  async getVehicle(id: number): Promise<Vehicle> {
    try {
      // Check cache first
      const cachedVehicle = await cacheService.getVehicleById(id);
      if (cachedVehicle) {
        console.log('Vehicle loaded from cache:', id);
        return cachedVehicle;
      }
      
      // Fetch from API
      const vehicle = await apiService.get<Vehicle>(API_CONFIG.ENDPOINTS.VEHICLES.GET(id));
      
      // Update cache
      await cacheService.upsertVehicles([vehicle]);
      console.log('Vehicle cached:', id);
      
      return vehicle;
    } catch (error) {
      console.error('Error in getVehicle:', error);
      // Fallback to cache on error
      const cachedVehicle = await cacheService.getVehicleById(id);
      if (cachedVehicle) {
        console.log('Using cached vehicle due to API error:', id);
        return cachedVehicle;
      }
      throw error;
    }
  }

  async getVehicleTypes(): Promise<VehicleType[]> {
    try {
      // Check cache first
      const cachedTypes = await cacheService.getVehicleTypes();
      if (cachedTypes.length > 0) {
        console.log('Vehicle types loaded from cache:', cachedTypes.length);
        return cachedTypes;
      }
      
      // Fetch from API
      const types = await apiService.get<VehicleType[]>(API_CONFIG.ENDPOINTS.VEHICLES.TYPES);
      
      // Update cache
      if (types && types.length > 0) {
        await cacheService.upsertVehicleTypes(types);
        console.log('Vehicle types cached:', types.length);
      }
      
      return types;
    } catch (error) {
      console.error('Error in getVehicleTypes:', error);
      // Fallback to cache on error
      const cachedTypes = await cacheService.getVehicleTypes();
      if (cachedTypes.length > 0) {
        console.log('Using cached vehicle types due to API error');
        return cachedTypes;
      }
      throw error;
    }
  }

  async createVehicle(data: Partial<Vehicle>): Promise<Vehicle> {
    const vehicle = await apiService.post<Vehicle>(API_CONFIG.ENDPOINTS.VEHICLES.CREATE, data);
    
    // Update cache
    await cacheService.upsertVehicles([vehicle]);
    console.log('New vehicle cached:', vehicle.id);
    
    return vehicle;
  }

  async updateVehicle(id: number, data: Partial<VehicleFormData>): Promise<Vehicle> {
    const vehicle = await apiService.put<Vehicle>(API_CONFIG.ENDPOINTS.VEHICLES.UPDATE(id), data);
    
    // Update cache
    await cacheService.upsertVehicles([vehicle]);
    console.log('Updated vehicle cached:', vehicle.id);
    
    return vehicle;
  }

  async deleteVehicle(id: number): Promise<void> {
    await apiService.delete(API_CONFIG.ENDPOINTS.VEHICLES.DELETE(id));
    
    // Remove from cache by fetching all and filtering
    const vehicles = await cacheService.getVehicles();
    const updatedVehicles = vehicles.filter(v => v.id !== id);
    await cacheService.clearVehicles();
    if (updatedVehicles.length > 0) {
      await cacheService.upsertVehicles(updatedVehicles);
    }
    console.log('Vehicle removed from cache:', id);
  }
}

export default new VehicleService();
