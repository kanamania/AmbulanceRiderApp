# Cache Implementation Migration Guide

## For Developers

This guide helps you understand what changed and how to work with the new cache-first architecture.

## What Changed?

### New Files Added
1. **`src/services/indexeddb.service.ts`** - IndexedDB implementation for web
2. **`src/services/cache.service.ts`** - Unified cache interface
3. **`CACHE_IMPLEMENTATION.md`** - Detailed documentation
4. **`CACHE_QUICK_REFERENCE.md`** - Quick API reference

### Modified Files
1. **`src/services/database.service.ts`**
   - Added `vehicles` table
   - Added `vehicle_types` table
   - Added `metadata` table
   - Added CRUD operations for vehicles and vehicle types

2. **`src/services/vehicle.service.ts`**
   - All methods now check cache first
   - Automatic cache updates on write operations
   - Error fallback to cached data

3. **`src/services/trip.service.ts`**
   - All methods now check cache first
   - Automatic cache updates on write operations
   - Error fallback to cached data

4. **`src/services/location.service.ts`**
   - All methods now check cache first
   - Automatic cache updates on write operations
   - Error fallback to cached data

5. **`src/services/tripType.service.ts`**
   - All methods now check cache first
   - Automatic cache updates on write operations
   - Error fallback to cached data

6. **`src/services/index.ts`**
   - Exported `cacheService`
   - Exported `indexedDBService`

## Breaking Changes

### None! 🎉
All changes are backward compatible. The services maintain their original API signatures.

## How to Use

### No Code Changes Required
If you're already using the services correctly, nothing needs to change:

```typescript
// This code works exactly the same as before
const vehicles = await vehicleService.getVehicles();
const trips = await tripService.getAllTrips();
const locations = await locationService.getAllLocations();
```

### Behind the Scenes
The difference is that now:
1. First call fetches from API and caches
2. Subsequent calls return from cache instantly
3. Offline/error scenarios fallback to cache

## Testing Your Code

### Test Scenarios

#### 1. First Load (Cache Empty)
```typescript
// Clear cache first
await cacheService.clearVehicles();

// This will fetch from API
const vehicles = await vehicleService.getVehicles();
// Console: "Vehicles cached: X"
```

#### 2. Subsequent Load (Cache Hit)
```typescript
// This will return from cache
const vehicles = await vehicleService.getVehicles();
// Console: "Vehicles loaded from cache: X"
```

#### 3. Offline Mode
```typescript
// Disconnect network, then:
const vehicles = await vehicleService.getVehicles();
// Console: "Using cached vehicles due to API error"
```

#### 4. CRUD Operations
```typescript
// Create updates cache
const newVehicle = await vehicleService.createVehicle(data);
// Console: "New vehicle cached: X"

// Update updates cache
const updated = await vehicleService.updateVehicle(id, data);
// Console: "Updated vehicle cached: X"

// Delete removes from cache
await vehicleService.deleteVehicle(id);
// Console: "Vehicle removed from cache: X"
```

## Common Patterns

### Loading Data on App Start
```typescript
// In your App.tsx or main component
useEffect(() => {
  const preloadData = async () => {
    try {
      // These will cache data for offline use
      await Promise.all([
        vehicleService.getVehicles(),
        tripService.getAllTrips(),
        locationService.getAllLocations(),
        tripTypeService.getAllTripTypes()
      ]);
      console.log('Data preloaded and cached');
    } catch (error) {
      console.error('Preload failed:', error);
    }
  };
  
  preloadData();
}, []);
```

### Handling Logout
```typescript
const handleLogout = async () => {
  try {
    // Clear all cached data
    await cacheService.clearAllData();
    
    // Perform logout
    await authService.logout();
    
    // Navigate to login
    history.push('/login');
  } catch (error) {
    console.error('Logout failed:', error);
  }
};
```

### Force Refresh
```typescript
const handleRefresh = async () => {
  try {
    // Clear specific cache
    await cacheService.clearTrips();
    
    // Fetch fresh data
    const trips = await tripService.getAllTrips();
    
    setTrips(trips);
  } catch (error) {
    console.error('Refresh failed:', error);
  }
};
```

### Checking Cache Status
```typescript
const checkCacheStatus = async () => {
  const hasTrips = await cacheService.hasData('trips');
  const hasVehicles = await cacheService.hasData('vehicles');
  
  console.log('Cache status:', {
    trips: hasTrips,
    vehicles: hasVehicles
  });
};
```

