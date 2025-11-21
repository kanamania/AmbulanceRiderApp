import apiService from './api.service';
import cacheService from './cache.service';
import { tripService, locationService, tripTypeService, vehicleService } from './index';
import { API_CONFIG } from '../config/api.config';

/**
 * Data Hash Response from /api/system/data
 */
export interface DataHashResponse {
  trips: string;
  locations: string;
  tripTypes: string;
  vehicles: string;
}

/**
 * Full Data Response from /api/system/data?includeData=true
 */
export interface FullDataResponse {
  hashes: DataHashResponse;
  data: {
    trips?: any[];
    locations?: any[];
    tripTypes?: any[];
    vehicles?: any[];
  };
}

/**
 * Stored hashes in local cache
 */
interface StoredHashes {
  trips?: string;
  locations?: string;
  tripTypes?: string;
  vehicles?: string;
  lastSync?: string;
}

/**
 * Data Hash Service
 * Manages hash-based data synchronization
 */
class DataHashService {
  private readonly HASH_STORAGE_KEY = 'data_hashes';
  private readonly LOCALSTORAGE_KEY = 'app_data_hashes';

  /**
   * Fetch current data hashes from server
   * Uses /auth/data-hashes endpoint
   */
  async fetchDataHashes(): Promise<DataHashResponse> {
    try {
      const response = await apiService.get<DataHashResponse>(
        API_CONFIG.ENDPOINTS.AUTH.DATA_HASHES
      );
      return response;
    } catch (error) {
      console.error('Error fetching data hashes:', error);
      throw error;
    }
  }

  /**
   * Fetch all data with hashes from server
   * Uses /system/data endpoint with optional include params
   * @param entities - Optional array of entities to fetch. If not provided, fetches all.
   */
  async fetchFullData(entities?: string[]): Promise<FullDataResponse> {
    try {
      let url = API_CONFIG.ENDPOINTS.SYSTEM.DATA;
      
      // If specific entities provided, add query params
      if (entities && entities.length > 0) {
        const params = new URLSearchParams();
        if (entities.includes('trips')) params.append('includeTrips', 'true');
        if (entities.includes('locations')) params.append('includeLocations', 'true');
        if (entities.includes('tripTypes')) params.append('includeTripTypes', 'true');
        if (entities.includes('vehicles')) params.append('includeVehicles', 'true');
        url = `${url}?${params.toString()}`;
      }
      // If no params, backend will return all entities by default
      
      const response = await apiService.get<FullDataResponse>(url);
      return response;
    } catch (error) {
      console.error('Error fetching full data:', error);
      throw error;
    }
  }

  /**
   * Get stored hashes from cache (with localStorage fallback)
   */
  async getStoredHashes(): Promise<StoredHashes> {
    try {
      // Try cache first
      const hashes = await cacheService.getMetadata(this.HASH_STORAGE_KEY);
      if (hashes && Object.keys(hashes).length > 0) {
        return hashes;
      }
      
      // Fallback to localStorage
      const localHashes = this.getStoredHashesFromLocalStorage();
      return localHashes || {};
    } catch (error) {
      console.error('Error getting stored hashes:', error);
      // Try localStorage as last resort
      return this.getStoredHashesFromLocalStorage() || {};
    }
  }

