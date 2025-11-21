import React, {createContext, ReactNode, useEffect, useState} from 'react';
import {backgroundSyncService, syncService} from '../services';
import {SyncStatus} from "../types";

export interface SyncContextType {
  syncStatus: SyncStatus;
  forceSync: () => Promise<void>;
  isSyncEnabled: boolean;
  toggleSync: () => void;
  syncPendingTrips: () => Promise<void>;
}

const SyncContext = createContext<SyncContextType | undefined>(undefined);

interface SyncProviderProps {
  children: ReactNode;
}

export const SyncProvider: React.FC<SyncProviderProps> = ({ children }) => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: navigator.onLine,
    lastSyncTime: null,
    pendingSync: false,
    syncInProgress: false
  });
  const [isSyncEnabled, setIsSyncEnabled] = useState(true);

  useEffect(() => {
    // Initialize sync service
    if (isSyncEnabled) {
      backgroundSyncService.start();
    }

    // Set up periodic status updates
    const statusInterval = setInterval(() => {
      updateSyncStatus();
    }, 5000); // Update every 5 seconds

    // Listen for online/offline events
    const handleOnline = () => {
      updateSyncStatus();
      if (isSyncEnabled) {
        backgroundSyncService.syncPendingTrips();
      }
    };

    const handleOffline = () => {
      updateSyncStatus();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(statusInterval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      backgroundSyncService.stop();
    };
  }, [isSyncEnabled]);

  const updateSyncStatus = () => {
    const status = syncService.getSyncStatus();
    setSyncStatus(status);
  };

  const forceSync = async () => {
    try {
      setSyncStatus(prev => ({ ...prev, syncInProgress: true }));
      await backgroundSyncService.forceSyncNow();
      updateSyncStatus();
    } catch (error) {
      console.error('Force sync failed:', error);
    } finally {
      setSyncStatus(prev => ({ ...prev, syncInProgress: false }));
    }
  };

  const toggleSync = () => {
    if (isSyncEnabled) {
      backgroundSyncService.stop();
    } else {
      backgroundSyncService.start();
    }
    setIsSyncEnabled(!isSyncEnabled);
  };

  const syncPendingTrips = async () => {
    try {
      await backgroundSyncService.syncPendingTrips();
      updateSyncStatus();
    } catch (error) {
      console.error('Sync pending trips failed:', error);
    }
  };

  const value: SyncContextType = {
    syncStatus,
    forceSync,
    isSyncEnabled,
    toggleSync,
    syncPendingTrips
  };

  return (
    <SyncContext.Provider value={value}>
      {children}
    </SyncContext.Provider>
  );
};

export default SyncContext;