## Debugging

### Enable Verbose Logging
All cache operations already log to console. Watch for:
- `"Cache Service: Using SQLite (Native Platform)"`
- `"Cache Service: Using IndexedDB (Web Platform)"`
- `"Vehicles loaded from cache: X"`
- `"Vehicles cached: X"`
- `"Using cached vehicles due to API error"`

### Inspect Cache Contents

#### For Web (IndexedDB)
1. Open Chrome DevTools
2. Go to Application tab
3. Expand IndexedDB
4. Look for `ambulance_rider_db`
5. Inspect object stores: trips, vehicles, locations, etc.

#### For Native (SQLite)
Use a SQLite browser tool to inspect the database file on the device.

### Clear Cache Manually

#### Web
```javascript
// In browser console
indexedDB.deleteDatabase('ambulance_rider_db');
```

#### Native
```typescript
// In your code
await cacheService.clearAllData();
```

## Performance Considerations

### Cache Size
Monitor cache size in production:
```typescript
const getCacheSize = async () => {
  const trips = await cacheService.getTrips();
  const vehicles = await cacheService.getVehicles();
  const locations = await cacheService.getLocations();
  
  console.log('Cache items:', {
    trips: trips.length,
    vehicles: vehicles.length,
    locations: locations.length
  });
};
```

### Memory Usage
- IndexedDB (Web): Limited by browser storage quota (~50-100MB typical)
- SQLite (Native): Limited by device storage

### Optimization Tips
1. **Selective Caching**: Only cache frequently accessed data
2. **Periodic Cleanup**: Clear old data periodically
3. **Lazy Loading**: Load data on demand, not all at once
4. **Pagination**: Use pagination for large datasets

## Troubleshooting

### Issue: Cache Not Working
**Solution:**
```typescript
// Ensure cache is initialized
await cacheService.initialize();

// Check platform
import { Capacitor } from '@capacitor/core';
console.log('Platform:', Capacitor.getPlatform());
console.log('Is Native:', Capacitor.isNativePlatform());
```

### Issue: Stale Data
**Solution:**
```typescript
// Clear and refresh
await cacheService.clearVehicles();
const freshData = await vehicleService.getVehicles();
```

### Issue: IndexedDB Errors (Web)
**Solution:**
- Check browser compatibility
- Ensure not in private/incognito mode
- Check storage quota
- Clear browser data and retry

### Issue: SQLite Errors (Native)
**Solution:**
- Check Capacitor SQLite plugin installation
- Verify database permissions
- Check device storage space
- Reinstall app if database is corrupted

## Best Practices

### DO ✅
- Use the service methods as normal
- Clear cache on logout
- Monitor console logs in development
- Test offline functionality
- Preload critical data on app start

### DON'T ❌
- Bypass services and call API directly
- Manually manage cache in components
- Forget to clear cache on logout
- Ignore console warnings/errors
- Assume cache is always populated

## Migration Checklist

- [ ] Review new files added
- [ ] Understand cache-first flow
- [ ] Test existing functionality
- [ ] Test offline mode
- [ ] Test CRUD operations
- [ ] Verify cache clearing on logout
- [ ] Check console logs
- [ ] Test on both web and native platforms
- [ ] Update any direct API calls to use services
- [ ] Document any custom cache usage

## Need Help?

### Resources
- `CACHE_IMPLEMENTATION.md` - Detailed architecture
- `CACHE_QUICK_REFERENCE.md` - API reference
- Console logs - Real-time cache operations
- Browser DevTools - Inspect IndexedDB (web)

### Common Questions

**Q: Will this slow down my app?**  
A: No, it will make it faster! Cache hits are instant.

**Q: What happens if cache and API are out of sync?**  
A: Cache is updated on every write operation. For reads, you can force refresh by clearing cache.

**Q: How much storage does this use?**  
A: Depends on data size. Typical usage: <10MB for most apps.

**Q: Can I disable caching?**  
A: Not recommended, but you can clear cache before each request.

**Q: Does this work offline?**  
A: Yes! That's the main benefit. Cached data is available offline.

**Q: How do I force a refresh?**  
A: Clear the specific cache, then call the service method.

## Support

For issues or questions:
1. Check console logs
2. Review documentation
3. Test in isolation
4. Check browser/device compatibility
5. Report bugs with logs and reproduction steps
