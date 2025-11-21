# Backend: Data Endpoints Specification

## Overview
Two endpoints work together for efficient data synchronization:
1. **`/api/auth/data-hashes`** - Returns only hashes (fast, lightweight)
2. **`/api/system/data`** - Returns full data with hashes (with optional entity filters)

---

## Endpoint 1: Data Hashes Only

### GET /api/auth/data-hashes

**Description**: Get current data hashes for all entities (lightweight check)

**Authentication**: Required (Bearer token)

**Response**:
```json
{
  "trips": "base64_hash_string",
  "locations": "base64_hash_string",
  "tripTypes": "base64_hash_string",
  "vehicles": "base64_hash_string"
}
```

**Use Case**: Quick sync check to determine what changed

---

## Endpoint 2: Full Data with Hashes

### GET /api/system/data

**Description**: Get data hashes and optionally full data for specific entities

**Authentication**: Required (Bearer token)

**Query Parameters**:
- `includeTrips` (optional, boolean): If `true`, includes full trip data
- `includeLocations` (optional, boolean): If `true`, includes full location data
- `includeTripTypes` (optional, boolean): If `true`, includes full trip type data
- `includeVehicles` (optional, boolean): If `true`, includes full vehicle data
- **Note**: If no query parameters are provided, all entity data will be included by default

---

## Response Formats

### Hashes Only (No Query Parameters with Backend Logic)
**Request**: `GET /api/system/data`

**Response** (if backend detects no include params, returns hashes only):
```json
{
  "trips": "base64_hash_string",
  "locations": "base64_hash_string",
  "tripTypes": "base64_hash_string",
  "vehicles": "base64_hash_string"
}
```

