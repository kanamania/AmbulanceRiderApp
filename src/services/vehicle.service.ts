import apiService from './api.service';
import { API_CONFIG } from '../config/api.config';
import { Vehicle, VehicleType, VehicleFilters, VehicleFormData, PaginatedResponse } from '../types';

class VehicleService {
  async getVehicles(filters?: VehicleFilters): Promise<PaginatedResponse<Vehicle>> {
    const params = new URLSearchParams();
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.search) params.append('search', filters.search);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.vehicleTypeId) params.append('vehicleTypeId', filters.vehicleTypeId.toString());
    
    const response = await apiService.get<PaginatedResponse<Vehicle>>(
      `${API_CONFIG.ENDPOINTS.VEHICLES.LIST}?${params.toString()}`
    );
    return response;
  }

  async getVehicle(id: number): Promise<Vehicle> {
    return await apiService.get<Vehicle>(API_CONFIG.ENDPOINTS.VEHICLES.GET(id));
  }

  async getVehicleTypes(): Promise<VehicleType[]> {
    return await apiService.get<VehicleType[]>(API_CONFIG.ENDPOINTS.VEHICLES.TYPES);
  }

  async createVehicle(data: Partial<Vehicle>): Promise<Vehicle> {
    return await apiService.post<Vehicle>(API_CONFIG.ENDPOINTS.VEHICLES.CREATE, data);
  }

  async updateVehicle(id: number, data: Partial<VehicleFormData>): Promise<Vehicle> {
    return await apiService.put<Vehicle>(API_CONFIG.ENDPOINTS.VEHICLES.UPDATE(id), data);
  }

  async deleteVehicle(id: number): Promise<void> {
    await apiService.delete(API_CONFIG.ENDPOINTS.VEHICLES.DELETE(id));
  }
}

export default new VehicleService();
