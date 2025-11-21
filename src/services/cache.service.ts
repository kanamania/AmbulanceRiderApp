import { Capacitor } from '@capacitor/core';
import databaseService from './database.service';
import indexedDBService from './indexeddb.service';
import { Trip, TripType, LocationPlace, Vehicle, VehicleType } from '../types';

/**
 * Unified Cache Service
 * Automatically uses SQLite for native platforms and IndexedDB for web
 */
class CacheService {
  private isNative: boolean;
  private initialized: boolean = false;

  constructor() {
    this.isNative = Capacitor.isNativePlatform();
  }

  /**
   * Initialize the appropriate storage backend
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      if (this.isNative) {
        await databaseService.initialize();
        console.log('Cache Service: Using SQLite (Native Platform)');
      } else {
        await indexedDBService.initialize();
        console.log('Cache Service: Using IndexedDB (Web Platform)');
      }
      this.initialized = true;
    } catch (error) {
      console.error('Cache Service initialization failed:', error);
      throw error;
    }
  }

  /**
   * Ensure cache is initialized before operations
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  // ==================== TRIPS ====================

  async getTrips(): Promise<Trip[]> {
    await this.ensureInitialized();
    try {
      if (this.isNative) {
        return await databaseService.getTrips();
      } else {
        return await indexedDBService.getTrips();
      }
    } catch (error) {
      console.error('Error getting trips from cache:', error);
      return [];
    }
  }

  async getTripById(id: number): Promise<Trip | null> {
    await this.ensureInitialized();
    try {
      if (this.isNative) {
        const trips = await databaseService.getTrips();
        return trips.find(t => t.id === id) || null;
      } else {
        return await indexedDBService.getTripById(id);
      }
    } catch (error) {
      console.error('Error getting trip by ID from cache:', error);
      return null;
    }
  }

  async upsertTrips(trips: Trip[]): Promise<void> {
    await this.ensureInitialized();
    try {
      if (this.isNative) {
        await databaseService.upsertTrips(trips);
      } else {
        await indexedDBService.upsertTrips(trips);
      }
    } catch (error) {
      console.error('Error upserting trips to cache:', error);
    }
  }

  async clearTrips(): Promise<void> {
    await this.ensureInitialized();
    try {
      if (this.isNative) {
        // SQLite clear is handled by clearAllData
        const db = databaseService.getConnection();
        if (db) await db.execute('DELETE FROM trips');
      } else {
        await indexedDBService.clearTrips();
      }
    } catch (error) {
      console.error('Error clearing trips from cache:', error);
    }
  }

  // ==================== TRIP TYPES ====================

  async getTripTypes(): Promise<TripType[]> {
    await this.ensureInitialized();
    try {
      if (this.isNative) {
        return await databaseService.getTripTypes();
      } else {
        return await indexedDBService.getTripTypes();
      }
    } catch (error) {
      console.error('Error getting trip types from cache:', error);
      return [];
    }
  }

  async getTripTypeById(id: number): Promise<TripType | null> {
    await this.ensureInitialized();
    try {
      if (this.isNative) {
        const tripTypes = await databaseService.getTripTypes();
        return tripTypes.find(t => t.id === id) || null;
      } else {
        return await indexedDBService.getTripTypeById(id);
      }
    } catch (error) {
      console.error('Error getting trip type by ID from cache:', error);
      return null;
    }
  }

  async upsertTripTypes(tripTypes: TripType[]): Promise<void> {
    await this.ensureInitialized();
    try {
      if (this.isNative) {
        await databaseService.upsertTripTypes(tripTypes);
      } else {
        await indexedDBService.upsertTripTypes(tripTypes);
      }
    } catch (error) {
      console.error('Error upserting trip types to cache:', error);
    }
  }

  async clearTripTypes(): Promise<void> {
    await this.ensureInitialized();
    try {
      if (this.isNative) {
        const db = databaseService.getConnection();
        if (db) await db.execute('DELETE FROM trip_types');
      } else {
        await indexedDBService.clearTripTypes();
      }
    } catch (error) {
      console.error('Error clearing trip types from cache:', error);
    }
  }

  // ==================== LOCATIONS ====================

  async getLocations(): Promise<LocationPlace[]> {
    await this.ensureInitialized();
    try {
      if (this.isNative) {
        return await databaseService.getLocations();
      } else {
        return await indexedDBService.getLocations();
      }
    } catch (error) {
      console.error('Error getting locations from cache:', error);
      return [];
    }
  }

  async getLocationById(id: number): Promise<LocationPlace | null> {
    await this.ensureInitialized();
    try {
      if (this.isNative) {
        const locations = await databaseService.getLocations();
        return locations.find(l => l.id === id) || null;
      } else {
        return await indexedDBService.getLocationById(id);
      }
    } catch (error) {
      console.error('Error getting location by ID from cache:', error);
      return null;
    }
  }

  async upsertLocations(locations: LocationPlace[]): Promise<void> {
    await this.ensureInitialized();
    try {
      if (this.isNative) {
        await databaseService.upsertLocations(locations);
      } else {
        await indexedDBService.upsertLocations(locations);
      }
    } catch (error) {
      console.error('Error upserting locations to cache:', error);
    }
  }

  async clearLocations(): Promise<void> {
    await this.ensureInitialized();
    try {
      if (this.isNative) {
        const db = databaseService.getConnection();
        if (db) await db.execute('DELETE FROM locations');
      } else {
        await indexedDBService.clearLocations();
      }
    } catch (error) {
      console.error('Error clearing locations from cache:', error);
    }
  }

  // ==================== VEHICLES ====================

  async getVehicles(): Promise<Vehicle[]> {
    await this.ensureInitialized();
    try {
      if (this.isNative) {
        return await databaseService.getVehicles();
      } else {
        return await indexedDBService.getVehicles();
      }
    } catch (error) {
      console.error('Error getting vehicles from cache:', error);
      return [];
    }
  }

  async getVehicleById(id: number): Promise<Vehicle | null> {
    await this.ensureInitialized();
    try {
      if (this.isNative) {
        const vehicles = await databaseService.getVehicles();
        return vehicles.find(v => v.id === id) || null;
      } else {
        return await indexedDBService.getVehicleById(id);
      }
    } catch (error) {
      console.error('Error getting vehicle by ID from cache:', error);
      return null;
    }
  }

  async upsertVehicles(vehicles: Vehicle[]): Promise<void> {
    await this.ensureInitialized();
    try {
      if (this.isNative) {
        await databaseService.upsertVehicles(vehicles);
      } else {
        await indexedDBService.upsertVehicles(vehicles);
      }
    } catch (error) {
      console.error('Error upserting vehicles to cache:', error);
    }
  }

  async clearVehicles(): Promise<void> {
    await this.ensureInitialized();
    try {
      if (this.isNative) {
        const db = databaseService.getConnection();
        if (db) await db.execute('DELETE FROM vehicles');
      } else {
        await indexedDBService.clearVehicles();
      }
    } catch (error) {
      console.error('Error clearing vehicles from cache:', error);
    }
  }

  // ==================== VEHICLE TYPES ====================

  async getVehicleTypes(): Promise<VehicleType[]> {
    await this.ensureInitialized();
    try {
      if (this.isNative) {
        return await databaseService.getVehicleTypes();
      } else {
        return await indexedDBService.getVehicleTypes();
      }
    } catch (error) {
      console.error('Error getting vehicle types from cache:', error);
      return [];
    }
  }

  async getVehicleTypeById(id: number): Promise<VehicleType | null> {
    await this.ensureInitialized();
    try {
      if (this.isNative) {
        const vehicleTypes = await databaseService.getVehicleTypes();
        return vehicleTypes.find(vt => vt.id === id) || null;
      } else {
        return await indexedDBService.getVehicleTypeById(id);
      }
    } catch (error) {
      console.error('Error getting vehicle type by ID from cache:', error);
      return null;
    }
  }

  async upsertVehicleTypes(vehicleTypes: VehicleType[]): Promise<void> {
    await this.ensureInitialized();
    try {
      if (this.isNative) {
        await databaseService.upsertVehicleTypes(vehicleTypes);
      } else {
        await indexedDBService.upsertVehicleTypes(vehicleTypes);
      }
    } catch (error) {
      console.error('Error upserting vehicle types to cache:', error);
    }
  }

  async clearVehicleTypes(): Promise<void> {
    await this.ensureInitialized();
    try {
      if (this.isNative) {
        const db = databaseService.getConnection();
        if (db) await db.execute('DELETE FROM vehicle_types');
      } else {
        await indexedDBService.clearVehicleTypes();
      }
    } catch (error) {
      console.error('Error clearing vehicle types from cache:', error);
    }
  }

  // ==================== METADATA ====================

  async setMetadata(key: string, value: unknown): Promise<void> {
    await this.ensureInitialized();
    try {
      if (this.isNative) {
        // For SQLite, we can use a simple key-value approach with JSON
        const db = databaseService.getConnection();
        if (db) {
          await db.query(
            `INSERT OR REPLACE INTO metadata (key, value, timestamp) VALUES (?, ?, ?)`,
            [key, JSON.stringify(value), new Date().toISOString()]
          );
        }
      } else {
        await indexedDBService.setMetadata(key, value);
      }
    } catch (error) {
      console.error('Error setting metadata:', error);
    }
  }

  async getMetadata(key: string): Promise<unknown> {
    await this.ensureInitialized();
    try {
      if (this.isNative) {
        const db = databaseService.getConnection();
        if (db) {
          const result = await db.query(`SELECT value FROM metadata WHERE key = ?`, [key]);
          if (result.values && result.values.length > 0) {
            return JSON.parse(result.values[0].value);
          }
        }
        return null;
      } else {
        return await indexedDBService.getMetadata(key);
      }
    } catch (error) {
      console.error('Error getting metadata:', error);
      return null;
    }
  }

  // ==================== UTILITY ====================

  /**
   * Clear all cached data
   */
  async clearAllData(): Promise<void> {
    await this.ensureInitialized();
    try {
      if (this.isNative) {
        await databaseService.clearAllData();
      } else {
        await indexedDBService.clearAllData();
      }
    } catch (error) {
      console.error('Error clearing all data:', error);
    }
  }

  /**
   * Check if cache has data for a specific resource
   */
  async hasData(resource: 'trips' | 'tripTypes' | 'locations' | 'vehicles' | 'vehicleTypes'): Promise<boolean> {
    await this.ensureInitialized();
    try {
      let data: unknown[] = [];
      switch (resource) {
        case 'trips':
          data = await this.getTrips();
          break;
        case 'tripTypes':
          data = await this.getTripTypes();
          break;
        case 'locations':
          data = await this.getLocations();
          break;
        case 'vehicles':
          data = await this.getVehicles();
          break;
        case 'vehicleTypes':
          data = await this.getVehicleTypes();
          break;
      }
      return data.length > 0;
    } catch (error) {
      console.error(`Error checking if cache has data for ${resource}:`, error);
      return false;
    }
  }
}

export default new CacheService();
