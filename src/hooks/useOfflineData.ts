import { useState, useEffect, useCallback, useRef } from 'react';
import { useOffline } from '../contexts/OfflineContext';
import cacheManager from '../services/cacheManager.service';
import errorService from '../services/error.service';

interface UseOfflineDataOptions<T> {
  cacheKey: string;
  fetcher: () => Promise<T>;
  ttl?: number;
  enabled?: boolean;
  refetchOnReconnect?: boolean;
  onError?: (error: unknown) => void;
  onSuccess?: (data: T) => void;
}

interface UseOfflineDataResult<T> {
  data: T | null;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  isStale: boolean;
  isFromCache: boolean;
  refetch: () => Promise<void>;
  invalidate: () => Promise<void>;
}

export function useOfflineData<T>({
  cacheKey,
  fetcher,
  ttl,
  enabled = true,
  refetchOnReconnect = true,
  onError,
  onSuccess
}: UseOfflineDataOptions<T>): UseOfflineDataResult<T> {
  const { isOnline } = useOffline();
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [isFromCache, setIsFromCache] = useState(false);
  const wasOffline = useRef(!isOnline);
  const isMounted = useRef(true);

  const fetchData = useCallback(async (forceRefresh = false) => {
    if (!enabled) return;

    setIsLoading(true);
    setIsError(false);
    setError(null);

    try {
      const cached = await cacheManager.get<T>(cacheKey);
      
      if (cached !== null && !forceRefresh) {
        if (isMounted.current) {
          setData(cached);
          setIsFromCache(true);
          setIsLoading(false);
        }
        
        if (!cacheManager.isStale(cacheKey)) {
          onSuccess?.(cached);
          return;
        }
      }

      if (!isOnline) {
        if (cached !== null) {
          if (isMounted.current) {
            setData(cached);
            setIsFromCache(true);
            setIsLoading(false);
          }
          return;
        }
        throw new Error('No cached data available offline');
      }

      const freshData = await fetcher();
      await cacheManager.set(cacheKey, freshData, ttl);
      
      if (isMounted.current) {
        setData(freshData);
        setIsFromCache(false);
        setIsLoading(false);
      }
      
      onSuccess?.(freshData);
    } catch (err) {
      const appError = errorService.parseError(err);
      
      if (isMounted.current) {
        setIsError(true);
        setError(err);
        setIsLoading(false);
      }
      
      onError?.(err);
      
      const cached = await cacheManager.get<T>(cacheKey);
      if (cached !== null && isMounted.current) {
        setData(cached);
        setIsFromCache(true);
      }
    }
  }, [cacheKey, enabled, fetcher, isOnline, onError, onSuccess, ttl]);

  const refetch = useCallback(async () => {
    await fetchData(true);
  }, [fetchData]);

  const invalidate = useCallback(async () => {
    await cacheManager.invalidate(cacheKey);
    setData(null);
    setIsFromCache(false);
  }, [cacheKey]);

  useEffect(() => {
    isMounted.current = true;
    fetchData();
    
    return () => {
      isMounted.current = false;
    };
  }, [fetchData]);

  useEffect(() => {
    if (refetchOnReconnect && wasOffline.current && isOnline) {
      fetchData(true);
    }
    wasOffline.current = !isOnline;
  }, [isOnline, refetchOnReconnect, fetchData]);

  return {
    data,
    isLoading,
    isError,
    error,
    isStale: cacheManager.isStale(cacheKey),
    isFromCache,
    refetch,
    invalidate
  };
}

export default useOfflineData;
