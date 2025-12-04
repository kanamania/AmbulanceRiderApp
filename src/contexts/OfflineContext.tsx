import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Capacitor } from '@capacitor/core';

interface OfflineContextType {
  isOnline: boolean;
  isOfflineMode: boolean;
  pendingActions: number;
  lastOnlineTime: Date | null;
  checkConnection: () => Promise<boolean>;
  addPendingAction: () => void;
  removePendingAction: () => void;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

export const useOffline = (): OfflineContextType => {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
};

interface OfflineProviderProps {
  children: ReactNode;
}

export const OfflineProvider: React.FC<OfflineProviderProps> = ({ children }) => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(!navigator.onLine);
  const [pendingActions, setPendingActions] = useState<number>(0);
  const [lastOnlineTime, setLastOnlineTime] = useState<Date | null>(
    navigator.onLine ? new Date() : null
  );

  const checkConnection = useCallback(async (): Promise<boolean> => {
    return navigator.onLine;
  }, []);

  const handleOnline = useCallback(() => {
    setIsOnline(true);
    setIsOfflineMode(false);
    setLastOnlineTime(new Date());
  }, []);

  const handleOffline = useCallback(() => {
    setIsOnline(false);
    setIsOfflineMode(true);
  }, []);

  const addPendingAction = useCallback(() => {
    setPendingActions(prev => prev + 1);
  }, []);

  const removePendingAction = useCallback(() => {
    setPendingActions(prev => Math.max(0, prev - 1));
  }, []);

  useEffect(() => {
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    checkConnection().then(online => {
      setIsOnline(online);
      setIsOfflineMode(!online);
      if (online) {
        setLastOnlineTime(new Date());
      }
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [handleOnline, handleOffline, checkConnection]);

  const value: OfflineContextType = {
    isOnline,
    isOfflineMode,
    pendingActions,
    lastOnlineTime,
    checkConnection,
    addPendingAction,
    removePendingAction
  };

  return (
    <OfflineContext.Provider value={value}>
      {children}
    </OfflineContext.Provider>
  );
};
