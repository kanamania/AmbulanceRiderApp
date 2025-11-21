// Data hash structure from API
import {Trip} from "./index";

export interface DataHashResponse {
  userHash: string;
  profileHash: string;
  tripTypesHash: string;
  tripsHash: string;
  locationsHash: string;
  othersHash?: string;
}

// Local stored hash data
export interface StoredDataHashes {
  userHash: string;
  profileHash: string;
  tripTypesHash: string;
  tripsHash: string;
  locationsHash: string;
  othersHash?: string;
  lastSync: string;
}

// Sync status
export interface SyncStatus {
  isOnline: boolean;
  lastSyncTime: string | null;
  pendingSync: boolean;
  syncInProgress: boolean;
}

// Local trip with sync status
export interface LocalTrip extends Trip {
  isLocal: boolean;
  syncStatus: 'pending' | 'synced' | 'error';
  lastSyncAttempt?: string;
  syncError?: string;
}

// Database entity interfaces
export interface DBTripType {
  id: number;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  attributes: string; // JSON string
}

export interface DBLocation {
  id: number;
  name: string;
  longitude: number;
  latitude: number;
  imagePath?: string;
  imageUrl?: string;
  createdAt: string;
}

export interface DBTrip {
  id: number;
  name: string;
  description?: string;
  scheduledStartTime: string;
  actualStartTime?: string;
  actualEndTime?: string;
  status: string;
  rejectionReason?: string;
  fromLatitude: number;
  fromLongitude: number;
  toLatitude: number;
  toLongitude: number;
  fromLocationName: string;
  toLocationName: string;
  vehicleId?: number;
  driverId?: string;
  approvedBy?: string;
  approver?: string;
  approvedAt?: string;
  createdAt: string;
  tripTypeId?: number;
  attributeValues?: string;
  optimizedRoute?: string;
  routePolyline?: string;
  estimatedDistance?: number;
  estimatedDuration?: number;
  isLocal: boolean;
  syncStatus: 'pending' | 'synced' | 'error';
  lastSyncAttempt?: string;
  syncError?: string;
}

export interface DBUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  imagePath?: string;
  imageUrl?: string;
  roles: string; // JSON string
  isActive?: boolean;
  createdAt: string;
}

// Database initialization result
export interface DatabaseInitResult {
  success: boolean;
  message?: string;
}
