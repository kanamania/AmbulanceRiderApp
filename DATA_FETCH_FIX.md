# Data Fetching Optimization Fix

## Problem
After `/api/system/data` endpoint was called during login (via `dataHashService.performSync()`), data was being fetched redundantly from the API even though it had just been synced to cache.

## Latest Update: Smart Bulk Sync (v2)
**Date**: 2025-11-21

### New Optimization Strategy
The sync logic now intelligently decides between bulk and individual fetches:
- **3+ entities changed**: Fetch all data via `/system/data?includeData=true` (1 API call)
- **1-2 entities changed**: Fetch individually (1-2 API calls)
- **0 entities changed**: No API calls (use cache)

### Root Causes

1. **Vehicle Service Cache Bypass**: The `vehicleService.getVehicles()` method was bypassing cache when ANY filters were present (pagination, search, status), causing unnecessary API calls even when data was freshly cached.

2. **Sync Using Service Layer**: The `dataHashService.syncEntity()` method was calling service methods (e.g., `vehicleService.getVehicles()`), which would check cache first. This created a circular dependency where sync would sometimes skip fetching if cache existed.

3. **No Client-Side Filtering**: Services weren't applying filters (pagination, search) on cached data, forcing API calls for simple operations.

## Solution

### 1. Vehicle Service - Cache-First with Client-Side Filtering
**File**: `src/services/vehicle.service.ts`

- **Always check cache first**, regardless of filters
- **Apply filters client-side** on cached data:
  - Search filtering (name, plate number)
  - Vehicle type filtering
  - Pagination
- **Only fetch from API** when cache is empty
- **Fallback to filtered cache** on API errors

**Benefits**:
- Eliminates redundant API calls after sync
- Faster response times for filtered queries
- Better offline support
- Reduced server load

### 2. Data Hash Service - Smart Sync Strategy
**File**: `src/services/dataHash.service.ts`

#### Intelligent Sync Decision
- **Compares hashes** stored in localStorage with server hashes
- **Determines changed entities** (trips, locations, tripTypes, vehicles)
- **Chooses optimal sync method** based on number of changes

#### Bulk Sync (3+ entities)
- Calls `/system/data?includeData=true` to get all data in **one request**
- Parses full data response and updates cache
- Falls back to individual calls if bulk sync fails
- Logs: "3+ entities changed, fetching all data in single call..."

#### Individual Sync (1-2 entities)
- Makes targeted API calls only for changed entities
- Reduces payload size for minor updates
- Logs: "1-2 entities changed, using individual API calls..."

**New Methods**:
- `fetchFullData()` - Fetches all data with hashes
- `syncEntityFromFullData()` - Syncs from bulk response
- Enhanced `performSync()` - Smart decision logic

## Flow After Fix

### Login Flow (Smart Sync)
1. User logs in → `authService.login()`
2. `dataHashService.performSync()` is called
3. Fetches hashes from `/api/auth/data-hashes` (lightweight)
4. Compares with stored hashes in localStorage
5. **Decision Point**:
   - **0 changes**: No API calls, use cache ✅
   - **1-2 changes**: Individual API calls for changed entities
   - **3+ changes**: Single bulk call to `/system/data?includeTrips=true&includeLocations=true...` ✅
6. Updates cache with fresh data
7. Saves new hashes to cache + localStorage

### Component Data Loading
1. Component calls `vehicleService.getVehicles({ page: 1, limit: 10 })`
2. Service checks cache **first**
3. If cache exists (from recent sync):
   - Applies filters **client-side**
   - Returns paginated results
   - **No API call made** ✅
4. If cache empty:
   - Fetches from API
   - Caches results
   - Returns data

## Performance Impact

### Before Fix (Original)
- Login: 1 hash check + 4 sync API calls
- Component load: 4+ additional API calls (one per service with filters)
- **Total: ~8 API calls**

### After Fix v1
- Login: 1 hash check + 4 sync API calls
- Component load: 0 API calls (uses cache)
- **Total: ~5 API calls** (37.5% reduction)

