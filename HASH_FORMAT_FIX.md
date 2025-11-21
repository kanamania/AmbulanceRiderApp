# Hash Format Mismatch Fix

## Problem Identified

The backend returns hash keys with a different format than the frontend expected:

### Backend Response Format
```json
{
  "userHash": "BJL35/dekZGxju4QwlOZF5ZGtDsaa+dP0IhvEPhZwHE=",
  "profileHash": "BJL35/dekZGxju4QwlOZF5ZGtDsaa+dP0IhvEPhZwHE=",
  "tripTypesHash": "81ev7pam+TTMhU3o1jYOB9Ij5Tov9Sm25ScNDVgiw0I=",
  "locationsHash": "dMNG2F9/LJeTB/hKICgchkxXyodZXvs1WHXcskdEQ1E=",
  "tripsHash": "Gr8v9TRjuxoWISq3vSXG2E8h45bL15fCt6a+0vAcWPE="
}
```

### Frontend Expected Format
```json
{
  "trips": "hash_string",
  "locations": "hash_string",
  "tripTypes": "hash_string",
  "vehicles": "hash_string"
}
```

## Impact

This mismatch caused:
1. ❌ All hashes read as `undefined`
2. ❌ Hash comparison always returned "no changes"
3. ❌ Cache remained empty
4. ❌ Services fetched from API every time

## Solution

Added a transformation layer in `dataHash.service.ts`:

### New Interfaces
```typescript
// Backend format
export interface BackendHashResponse {
  userHash?: string;
  profileHash?: string;
  tripsHash?: string;
  locationsHash?: string;
  tripTypesHash?: string;
  vehiclesHash?: string;
}

// Frontend format (normalized)
export interface DataHashResponse {
  trips: string;
  locations: string;
  tripTypes: string;
  vehicles: string;
}
```

### Transformation Logic
```typescript
async fetchDataHashes(): Promise<DataHashResponse> {
  const backendResponse = await apiService.get<BackendHashResponse>(
    API_CONFIG.ENDPOINTS.AUTH.DATA_HASHES
  );
  
  // Transform backend format to frontend format
  const response: DataHashResponse = {
    trips: backendResponse.tripsHash || '',
    locations: backendResponse.locationsHash || '',
    tripTypes: backendResponse.tripTypesHash || '',
    vehicles: backendResponse.vehiclesHash || ''
  };
  
  return response;
}
```

## Expected Behavior After Fix

### First Login
```
[Hash Service] Server hashes received: {
  trips: "Gr8v9TRj...",
  locations: "dMNG2F9/...",
  tripTypes: "81ev7pam...",
  vehicles: "undefined..."  ← Note: Backend doesn't return vehiclesHash yet
}
[Hash Service] 3 entities changed, fetching in single call...
[Hash Service] Synced 8 locations (bulk)
[Hash Service] Synced 4 trip types (bulk)
[Hash Service] Data synchronization completed successfully
```

### Subsequent Login
```
[Hash Service] Server hashes received: {...}
[Hash Service] Comparing server hashes with stored hashes...
[Hash Service] trips unchanged
[Hash Service] locations unchanged
[Hash Service] tripTypes unchanged
[Hash Service] All data is up to date, no sync needed
```

### Service Calls
```
[TripType Service] getActiveTripTypes() called
[TripType Service] ✓ Active trip types filtered from cache: 4 / 4
[Location Service] getAllLocations() called
[Location Service] ✓ Locations loaded from cache: 8
```

## Backend Requirements

### 1. Hash Endpoint (Implemented ✅)
`GET /api/auth/data-hashes` is working but missing `vehiclesHash`:

```csharp
[HttpGet("auth/data-hashes")]
public async Task<IActionResult> GetDataHashes()
{
    return Ok(new
    {
        userHash = ...,
        profileHash = ...,
        tripsHash = ...,
        locationsHash = ...,
        tripTypesHash = ...,
        vehiclesHash = ...  // ← Add this
    });
}
```

### 2. Bulk Data Endpoint (NOT Implemented ❌)
`GET /api/system/data` is **not implemented** yet. Currently returns `{}`.

**Expected Response**:
```json
{
  "hashes": {
    "tripsHash": "...",
    "locationsHash": "...",
    "tripTypesHash": "...",
    "vehiclesHash": "..."
  },
  "data": {
    "trips": [...],
    "locations": [...],
    "tripTypes": [...],
    "vehicles": [...]
  }
}
```

**Current Behavior**:
- Frontend detects endpoint is not implemented
- Falls back to individual API calls
- Still works, just makes 4 calls instead of 1

See `BACKEND_BULK_DATA_ENDPOINT.md` for implementation guide.

## Testing

After this fix:
1. ✅ Hashes should be properly read from backend
2. ✅ Hash comparison should detect actual changes
3. ✅ Cache should be populated during sync
4. ✅ Services should load from cache
5. ✅ No redundant API calls to `/api/locations` or `/api/triptypes/active`

## Files Modified

- `src/services/dataHash.service.ts` - Added transformation layer
- `HASH_FORMAT_FIX.md` - This documentation
