import apiService from './api.service';
import databaseService from './database.service';
import { tripService } from './index';
import { 
  DataHashResponse, 
  SyncStatus, 
  LocalTrip 
} from '../types/database.types';
import { 
  compareHashes, 
  getStoredHashes, 
  storeHashes, 
  clearStoredHashes 
} from '../utils/hash.util';
import { Trip, TripType, Location, User, CreateTripData } from '../types';
import { API_CONFIG } from '../config/api.config';

class SyncService {
  private syncInProgress = false;
  private isOnline = navigator.onLine;

  constructor() {
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.attemptPendingSync();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  /**
   * Get current sync status
   */
  getSyncStatus(): SyncStatus {
    const storedHashes = getStoredHashes();
    return {
      isOnline: this.isOnline,
      lastSyncTime: storedHashes?.lastSync || null,
      pendingSync: this.hasPendingSync(),
      syncInProgress: this.syncInProgress
    };
  }

  /**
   * Check if there are pending sync items
   */
  private hasPendingSync(): boolean {
    // This would be enhanced to check local database for pending items
    return false;
  }

  /**
   * Perform initial sync after login
   */
  async performInitialSync(): Promise<void> {
    if (this.syncInProgress) {
      throw new Error('Sync already in progress');
    }

    if (!this.isOnline) {
      throw new Error('Device is offline');
    }

    try {
      this.syncInProgress = true;

      // Get data hashes from API
      const hashResponse = await this.fetchDataHashes();
      const storedHashes = getStoredHashes();

      // Compare hashes to determine what needs to be synced
      const changes = storedHashes 
        ? compareHashes(storedHashes, hashResponse)
        : {
            userChanged: true,
            profileChanged: true,
            tripTypesChanged: true,
            tripsChanged: true,
            locationsChanged: true,
            othersChanged: true
          };

      // Sync changed data
      await this.syncChangedData(changes);

      // Store the new hashes
      storeHashes(hashResponse);

      console.log('Initial sync completed successfully');
    } catch (error) {
      console.error('Initial sync failed:', error);
      throw error;
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Fetch data hashes from API
   */
  private async fetchDataHashes(): Promise<DataHashResponse> {
    const response = await apiService.get<DataHashResponse>('/auth/data-hashes');
    return response;
  }

  /**
   * Sync data that has changed based on hash comparison
   */
  private async syncChangedData(changes: {
    userChanged: boolean;
    profileChanged: boolean;
    tripTypesChanged: boolean;
    tripsChanged: boolean;
    locationsChanged: boolean;
    othersChanged: boolean;
  }): Promise<void> {
    const promises: Promise<void>[] = [];

    if (changes.tripTypesChanged) {
      promises.push(this.syncTripTypes());
    }

    if (changes.locationsChanged) {
      promises.push(this.syncLocations());
    }

    if (changes.tripsChanged) {
      promises.push(this.syncTrips());
    }

    if (changes.profileChanged) {
      promises.push(this.syncUserProfile());
    }

    // Execute all sync operations in parallel
    await Promise.all(promises);
  }

  /**
   * Sync trip types
   */
  private async syncTripTypes(): Promise<void> {
    try {
      const response = await apiService.get<TripType[]>(API_CONFIG.ENDPOINTS.TRIP_TYPES.LIST);
      await databaseService.upsertTripTypes(response);
      console.log('Trip types synced successfully');
    } catch (error) {
      console.error('Failed to sync trip types:', error);
      throw error;
    }
  }

  /**
   * Sync locations
   */
  private async syncLocations(): Promise<void> {
    try {
      const response = await apiService.get<Location[]>(API_CONFIG.ENDPOINTS.LOCATIONS.LIST);
      await databaseService.upsertLocations(response);
      console.log('Locations synced successfully');
    } catch (error) {
      console.error('Failed to sync locations:', error);
      throw error;
    }
  }

  /**
   * Sync trips (user's trips or all trips for admin/dispatcher)
   */
  private async syncTrips(): Promise<void> {
    try {
      // Get user data to determine role
      const user = await this.getCurrentUser();
      let response;

      if (user?.roles.some(role => ['Admin', 'Dispatcher'].includes(role))) {
        // Admin/Dispatcher gets all trips
        response = await apiService.get<Trip[]>(API_CONFIG.ENDPOINTS.TRIPS.LIST);
      } else {
        // Regular user gets their own trips
        response = await apiService.get<Trip[]>(API_CONFIG.ENDPOINTS.TRIPS.BY_DRIVER(user?.id || 0));
      }

      await databaseService.upsertTrips(response);
      console.log('Trips synced successfully');
    } catch (error) {
      console.error('Failed to sync trips:', error);
      throw error;
    }
  }

  /**
   * Sync user profile
   */
  private async syncUserProfile(): Promise<void> {
    try {
      const response = await apiService.get<User>('/auth/profile');
      await databaseService.upsertUser(response);
      console.log('User profile synced successfully');
    } catch (error) {
      console.error('Failed to sync user profile:', error);
      throw error;
    }
  }

  /**
   * Create a trip locally and mark for sync
   */
  async createLocalTrip(tripData: CreateTripData): Promise<Trip> {
    if (!this.isOnline) {
      // Create trip locally when offline
      const localTrip: LocalTrip = {
        ...tripData,
        id: Date.now() * -1, // Negative ID to indicate local
        createdAt: new Date().toISOString(),
        status: 'pending',
        attributeValues: tripData.attributeValues || [],
        scheduledStartTime: tripData.scheduledStartTime || new Date().toISOString(),
        isLocal: true,
        syncStatus: 'pending'
      };

      await databaseService.upsertTrips([localTrip]);
      console.log('Trip created locally (offline mode)');
      return localTrip;
    } else {
      // Create trip via API when online
      try {
        const response = await tripService.createTrip(tripData);
        
        // Store the API response locally
        await databaseService.upsertTrips([response]);
        console.log('Trip created successfully via API');
        return response;
      } catch (error) {
        console.error('Failed to create trip via API, storing locally:', error);
        
        // Fallback: create locally and mark for sync
        const localTrip: LocalTrip = {
          ...tripData,
          id: Date.now() * -1,
          createdAt: new Date().toISOString(),
          status: 'pending',
          attributeValues: tripData.attributeValues || [],
          scheduledStartTime: tripData.scheduledStartTime || new Date().toISOString(),
          isLocal: true,
          syncStatus: 'pending'
        };

        await databaseService.upsertTrips([localTrip]);
        return localTrip;
      }
    }
  }

  /**
   * Sync pending local trips to server
   */
  async syncPendingTrips(): Promise<void> {
    if (!this.isOnline) {
      throw new Error('Device is offline, cannot sync');
    }

    try {
      const pendingTrips = await databaseService.getPendingSyncTrips();
      
      for (const trip of pendingTrips) {
        try {
          if (trip.isLocal) {
            // This is a new trip, create it on server
            const { ...tripData } = trip;
            const serverTrip = await tripService.createTrip({
              ...tripData,
              attributeValues: trip.attributeValues
            });
            
            // Update local trip with server data
            await databaseService.upsertTrips([serverTrip]);
            
            // Remove the local trip
            await databaseService.getConnection()?.query(
              `DELETE FROM trips WHERE id = ?`,
              [trip.id]
            );
          }
          
          console.log(`Trip ${trip.id} synced successfully`);
        } catch (error) {
          console.error(`Failed to sync trip ${trip.id}:`, error);
          await databaseService.updateTripSyncStatus(
            trip.id, 
            'error', 
            error instanceof Error ? error.message : 'Unknown error'
          );
        }
      }
    } catch (error) {
      console.error('Failed to sync pending trips:', error);
      throw error;
    }
  }

  /**
   * Attempt to sync pending items when coming back online
   */
  private async attemptPendingSync(): Promise<void> {
    try {
      await this.syncPendingTrips();
    } catch (error) {
      console.error('Auto-sync failed:', error);
    }
  }

  /**
   * Force a full sync of all data
   */
  async forceFullSync(): Promise<void> {
    try {
      // Clear stored hashes to force full sync
      clearStoredHashes();
      await this.performInitialSync();
    } catch (error) {
      console.error('Force sync failed:', error);
      throw error;
    }
  }

  /**
   * Get current user from API
   */
  private async getCurrentUser(): Promise<User | null> {
    try {
      const response = await apiService.get<User>('/auth/profile');
      return response;
    } catch (error) {
      console.error('Failed to get current user:', error);
      return null;
    }
  }

  /**
   * Clear all local data and hashes
   */
  async clearAllData(): Promise<void> {
    try {
      await databaseService.clearAllData();
      clearStoredHashes();
      console.log('All local data cleared successfully');
    } catch (error) {
      console.error('Failed to clear local data:', error);
      throw error;
    }
  }

  /**
   * Get local trip types
   */
  async getLocalTripTypes(): Promise<TripType[]> {
    return await databaseService.getTripTypes();
  }

  /**
   * Get local locations
   */
  async getLocalLocations(): Promise<Location[]> {
    return await databaseService.getLocations();
  }

  /**
   * Get local trips
   */
  async getLocalTrips(): Promise<Trip[]> {
    return await databaseService.getTrips();
  }

  /**
   * Get local user profile
   */
  async getLocalUser(): Promise<User | null> {
    return await databaseService.getUser();
  }
}

// Export singleton instance
const syncService = new SyncService();
export default syncService;
