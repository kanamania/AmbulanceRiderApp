import apiService from './api.service';
import { API_CONFIG } from '../config/api.config';
import { Vehicle, VehicleType, CreateVehicleData, UpdateVehicleData } from '../types';

class VehicleService {
  // Get all vehicles
  async getAllVehicles(): Promise<Vehicle[]> {
    try {
      const response = await apiService.get<Vehicle[]>(API_CONFIG.ENDPOINTS.VEHICLES.LIST);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch vehicles');
    }
  }

  // Get all vehicle types
  async getVehicleTypes(): Promise<VehicleType[]> {
    try {
      const response = await apiService.get<VehicleType[]>(API_CONFIG.ENDPOINTS.VEHICLES.TYPES);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch vehicle types');
    }
  }

  // Get vehicle by ID
  async getVehicleById(id: number): Promise<Vehicle> {
    try {
      const response = await apiService.get<Vehicle>(API_CONFIG.ENDPOINTS.VEHICLES.GET(id));
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch vehicle');
    }
  }

  // Create new vehicle (Admin, Dispatcher)
  async createVehicle(data: CreateVehicleData): Promise<Vehicle> {
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      
      if (data.image) {
        formData.append('image', data.image);
      }
      
      data.types.forEach(type => {
        formData.append('types', type);
      });

      const response = await apiService.post<Vehicle>(
        API_CONFIG.ENDPOINTS.VEHICLES.CREATE,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create vehicle');
    }
  }

  // Update vehicle (Admin, Dispatcher)
  async updateVehicle(id: number, data: UpdateVehicleData): Promise<Vehicle> {
    try {
      const formData = new FormData();
      
      if (data.name) formData.append('name', data.name);
      if (data.image) formData.append('image', data.image);
      if (data.removeImage !== undefined) formData.append('removeImage', data.removeImage.toString());
      
      if (data.types) {
        data.types.forEach(type => {
          formData.append('types', type);
        });
      }

      const response = await apiService.put<Vehicle>(
        API_CONFIG.ENDPOINTS.VEHICLES.UPDATE(id),
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update vehicle');
    }
  }

  // Delete vehicle (Admin only)
  async deleteVehicle(id: number): Promise<void> {
    try {
      await apiService.delete(API_CONFIG.ENDPOINTS.VEHICLES.DELETE(id));
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete vehicle');
    }
  }
}

export default new VehicleService();
