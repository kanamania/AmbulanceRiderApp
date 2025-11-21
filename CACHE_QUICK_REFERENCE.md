# Cache Service Quick Reference

## Import
```typescript
import { cacheService } from './services';
```

## Platform Detection
- **Native (iOS/Android)**: Uses SQLite
- **Web**: Uses IndexedDB
- Automatic detection via `Capacitor.isNativePlatform()`

## API Methods

### Trips
```typescript
// Get all trips
const trips = await cacheService.getTrips();

// Get trip by ID
const trip = await cacheService.getTripById(123);

// Upsert trips (insert or update)
await cacheService.upsertTrips([trip1, trip2]);

// Clear trips
await cacheService.clearTrips();
```

### Trip Types
```typescript
// Get all trip types
const tripTypes = await cacheService.getTripTypes();

// Get trip type by ID
const tripType = await cacheService.getTripTypeById(5);

// Upsert trip types
await cacheService.upsertTripTypes([tripType1, tripType2]);

// Clear trip types
await cacheService.clearTripTypes();
```

### Locations
```typescript
// Get all locations
const locations = await cacheService.getLocations();

// Get location by ID
const location = await cacheService.getLocationById(10);

// Upsert locations
await cacheService.upsertLocations([location1, location2]);

// Clear locations
await cacheService.clearLocations();
```

### Vehicles
```typescript
// Get all vehicles
const vehicles = await cacheService.getVehicles();

// Get vehicle by ID
const vehicle = await cacheService.getVehicleById(7);

// Upsert vehicles
await cacheService.upsertVehicles([vehicle1, vehicle2]);

// Clear vehicles
await cacheService.clearVehicles();
```

### Vehicle Types
```typescript
// Get all vehicle types
const vehicleTypes = await cacheService.getVehicleTypes();

// Get vehicle type by ID
const vehicleType = await cacheService.getVehicleTypeById(3);

// Upsert vehicle types
await cacheService.upsertVehicleTypes([vehicleType1, vehicleType2]);

// Clear vehicle types
await cacheService.clearVehicleTypes();
```

### Metadata
```typescript
// Set metadata
await cacheService.setMetadata('lastSyncTime', Date.now());
await cacheService.setMetadata('userPreferences', { theme: 'dark' });

// Get metadata
const lastSync = await cacheService.getMetadata('lastSyncTime');
const prefs = await cacheService.getMetadata('userPreferences');
```

### Utility Methods
```typescript
// Check if cache has data
const hasTrips = await cacheService.hasData('trips');
const hasVehicles = await cacheService.hasData('vehicles');
const hasLocations = await cacheService.hasData('locations');
const hasTripTypes = await cacheService.hasData('tripTypes');
const hasVehicleTypes = await cacheService.hasData('vehicleTypes');

// Clear all data (e.g., on logout)
await cacheService.clearAllData();

// Initialize cache (usually automatic)
await cacheService.initialize();
```

## Service Usage Examples

### Vehicle Service
```typescript
import { vehicleService } from './services';

// Automatically checks cache first, then API
const vehicles = await vehicleService.getVehicles();

// With filters (bypasses cache for complex queries)
const availableVehicles = await vehicleService.getVehicles({ 
  status: 'available' 
});

// Single vehicle (cache-first)
const vehicle = await vehicleService.getVehicle(123);

// Vehicle types (cache-first)
const types = await vehicleService.getVehicleTypes();
```

### Trip Service
```typescript
import { tripService } from './services';

// Get all trips (cache-first)
const trips = await tripService.getAllTrips();

// Get single trip (cache-first)
const trip = await tripService.getTripById(456);

// Create trip (updates cache)
const newTrip = await tripService.createTrip(tripData);

// Update trip (updates cache)
const updated = await tripService.updateTrip(456, updates);

// Update status (updates cache)
const statusUpdated = await tripService.updateTripStatus({
  id: 456,
  status: 1
});
```

### Location Service
```typescript
import { locationService } from './services';

// Get all locations (cache-first)
const locations = await locationService.getAllLocations();

// Get single location (cache-first)
const location = await locationService.getLocationById(789);

// Create location (updates cache)
const newLocation = await locationService.createLocation(locationData);
```

### Trip Type Service
```typescript
import { tripTypeService } from './services';

// Get all trip types (cache-first)
const allTypes = await tripTypeService.getAllTripTypes();

// Get active trip types (cache-first with filter)
const activeTypes = await tripTypeService.getActiveTripTypes();

// Get single trip type (cache-first)
const tripType = await tripTypeService.getTripTypeById(12);
```

## Cache Behavior

### Read Operations
1. Check cache first
2. Return cached data if available
3. Fetch from API if cache is empty
4. Update cache with API response
5. Fallback to cache on API error

### Write Operations
1. Perform API operation
2. Update cache with result
3. Maintain cache consistency

## Console Logs
Watch for these logs to debug cache behavior:
- `"Vehicles loaded from cache: X"` - Cache hit
- `"Vehicles cached: X"` - Data stored
- `"Using cached vehicles due to API error"` - Fallback
- `"Cache Service: Using SQLite (Native Platform)"` - Platform detection
- `"Cache Service: Using IndexedDB (Web Platform)"` - Platform detection

## Best Practices

### DO
✅ Use cache-first methods for read operations  
✅ Let services handle cache updates automatically  
✅ Clear cache on logout  
✅ Check console logs for cache behavior  
✅ Test offline functionality  

### DON'T
❌ Manually manage cache in components  
❌ Bypass cache for simple queries  
❌ Forget to clear cache on logout  
❌ Assume cache is always populated  
❌ Mix direct API calls with cached services  

## Troubleshooting

### Cache Not Working
```typescript
// Check if cache is initialized
await cacheService.initialize();

// Check if cache has data
const hasData = await cacheService.hasData('vehicles');
console.log('Cache has vehicles:', hasData);
```

### Stale Data
```typescript
// Force refresh by clearing cache
await cacheService.clearVehicles();
const freshVehicles = await vehicleService.getVehicles();
```

### Platform Issues
```typescript
// Check which backend is being used
import { Capacitor } from '@capacitor/core';
console.log('Is Native:', Capacitor.isNativePlatform());
```

## Performance Tips

1. **Preload Data**: Load frequently accessed data on app start
2. **Batch Operations**: Use upsert with arrays for multiple items
3. **Selective Clearing**: Clear only what's needed, not everything
4. **Monitor Size**: Check cache size periodically in production
5. **Log Analysis**: Use console logs to identify cache misses
