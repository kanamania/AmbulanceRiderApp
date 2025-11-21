import {signalRService, syncService} from './index';
import { getStoredHashes, storeHashes } from '../utils/hash.util';
import { DataHashResponse } from '../types';

// SignalR event data types
interface TripStatusChangedData {
  tripId: number;
  status: string;
  message?: string;
}

interface TripCreatedData {
  tripId: number;
  [key: string]: unknown; // Allow other trip properties
}

interface TripUpdatedData {
  tripId: number;
  [key: string]: unknown; // Allow other trip properties
}

class BackgroundSyncService {
  private syncInterval: NodeJS.Timeout | null = null;
  private isRunning = false;
  private readonly SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutes
  private readonly FAST_SYNC_INTERVAL = 30 * 1000; // 30 seconds for active trips

  constructor() {
    // Listen for app visibility changes
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    
    // Listen for SignalR trip updates
    this.setupSignalRListeners();
  }

  /**
   * Start background sync
   */
  start(): void {
    if (this.isRunning) return;
    
    console.log('Starting background sync service');
    this.isRunning = true;
    
    // Start periodic sync
    this.syncInterval = setInterval(() => {
      this.performPeriodicSync();
    }, this.SYNC_INTERVAL);
    
    // Perform initial sync
    this.performPeriodicSync();
  }

  /**
   * Stop background sync
   */
  stop(): void {
    if (!this.isRunning) return;
    
    console.log('Stopping background sync service');
    this.isRunning = false;
    
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  /**
   * Handle app visibility changes
   */
  private handleVisibilityChange(): void {
    if (document.hidden) {
      // App is hidden, reduce sync frequency
      this.updateSyncInterval(this.SYNC_INTERVAL);
    } else {
      // App is visible, increase sync frequency
      this.updateSyncInterval(this.FAST_SYNC_INTERVAL);
      // Perform immediate sync when app becomes visible
      this.performPeriodicSync();
    }
  }

  /**
   * Update sync interval
   */
  private updateSyncInterval(interval: number): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    
    if (this.isRunning) {
      this.syncInterval = setInterval(() => {
        this.performPeriodicSync();
      }, interval);
    }
  }

  /**
   * Perform periodic sync
   */
  private async performPeriodicSync(): Promise<void> {
    if (!navigator.onLine) {
      console.log('Device is offline, skipping periodic sync');
      return;
    }

    try {
      console.log('Performing periodic sync check');
      await syncService.performInitialSync();
    } catch (error) {
      console.error('Periodic sync failed:', error);
    }
  }

  /**
   * Setup SignalR listeners for real-time updates
   */
  private setupSignalRListeners(): void {
    // Listen for trip status changes
    signalRService.on('TripStatusChanged', async (...args: unknown[]) => {
      const data = args[0] as TripStatusChangedData;
      console.log('Trip status changed via SignalR:', data);
      await this.handleTripUpdate(data.tripId);
    });

    // Listen for new trips
    signalRService.on('TripCreated', async (...args: unknown[]) => {
      const data = args[0] as TripCreatedData;
      console.log('New trip created via SignalR:', data);
      await this.handleTripUpdate(data.tripId);
    });

    // Listen for trip updates
    signalRService.on('TripUpdated', async (...args: unknown[]) => {
      const data = args[0] as TripUpdatedData;
      console.log('Trip updated via SignalR:', data);
      await this.handleTripUpdate(data.tripId);
    });

    // Listen for data hash changes
    signalRService.on('DataHashChanged', async (...args: unknown[]) => {
      const data = args[0] as DataHashResponse;
      console.log('Data hash changed via SignalR:', data);
      await this.handleDataHashChange(data);
    });
  }

  /**
   * Handle individual trip update
   */
  private async handleTripUpdate(tripId: number): Promise<void> {
    try {
      // This would trigger a specific trip sync
      // For now, we'll do a full sync of trips
      await syncService.performInitialSync();
    } catch (error) {
      console.error(`Failed to sync trip ${tripId}:`, error);
    }
  }

  /**
   * Handle data hash changes
   */
  private async handleDataHashChange(newHashes: DataHashResponse): Promise<void> {
    try {
      const storedHashes = getStoredHashes();
      
      if (!storedHashes) {
        // No stored hashes, perform full sync
        await syncService.performInitialSync();
        return;
      }

      // Check what has changed
      const hasChanges = 
        storedHashes.userHash !== newHashes.userHash ||
        storedHashes.profileHash !== newHashes.profileHash ||
        storedHashes.tripTypesHash !== newHashes.tripTypesHash ||
        storedHashes.tripsHash !== newHashes.tripsHash ||
        storedHashes.locationsHash !== newHashes.locationsHash ||
        storedHashes.othersHash !== newHashes.othersHash;

      if (hasChanges) {
        console.log('Data changes detected, performing sync');
        await syncService.performInitialSync();
        storeHashes(newHashes);
      }
    } catch (error) {
      console.error('Failed to handle data hash change:', error);
    }
  }

  /**
   * Force immediate sync
   */
  async forceSyncNow(): Promise<void> {
    try {
      await syncService.performInitialSync();
    } catch (error) {
      console.error('Force sync failed:', error);
      throw error;
    }
  }

  /**
   * Get sync status
   */
  getSyncStatus() {
    return syncService.getSyncStatus();
  }

  /**
   * Sync pending trips (for when coming back online)
   */
  async syncPendingTrips(): Promise<void> {
    try {
      await syncService.syncPendingTrips();
    } catch (error) {
      console.error('Failed to sync pending trips:', error);
      throw error;
    }
  }

  /**
   * Check if service is running
   */
  isActive(): boolean {
    return this.isRunning;
  }
}

// Export singleton instance
const backgroundSyncService = new BackgroundSyncService();
export default backgroundSyncService;
