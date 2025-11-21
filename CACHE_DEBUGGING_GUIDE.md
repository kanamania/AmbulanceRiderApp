# Cache Debugging Guide

## Overview
This guide helps debug why locations and trip types might still be fetched from the API instead of cache.

---

## Expected Flow

### Login Sequence
```
1. User enters credentials
2. AuthService.login() called
   ├─ POST /api/auth/login
   ├─ Store token
   ├─ Initialize cache
   └─ dataHashService.performSync()
       ├─ GET /api/auth/data-hashes
       ├─ Compare with stored hashes
       └─ If changed:
           ├─ 3+ entities: GET /system/data (bulk)
           └─ 1-2 entities: Individual API calls
3. AuthContext.login() completes
4. Components load data
   └─ Services check cache FIRST
       ├─ Cache hit: Return data ✓
       └─ Cache miss: Fetch from API ⚠
```

---

## Console Log Patterns

### ✅ CORRECT: Data Loaded from Cache
```
[Hash Service] Starting data synchronization...
[Hash Service] Fetching data hashes from server...
[Hash Service] 4 entities changed, fetching in single call...
[Hash Service] Synced 8 locations (bulk)
[Hash Service] Synced 5 trip types (bulk)
[Hash Service] Data synchronization completed successfully (bulk)

[Location Service] getAllLocations() called
[Location Service] ✓ Locations loaded from cache: 8

[TripType Service] getActiveTripTypes() called
[TripType Service] ✓ Active trip types filtered from cache: 3 / 5
```

### ⚠ PROBLEM: Data Fetched from API
```
[Hash Service] Starting data synchronization...
[Hash Service] Fetching data hashes from server...
[Hash Service] 4 entities changed, fetching in single call...
[Hash Service] Synced 8 locations (bulk)
[Hash Service] Synced 5 trip types (bulk)
[Hash Service] Data synchronization completed successfully (bulk)

[Location Service] getAllLocations() called
[Location Service] ⚠ Cache empty, fetching from API /api/locations  ← PROBLEM!

[TripType Service] getActiveTripTypes() called
[TripType Service] ⚠ Cache empty, fetching from API /api/triptypes/active  ← PROBLEM!
```

---

## Possible Causes & Solutions

### Cause 1: Race Condition (Service Called Before Sync Completes)

**Symptoms:**
- Logs show service called before sync completes
- API calls happen immediately after login

**Check:**
```
Look for this pattern in logs:
[Location Service] getAllLocations() called
[Hash Service] Starting data synchronization...  ← Sync starts AFTER service call
```

**Solution:**
Ensure `AuthService.login()` completes before components load:
```typescript
// In AuthContext.tsx
const response = await AuthService.login(credentials);  // Wait for sync
setUser(response.user);  // Then set user
// Components will now load with populated cache
```

---

### Cause 2: Cache Not Persisting

**Symptoms:**
- Sync completes successfully
- But cache is empty when service checks

**Check:**
```javascript
// In browser console after login:
// Check IndexedDB
// DevTools > Application > Storage > IndexedDB > ambulance_rider_db

// Check if data exists in stores:
// - locations
// - trip_types
```

**Solution:**
Verify cache service is working:
```typescript
// Add temporary logging in cache.service.ts
console.log('Upserting locations:', locations.length);
console.log('Locations in DB:', await this.getLocations());
```

---

### Cause 3: Multiple Cache Instances

**Symptoms:**
- Data is cached in one instance
- But service reads from different instance

**Check:**
Look for multiple cache initializations:
```
Cache initialized
Cache initialized  ← Should only happen once
```

**Solution:**
Ensure singleton pattern in cache service.

---

### Cause 4: Service Called During Initialization (Before Login)

**Symptoms:**
- API calls happen on app load
- Before user logs in

**Check:**
```
[Location Service] getAllLocations() called
[Location Service] ⚠ Cache empty, fetching from API /api/locations
// No login or sync logs before this
```

**Solution:**
Ensure components wait for auth:
```typescript
useEffect(() => {
  if (authLoading || !isAuthenticated) {
    return;  // Don't fetch if not authenticated
  }
  // Fetch data
}, [authLoading, isAuthenticated]);
```

---

### Cause 5: Cache Cleared Unexpectedly

**Symptoms:**
- Sync completes
- Cache works initially
- Then becomes empty

**Check:**
Look for:
```
[Hash Service] Clearing stored hashes...
// Or
Cache cleared
```

**Solution:**
Check logout/cleanup logic doesn't run prematurely.

---

## Debugging Steps

### Step 1: Check Login Flow
1. Open browser console
2. Clear all data (Application > Clear storage)
3. Login
4. Watch for this sequence:
```
[Hash Service] Starting data synchronization...
[Hash Service] Synced X locations
[Hash Service] Synced Y trip types
[Hash Service] Data synchronization completed successfully
[Location Service] getAllLocations() called
[Location Service] ✓ Locations loaded from cache: X
[TripType Service] getActiveTripTypes() called
[TripType Service] ✓ Active trip types filtered from cache: Y
```

