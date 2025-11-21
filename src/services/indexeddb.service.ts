import { Trip, TripType, LocationPlace, Vehicle, VehicleType } from '../types';

/**
 * IndexedDB Service for Web Platform Caching
 * Provides local storage for web browsers using IndexedDB
 */
class IndexedDBService {
  private static instance: IndexedDBService;
  private db: IDBDatabase | null = null;
  private readonly DB_NAME = 'ambulance_rider_db';
  private readonly DB_VERSION = 2;
  private initPromise: Promise<void> | null = null;

  /**
   * Initialize IndexedDB
   */
  async initialize(): Promise<void> {
    // If initialization is already in progress, wait for it
    if (this.initPromise) {
      console.log('IndexedDB initialization already in progress, waiting...');
      return this.initPromise;
    }

    // If already initialized and connection is valid, return immediately
    if (this.db) {
      try {
        // Test if connection is still valid by checking object stores
        const storeNames = this.db.objectStoreNames;
        if (storeNames.length > 0) {
          console.log('IndexedDB already initialized, reusing connection');
          return Promise.resolve();
        }
      } catch (error) {
        // Connection is closed or invalid, continue to reopen
        console.log('IndexedDB connection invalid, reinitializing...');
        this.db = null;
      }
    }

    // Store the initialization promise to prevent concurrent initializations
    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = () => {
        this.initPromise = null; // Clear the promise on error
        console.error('IndexedDB initialization failed:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        this.initPromise = null; // Clear the promise after successful initialization
        console.log('IndexedDB initialized successfully');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const oldVersion = event.oldVersion;
        const transaction = (event.target as IDBOpenDBRequest).transaction!;

        // Create object stores (version 1)
        if (!db.objectStoreNames.contains('trips')) {
          const tripStore = db.createObjectStore('trips', { keyPath: 'id' });
          tripStore.createIndex('status', 'status', { unique: false });
          tripStore.createIndex('createdAt', 'createdAt', { unique: false });
          tripStore.createIndex('isLocal', 'isLocal', { unique: false });
          tripStore.createIndex('syncStatus', 'syncStatus', { unique: false });
        }

        if (!db.objectStoreNames.contains('tripTypes')) {
          const tripTypeStore = db.createObjectStore('tripTypes', { keyPath: 'id' });
          tripTypeStore.createIndex('isActive', 'isActive', { unique: false });
        }

        if (!db.objectStoreNames.contains('locations')) {
          db.createObjectStore('locations', { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains('vehicles')) {
          const vehicleStore = db.createObjectStore('vehicles', { keyPath: 'id' });
          vehicleStore.createIndex('plateNumber', 'plateNumber', { unique: false });
          vehicleStore.createIndex('vehicleTypeId', 'vehicleTypeId', { unique: false });
          vehicleStore.createIndex('name', 'name', { unique: false });
        }

        if (!db.objectStoreNames.contains('vehicleTypes')) {
          const vehicleTypeStore = db.createObjectStore('vehicleTypes', { keyPath: 'id' });
          vehicleTypeStore.createIndex('name', 'name', { unique: false });
        }

        if (!db.objectStoreNames.contains('metadata')) {
          db.createObjectStore('metadata', { keyPath: 'key' });
        }

        // Migration from version 1 to version 2
        if (oldVersion < 2) {
          // Add new indexes to existing stores
          if (db.objectStoreNames.contains('trips')) {
            const tripStore = transaction.objectStore('trips');
            if (!tripStore.indexNames.contains('isLocal')) {
              tripStore.createIndex('isLocal', 'isLocal', { unique: false });
            }
            if (!tripStore.indexNames.contains('syncStatus')) {
              tripStore.createIndex('syncStatus', 'syncStatus', { unique: false });
            }
          }

          if (db.objectStoreNames.contains('vehicles')) {
            const vehicleStore = transaction.objectStore('vehicles');
            // Remove old status index if it exists
            if (vehicleStore.indexNames.contains('status')) {
              vehicleStore.deleteIndex('status');
            }
            // Add new indexes
            if (!vehicleStore.indexNames.contains('plateNumber')) {
              vehicleStore.createIndex('plateNumber', 'plateNumber', { unique: false });
            }
            if (!vehicleStore.indexNames.contains('vehicleTypeId')) {
              vehicleStore.createIndex('vehicleTypeId', 'vehicleTypeId', { unique: false });
            }
            if (!vehicleStore.indexNames.contains('name')) {
              vehicleStore.createIndex('name', 'name', { unique: false });
            }
          }

          if (db.objectStoreNames.contains('vehicleTypes')) {
            const vehicleTypeStore = transaction.objectStore('vehicleTypes');
            if (!vehicleTypeStore.indexNames.contains('name')) {
              vehicleTypeStore.createIndex('name', 'name', { unique: false });
            }
          }
        }
      };
    });

    return this.initPromise;
  }

  /**
   * Generic method to get all items from a store
   */
  private async getAll<T>(storeName: string): Promise<T[]> {
    // Ensure database is initialized before operation
    await this.initialize();
    
    if (!this.db) throw new Error('IndexedDB not initialized');

    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db!.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
        
        transaction.onerror = () => {
          // If transaction fails due to closing connection, mark db as null
          if (transaction.error?.name === 'InvalidStateError') {
            console.warn('[IndexedDB] Connection closing detected, will reinitialize on next call');
            this.db = null;
          }
          reject(transaction.error);
        };
      } catch (error) {
        // If we catch InvalidStateError, mark db as null for reinitialization
        if (error instanceof DOMException && error.name === 'InvalidStateError') {
          console.warn('[IndexedDB] Connection closing detected, will reinitialize on next call');
          this.db = null;
        }
        reject(error);
      }
    });
  }

  /**
   * Generic method to get a single item by ID
   */
  private async getById<T>(storeName: string, id: number): Promise<T | null> {
    if (!this.db) throw new Error('IndexedDB not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Generic method to upsert items (insert or update)
   */
  private async upsertMany<T extends { id: number }>(storeName: string, items: T[]): Promise<void> {
    // Ensure database is initialized before operation
    await this.initialize();
    
    if (!this.db) throw new Error('IndexedDB not initialized');

    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db!.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);

        items.forEach(item => store.put(item));

        transaction.oncomplete = () => resolve();
        transaction.onerror = () => {
          if (transaction.error?.name === 'InvalidStateError') {
            console.warn('[IndexedDB] Connection closing detected, will reinitialize on next call');
            this.db = null;
          }
          reject(transaction.error);
        };
      } catch (error) {
        if (error instanceof DOMException && error.name === 'InvalidStateError') {
          console.warn('[IndexedDB] Connection closing detected, will reinitialize on next call');
          this.db = null;
        }
        reject(error);
      }
    });
  }

  /**
   * Generic method to clear a store
   */
  private async clearStore(storeName: string): Promise<void> {
    if (!this.db) throw new Error('IndexedDB not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Trips
  async getTrips(): Promise<Trip[]> {
    return this.getAll<Trip>('trips');
  }

  async getTripById(id: number): Promise<Trip | null> {
    return this.getById<Trip>('trips', id);
  }

  async upsertTrips(trips: Trip[]): Promise<void> {
    return this.upsertMany('trips', trips);
  }

  async clearTrips(): Promise<void> {
    return this.clearStore('trips');
  }

  // Trip Types
  async getTripTypes(): Promise<TripType[]> {
    return this.getAll<TripType>('tripTypes');
  }

  async getTripTypeById(id: number): Promise<TripType | null> {
    return this.getById<TripType>('tripTypes', id);
  }

  async upsertTripTypes(tripTypes: TripType[]): Promise<void> {
    return this.upsertMany('tripTypes', tripTypes);
  }

  async clearTripTypes(): Promise<void> {
    return this.clearStore('tripTypes');
  }

  // Locations
  async getLocations(): Promise<LocationPlace[]> {
    return this.getAll<LocationPlace>('locations');
  }

  async getLocationById(id: number): Promise<LocationPlace | null> {
    return this.getById<LocationPlace>('locations', id);
  }

  async upsertLocations(locations: LocationPlace[]): Promise<void> {
    return this.upsertMany('locations', locations);
  }

  async clearLocations(): Promise<void> {
    return this.clearStore('locations');
  }

  // Vehicles
  async getVehicles(): Promise<Vehicle[]> {
    return this.getAll<Vehicle>('vehicles');
  }

  async getVehicleById(id: number): Promise<Vehicle | null> {
    return this.getById<Vehicle>('vehicles', id);
  }

  async upsertVehicles(vehicles: Vehicle[]): Promise<void> {
    return this.upsertMany('vehicles', vehicles);
  }

  async clearVehicles(): Promise<void> {
    return this.clearStore('vehicles');
  }

  // Vehicle Types
  async getVehicleTypes(): Promise<VehicleType[]> {
    return this.getAll<VehicleType>('vehicleTypes');
  }

  async getVehicleTypeById(id: number): Promise<VehicleType | null> {
    return this.getById<VehicleType>('vehicleTypes', id);
  }

  async upsertVehicleTypes(vehicleTypes: VehicleType[]): Promise<void> {
    return this.upsertMany('vehicleTypes', vehicleTypes);
  }

  async clearVehicleTypes(): Promise<void> {
    return this.clearStore('vehicleTypes');
  }

  // Metadata (for cache timestamps, etc.)
  async setMetadata(key: string, value: unknown): Promise<void> {
    // Ensure database is initialized before operation
    await this.initialize();
    
    if (!this.db) throw new Error('IndexedDB not initialized');

    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db!.transaction('metadata', 'readwrite');
        const store = transaction.objectStore('metadata');
        const request = store.put({ key, value, timestamp: Date.now() });

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
        
        transaction.onerror = () => {
          if (transaction.error?.name === 'InvalidStateError') {
            console.warn('[IndexedDB] Connection closing detected, will reinitialize on next call');
            this.db = null;
          }
          reject(transaction.error);
        };
      } catch (error) {
        if (error instanceof DOMException && error.name === 'InvalidStateError') {
          console.warn('[IndexedDB] Connection closing detected, will reinitialize on next call');
          this.db = null;
        }
        reject(error);
      }
    });
  }

  async getMetadata(key: string): Promise<unknown> {
    // Ensure database is initialized before operation
    await this.initialize();
    
    if (!this.db) throw new Error('IndexedDB not initialized');

    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db!.transaction('metadata', 'readonly');
        const store = transaction.objectStore('metadata');
        const request = store.get(key);

        request.onsuccess = () => resolve(request.result?.value || null);
        request.onerror = () => reject(request.error);
        
        transaction.onerror = () => {
          if (transaction.error?.name === 'InvalidStateError') {
            console.warn('[IndexedDB] Connection closing detected, will reinitialize on next call');
            this.db = null;
          }
          reject(transaction.error);
        };
      } catch (error) {
        if (error instanceof DOMException && error.name === 'InvalidStateError') {
          console.warn('[IndexedDB] Connection closing detected, will reinitialize on next call');
          this.db = null;
        }
        reject(error);
      }
    });
  }

  /**
   * Clear all data (useful for logout)
   */
  async clearAllData(): Promise<void> {
    await Promise.all([
      this.clearTrips(),
      this.clearTripTypes(),
      this.clearLocations(),
      this.clearVehicles(),
      this.clearVehicleTypes(),
      this.clearStore('metadata')
    ]);
  }

  /**
   * Close database connection
   */
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

export default new IndexedDBService();
