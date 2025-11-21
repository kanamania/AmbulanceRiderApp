import apiService from './api.service';
import cacheService from './cache.service';
import { API_CONFIG } from '../config/api.config';
import {LocationPlace, Trip, TripType, Vehicle} from "../types";

/**
 * Data Hash Response from /api/auth/data-hashes (Backend format)
 */
export interface BackendHashResponse {
  userHash?: string;
  profileHash?: string;
  tripsHash?: string;
  locationsHash?: string;
  tripTypesHash?: string;
  vehiclesHash?: string;
}

/**
 * Normalized Data Hash Response (Frontend format)
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
    trips?: Trip[];
    locations?: LocationPlace[];
    tripTypes?: TripType[];
    vehicles?: Vehicle[];
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
      console.log('[Hash Service] Fetching data hashes from server...');
      const backendResponse = await apiService.get<BackendHashResponse>(
        API_CONFIG.ENDPOINTS.AUTH.DATA_HASHES
      );
      
      // Transform backend format to frontend format
      const response: DataHashResponse = {
        trips: backendResponse.tripsHash || '',
        locations: backendResponse.locationsHash || '',
        tripTypes: backendResponse.tripTypesHash || '',
        vehicles: backendResponse.vehiclesHash || ''
      };
      
      console.log('[Hash Service] Server hashes received:', {
        trips: response.trips?.substring(0, 8) + '...',
        locations: response.locations?.substring(0, 8) + '...',
        tripTypes: response.tripTypes?.substring(0, 8) + '...',
        vehicles: response.vehicles?.substring(0, 8) + '...'
      });
      
      return response;
    } catch (error) {
      console.error('[Hash Service] Error fetching data hashes:', error);
      throw error;
    }
  }

  /**
   * Fetch all data with hashes from server
   * Uses /system/data endpoint with optional include params
   * @param entities - Optional array of entities to fetch. If not provided or all 4, fetches all without params.
   */
  async fetchFullData(entities?: string[]): Promise<FullDataResponse> {
    try {
      let url = API_CONFIG.ENDPOINTS.SYSTEM.DATA;
      
      // If all 4 entities or no entities specified, don't add query params
      // Backend returns all data when no params are provided
      const allEntities = ['trips', 'locations', 'tripTypes', 'vehicles'];
      const fetchingAll = !entities || entities.length === 0 || entities.length === 4;
      
      if (fetchingAll) {
        console.log('[Hash Service] Fetching all entity data (no query params)');
      } else {
        // Specific subset of entities - add query params
        const params = new URLSearchParams();
        if (entities.includes('trips')) params.append('includeTrips', 'true');
        if (entities.includes('locations')) params.append('includeLocations', 'true');
        if (entities.includes('tripTypes')) params.append('includeTripTypes', 'true');
        if (entities.includes('vehicles')) params.append('includeVehicles', 'true');
        url = `${url}?${params.toString()}`;
        console.log('[Hash Service] Fetching specific entities:', entities);
      }
      
      console.log('[Hash Service] Bulk data request URL:', url);
      const backendResponse = await apiService.get<any>(url);
      
      // Backend returns flat structure: {trips: [], locations: [], tripTypes: [], vehicles: []}
      // Transform to expected nested structure: {hashes: {...}, data: {...}}
      let response: FullDataResponse;
      
      if (backendResponse.hashes && backendResponse.data) {
        // Already in expected format
        response = backendResponse as FullDataResponse;
      } else if (backendResponse.trips || backendResponse.locations || backendResponse.tripTypes || backendResponse.vehicles) {
        // Flat format - transform it
        console.log('[Hash Service] Transforming flat backend response to nested format');
        response = {
          hashes: {
            trips: '',
            locations: '',
            tripTypes: '',
            vehicles: ''
          },
          data: {
            trips: backendResponse.trips || [],
            locations: backendResponse.locations || [],
            tripTypes: backendResponse.tripTypes || [],
            vehicles: backendResponse.vehicles || []
          }
        };
      } else {
        console.warn('[Hash Service] ⚠ Invalid bulk data response structure:', backendResponse);
        throw new Error('Backend /system/data endpoint returned invalid structure');
      }
      
      const dataSummary: { [key: string]: number | undefined } = {};
      if (response.data.trips) dataSummary.trips = response.data.trips.length;
      if (response.data.locations) dataSummary.locations = response.data.locations.length;
      if (response.data.tripTypes) dataSummary.tripTypes = response.data.tripTypes.length;
      if (response.data.vehicles) dataSummary.vehicles = response.data.vehicles.length;
      console.log('[Hash Service] Bulk data received:', dataSummary);
      
      return response;
    } catch (error) {
      console.error('[Hash Service] Error fetching full data:', error);
      throw error;
    }
  }

  /**
   * Get stored hashes from cache (with localStorage fallback)
   */
  async getStoredHashes(): Promise<StoredHashes> {
    try {
      // Try cache first
      console.log('[Hash Service] Retrieving stored hashes from cache...');
      const hashes = await cacheService.getMetadata(this.HASH_STORAGE_KEY) as StoredHashes;
      if (hashes && Object.keys(hashes).length > 0) {
        console.log('[Hash Service] Stored hashes found in cache:', {
          trips: hashes.trips?.substring(0, 8) + '...',
          locations: hashes.locations?.substring(0, 8) + '...',
          tripTypes: hashes.tripTypes?.substring(0, 8) + '...',
          vehicles: hashes.vehicles?.substring(0, 8) + '...',
          lastSync: hashes.lastSync
        });
        return hashes;
      }
      
      // Fallback to localStorage
      console.log('[Hash Service] Cache empty, checking localStorage...');
      const localHashes = this.getStoredHashesFromLocalStorage();
      if (localHashes && Object.keys(localHashes).length > 0) {
        console.log('[Hash Service] Hashes retrieved from localStorage:', {
          trips: localHashes.trips?.substring(0, 8) + '...',
          locations: localHashes.locations?.substring(0, 8) + '...',
          tripTypes: localHashes.tripTypes?.substring(0, 8) + '...',
          vehicles: localHashes.vehicles?.substring(0, 8) + '...',
          lastSync: localHashes.lastSync
        });
        return localHashes;
      }
      
      console.log('[Hash Service] No stored hashes found (first sync)');
      return {};
    } catch (error) {
      console.error('[Hash Service] Error getting stored hashes:', error);
      // Try localStorage as final fallback
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
   * Save hashes to cache and localStorage
   */
  async saveHashes(hashes: DataHashResponse): Promise<void> {
    try {
      const storedHashes: StoredHashes = {
        ...hashes,
        lastSync: new Date().toISOString()
      };
      
      console.log('[Hash Service] Saving hashes to cache and localStorage...');
      
      // Save to cache
      await cacheService.setMetadata(this.HASH_STORAGE_KEY, storedHashes);
      console.log('[Hash Service] Hashes saved to cache');
      
      // Save to localStorage
      try {
        localStorage.setItem(this.LOCALSTORAGE_KEY, JSON.stringify(storedHashes));
        console.log('[Hash Service] Hashes saved to localStorage');
        console.log('[Hash Service] Sync timestamp:', storedHashes.lastSync);
      } catch (localStorageError) {
        console.warn('[Hash Service] Failed to save hashes to localStorage:', localStorageError);
        console.log('[Hash Service] Hashes saved to cache only');
      }
    } catch (error) {
      console.error('[Hash Service] Error saving hashes:', error);
    }
  }

  /**
   * Compare server hashes with stored hashes
   * Returns list of entities that have changed
   */
  async compareHashes(serverHashes: DataHashResponse): Promise<string[]> {
    console.log('[Hash Service] Comparing server hashes with stored hashes...');
    const storedHashes = await this.getStoredHashes();
    const changedEntities: string[] = [];

    const comparisons = [
      { entity: 'trips', stored: storedHashes.trips, server: serverHashes.trips },
      { entity: 'locations', stored: storedHashes.locations, server: serverHashes.locations },
      { entity: 'tripTypes', stored: storedHashes.tripTypes, server: serverHashes.tripTypes },
      { entity: 'vehicles', stored: storedHashes.vehicles, server: serverHashes.vehicles }
    ];

    comparisons.forEach(({ entity, stored, server }) => {
      if (stored !== server) {
        changedEntities.push(entity);
        console.log(`[Hash Service] ${entity} changed:`, {
          stored: stored ? stored.substring(0, 8) + '...' : 'none',
          server: server ? server.substring(0, 8) + '...' : 'none'
        });
      } else {
        console.log(`[Hash Service] ${entity} unchanged`);
      }
    });

    console.log('[Hash Service] Hash comparison complete. Changed entities:', changedEntities.length > 0 ? changedEntities : 'none');
    return changedEntities;
  }

  /**
   * Sync entity from full data response (bulk sync)
   */
  private async syncEntityFromFullData(entityName: string, data: FullDataResponse['data']): Promise<void> {
    console.log(`[Hash Service] Syncing ${entityName} from bulk data...`);
    
    // Validate data object exists
    if (!data) {
      throw new Error('Bulk data is undefined - backend endpoint may not be implemented');
    }
    
    try {
      switch (entityName) {
        case 'trips': {
          if (data.trips && data.trips.length > 0) {
            await cacheService.upsertTrips(data.trips);
            console.log(`[Hash Service] Synced ${data.trips.length} trips (bulk)`);
          } else {
            console.log('[Hash Service] No trips in bulk data');
          }
          break;
        }

        case 'locations': {
          if (data.locations && data.locations.length > 0) {
            await cacheService.upsertLocations(data.locations);
            console.log(`[Hash Service] Synced ${data.locations.length} locations (bulk)`);
          } else {
            console.log('[Hash Service] No locations in bulk data');
          }
          break;
        }

        case 'tripTypes': {
          if (data.tripTypes && data.tripTypes.length > 0) {
            await cacheService.upsertTripTypes(data.tripTypes);
            console.log(`[Hash Service] Synced ${data.tripTypes.length} trip types (bulk)`);
          } else {
            console.log('[Hash Service] No trip types in bulk data');
          }
          break;
        }

        case 'vehicles': {
          if (data.vehicles && data.vehicles.length > 0) {
            await cacheService.upsertVehicles(data.vehicles);
            console.log(`[Hash Service] Synced ${data.vehicles.length} vehicles (bulk)`);
          } else {
            console.log('[Hash Service] No vehicles in bulk data');
          }
          break;
        }

        default:
          console.warn(`[Hash Service] Unknown entity: ${entityName}`);
      }
    } catch (error) {
      console.error(`[Hash Service] Error syncing ${entityName} from bulk data:`, error);
      throw error;
    }
  }

  /**
   * Sync specific entity data (individual sync)
   * Fetches directly from API to ensure fresh data, bypassing service cache logic
   */
  async syncEntity(entityName: string): Promise<void> {
    console.log(`[Hash Service] Syncing ${entityName}...`);
    
    try {
      switch (entityName) {
        case 'trips': {
          // Fetch directly from API
          const trips = await apiService.get<Trip[]>(API_CONFIG.ENDPOINTS.TRIPS.LIST);
          if (trips && trips.length > 0) {
            await cacheService.upsertTrips(trips);
            console.log(`[Hash Service] Synced ${trips.length} trips`);
          } else {
            console.log('[Hash Service] No trips to sync');
          }
          break;
        }

        case 'locations': {
          // Fetch directly from API
          const locations = await apiService.get<LocationPlace[]>(API_CONFIG.ENDPOINTS.LOCATIONS.LIST);
          if (locations && locations.length > 0) {
            await cacheService.upsertLocations(locations);
            console.log(`[Hash Service] Synced ${locations.length} locations`);
          } else {
            console.log('[Hash Service] No locations to sync');
          }
          break;
        }

        case 'tripTypes': {
          // Fetch directly from API
          const tripTypes = await apiService.get<TripType[]>(API_CONFIG.ENDPOINTS.TRIP_TYPES.LIST);
          if (tripTypes && tripTypes.length > 0) {
            await cacheService.upsertTripTypes(tripTypes);
            console.log(`[Hash Service] Synced ${tripTypes.length} trip types`);
          } else {
            console.log('[Hash Service] No trip types to sync');
          }
          break;
        }

        case 'vehicles': {
          // Fetch directly from API
          const vehicles = await apiService.get<{ data: Vehicle[] }>(API_CONFIG.ENDPOINTS.VEHICLES.LIST);
          if (vehicles && vehicles.data && vehicles.data.length > 0) {
            await cacheService.upsertVehicles(vehicles.data);
            console.log(`[Hash Service] Synced ${vehicles.data.length} vehicles (individual)`);
          } else {
            console.log('[Hash Service] No vehicles to sync');
          }
          break;
        }

        default:
          console.warn(`[Hash Service] Unknown entity: ${entityName}`);
      }
    } catch (error) {
      console.error(`[Hash Service] Error syncing ${entityName}:`, error);
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
      console.log('[Hash Service] Starting data synchronization...');
      
      // Fetch current hashes from server
      const serverHashes = await this.fetchDataHashes();
      console.log('[Hash Service] Server hashes received:', {
        trips: serverHashes.trips?.substring(0, 8) + '...',
        locations: serverHashes.locations?.substring(0, 8) + '...',
        tripTypes: serverHashes.tripTypes?.substring(0, 8) + '...',
        vehicles: serverHashes.vehicles?.substring(0, 8) + '...'
      });
      
      // Compare with stored hashes
      const changedEntities = await this.compareHashes(serverHashes);
      
      if (changedEntities.length === 0) {
        console.log('[Hash Service] All data is up to date, no sync needed');
        return { success: true, syncedEntities: [], errors: [] };
      }

      console.log('[Hash Service] Entities to sync:', changedEntities);

      // Optimization: If 3+ entities need updating, fetch all data in one call
      if (changedEntities.length >= 3) {
        console.log(`[Hash Service] ${changedEntities.length} entities changed, fetching all data...`);
        try {
          // Fetch all data (no query params when 3+ entities)
          const fullData = await this.fetchFullData();
          
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
          
          // Save server hashes (not from fullData which may be empty)
          if (errors.length === 0) {
            await this.saveHashes(serverHashes);
            console.log('[Hash Service] Data synchronization completed successfully (bulk)');
          }
        } catch (error) {
          console.error('[Hash Service] Bulk sync failed, falling back to individual calls:', error);
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
        console.log(`[Hash Service] ${changedEntities.length} ${changedEntities.length === 1 ? 'entity' : 'entities'} changed, using individual API calls...`);
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
          console.log('[Hash Service] Data synchronization completed successfully (individual)');
        } else {
          console.warn('[Hash Service] Data synchronization completed with errors');
        }
      }

      return {
        success: errors.length === 0,
        syncedEntities,
        errors
      };
    } catch (error) {
      console.error('[Hash Service] Data synchronization failed:', error);
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
    console.log('[Hash Service] Forcing full data sync...');
    
    const entities = ['trips', 'locations', 'tripTypes', 'vehicles'];
    
    for (const entity of entities) {
      await this.syncEntity(entity);
    }

    // Fetch and save current hashes
    try {
      const serverHashes = await this.fetchDataHashes();
      await this.saveHashes(serverHashes);
    } catch (error) {
      console.error('[Hash Service] Error saving hashes after force sync:', error);
    }

    console.log('[Hash Service] Force sync completed');
  }

  /**
   * Clear stored hashes from cache and localStorage
   */
  async clearHashes(): Promise<void> {
    try {
      console.log('[Hash Service] Clearing stored hashes...');
      
      // Clear from cache
      await cacheService.setMetadata(this.HASH_STORAGE_KEY, {});
      console.log('[Hash Service] Hashes cleared from cache');
      
      // Clear from localStorage
      try {
        localStorage.removeItem(this.LOCALSTORAGE_KEY);
        console.log('[Hash Service] Hashes cleared from localStorage');
      } catch (localStorageError) {
        console.warn('[Hash Service] Failed to clear hashes from localStorage:', localStorageError);
        console.log('[Hash Service] Hashes cleared from cache only');
      }
    } catch (error) {
      console.error('[Hash Service] Error clearing hashes:', error);
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
