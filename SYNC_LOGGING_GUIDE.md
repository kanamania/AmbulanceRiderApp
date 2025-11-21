# Sync Process Logging Guide

## Overview
Comprehensive logging has been added to the data synchronization process to help with debugging and monitoring. All logs are prefixed with `[Hash Service]` for easy filtering.

---

## Log Patterns

### 1. Successful Sync (No Changes)
```
[Hash Service] Starting data synchronization...
[Hash Service] Fetching data hashes from server...
[Hash Service] Server hashes received: {trips: "abc123...", locations: "def456...", ...}
[Hash Service] Retrieving stored hashes from cache...
[Hash Service] Stored hashes found in cache: {trips: "abc123...", locations: "def456...", ...}
[Hash Service] Comparing server hashes with stored hashes...
[Hash Service] trips unchanged
[Hash Service] locations unchanged
[Hash Service] tripTypes unchanged
[Hash Service] vehicles unchanged
[Hash Service] Hash comparison complete. Changed entities: none
[Hash Service] All data is up to date, no sync needed
```

---

### 2. First Login (All Entities Changed - Bulk Sync)
```
[Hash Service] Starting data synchronization...
[Hash Service] Fetching data hashes from server...
[Hash Service] Server hashes received: {trips: "abc123...", locations: "def456...", ...}
[Hash Service] Retrieving stored hashes from cache...
[Hash Service] Cache empty, checking localStorage...
[Hash Service] No stored hashes found (first sync)
[Hash Service] Comparing server hashes with stored hashes...
[Hash Service] trips changed: {stored: "none", server: "abc123..."}
[Hash Service] locations changed: {stored: "none", server: "def456..."}
[Hash Service] tripTypes changed: {stored: "none", server: "ghi789..."}
[Hash Service] vehicles changed: {stored: "none", server: "jkl012..."}
[Hash Service] Hash comparison complete. Changed entities: ["trips", "locations", "tripTypes", "vehicles"]
[Hash Service] Entities to sync: ["trips", "locations", "tripTypes", "vehicles"]
[Hash Service] 4 entities changed, fetching in single call...
[Hash Service] Fetching bulk data for entities: ["trips", "locations", "tripTypes", "vehicles"]
[Hash Service] Bulk data request URL: /system/data?includeTrips=true&includeLocations=true&includeTripTypes=true&includeVehicles=true
[Hash Service] Bulk data received: {trips: 15, locations: 8, tripTypes: 5, vehicles: 10}
[Hash Service] Syncing trips from bulk data...
[Hash Service] Synced 15 trips (bulk)
[Hash Service] Syncing locations from bulk data...
[Hash Service] Synced 8 locations (bulk)
[Hash Service] Syncing tripTypes from bulk data...
[Hash Service] Synced 5 trip types (bulk)
[Hash Service] Syncing vehicles from bulk data...
[Hash Service] Synced 10 vehicles (bulk)
[Hash Service] Saving hashes to cache and localStorage...
[Hash Service] ✓ Hashes saved to cache
[Hash Service] ✓ Hashes saved to localStorage
[Hash Service] Sync timestamp: 2025-11-21T18:39:00.000Z
[Hash Service] Data synchronization completed successfully (bulk)
```

---

### 3. Partial Update (1-2 Entities Changed - Individual Sync)
```
[Hash Service] Starting data synchronization...
[Hash Service] Fetching data hashes from server...
[Hash Service] Server hashes received: {trips: "abc123...", locations: "def456...", ...}
[Hash Service] Retrieving stored hashes from cache...
[Hash Service] Stored hashes found in cache: {trips: "abc123...", locations: "def456...", ...}
[Hash Service] Comparing server hashes with stored hashes...
[Hash Service] trips unchanged
[Hash Service] locations changed: {stored: "def456...", server: "xyz789..."}
[Hash Service] tripTypes unchanged
[Hash Service] vehicles unchanged
[Hash Service] Hash comparison complete. Changed entities: ["locations"]
[Hash Service] Entities to sync: ["locations"]
[Hash Service] 1 entity changed, using individual API calls...
[Hash Service] Syncing locations...
[Hash Service] Synced 8 locations
[Hash Service] Saving hashes to cache and localStorage...
[Hash Service] ✓ Hashes saved to cache
[Hash Service] ✓ Hashes saved to localStorage
[Hash Service] Sync timestamp: 2025-11-21T18:40:00.000Z
[Hash Service] Data synchronization completed successfully (individual)
```

---

