# Data Synchronization System

This document describes the data synchronization system implemented for the Ambulance Rider App.

## Overview

The sync system provides:
- **Hash-based data validation** to minimize unnecessary API calls
- **Offline-first approach** with local SQLite storage
- **Automatic background synchronization** 
- **Real-time updates** via SignalR
- **Conflict resolution** for concurrent updates

## Architecture

### Core Components

1. **Database Service** (`database.service.ts`)
   - Manages local SQLite database
   - Provides CRUD operations for all entities
   - Handles data serialization/deserialization

2. **Sync Service** (`sync.service.ts`)
   - Orchestrates data synchronization
   - Compares hashes to detect changes
   - Handles offline/online scenarios

3. **Background Sync Service** (`backgroundSync.service.ts`)
   - Manages periodic sync operations
   - Listens for real-time updates via SignalR
   - Adapts sync frequency based on app visibility

4. **Hash Utilities** (`hash.util.ts`)
   - Generates SHA-256 hashes for data comparison
   - Normalizes data for consistent hashing
   - Manages hash storage in localStorage

5. **Sync Context** (`SyncContext.tsx`)
   - Provides sync state to React components
   - Exposes sync controls and status
   - Manages sync lifecycle

## API Integration

### Login Flow
```typescript
// During login, the system:
1. Authenticates user
2. Initializes local database
3. Fetches data hashes from API
4. Compares with stored hashes
5. Syncs only changed data
6. Stores new hashes
```

### Hash Endpoint
The API should provide:
```typescript
GET /auth/data-hashes
{
  "userHash": "sha256-hash",
  "profileHash": "sha256-hash", 
  "tripTypesHash": "sha256-hash",
  "tripsHash": "sha256-hash",
  "locationsHash": "sha256-hash",
  "othersHash": "sha256-hash"
}
```

## Usage Examples

### Using Sync-Aware Trip Service
```typescript
import { tripService } from '../services';

// Get trips with local cache fallback
const trips = await tripService.getTripsWithSync();

// Create trip with offline support
const newTrip = await tripService.createTripWithSync(tripData);

// Force full sync
await tripService.forceFullSync();
```

### Using Sync Context in Components
```typescript
import { useSync } from '../contexts/SyncContext';

function MyComponent() {
  const { syncStatus, forceSync, isSyncEnabled, toggleSync } = useSync();
  
  return (
    <div>
      <IonIcon icon={syncStatus.isOnline ? wifi : wifiOff} />
      <IonButton onClick={forceSync}>Sync Now</IonButton>
      <p>Last sync: {syncStatus.lastSyncTime}</p>
    </div>
  );
}
```

### Creating Offline-First Trips
```typescript
// This works offline and online
const trip = await syncService.createLocalTrip({
  name: "Emergency Transport",
  fromLatitude: 40.7128,
  fromLongitude: -74.0060,
  // ... other trip data
});

// Trip is stored locally and will sync when online
if (trip.isLocal) {
  console.log("Trip created locally, will sync when online");
}
```

## Data Flow

### Online Scenario
1. User performs action (create/update trip)
2. Data sent to API immediately
3. Local cache updated with API response
4. Hashes updated locally

### Offline Scenario
1. User performs action
2. Data stored locally with `syncStatus: 'pending'`
3. When app comes online, background sync attempts to sync
4. On success, local data replaced with API response
5. On failure, sync status updated to 'error'

### Real-time Updates
1. SignalR receives update from backend
2. Background sync service processes update
3. Hash comparison determines if sync is needed
4. Components automatically update via context

## Configuration

### Sync Intervals
- **Active app**: 30 seconds
- **Background app**: 5 minutes
- **Offline**: No sync attempts

### Database Tables
- `trips` - Trip data with sync metadata
- `trip_types` - Trip type definitions
- `locations` - Location data
- `users` - User profile data

## Error Handling

### Sync Failures
- Automatic retry with exponential backoff
- Error states stored locally
- User can manually trigger retry
- Graceful fallback to cached data

### Network Issues
- Offline detection via browser events
- Queue operations for later sync
- Clear UI indicators for sync status

## Performance Considerations

### Hash Optimization
- Only sync changed data entities
- Minimal API calls
- Efficient local queries with indexes

### Storage Management
- SQLite for structured data
- localStorage for hashes and metadata
- Automatic cleanup on logout

## Troubleshooting

### Common Issues

1. **Sync not working**
   - Check network connectivity
   - Verify API hash endpoint
   - Clear local data and re-login

2. **Data inconsistencies**
   - Force full sync from settings
   - Check console for sync errors
   - Verify hash generation logic

3. **Performance issues**
   - Check database indexes
   - Monitor sync frequency
   - Review data size

### Debug Tools
```typescript
// Check sync status
console.log(syncService.getSyncStatus());

// Force full sync
await syncService.forceFullSync();

// Clear all local data
await syncService.clearAllData();
```

## Future Enhancements

1. **Incremental sync** - Only sync changed records
2. **Conflict resolution** - Handle concurrent edits
3. **Background processing** - Service Worker support
4. **Compression** - Reduce data transfer
5. **Delta sync** - Transfer only differences
