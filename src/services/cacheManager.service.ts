import cacheService from './cache.service';
import { STORAGE_KEYS } from '../config/api.config';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface CacheConfig {
  ttl: number;
  staleWhileRevalidate: boolean;
}

const DEFAULT_TTL = 5 * 60 * 1000;
const STALE_TTL = 24 * 60 * 60 * 1000;

const CACHE_CONFIGS: Record<string, CacheConfig> = {
  trips: { ttl: 2 * 60 * 1000, staleWhileRevalidate: true },
  tripTypes: { ttl: 30 * 60 * 1000, staleWhileRevalidate: true },
  locations: { ttl: 30 * 60 * 1000, staleWhileRevalidate: true },
  vehicles: { ttl: 10 * 60 * 1000, staleWhileRevalidate: true },
  vehicleTypes: { ttl: 60 * 60 * 1000, staleWhileRevalidate: true },
  drivers: { ttl: 10 * 60 * 1000, staleWhileRevalidate: true },
  user: { ttl: 15 * 60 * 1000, staleWhileRevalidate: false }
};

class CacheManager {
  private memoryCache: Map<string, CacheEntry<unknown>> = new Map();
  private pendingRequests: Map<string, Promise<unknown>> = new Map();

  private getConfig(key: string): CacheConfig {
    return CACHE_CONFIGS[key] || { ttl: DEFAULT_TTL, staleWhileRevalidate: true };
  }

  async get<T>(key: string): Promise<T | null> {
    const memEntry = this.memoryCache.get(key) as CacheEntry<T> | undefined;
    if (memEntry && Date.now() < memEntry.expiresAt) {
      return memEntry.data;
    }

    try {
      const stored = localStorage.getItem(`cache_${key}`);
      if (stored) {
        const entry: CacheEntry<T> = JSON.parse(stored);
        const config = this.getConfig(key);
        
        if (Date.now() < entry.expiresAt) {
          this.memoryCache.set(key, entry);
          return entry.data;
        }
        
        if (config.staleWhileRevalidate && Date.now() < entry.timestamp + STALE_TTL) {
          return entry.data;
        }
      }
    } catch {
      // Ignore parse errors
    }

    return null;
  }

  async set<T>(key: string, data: T, customTtl?: number): Promise<void> {
    const config = this.getConfig(key);
    const ttl = customTtl ?? config.ttl;
    const now = Date.now();
    
    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      expiresAt: now + ttl
    };

    this.memoryCache.set(key, entry);

    try {
      localStorage.setItem(`cache_${key}`, JSON.stringify(entry));
    } catch {
      // localStorage might be full, clear old entries
      this.pruneLocalStorage();
      try {
        localStorage.setItem(`cache_${key}`, JSON.stringify(entry));
      } catch {
        // Still failed, just use memory cache
      }
    }
  }

  async invalidate(key: string): Promise<void> {
    this.memoryCache.delete(key);
    localStorage.removeItem(`cache_${key}`);
  }

  async invalidatePattern(pattern: string): Promise<void> {
    const regex = new RegExp(pattern);
    
    for (const key of this.memoryCache.keys()) {
      if (regex.test(key)) {
        this.memoryCache.delete(key);
      }
    }

    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && key.startsWith('cache_') && regex.test(key.substring(6))) {
        localStorage.removeItem(key);
      }
    }
  }

  async getOrFetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    options?: { forceRefresh?: boolean; customTtl?: number }
  ): Promise<T> {
    if (!options?.forceRefresh) {
      const cached = await this.get<T>(key);
      if (cached !== null) {
        return cached;
      }
    }

    const pending = this.pendingRequests.get(key);
    if (pending) {
      return pending as Promise<T>;
    }

    const fetchPromise = fetcher()
      .then(async (data) => {
        await this.set(key, data, options?.customTtl);
        this.pendingRequests.delete(key);
        return data;
      })
      .catch((error) => {
        this.pendingRequests.delete(key);
        throw error;
      });

    this.pendingRequests.set(key, fetchPromise);
    return fetchPromise;
  }

  isStale(key: string): boolean {
    const memEntry = this.memoryCache.get(key);
    if (memEntry) {
      return Date.now() >= memEntry.expiresAt;
    }
    return true;
  }

  async clearAll(): Promise<void> {
    this.memoryCache.clear();
    
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && key.startsWith('cache_')) {
        localStorage.removeItem(key);
      }
    }

    await cacheService.clearAllData();
  }

  private pruneLocalStorage(): void {
    const cacheKeys: { key: string; timestamp: number }[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('cache_')) {
        try {
          const entry = JSON.parse(localStorage.getItem(key) || '{}');
          cacheKeys.push({ key, timestamp: entry.timestamp || 0 });
        } catch {
          localStorage.removeItem(key);
        }
      }
    }

    cacheKeys.sort((a, b) => a.timestamp - b.timestamp);
    const toRemove = Math.ceil(cacheKeys.length / 3);
    for (let i = 0; i < toRemove; i++) {
      localStorage.removeItem(cacheKeys[i].key);
    }
  }

  getCacheStats(): { memorySize: number; localStorageKeys: number; pendingRequests: number } {
    let localStorageKeys = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('cache_')) {
        localStorageKeys++;
      }
    }

    return {
      memorySize: this.memoryCache.size,
      localStorageKeys,
      pendingRequests: this.pendingRequests.size
    };
  }

  async syncWithIndexedDB(): Promise<void> {
    try {
      const [trips, tripTypes, locations, vehicles, vehicleTypes, drivers] = await Promise.all([
        cacheService.getTrips(),
        cacheService.getTripTypes(),
        cacheService.getLocations(),
        cacheService.getVehicles(),
        cacheService.getVehicleTypes(),
        cacheService.getDrivers()
      ]);

      if (trips.length > 0) await this.set('trips', trips);
      if (tripTypes.length > 0) await this.set('tripTypes', tripTypes);
      if (locations.length > 0) await this.set('locations', locations);
      if (vehicles.length > 0) await this.set('vehicles', vehicles);
      if (vehicleTypes.length > 0) await this.set('vehicleTypes', vehicleTypes);
      if (drivers.length > 0) await this.set('drivers', drivers);
    } catch (error) {
      console.error('Failed to sync with IndexedDB:', error);
    }
  }
}

const cacheManager = new CacheManager();
export default cacheManager;
