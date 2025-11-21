import { DataHashResponse, StoredDataHashes } from '../types';

/**
 * Hash utility functions for data synchronization
 * Note: Hashes are generated on the backend and stored locally for comparison
 */

/**
 * Compare stored hashes with API response hashes
 */
export function compareHashes(stored: StoredDataHashes, apiResponse: DataHashResponse): {
  userChanged: boolean;
  profileChanged: boolean;
  tripTypesChanged: boolean;
  tripsChanged: boolean;
  locationsChanged: boolean;
  othersChanged: boolean;
} {
  return {
    userChanged: stored.userHash !== apiResponse.userHash,
    profileChanged: stored.profileHash !== apiResponse.profileHash,
    tripTypesChanged: stored.tripTypesHash !== apiResponse.tripTypesHash,
    tripsChanged: stored.tripsHash !== apiResponse.tripsHash,
    locationsChanged: stored.locationsHash !== apiResponse.locationsHash,
    othersChanged: stored.othersHash !== apiResponse.othersHash
  };
}

/**
 * Store hashes in local storage
 */
export function storeHashes(hashes: DataHashResponse): void {
  const storedHashes: StoredDataHashes = {
    ...hashes,
    lastSync: new Date().toISOString()
  };
  localStorage.setItem('data_hashes', JSON.stringify(storedHashes));
}

/**
 * Get stored hashes from local storage
 */
export function getStoredHashes(): StoredDataHashes | null {
  const stored = localStorage.getItem('data_hashes');
  return stored ? JSON.parse(stored) : null;
}

/**
 * Clear stored hashes
 */
export function clearStoredHashes(): void {
  localStorage.removeItem('data_hashes');
}
