import apiService from './api.service';
import { syncService } from './index';
import { API_CONFIG } from '../config/api.config';
import {
  Trip,
  CreateTripData,
  ApproveTripRequest,
  StartTripRequest,
  CompleteTripRequest,
  CancelTripRequest,
  UpdateTripStatusRequest,
  TripStatusLog,
} from '../types';

class TripService {
  // Get all trips for the current user
  async getAllTrips(): Promise<Trip[]> {
    try {
      const response = await apiService.get<Trip[]>(API_CONFIG.ENDPOINTS.TRIPS.LIST);
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch trips';
      throw new Error(message);
    }
  }

  // Get trip by ID
  async getTripById(id: number): Promise<Trip> {
    try {
      const response = await apiService.get<Trip>(API_CONFIG.ENDPOINTS.TRIPS.GET(id));
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch trip';
      throw new Error(message);
    }
  }

  // Get trips by status
  async getTripsByStatus(status: string): Promise<Trip[]> {
    try {
      const response = await apiService.get<Trip[]>(API_CONFIG.ENDPOINTS.TRIPS.BY_STATUS(status));
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch trips by status';
      throw new Error(message);
    }
  }

  // Get pending trips
  async getPendingTrips(): Promise<Trip[]> {
    try {
      const response = await apiService.get<Trip[]>(API_CONFIG.ENDPOINTS.TRIPS.PENDING);
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch pending trips';
      throw new Error(message);
    }
  }

  // Get trips by route
  async getTripsByRoute(routeId: number): Promise<Trip[]> {
    try {
      const response = await apiService.get<Trip[]>(API_CONFIG.ENDPOINTS.TRIPS.BY_ROUTE(routeId));
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch trips by route';
      throw new Error(message);
    }
  }

  // Get trips by driver
  async getTripsByDriver(driverId: number): Promise<Trip[]> {
    try {
      const response = await apiService.get<Trip[]>(API_CONFIG.ENDPOINTS.TRIPS.BY_DRIVER(driverId));
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch trips by driver';
      throw new Error(message);
    }
  }

  // Create new trip
  async createTrip(data: CreateTripData): Promise<Trip> {
    try {
      const response = await apiService.post<Trip>(
        API_CONFIG.ENDPOINTS.TRIPS.CREATE,
        data
      );
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create trip';
      throw new Error(message);
    }
  }

  // Update trip
  async updateTrip(id: number, data: Partial<CreateTripData>): Promise<Trip> {
    try {
      const response = await apiService.put<Trip>(
        API_CONFIG.ENDPOINTS.TRIPS.UPDATE(id),
        data
      );
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update trip';
      throw new Error(message);
    }
  }

  // Approve or reject trip
  async approveTrip(id: number, data: ApproveTripRequest): Promise<Trip> {
    try {
      const response = await apiService.post<Trip>(
        API_CONFIG.ENDPOINTS.TRIPS.APPROVE(id),
        data
      );
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to approve/reject trip';
      throw new Error(message);
    }
  }

  // Start trip
  async startTrip(id: number, data: StartTripRequest): Promise<Trip> {
    try {
      const response = await apiService.post<Trip>(
        API_CONFIG.ENDPOINTS.TRIPS.START(id),
        data
      );
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to start trip';
      throw new Error(message);
    }
  }

  // Complete trip
  async completeTrip(id: number, data: CompleteTripRequest): Promise<Trip> {
    try {
      const response = await apiService.post<Trip>(
        API_CONFIG.ENDPOINTS.TRIPS.COMPLETE(id),
        data
      );
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to complete trip';
      throw new Error(message);
    }
  }

  // Cancel trip
  async cancelTrip(id: number, data?: CancelTripRequest): Promise<Trip> {
    try {
      const response = await apiService.post<Trip>(
        API_CONFIG.ENDPOINTS.TRIPS.CANCEL(id),
        data || {}
      );
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to cancel trip';
      throw new Error(message);
    }
  }

  // Update trip status (unified endpoint)
  async updateTripStatus(data: UpdateTripStatusRequest): Promise<Trip> {
    try {
      const response = await apiService.put<Trip>(
        API_CONFIG.ENDPOINTS.TRIPS.UPDATE_STATUS(data.id),
        data
      );
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update trip status';
      throw new Error(message);
    }
  }

  // Get trip status logs
  async getTripStatusLogs(id: number): Promise<TripStatusLog[]> {
    try {
      const response = await apiService.get<TripStatusLog[]>(
        API_CONFIG.ENDPOINTS.TRIPS.STATUS_LOGS(id)
      );
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch trip status logs';
      throw new Error(message);
    }
  }

  // Delete trip
  async deleteTrip(id: number): Promise<void> {
    try {
      await apiService.delete(API_CONFIG.ENDPOINTS.TRIPS.DELETE(id));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete trip';
      throw new Error(message);
    }
  }

  // Sync-aware methods

  // Get trips from local cache first, then API if needed
  async getTripsWithSync(): Promise<Trip[]> {
    try {
      // Try to get from local cache first
      const localTrips = await syncService.getLocalTrips();
      if (localTrips.length > 0) {
        return localTrips;
      }
      
      // Fallback to API
      return await this.getAllTrips();
    } catch (error) {
      console.warn('Failed to get trips from cache, falling back to API:', error);
      return await this.getAllTrips();
    }
  }

  // Create trip with sync support
  async createTripWithSync(data: CreateTripData): Promise<Trip> {
    try {
      // Use sync service to handle local/online creation
      return await syncService.createLocalTrip(data);
    } catch (error) {
      console.error('Failed to create trip with sync:', error);
      throw error;
    }
  }

  // Get trip by ID with local cache support
  async getTripByIdWithSync(id: number): Promise<Trip | null> {
    try {
      // Try local cache first
      const localTrips = await syncService.getLocalTrips();
      const localTrip = localTrips.find(trip => trip.id === id);
      
      if (localTrip) {
        return localTrip;
      }
      
      // Fallback to API
      return await this.getTripById(id);
    } catch (error) {
      console.warn('Failed to get trip from cache, falling back to API:', error);
      try {
        return await this.getTripById(id);
      } catch {
        return null;
      }
    }
  }

  // Update trip status with local cache update
  async updateTripStatusWithSync(data: UpdateTripStatusRequest): Promise<Trip> {
    try {
      // Update via API
      const updatedTrip = await this.updateTripStatus(data);
      
      // Update local cache
      try {
        await syncService.getLocalTrips(); // Ensure cache is loaded
        const localTrips = await syncService.getLocalTrips();
        const tripIndex = localTrips.findIndex(trip => trip.id === data.id);
        
        if (tripIndex !== -1) {
          localTrips[tripIndex] = updatedTrip;
          // Update the trip in local database
          // This would need a method in syncService to update single trip
        }
      } catch (cacheError) {
        console.warn('Failed to update local cache:', cacheError);
      }
      
      return updatedTrip;
    } catch (error) {
      console.error('Failed to update trip status:', error);
      throw error;
    }
  }

  // Sync pending trips
  async syncPendingTrips(): Promise<void> {
    try {
      await syncService.syncPendingTrips();
    } catch (error) {
      console.error('Failed to sync pending trips:', error);
      throw error;
    }
  }

  // Force full sync
  async forceFullSync(): Promise<void> {
    try {
      await syncService.forceFullSync();
    } catch (error) {
      console.error('Failed to force full sync:', error);
      throw error;
    }
  }
}

export default new TripService();
