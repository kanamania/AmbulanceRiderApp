# Cache-First Strategy Implementation

## Overview
This document describes the cache-first strategy implementation for the Ambulance Rider App. All asset fetching operations now check local storage first before making API calls, providing offline support and improved performance.

## Architecture

### Storage Backends
The implementation uses different storage backends based on the platform:

- **Native Platforms (iOS/Android)**: SQLite via Capacitor SQLite plugin
- **Web Platform**: IndexedDB

### Key Components

#### 1. IndexedDB Service (`indexeddb.service.ts`)
- Provides IndexedDB storage for web browsers
- Manages object stores for: trips, tripTypes, locations, vehicles, vehicleTypes, metadata
- Implements CRUD operations for all cached entities

#### 2. Cache Service (`cache.service.ts`)
- Unified interface that automatically selects the appropriate backend
- Detects platform using `Capacitor.isNativePlatform()`
- Routes operations to either SQLite (database.service) or IndexedDB (indexeddb.service)
- Provides consistent API regardless of platform

#### 3. Database Service Updates (`database.service.ts`)
- Added tables for: `vehicles`, `vehicle_types`, `metadata`
- Implemented CRUD operations for vehicles and vehicle types
- Added indexes for better query performance

## Cache-First Strategy

### Flow for Read Operations
1. **Check Cache**: Query local storage (SQLite/IndexedDB) first
2. **Return if Found**: If data exists in cache, return immediately
3. **Fetch from API**: If cache is empty, make API request
4. **Update Cache**: Store API response in cache for future use
5. **Error Fallback**: On API error, fallback to cached data if available

### Flow for Write Operations (Create/Update/Delete)
1. **Perform API Operation**: Execute the operation on the server
2. **Update Cache**: Synchronize the cache with the new state
3. **Maintain Consistency**: Ensure cache reflects the latest data

## Updated Services

### 1. Vehicle Service (`vehicle.service.ts`)
- `getVehicles()`: Cache-first with filter support
- `getVehicle(id)`: Cache-first for single vehicle
- `getVehicleTypes()`: Cache-first for vehicle types
- `createVehicle()`: Updates cache after creation
- `updateVehicle()`: Updates cache after modification
- `deleteVehicle()`: Removes from cache after deletion

### 2. Trip Service (`trip.service.ts`)
- `getAllTrips()`: Cache-first for all trips
- `getTripById(id)`: Cache-first for single trip
- `createTrip()`: Updates cache after creation
- `updateTrip()`: Updates cache after modification
- `updateTripStatus()`: Updates cache after status change
- `deleteTrip()`: Removes from cache after deletion

### 3. Location Service (`location.service.ts`)
- `getAllLocations()`: Cache-first for all locations
- `getLocationById(id)`: Cache-first for single location
- `createLocation()`: Updates cache after creation
- `updateLocation()`: Updates cache after modification
- `deleteLocation()`: Removes from cache after deletion

### 4. Trip Type Service (`tripType.service.ts`)
- `getAllTripTypes()`: Cache-first for all trip types
- `getActiveTripTypes()`: Cache-first with active filter
- `getTripTypeById(id)`: Cache-first for single trip type
- `createTripType()`: Updates cache after creation
- `updateTripType()`: Updates cache after modification
- `deleteTripType()`: Removes from cache after deletion

## Benefits

### Performance
- **Instant Loading**: Cached data loads immediately without network delay
- **Reduced API Calls**: Fewer requests to the server reduce bandwidth usage
- **Better UX**: Faster app responsiveness improves user experience

### Offline Support
- **Graceful Degradation**: App continues to work with cached data when offline
- **Error Resilience**: Fallback to cache on API errors or network issues
- **Data Availability**: Users can view previously loaded data without connectivity

### Scalability
- **Reduced Server Load**: Fewer API requests reduce server resource usage
- **Bandwidth Savings**: Less data transfer saves costs and improves performance on slow connections

## Usage Examples

### Fetching Vehicles
```typescript
// First call - fetches from API and caches
const vehicles = await vehicleService.getVehicles();

// Subsequent calls - returns from cache instantly
const cachedVehicles = await vehicleService.getVehicles();

// Offline - returns cached data even without network
const offlineVehicles = await vehicleService.getVehicles();
```

### Creating a Trip
```typescript
// Creates trip via API and updates cache
const newTrip = await tripService.createTrip(tripData);

// Trip is now available in cache for offline access
const trip = await tripService.getTripById(newTrip.id); // From cache
```

## Cache Management

### Initialization
The cache is automatically initialized when first accessed. No manual initialization required.

### Clearing Cache
```typescript
// Clear all cached data (e.g., on logout)
await cacheService.clearAllData();

// Clear specific resources
await cacheService.clearTrips();
await cacheService.clearVehicles();
await cacheService.clearLocations();
await cacheService.clearTripTypes();
```

### Checking Cache Status
```typescript
// Check if cache has data for a resource
const hasTrips = await cacheService.hasData('trips');
const hasVehicles = await cacheService.hasData('vehicles');
```

## Metadata Storage
The cache service supports storing metadata (e.g., last sync time, cache timestamps):

```typescript
// Store metadata
await cacheService.setMetadata('lastSyncTime', Date.now());

// Retrieve metadata
const lastSync = await cacheService.getMetadata('lastSyncTime');
```

## Console Logging
All cache operations log to the console for debugging:
- "Vehicles loaded from cache: X" - Data retrieved from cache
- "Vehicles cached: X" - Data stored in cache
- "Using cached vehicles due to API error" - Fallback to cache on error

## Future Enhancements

### Potential Improvements
1. **Cache Expiration**: Implement TTL (Time To Live) for cached data
2. **Selective Refresh**: Add ability to force refresh specific resources
3. **Background Sync**: Automatically sync cache with server in background
4. **Cache Size Management**: Implement LRU (Least Recently Used) eviction
5. **Compression**: Compress cached data to save storage space
6. **Partial Updates**: Update only changed records instead of full refresh

## Testing Recommendations

### Test Scenarios
1. **First Load**: Verify data is fetched from API and cached
2. **Subsequent Loads**: Verify data is loaded from cache
3. **Offline Mode**: Verify app works with cached data when offline
4. **API Errors**: Verify fallback to cache on API failures
5. **CRUD Operations**: Verify cache stays in sync with API operations
6. **Platform Switching**: Test both web (IndexedDB) and native (SQLite) platforms

## Migration Notes

### Existing Data
- Existing apps will automatically initialize the cache on first use
- No data migration required - cache starts empty and populates on first API calls
- Users may experience slightly slower first load as cache is populated

### Backward Compatibility
- All services maintain their original API signatures
- Cache operations are transparent to calling code
- No breaking changes to existing functionality