### Step 2: Check Network Tab
1. Open DevTools > Network
2. Login
3. Expected calls:
   - ✅ POST /api/auth/login
   - ✅ GET /api/auth/data-hashes
   - ✅ GET /api/system/data (if 3+ entities changed)
   - ❌ Should NOT see: GET /api/locations
   - ❌ Should NOT see: GET /api/triptypes/active

### Step 3: Check IndexedDB
1. Open DevTools > Application > Storage > IndexedDB
2. Expand `ambulance_rider_db`
3. Check stores:
   - `locations` - Should have data
   - `trip_types` - Should have data
   - `metadata` - Should have `data_hashes` entry

### Step 4: Check localStorage
```javascript
// In console:
JSON.parse(localStorage.getItem('app_data_hashes'))
// Should return:
{
  trips: "hash...",
  locations: "hash...",
  tripTypes: "hash...",
  vehicles: "hash...",
  lastSync: "2025-11-21T..."
}
```

### Step 5: Force Clear and Retry
```javascript
// Clear everything
localStorage.clear();
// Then in DevTools > Application > Storage > IndexedDB
// Right-click ambulance_rider_db > Delete database

// Refresh and login again
// Watch console logs
```

---

## Common Patterns

### Pattern 1: First Login (Expected)
```
[Hash Service] No stored hashes found (first sync)
[Hash Service] 4 entities changed, fetching in single call...
[Hash Service] Bulk data received: {trips: 15, locations: 8, tripTypes: 5, vehicles: 10}
[Hash Service] Synced 8 locations (bulk)
[Hash Service] Synced 5 trip types (bulk)
✓ All subsequent calls load from cache
```

### Pattern 2: Subsequent Login (Expected)
```
[Hash Service] Stored hashes found in cache
[Hash Service] All data is up to date, no sync needed
[Location Service] ✓ Locations loaded from cache: 8
[TripType Service] ✓ Active trip types filtered from cache: 3 / 5
✓ No API calls except hash check
```

### Pattern 3: Partial Update (Expected)
```
[Hash Service] 1 entity changed, using individual API calls...
[Hash Service] Syncing locations...
[Hash Service] Synced 8 locations
[TripType Service] ✓ Active trip types filtered from cache: 3 / 5
✓ Only changed entity fetched from API
```

### Pattern 4: Race Condition (PROBLEM)
```
[Location Service] getAllLocations() called
[Location Service] ⚠ Cache empty, fetching from API /api/locations
[Hash Service] Starting data synchronization...  ← Too late!
[Hash Service] Synced 8 locations (bulk)
✗ Service called before sync completed
```

---

## Quick Fixes

### Fix 1: Ensure Sync Completes Before UI Loads
```typescript
// In AuthContext.tsx
const login = async (credentials: LoginCredentials) => {
  const response = await AuthService.login(credentials);  // Waits for sync
  setUser(response.user);  // UI updates after sync
};
```

### Fix 2: Add Loading State
```typescript
// In components
if (authLoading) {
  return <IonSpinner />;
}
// Only load data after auth is ready
```

### Fix 3: Verify Cache Service Singleton
```typescript
// In cache.service.ts
class CacheService {
  private static instance: CacheService;
  
  static getInstance() {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }
}

export default CacheService.getInstance();
```

---

## Monitoring Commands

### Check Current State
```javascript
// Hashes
JSON.parse(localStorage.getItem('app_data_hashes'))

// Check if cache has data (async)
// Open console and run:
const db = await indexedDB.databases();
console.log(db);
```

### Monitor API Calls
```javascript
// Add to console:
const originalFetch = window.fetch;
window.fetch = function(...args) {
  console.log('API Call:', args[0]);
  return originalFetch.apply(this, args);
};
```

---

## Success Criteria

After login, you should see:
1. ✅ Sync completes successfully
2. ✅ Hashes saved to localStorage
3. ✅ Data saved to IndexedDB
4. ✅ Services load from cache (no API calls)
5. ✅ Network tab shows only:
   - POST /api/auth/login
   - GET /api/auth/data-hashes
   - GET /api/system/data (if needed)

You should NOT see:
- ❌ GET /api/locations (after sync)
- ❌ GET /api/triptypes/active (after sync)
- ❌ GET /api/trips (after sync)
- ❌ GET /api/vehicles (after sync)

---

## Next Steps

1. Test login flow with console open
2. Verify log patterns match expected flow
3. Check network tab for unexpected API calls
4. If issues persist, share console logs showing:
   - Full login sequence
   - Service calls
   - Cache checks
   - API calls