**OR** (if backend defaults to include all data when no params):
```json
{
  "hashes": {
    "trips": "base64_hash_string",
    "locations": "base64_hash_string",
    "tripTypes": "base64_hash_string",
    "vehicles": "base64_hash_string"
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

### Specific Entities (Granular Control)
**Request**: `GET /api/system/data?includeTrips=true&includeVehicles=true`

**Response** (only includes requested entities in data):
```json
{
  "hashes": {
    "trips": "base64_hash_string",
    "locations": "base64_hash_string",
    "tripTypes": "base64_hash_string",
    "vehicles": "base64_hash_string"
  },
  "data": {
    "trips": [
      {
        "id": 1,
        "name": "Emergency Transport",
        "status": "Pending"
        // ... all trip fields
      }
    ],
    "vehicles": [
      {
        "id": 1,
        "name": "Ambulance 001",
        "plateNumber": "KAA 123A",
        "vehicleTypeId": 1
        // ... all vehicle fields
      }
    ]
    // Note: locations and tripTypes not included since not requested
  }
}
```

---

### All Entities (No Parameters - Default Behavior)
**Request**: `GET /api/system/data` (no query params)

**Response** (backend returns all data by default):
```json
{
  "hashes": {
    "trips": "base64_hash_string",
    "locations": "base64_hash_string",
    "tripTypes": "base64_hash_string",
    "vehicles": "base64_hash_string"
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

## C# Implementation Example

```csharp
[HttpGet("system/data")]
public async Task<IActionResult> GetSystemData(
    [FromQuery] bool includeTrips = false,
    [FromQuery] bool includeLocations = false,
    [FromQuery] bool includeTripTypes = false,
    [FromQuery] bool includeVehicles = false)
{
    try
    {
        // Get current user ID from token
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }

        // Calculate hashes for all entities (always return hashes)
        var tripHash = await _hashService.CalculateTripsHash(userId);
        var locationHash = await _hashService.CalculateLocationsHash();
        var tripTypeHash = await _hashService.CalculateTripTypesHash();
        var vehicleHash = await _hashService.CalculateVehiclesHash();

        var hashes = new
        {
            trips = tripHash,
            locations = locationHash,
            tripTypes = tripTypeHash,
            vehicles = vehicleHash
        };

        // Check if any include parameter is true
        bool anyIncludeParam = includeTrips || includeLocations || includeTripTypes || includeVehicles;
        
        // If no include params provided, return all data by default
        if (!anyIncludeParam)
        {
            // Default behavior: include all data
            var allTrips = await _tripService.GetUserTripsAsync(userId);
            var allLocations = await _locationService.GetAllLocationsAsync();
            var allTripTypes = await _tripTypeService.GetAllTripTypesAsync();
            var allVehicles = await _vehicleService.GetAllVehiclesAsync();

            return Ok(new
            {
                hashes = hashes,
                data = new
                {
                    trips = allTrips,
                    locations = allLocations,
                    tripTypes = allTripTypes,
                    vehicles = allVehicles
                }
            });
        }

        // Fetch only requested entities
        var data = new Dictionary<string, object>();
        
        if (includeTrips)
        {
            var trips = await _tripService.GetUserTripsAsync(userId);
            data["trips"] = trips;
        }
        
        if (includeLocations)
        {
            var locations = await _locationService.GetAllLocationsAsync();
            data["locations"] = locations;
        }
        
        if (includeTripTypes)
        {
            var tripTypes = await _tripTypeService.GetAllTripTypesAsync();
            data["tripTypes"] = tripTypes;
        }
        
        if (includeVehicles)
        {
            var vehicles = await _vehicleService.GetAllVehiclesAsync();
            data["vehicles"] = vehicles;
        }

        // Return hashes and requested data
        return Ok(new
        {
            hashes = hashes,
            data = data
        });
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error fetching system data");
        return StatusCode(500, new { message = "Error fetching system data" });
    }
}
```

---

## Hash Calculation Service Example

```csharp
public interface IHashService
{
    Task<string> CalculateTripsHash(string userId);
    Task<string> CalculateLocationsHash();
    Task<string> CalculateTripTypesHash();
    Task<string> CalculateVehiclesHash();
}

public class HashService : IHashService
{
    private readonly ApplicationDbContext _context;

    public HashService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<string> CalculateTripsHash(string userId)
    {
        var trips = await _context.Trips
            .Where(t => t.DriverId == userId || t.CreatedById == userId)
            .OrderBy(t => t.Id)
            .Select(t => new { t.Id, t.UpdatedAt })
            .ToListAsync();

        return CalculateHash(trips);
    }

    public async Task<string> CalculateLocationsHash()
    {
        var locations = await _context.Locations
            .OrderBy(l => l.Id)
            .Select(l => new { l.Id, l.UpdatedAt })
            .ToListAsync();

        return CalculateHash(locations);
    }

    public async Task<string> CalculateTripTypesHash()
    {
        var tripTypes = await _context.TripTypes
            .Include(tt => tt.Attributes)
            .OrderBy(tt => tt.Id)
            .Select(tt => new { tt.Id, tt.UpdatedAt })
            .ToListAsync();

        return CalculateHash(tripTypes);
    }

    public async Task<string> CalculateVehiclesHash()
    {
        var vehicles = await _context.Vehicles
            .OrderBy(v => v.Id)
            .Select(v => new { v.Id, v.UpdatedAt })
            .ToListAsync();

        return CalculateHash(vehicles);
    }

    private string CalculateHash(object data)
    {
        var json = JsonSerializer.Serialize(data);
        using var sha256 = SHA256.Create();
        var hashBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(json));
        return Convert.ToBase64String(hashBytes);
    }
}
```

---

## Performance Considerations

### No Query Parameters (Default: All Data)
- **Slower**: Fetches all data from database
- **Large payload**: Can be several MB depending on data
- **Use case**: First-time sync or when all entities changed
- **Optimization**: Consider pagination or limiting data size

### Specific Entities (Granular)
- **Moderate**: Only fetches requested entities
- **Medium payload**: Depends on which entities requested
- **Use case**: When 1-3 specific entities need syncing
- **Benefit**: Reduces payload size and database queries

### Recommended Optimizations
1. **Caching**: Cache the full data response for 30-60 seconds
2. **Compression**: Enable gzip compression for large responses
3. **Pagination**: Consider adding pagination for large datasets
4. **Field Selection**: Allow clients to specify which fields to include
5. **Rate Limiting**: Limit bulk data calls to prevent abuse

---

## Status Codes

- `200 OK` - Success
- `400 Bad Request` - Invalid query parameters
- `401 Unauthorized` - Not authenticated
- `500 Internal Server Error` - Server error

---

## Security Considerations

1. **Authentication**: Always require valid JWT token
2. **Authorization**: Only return data user has access to
3. **Rate Limiting**: Limit bulk data requests (e.g., 10 per minute)
4. **Data Filtering**: Filter trips by user permissions
5. **Audit Logging**: Log bulk data requests for monitoring

---

## Testing

### Test Case 1: Hashes Only
```bash
curl -X GET "http://localhost:5000/api/system/data" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test Case 2: Full Data
```bash
curl -X GET "http://localhost:5000/api/system/data?includeData=true" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test Case 3: Invalid Parameter
```bash
curl -X GET "http://localhost:5000/api/system/data?includeData=invalid" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Frontend Integration

The frontend automatically uses this endpoint when 3+ entities need syncing:

```typescript
// In dataHashService.performSync()
if (changedEntities.length >= 3) {
  // Bulk sync - single API call
  const fullData = await this.fetchFullData(); // Calls ?includeData=true
  // Process all data at once
} else {
  // Individual sync - targeted API calls
  for (const entity of changedEntities) {
    await this.syncEntity(entity);
  }
}
```

---

## Migration Path

1. **Phase 1**: Deploy backend with `includeData` support
2. **Phase 2**: Test endpoint with both parameters
3. **Phase 3**: Deploy frontend with smart sync logic
4. **Phase 4**: Monitor performance and adjust thresholds

---

## Monitoring

Track these metrics:
- Number of hash-only requests vs full data requests
- Response times for both request types
- Payload sizes
- Cache hit rates
- Error rates

---

## Future Enhancements

1. **Delta Sync**: Return only changed records since last sync
2. **Compression**: Use binary formats for large datasets
3. **Streaming**: Stream large responses
4. **Selective Fields**: Allow clients to request specific fields
5. **Batch Updates**: Support batch update operations
