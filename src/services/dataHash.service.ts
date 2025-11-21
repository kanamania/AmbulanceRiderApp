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

  /**
   * Fetch current data hashes from server
   */
  async fetchDataHashes(): Promise<DataHashResponse> {
    try {
      const response = await apiService.get<DataHashResponse>(
        API_CONFIG.ENDPOINTS.SYSTEM.DATA_HASHES
      );
      return response;
    } catch (error) {
      console.error('Error fetching data hashes:', error);
      throw error;
    }
  }

  /**
   * Get stored hashes from cache
   */
  async getStoredHashes(): Promise<StoredHashes> {
    try {
      const hashes = await cacheService.getMetadata(this.HASH_STORAGE_KEY);
      return hashes || {};
    } catch (error) {
      console.error('Error getting stored hashes:', error);
      return {};
    }
  }

  /**
   * Save hashes to cache
   */
  async saveHashes(hashes: DataHashResponse): Promise<void> {
    try {
      const storedHashes: StoredHashes = {
        ...hashes,
        lastSync: new Date().toISOString()
      };
      await cacheService.setMetadata(this.HASH_STORAGE_KEY, storedHashes);
      console.log('Data hashes saved:', storedHashes);
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
   * Sync specific entity data
   */
  async syncEntity(entityName: string): Promise<void> {
    console.log(`Syncing ${entityName}...`);
    
    try {
      switch (entityName) {
        case 'trips': {
          const trips = await tripService.getAllTrips();
          await cacheService.upsertTrips(trips);
          console.log(`Synced ${trips.length} trips`);
          break;
        }

        case 'locations': {
          const locations = await locationService.getAllLocations();
          await cacheService.upsertLocations(locations);
          console.log(`Synced ${locations.length} locations`);
          break;
        }

        case 'tripTypes': {
          const tripTypes = await tripTypeService.getAllTripTypes();
          await cacheService.upsertTripTypes(tripTypes);
          console.log(`Synced ${tripTypes.length} trip types`);
          break;
        }

        case 'vehicles': {
          const vehiclesResponse = await vehicleService.getVehicles();
          if (vehiclesResponse.data) {
            await cacheService.upsertVehicles(vehiclesResponse.data);
            console.log(`Synced ${vehiclesResponse.data.length} vehicles`);
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

      // Sync each changed entity
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
        console.log('Data synchronization completed successfully');
      } else {
        console.warn('Data synchronization completed with errors');
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
   * Clear stored hashes (useful for testing or reset)
   */
  async clearHashes(): Promise<void> {
    try {
      await cacheService.setMetadata(this.HASH_STORAGE_KEY, {});
      console.log('Stored hashes cleared');
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