  /**
   * Get stored hashes from localStorage (synchronous)
   */
  private getStoredHashesFromLocalStorage(): StoredHashes | null {
    try {
      const stored = localStorage.getItem(this.LOCALSTORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      return null;
    } catch (error) {
      console.error('Error reading hashes from localStorage:', error);
      return null;
    }
  }

  /**
   * Save hashes to both cache and localStorage
   */
  async saveHashes(hashes: DataHashResponse): Promise<void> {
    try {
      const storedHashes: StoredHashes = {
        ...hashes,
        lastSync: new Date().toISOString()
      };
      
      // Save to cache
      await cacheService.setMetadata(this.HASH_STORAGE_KEY, storedHashes);
      
      // Also save to localStorage for easy reference
      try {
        localStorage.setItem(this.LOCALSTORAGE_KEY, JSON.stringify(storedHashes));
        console.log('Data hashes saved to cache and localStorage:', storedHashes);
      } catch (localStorageError) {
        console.warn('Failed to save hashes to localStorage:', localStorageError);
        console.log('Data hashes saved to cache only:', storedHashes);
      }
    } catch (error) {
      console.error('Error saving hashes:', error);
    }
  }

  /**
   * Compare server hashes with stored hashes
   * Returns list of entities that need to be synced
   */
  async compareHashes(serverHashes: DataHashResponse): Promise<string[]> {
    const storedHashes = await this.getStoredHashes();
    const changedEntities: string[] = [];

    if (storedHashes.trips !== serverHashes.trips) {
      changedEntities.push('trips');
    }
    if (storedHashes.locations !== serverHashes.locations) {
      changedEntities.push('locations');
    }
    if (storedHashes.tripTypes !== serverHashes.tripTypes) {
      changedEntities.push('tripTypes');
    }
    if (storedHashes.vehicles !== serverHashes.vehicles) {
      changedEntities.push('vehicles');
    }

    return changedEntities;
  }

  /**
   * Sync entity from full data response (bulk sync)
   */
  private async syncEntityFromFullData(entityName: string, data: FullDataResponse['data']): Promise<void> {
    console.log(`Syncing ${entityName} from bulk data...`);
    
    try {
      switch (entityName) {
        case 'trips': {
          if (data.trips && data.trips.length > 0) {
            await cacheService.upsertTrips(data.trips);
            console.log(`Synced ${data.trips.length} trips (bulk)`);
          } else {
            console.log('No trips in bulk data');
          }
          break;
        }

        case 'locations': {
          if (data.locations && data.locations.length > 0) {
            await cacheService.upsertLocations(data.locations);
            console.log(`Synced ${data.locations.length} locations (bulk)`);
          } else {
            console.log('No locations in bulk data');
          }
          break;
        }

        case 'tripTypes': {
          if (data.tripTypes && data.tripTypes.length > 0) {
            await cacheService.upsertTripTypes(data.tripTypes);
            console.log(`Synced ${data.tripTypes.length} trip types (bulk)`);
          } else {
            console.log('No trip types in bulk data');
          }
          break;
        }

        case 'vehicles': {
          if (data.vehicles && data.vehicles.length > 0) {
            await cacheService.upsertVehicles(data.vehicles);
            console.log(`Synced ${data.vehicles.length} vehicles (bulk)`);
          } else {
            console.log('No vehicles in bulk data');
          }
          break;
        }

        default:
          console.warn(`Unknown entity: ${entityName}`);
      }
    } catch (error) {
      console.error(`Error syncing ${entityName} from bulk data:`, error);
      throw error;
    }
  }

  /**
   * Sync specific entity data (individual sync)
   * Fetches directly from API to ensure fresh data, bypassing service cache logic
   */
  async syncEntity(entityName: string): Promise<void> {
    console.log(`Syncing ${entityName}...`);
    
    try {
      switch (entityName) {
        case 'trips': {
          // Fetch directly from API
          const trips = await apiService.get<any[]>(API_CONFIG.ENDPOINTS.TRIPS.LIST);
          if (trips && trips.length > 0) {
            await cacheService.upsertTrips(trips);
            console.log(`Synced ${trips.length} trips`);
          } else {
            console.log('No trips to sync');
          }
          break;
        }

        case 'locations': {
          // Fetch directly from API
          const locations = await apiService.get<any[]>(API_CONFIG.ENDPOINTS.LOCATIONS.LIST);
          if (locations && locations.length > 0) {
            await cacheService.upsertLocations(locations);
            console.log(`Synced ${locations.length} locations`);
          } else {
            console.log('No locations to sync');
          }
          break;
        }

        case 'tripTypes': {
          // Fetch directly from API
          const tripTypes = await apiService.get<any[]>(API_CONFIG.ENDPOINTS.TRIP_TYPES.LIST);
          if (tripTypes && tripTypes.length > 0) {
            await cacheService.upsertTripTypes(tripTypes);
            console.log(`Synced ${tripTypes.length} trip types`);
          } else {
            console.log('No trip types to sync');
          }
          break;
        }

        case 'vehicles': {
          // Fetch directly from API
          const vehicles = await apiService.get<{ data: any[] }>(API_CONFIG.ENDPOINTS.VEHICLES.LIST);
          if (vehicles && vehicles.data && vehicles.data.length > 0) {
            await cacheService.upsertVehicles(vehicles.data);
            console.log(`Synced ${vehicles.data.length} vehicles (individual)`);
          } else {
            console.log('No vehicles to sync');
          }
          break;
        }

        default:
          console.warn(`Unknown entity: ${entityName}`);
      }
    } catch (error) {
      console.error(`Error syncing ${entityName}:`, error);
      throw error;
    }
  }

  /**
   * Perform full data synchronization
   * Checks hashes and only syncs changed data
   * Optimization: If 3+ entities need updating, fetch all data in one call
   */
  async performSync(): Promise<{
    success: boolean;
    syncedEntities: string[];
    errors: string[];
  }> {
    const syncedEntities: string[] = [];
    const errors: string[] = [];

    try {
      console.log('Starting data synchronization...');

      // Fetch current hashes from server
      const serverHashes = await this.fetchDataHashes();
      console.log('Server hashes:', serverHashes);

      // Compare with stored hashes
      const changedEntities = await this.compareHashes(serverHashes);
      
      if (changedEntities.length === 0) {
        console.log('All data is up to date, no sync needed');
        return { success: true, syncedEntities: [], errors: [] };
      }

      console.log('Entities to sync:', changedEntities);

      // Optimization: If 3+ entities need updating, fetch all data in one call
      if (changedEntities.length >= 3) {
        console.log(`${changedEntities.length} entities changed, fetching in single call...`);
        try {
          // Fetch only the changed entities
          const fullData = await this.fetchFullData(changedEntities);
          
          // Sync all entities from full data response
          for (const entity of changedEntities) {
            try {
              await this.syncEntityFromFullData(entity, fullData.data);
              syncedEntities.push(entity);
            } catch (error) {
              const errorMsg = `Failed to sync ${entity}: ${error instanceof Error ? error.message : 'Unknown error'}`;
              console.error(errorMsg);
              errors.push(errorMsg);
            }
          }
          
          // Save hashes from full data response
          if (errors.length === 0) {
            await this.saveHashes(fullData.hashes);
            console.log('Data synchronization completed successfully (bulk)');
          }
        } catch (error) {
          console.error('Bulk sync failed, falling back to individual calls:', error);
          // Fallback to individual calls
          for (const entity of changedEntities) {
            try {
              await this.syncEntity(entity);
              syncedEntities.push(entity);
            } catch (error) {
              const errorMsg = `Failed to sync ${entity}: ${error instanceof Error ? error.message : 'Unknown error'}`;
              console.error(errorMsg);
              errors.push(errorMsg);
            }
          }
          
          if (errors.length === 0) {
            await this.saveHashes(serverHashes);
          }
        }
      } else {
        // 1-2 entities: Use individual API calls
        console.log('1-2 entities changed, using individual API calls...');
        for (const entity of changedEntities) {
          try {
            await this.syncEntity(entity);
            syncedEntities.push(entity);
          } catch (error) {
            const errorMsg = `Failed to sync ${entity}: ${error instanceof Error ? error.message : 'Unknown error'}`;
            console.error(errorMsg);
            errors.push(errorMsg);
          }
        }

        // Save new hashes if all syncs succeeded
        if (errors.length === 0) {
          await this.saveHashes(serverHashes);
          console.log('Data synchronization completed successfully (individual)');
        } else {
          console.warn('Data synchronization completed with errors');
        }
      }

      return {
        success: errors.length === 0,
        syncedEntities,
        errors
      };
    } catch (error) {
      console.error('Data synchronization failed:', error);
      return {
        success: false,
        syncedEntities,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Force full sync (ignore hashes)
   */
  async forceFullSync(): Promise<void> {
    console.log('Forcing full data sync...');
    
    const entities = ['trips', 'locations', 'tripTypes', 'vehicles'];
    
    for (const entity of entities) {
      await this.syncEntity(entity);
    }

    // Fetch and save current hashes
    try {
      const serverHashes = await this.fetchDataHashes();
      await this.saveHashes(serverHashes);
    } catch (error) {
      console.error('Error saving hashes after force sync:', error);
    }

    console.log('Force sync completed');
  }

  /**
   * Clear stored hashes from both cache and localStorage
   */
  async clearHashes(): Promise<void> {
    try {
      // Clear from cache
      await cacheService.setMetadata(this.HASH_STORAGE_KEY, {});
      
      // Clear from localStorage
      try {
        localStorage.removeItem(this.LOCALSTORAGE_KEY);
        console.log('Stored hashes cleared from cache and localStorage');
      } catch (localStorageError) {
        console.warn('Failed to clear hashes from localStorage:', localStorageError);
        console.log('Stored hashes cleared from cache only');
      }
    } catch (error) {
      console.error('Error clearing hashes:', error);
    }
  }

  /**
   * Get sync status information
   */
  async getSyncStatus(): Promise<{
    hasStoredHashes: boolean;
    lastSync?: string;
    storedHashes: StoredHashes;
  }> {
    const storedHashes = await this.getStoredHashes();
    return {
      hasStoredHashes: Object.keys(storedHashes).length > 0,
      lastSync: storedHashes.lastSync,
      storedHashes
    };
  }
}

export default new DataHashService();