### 4. Bulk Sync Failure (Fallback to Individual)
```
[Hash Service] Starting data synchronization...
[Hash Service] Fetching data hashes from server...
[Hash Service] Server hashes received: {trips: "abc123...", locations: "def456...", ...}
[Hash Service] Retrieving stored hashes from cache...
[Hash Service] Stored hashes found in cache: {trips: "abc123...", locations: "def456...", ...}
[Hash Service] Comparing server hashes with stored hashes...
[Hash Service] trips changed: {stored: "abc123...", server: "new123..."}
[Hash Service] locations changed: {stored: "def456...", server: "new456..."}
[Hash Service] tripTypes changed: {stored: "ghi789...", server: "new789..."}
[Hash Service] vehicles unchanged
[Hash Service] Hash comparison complete. Changed entities: ["trips", "locations", "tripTypes"]
[Hash Service] Entities to sync: ["trips", "locations", "tripTypes"]
[Hash Service] 3 entities changed, fetching in single call...
[Hash Service] Fetching bulk data for entities: ["trips", "locations", "tripTypes"]
[Hash Service] Bulk data request URL: /system/data?includeTrips=true&includeLocations=true&includeTripTypes=true
[Hash Service] Error fetching full data: Network error
[Hash Service] Bulk sync failed, falling back to individual calls: Network error
[Hash Service] Syncing trips...
[Hash Service] Synced 15 trips
[Hash Service] Syncing locations...
[Hash Service] Synced 8 locations
[Hash Service] Syncing tripTypes...
[Hash Service] Synced 5 trip types
[Hash Service] Saving hashes to cache and localStorage...
[Hash Service] ✓ Hashes saved to cache
[Hash Service] ✓ Hashes saved to localStorage
[Hash Service] Sync timestamp: 2025-11-21T18:41:00.000Z
```

---

## Service-Level Logging

### Location Service
```
// Cache hit
Locations loaded from cache: 8

// Cache miss
No cached locations, fetching from API
Locations cached: 8

// Error fallback
Using cached locations due to API error
```

### Trip Type Service
```
// Active types filtered from cache
Active trip types filtered from cache: 3 / 5

// Cache miss
No cached trip types, fetching active from API
Active trip types cached: 3

// Error fallback
Using cached active trip types due to API error: 3
```

### Vehicle Service
```
// Cache hit with filters
Vehicles loaded from cache: 10

// Cache miss
No cached vehicles, fetching from API
Vehicles cached: 10

// Error fallback
Using cached vehicles due to API error
```

---

## Filtering Console Logs

### View Only Hash Service Logs
```javascript
// In browser console, filter by:
[Hash Service]
```

### View All Sync-Related Logs
```javascript
// Filter by any of:
[Hash Service]
cached
from cache
```

### Monitor API Calls
Open Network tab and filter by:
- `/auth/data-hashes` - Hash checks
- `/system/data` - Bulk data fetches
- `/trips`, `/locations`, `/triptypes`, `/vehicles` - Individual fetches

---

## Debugging Commands

### Check Current Hashes
```javascript
// In browser console:
JSON.parse(localStorage.getItem('app_data_hashes'))
```

### Force Clear Hashes (Trigger Full Sync)
```javascript
localStorage.removeItem('app_data_hashes')
// Then refresh or login again
```

### Check Cache Status
```javascript
// Open DevTools > Application > Storage > IndexedDB > ambulance_rider_db
// Check each object store for data
```

---

## Log Symbols

- `✓` - Success
- `⚠` - Warning (non-critical)
- `✗` - Error (critical)

---

## Expected Log Patterns by Scenario

### Scenario 1: Fresh Install
```
1. First login
   → No stored hashes
   → All 4 entities changed
   → Bulk sync (1 API call)
   → All data cached

2. Navigate to pages
   → All data loaded from cache
   → No API calls
```

### Scenario 2: Regular Usage
```
1. Login
   → Hashes retrieved from localStorage
   → 0 entities changed
   → No sync needed (1 API call only)

2. Navigate to pages
   → All data loaded from cache
   → No API calls
```

### Scenario 3: Data Updated on Server
```
1. Login
   → Hashes retrieved from localStorage
   → 2 entities changed (e.g., trips, vehicles)
   → Individual sync (3 API calls total)
   → Updated data cached

2. Navigate to pages
   → All data loaded from cache
   → No API calls
```

### Scenario 4: Major Server Update
```
1. Login
   → Hashes retrieved from localStorage
   → 4 entities changed
   → Bulk sync (2 API calls total)
   → All data refreshed in cache

2. Navigate to pages
   → All data loaded from cache
   → No API calls
```

---

## Troubleshooting

### Problem: Seeing API calls after sync
**Check**:
1. Look for `loaded from cache` logs
2. If missing, cache may not be populated
3. Check for sync errors in console

### Problem: Sync taking too long
**Check**:
1. Look for bulk vs individual sync logs
2. Check network tab for slow requests
3. Verify backend `/system/data` endpoint exists

### Problem: Hashes not persisting
**Check**:
1. Look for `✓ Hashes saved to localStorage` log
2. Check browser localStorage quota
3. Verify no localStorage errors

### Problem: Always syncing all data
**Check**:
1. Look for "No stored hashes found" log
2. Verify hashes are being saved
3. Check if hashes are being cleared unexpectedly

---

## Performance Metrics to Monitor

Track these from logs:
- **Hash check time**: Time between "Fetching data hashes" and "Server hashes received"
- **Sync decision time**: Time for hash comparison
- **Bulk sync time**: Time for full data fetch
- **Cache operations**: Time to save/retrieve from cache
- **API call count**: Total calls per login session

---

## Log Levels

### INFO (Normal Operation)
- Starting/completing sync
- Cache hits
- Hash comparisons
- Data counts

### WARN (Non-Critical Issues)
- localStorage failures (falls back to cache)
- Bulk sync failures (falls back to individual)
- Empty data responses

### ERROR (Critical Issues)
- API failures
- Cache failures
- Sync failures
- Hash retrieval failures

---

## Next Steps

1. Monitor logs during testing
2. Verify expected patterns match actual logs
3. Adjust logging verbosity if needed
4. Add custom logging for specific debugging needs
