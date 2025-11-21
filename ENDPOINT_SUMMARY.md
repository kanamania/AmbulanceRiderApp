# Data Sync Endpoints Summary

## Overview
The smart sync system uses two endpoints for efficient data synchronization:

---

## Endpoint 1: Hashes Only (Lightweight Check)

### GET /api/auth/data-hashes

**Purpose**: Quick check to determine what data has changed

**Authentication**: Required (Bearer token)

**Request**:
```bash
GET /api/auth/data-hashes
Authorization: Bearer {token}
```

**Response**:
```json
{
  "trips": "abc123hash",
  "locations": "def456hash",
  "tripTypes": "ghi789hash",
  "vehicles": "jkl012hash"
}
```

**Characteristics**:
- ⚡ **Fast**: Only calculates hashes
- 📦 **Small**: ~200 bytes
- 🔄 **Frequent**: Called on every login
- ✅ **Already Implemented**: This endpoint exists

---

## Endpoint 2: Full Data (Bulk Sync)

### GET /api/system/data

**Purpose**: Fetch full data for specific entities or all entities

**Authentication**: Required (Bearer token)

### Usage Patterns

#### Pattern 1: All Data (No Parameters)
**Request**:
```bash
GET /api/system/data
Authorization: Bearer {token}
```

**Behavior**: Returns all entity data by default

**Response**:
```json
{
  "hashes": {
    "trips": "abc123hash",
    "locations": "def456hash",
    "tripTypes": "ghi789hash",
    "vehicles": "jkl012hash"
  },
  "data": {
    "trips": [...],
    "locations": [...],
    "tripTypes": [...],
    "vehicles": [...]
  }
}
```

---

#### Pattern 2: Specific Entities (Granular)
**Request**:
```bash
GET /api/system/data?includeTrips=true&includeVehicles=true
Authorization: Bearer {token}
```

**Behavior**: Returns only requested entities

**Response**:
```json
{
  "hashes": {
    "trips": "abc123hash",
    "locations": "def456hash",
    "tripTypes": "ghi789hash",
    "vehicles": "jkl012hash"
  },
  "data": {
    "trips": [...],
    "vehicles": [...]
    // Only requested entities included
  }
}
```

**Query Parameters**:
- `includeTrips=true` - Include trip data
- `includeLocations=true` - Include location data
- `includeTripTypes=true` - Include trip type data
- `includeVehicles=true` - Include vehicle data

**Characteristics**:
- 🐌 **Slower**: Fetches data from database
- 📦 **Large**: Can be several MB
- 🔄 **Infrequent**: Only when 3+ entities changed
- ⏳ **Needs Implementation**: This endpoint needs to be created

---

## Frontend Usage

### When Hashes Endpoint is Called
```typescript
// On every login
const hashes = await dataHashService.fetchDataHashes();
// Calls: GET /api/auth/data-hashes
```

### When Full Data Endpoint is Called
```typescript
// When 3+ entities need syncing
const fullData = await dataHashService.fetchFullData(['trips', 'locations', 'tripTypes', 'vehicles']);
// Calls: GET /api/system/data?includeTrips=true&includeLocations=true&includeTripTypes=true&includeVehicles=true
```

---

## Decision Flow

```
Login
  ↓
Fetch hashes from /api/auth/data-hashes
  ↓
Compare with localStorage
  ↓
┌─────────────────────────────────────┐
│ How many entities changed?          │
├─────────────────────────────────────┤
│ 0 changes → Use cache (no API call) │
│ 1-2 changes → Individual endpoints  │
│ 3-4 changes → /api/system/data      │
└─────────────────────────────────────┘
```

---

## Backend Implementation Priority

### ✅ Already Done
- `/api/auth/data-hashes` - Returns hashes only

### ⏳ Needs Implementation
- `/api/system/data` - Returns full data with optional filters

**Implementation Guide**: See `BACKEND_BULK_DATA_ENDPOINT.md`

---

## API Call Reduction

### Scenario: First Login (All 4 Entities Changed)

**Before**:
```
1. GET /api/auth/data-hashes
2. GET /api/trips
3. GET /api/locations
4. GET /api/triptypes
5. GET /api/vehicles
Total: 5 API calls
```

**After**:
```
1. GET /api/auth/data-hashes
2. GET /api/system/data (returns all)
Total: 2 API calls (60% reduction) ✅
```

### Scenario: Subsequent Login (No Changes)

**Before**:
```
1. GET /api/auth/data-hashes
2. GET /api/trips
3. GET /api/locations
4. GET /api/triptypes
5. GET /api/vehicles
Total: 5 API calls
```

**After**:
```
1. GET /api/auth/data-hashes
Total: 1 API call (80% reduction) ✅
```

### Scenario: Partial Update (2 Entities Changed)

**Before**:
```
1. GET /api/auth/data-hashes
2. GET /api/trips
3. GET /api/locations
4. GET /api/triptypes
5. GET /api/vehicles
Total: 5 API calls
```

**After**:
```
1. GET /api/auth/data-hashes
2. GET /api/trips
3. GET /api/vehicles
Total: 3 API calls (40% reduction) ✅
```

---

## Testing Commands

### Test Hashes Endpoint
```bash
curl -X GET "http://localhost:5000/api/auth/data-hashes" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test Full Data (All)
```bash
curl -X GET "http://localhost:5000/api/system/data" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test Full Data (Specific)
```bash
curl -X GET "http://localhost:5000/api/system/data?includeTrips=true&includeVehicles=true" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Configuration

### Frontend Config
**File**: `src/config/api.config.ts`

```typescript
AUTH: {
  DATA_HASHES: '/auth/data-hashes',
},
SYSTEM: {
  DATA: '/system/data',
}
```

### Backend Routes
```csharp
// Already exists
[HttpGet("auth/data-hashes")]
public async Task<IActionResult> GetDataHashes() { ... }

// Needs implementation
[HttpGet("system/data")]
public async Task<IActionResult> GetSystemData(
    [FromQuery] bool includeTrips = false,
    [FromQuery] bool includeLocations = false,
    [FromQuery] bool includeTripTypes = false,
    [FromQuery] bool includeVehicles = false) { ... }
```

---

## Summary

| Endpoint | Purpose | Size | Speed | Status |
|----------|---------|------|-------|--------|
| `/api/auth/data-hashes` | Check changes | Small | Fast | ✅ Exists |
| `/api/system/data` | Bulk sync | Large | Slow | ⏳ Needs implementation |

**Next Step**: Implement `/api/system/data` endpoint on backend
