import apiService from './api.service';
import cacheService from './cache.service';
import {tripService} from './index';
import {CreateTripData, DataHashResponse, LocalTrip, LocationPlace, SyncStatus, Trip, TripType, User} from '../types';
import {clearStoredHashes, compareHashes, getStoredHashes, storeHashes} from '../utils/hash.util';
import {API_CONFIG} from '../config/api.config';

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
   * Check if user is authenticated
   */
  private isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    return !!token;
  }

  /**
   * Perform initial sync after login
   */
  async performInitialSync(): Promise<void> {
    // Check if user is authenticated
    if (!this.isAuthenticated()) {
      console.warn('Cannot sync: User is not authenticated');
      return;
    }

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
   * Requires authentication
   */
  private async fetchDataHashes(): Promise<DataHashResponse> {
    if (!this.isAuthenticated()) {
      throw new Error('User must be authenticated to fetch data hashes');
    }
    return await apiService.get<DataHashResponse>('/auth/data-hashes');
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
      await cacheService.upsertTripTypes(response);
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
      const response = await apiService.get<LocationPlace[]>(API_CONFIG.ENDPOINTS.LOCATIONS.LIST);
      await cacheService.upsertLocations(response);
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

      await cacheService.upsertTrips(response);
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
      await apiService.get<User>('/auth/profile');
      // Note: User storage is handled separately via localStorage
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

      await cacheService.upsertTrips([localTrip]);
      console.log('Trip created locally (offline mode)');
      return localTrip;
    } else {
      // Create trip via API when online
      try {
        const response = await tripService.createTrip(tripData);
        
        // Store the API response locally
        await cacheService.upsertTrips([response]);
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

        await cacheService.upsertTrips([localTrip]);
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
      // Note: getPendingSyncTrips needs to be implemented in cacheService
      // For now, get all trips and filter locally
      const allTrips = await cacheService.getTrips();
      const pendingTrips: LocalTrip[] = allTrips.filter(t => (t as LocalTrip).isLocal && (t as LocalTrip).syncStatus === 'pending') as LocalTrip[];
      
      for (const trip of pendingTrips) {
        try {
          if (trip.isLocal) {
            // This is a new trip, create it on server
            const { ...tripData } = trip;
            const serverTrip = await tripService.createTrip({
              ...tripData,
              attributeValues: trip.attributeValues || undefined
            });
            
            // Update local trip with server data
            await cacheService.upsertTrips([serverTrip]);
            
            // Note: Removing local trip would need a delete method in cacheService
            // For now, the upsert will replace the local trip with server data
          }
          
          console.log(`Trip ${trip.id} synced successfully`);
        } catch (error) {
          console.error(`Failed to sync trip ${trip.id}:`, error);
          // Note: updateTripSyncStatus would need to be implemented in cacheService
          // For now, just log the error
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
      return await apiService.get<User>('/auth/profile');
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
      await cacheService.clearAllData();
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
    return await cacheService.getTripTypes();
  }

  /**
   * Get local locations
   */
  async getLocalLocations(): Promise<LocationPlace[]> {
    return await cacheService.getLocations();
  }

  /**
   * Get local trips
   */
  async getLocalTrips(): Promise<Trip[]> {
    return await cacheService.getTrips();
  }

  /**
   * Get local user profile
   */
  async getLocalUser(): Promise<User | null> {
    // User data is stored in localStorage, not in cache
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  }
}

// Export singleton instance
const syncService = new SyncService();
export default syncService;
