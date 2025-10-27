import apiService from './api.service';
import { API_CONFIG } from '../config/api.config';
import { Route, CreateRouteData, UpdateRouteData } from '../types';

class RouteService {
  // Get all routes
  async getAllRoutes(): Promise<Route[]> {
    try {
      const response = await apiService.get<Route[]>(API_CONFIG.ENDPOINTS.ROUTES.LIST);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch routes');
    }
  }

  // Get route by ID
  async getRouteById(id: number): Promise<Route> {
    try {
      const response = await apiService.get<Route>(API_CONFIG.ENDPOINTS.ROUTES.GET(id));
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch route');
    }
  }

  // Create new route (Admin, Dispatcher)
  async createRoute(data: CreateRouteData): Promise<Route> {
    try {
      const payload = {
        name: data.name,
        fromLocation: null,
        toLocation: null,
        fromLocationId: data.fromLocationId,
        toLocationId: data.toLocationId,
        distance: data.distance,
        estimatedDuration: data.estimatedDuration,
        description: data.description || undefined,
      };

      const response = await apiService.post<Route>(
        API_CONFIG.ENDPOINTS.ROUTES.CREATE,
        payload
      );
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create route');
    }
  }

  // Update route (Admin, Dispatcher)
  async updateRoute(id: number, data: UpdateRouteData): Promise<Route> {
    try {
      const payload: any = {
        fromLocation: null,
        toLocation: null,
      };
      
      if (data.name !== undefined) payload.name = data.name;
      if (data.fromLocationId !== undefined) payload.fromLocationId = data.fromLocationId;
      if (data.toLocationId !== undefined) payload.toLocationId = data.toLocationId;
      if (data.distance !== undefined) payload.distance = data.distance;
      if (data.estimatedDuration !== undefined) payload.estimatedDuration = data.estimatedDuration;
      if (data.description !== undefined) payload.description = data.description;

      const response = await apiService.put<Route>(
        API_CONFIG.ENDPOINTS.ROUTES.UPDATE(id),
        payload
      );
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update route');
    }
  }

  // Delete route (Admin only)
  async deleteRoute(id: number): Promise<void> {
    try {
      await apiService.delete(API_CONFIG.ENDPOINTS.ROUTES.DELETE(id));
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete route');
    }
  }
}

export default new RouteService();