### After Fix v2 (Smart Sync)
**Scenario 1: All entities changed (first login)**
- Login: 1 hash check + 1 bulk data call
- Component load: 0 API calls (uses cache)
- **Total: 2 API calls** (75% reduction) ✅

**Scenario 2: 1-2 entities changed**
- Login: 1 hash check + 1-2 individual calls
- Component load: 0 API calls (uses cache)
- **Total: 2-3 API calls** (62-75% reduction)

**Scenario 3: No changes**
- Login: 1 hash check only
- Component load: 0 API calls (uses cache)
- **Total: 1 API call** (87.5% reduction) ✅

## Testing Checklist

- [ ] Login and verify data sync happens once
- [ ] Navigate to Vehicle Management - should load from cache
- [ ] Apply search filter - should filter client-side
- [ ] Apply pagination - should paginate client-side
- [ ] Check network tab - no redundant API calls after login
- [ ] Test offline mode - should work with cached data
- [ ] Test error scenarios - should fallback to cache

## Hash Storage Enhancement

### localStorage Integration
**File**: `src/services/dataHash.service.ts`

Data hashes are now stored in **both** cache and localStorage:
- **Key**: `app_data_hashes`
- **Benefits**:
  - Easy debugging via browser DevTools
  - Synchronous access when needed
  - Redundancy if cache fails
  - Persists across sessions

**Structure**:
```json
{
  "trips": "hash_string",
  "locations": "hash_string",
  "tripTypes": "hash_string",
  "vehicles": "hash_string",
  "lastSync": "2025-11-21T18:13:00.000Z"
}
```

**Methods Updated**:
- `saveHashes()` - Saves to both cache and localStorage
- `getStoredHashes()` - Reads from cache with localStorage fallback
- `clearHashes()` - Clears from both locations

## Related Files
- `src/services/vehicle.service.ts` - Cache-first with client-side filtering
- `src/services/dataHash.service.ts` - Direct API fetching during sync + localStorage storage
- `src/services/trip.service.ts` - Already cache-first (no changes needed)
- `src/services/location.service.ts` - Already cache-first (no changes needed)
- `src/services/tripType.service.ts` - Already cache-first (no changes needed)

## Debugging Tips

### Check Current Hashes
Open browser console and run:
```javascript
JSON.parse(localStorage.getItem('app_data_hashes'))
```

### Force Clear Hashes
```javascript
localStorage.removeItem('app_data_hashes')
```

### Monitor Sync Activity
Watch console logs for:
- "Data hashes saved to cache and localStorage"
- "Syncing [entity]..."
- "Synced X [entities]"

## Backend Requirements

### Two Endpoints Required

#### 1. GET /api/auth/data-hashes
Returns only hashes (lightweight, fast):
```json
{
  "trips": "hash_string",
  "locations": "hash_string",
  "tripTypes": "hash_string",
  "vehicles": "hash_string"
}
```

#### 2. GET /api/system/data
Returns full data with optional entity filters:

**Query Parameters**:
- `includeTrips=true`
- `includeLocations=true`
- `includeTripTypes=true`
- `includeVehicles=true`
- **No params**: Returns all data by default

**Response Structure**:
```json
{
  "hashes": {
    "trips": "hash_string",
    "locations": "hash_string",
    "tripTypes": "hash_string",
    "vehicles": "hash_string"
  },
  "data": {
    "trips": [...],
    "locations": [...],
    "tripTypes": [...],
    "vehicles": [...]
  }
}
```

**See**: `BACKEND_BULK_DATA_ENDPOINT.md` for complete backend implementation guide

---

## Notes
- Other services (trip, location, tripType) already had proper cache-first logic
- Vehicle service was the main culprit due to filter-based cache bypass
- Hash storage in localStorage provides easy debugging and redundancy
- Smart sync reduces API calls by up to 87.5% in optimal scenarios
- Backend must implement `includeData` parameter for bulk sync to work
- This fix maintains backward compatibility while improving performance
