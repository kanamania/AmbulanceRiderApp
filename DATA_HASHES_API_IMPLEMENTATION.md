# Data Hashes API Implementation Guide

## Overview
The frontend expects a `/auth/data-hashes` endpoint that returns hash values for user data, profile, trip types, locations, and trips. These hashes are used for efficient data synchronization.

## Required Endpoint

### GET /api/auth/data-hashes
**Authentication:** Required (Bearer token)

**Response Format:**
```json
{
  "userHash": "abc123...",
  "profileHash": "def456...",
  "tripTypesHash": "ghi789...",
  "locationsHash": "jkl012...",
  "tripsHash": "mno345..."
}
```

## Implementation Steps

### 1. Create DTOs (Data Transfer Objects)

**File:** `AmbulanceRider.API/DTOs/DataHashResponseDto.cs`

```csharp
namespace AmbulanceRider.API.DTOs
{
    public class DataHashResponseDto
    {
        public string UserHash { get; set; } = string.Empty;
        public string ProfileHash { get; set; } = string.Empty;
        public string TripTypesHash { get; set; } = string.Empty;
        public string LocationsHash { get; set; } = string.Empty;
        public string TripsHash { get; set; } = string.Empty;
    }
}
```

### 2. Create Hash Service

**File:** `AmbulanceRider.API/Services/DataHashService.cs`

```csharp
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using AmbulanceRider.API.Data;
using Microsoft.EntityFrameworkCore;

namespace AmbulanceRider.API.Services
{
    public interface IDataHashService
    {
        Task<string> GenerateUserHashAsync(string userId);
        Task<string> GenerateProfileHashAsync(string userId);
        Task<string> GenerateTripTypesHashAsync();
        Task<string> GenerateLocationsHashAsync();
        Task<string> GenerateTripsHashAsync(string userId);
    }

    public class DataHashService : IDataHashService
    {
        private readonly ApplicationDbContext _context;

        public DataHashService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<string> GenerateUserHashAsync(string userId)
        {
            var user = await _context.Users
                .AsNoTracking()
                .Where(u => u.Id == userId)
                .Select(u => new
                {
                    u.Id,
                    u.FirstName,
                    u.LastName,
                    u.Email,
                    u.PhoneNumber,
                    u.ImagePath,
                    u.UpdatedAt
                })
                .FirstOrDefaultAsync();

            if (user == null)
                return string.Empty;

            var json = JsonSerializer.Serialize(user);
            return ComputeHash(json);
        }

        public async Task<string> GenerateProfileHashAsync(string userId)
        {
            // Same as user hash for now, can be extended with additional profile data
            return await GenerateUserHashAsync(userId);
        }

        public async Task<string> GenerateTripTypesHashAsync()
        {
            var tripTypes = await _context.TripTypes
                .AsNoTracking()
                .Include(t => t.Attributes)
                .Where(t => t.IsActive)
                .OrderBy(t => t.Id)
                .Select(t => new
                {
                    t.Id,
                    t.Name,
                    t.Description,
                    t.IsActive,
                    t.UpdatedAt,
                    Attributes = t.Attributes
                        .Where(a => a.IsActive)
                        .OrderBy(a => a.DisplayOrder)
                        .Select(a => new
                        {
                            a.Id,
                            a.Name,
                            a.Label,
                            a.DataType,
                            a.IsRequired,
                            a.DisplayOrder,
                            a.ValidationRules
                        })
                })
                .ToListAsync();

            var json = JsonSerializer.Serialize(tripTypes);
            return ComputeHash(json);
        }

        public async Task<string> GenerateLocationsHashAsync()
        {
            var locations = await _context.Locations
                .AsNoTracking()
                .Where(l => l.IsActive)
                .OrderBy(l => l.Id)
                .Select(l => new
                {
                    l.Id,
                    l.Name,
                    l.Address,
                    l.Latitude,
                    l.Longitude,
                    l.UpdatedAt
                })
                .ToListAsync();

            var json = JsonSerializer.Serialize(locations);
            return ComputeHash(json);
        }

        public async Task<string> GenerateTripsHashAsync(string userId)
        {
            var trips = await _context.Trips
                .AsNoTracking()
                .Where(t => t.CreatedBy == userId || t.DriverId == userId)
                .OrderByDescending(t => t.UpdatedAt ?? t.CreatedAt)
                .Select(t => new
                {
                    t.Id,
                    t.Name,
                    t.Status,
                    t.FromLatitude,
                    t.FromLongitude,
                    t.ToLatitude,
                    t.ToLongitude,
                    t.FromLocationName,
                    t.ToLocationName,
                    t.VehicleId,
                    t.DriverId,
                    t.EstimatedDistance,
                    t.EstimatedDuration,
                    t.CreatedAt,
                    t.UpdatedAt,
                    t.ApprovedAt,
                    t.ActualStartTime,
                    t.ActualEndTime
                })
                .ToListAsync();

            var json = JsonSerializer.Serialize(trips);
            return ComputeHash(json);
        }

        private static string ComputeHash(string input)
        {
            using var sha256 = SHA256.Create();
            var bytes = Encoding.UTF8.GetBytes(input);
            var hash = sha256.ComputeHash(bytes);
            return Convert.ToBase64String(hash);
        }
    }
}
```

### 3. Register Service in Program.cs

**File:** `AmbulanceRider.API/Program.cs`

Add this line in the service registration section:

```csharp
// Add Data Hash Service
builder.Services.AddScoped<IDataHashService, DataHashService>();
```

### 4. Create Controller Endpoint

**File:** `AmbulanceRider.API/Controllers/AuthController.cs`

Add this method to the existing AuthController:

```csharp
using AmbulanceRider.API.Services;
using AmbulanceRider.API.DTOs;

// ... existing using statements ...

[HttpGet("data-hashes")]
[Authorize]
public async Task<ActionResult<DataHashResponseDto>> GetDataHashes()
{
    try
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized(new { message = "User not authenticated" });
        }

        var userHash = await _dataHashService.GenerateUserHashAsync(userId);
        var profileHash = await _dataHashService.GenerateProfileHashAsync(userId);
        var tripTypesHash = await _dataHashService.GenerateTripTypesHashAsync();
        var locationsHash = await _dataHashService.GenerateLocationsHashAsync();
        var tripsHash = await _dataHashService.GenerateTripsHashAsync(userId);

        var response = new DataHashResponseDto
        {
            UserHash = userHash,
            ProfileHash = profileHash,
            TripTypesHash = tripTypesHash,
            LocationsHash = locationsHash,
            TripsHash = tripsHash
        };

        return Ok(response);
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error generating data hashes for user");
        return StatusCode(500, new { message = "An error occurred while generating data hashes" });
    }
}
```

**Don't forget to inject the service in the controller constructor:**

```csharp
private readonly IDataHashService _dataHashService;

public AuthController(
    // ... existing parameters ...
    IDataHashService dataHashService)
{
    // ... existing assignments ...
    _dataHashService = dataHashService;
}
```

### 5. Add SignalR Hub Method (Optional but Recommended)

**File:** `AmbulanceRider.API/Hubs/NotificationHub.cs`

Add method to broadcast hash changes:

```csharp
public async Task BroadcastDataHashChange(string userId, DataHashResponseDto hashes)
{
    await Clients.User(userId).SendAsync("DataHashChanged", hashes);
}
```

### 6. Trigger Hash Updates

Add this helper method to trigger hash updates when data changes:

**File:** `AmbulanceRider.API/Services/DataHashNotificationService.cs`

```csharp
using AmbulanceRider.API.DTOs;
using AmbulanceRider.API.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace AmbulanceRider.API.Services
{
    public interface IDataHashNotificationService
    {
        Task NotifyUserDataChanged(string userId);
        Task NotifyTripTypesChanged();
        Task NotifyLocationsChanged();
        Task NotifyTripsChanged(string userId);
    }

    public class DataHashNotificationService : IDataHashNotificationService
    {
        private readonly IDataHashService _hashService;
        private readonly IHubContext<NotificationHub> _hubContext;

        public DataHashNotificationService(
            IDataHashService hashService,
            IHubContext<NotificationHub> hubContext)
        {
            _hashService = hashService;
            _hubContext = hubContext;
        }

        public async Task NotifyUserDataChanged(string userId)
        {
            var hashes = new DataHashResponseDto
            {
                UserHash = await _hashService.GenerateUserHashAsync(userId),
                ProfileHash = await _hashService.GenerateProfileHashAsync(userId),
                TripTypesHash = await _hashService.GenerateTripTypesHashAsync(),
                LocationsHash = await _hashService.GenerateLocationsHashAsync(),
                TripsHash = await _hashService.GenerateTripsHashAsync(userId)
            };

            await _hubContext.Clients.User(userId).SendAsync("DataHashChanged", hashes);
        }

        public async Task NotifyTripTypesChanged()
        {
            var tripTypesHash = await _hashService.GenerateTripTypesHashAsync();
            await _hubContext.Clients.All.SendAsync("TripTypesHashChanged", tripTypesHash);
        }

        public async Task NotifyLocationsChanged()
        {
            var locationsHash = await _hashService.GenerateLocationsHashAsync();
            await _hubContext.Clients.All.SendAsync("LocationsHashChanged", locationsHash);
        }

        public async Task NotifyTripsChanged(string userId)
        {
            var tripsHash = await _hashService.GenerateTripsHashAsync(userId);
            await _hubContext.Clients.User(userId).SendAsync("TripsHashChanged", tripsHash);
        }
    }
}
```

Register in Program.cs:
```csharp
builder.Services.AddScoped<IDataHashNotificationService, DataHashNotificationService>();
```

## Testing

### Using Swagger
1. Navigate to `https://your-api/swagger`
2. Authorize with a valid token
3. Execute `GET /api/auth/data-hashes`
4. Verify response contains all hash fields

### Using cURL
```bash
curl -X GET "https://your-api/api/auth/data-hashes" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Expected Response
```json
{
  "userHash": "xYz123AbC456...",
  "profileHash": "xYz123AbC456...",
  "tripTypesHash": "dEf789GhI012...",
  "locationsHash": "jKl345MnO678...",
  "tripsHash": "pQr901StU234..."
}
```

## How It Works

1. **Hash Generation**: Each hash is computed using SHA256 of the serialized JSON data
2. **User/Profile Hash**: Based on user's personal information and last update time
3. **Trip Types Hash**: Based on all active trip types and their attributes
4. **Locations Hash**: Based on all active locations
5. **Trips Hash**: Based on user's trips (created by or assigned as driver)

5. **Frontend Usage**:
   - Frontend calls this endpoint periodically
   - Compares returned hashes with locally stored hashes
   - If hashes differ, fetches fresh data
   - Reduces unnecessary API calls and bandwidth

## Benefits

✅ **Efficient Sync**: Only fetch data when it actually changed  
✅ **Reduced Bandwidth**: No need to transfer full data for comparison  
✅ **Real-time Updates**: SignalR broadcasts hash changes immediately  
✅ **Offline Support**: Works with local storage and background sync  
✅ **Scalable**: Hashes are lightweight compared to full data

## Next Steps

1. Implement the code in the backend API
2. Test the endpoint with Swagger
3. Verify frontend sync service works correctly
4. Monitor hash changes in browser console
5. Test offline/online scenarios

---

**Implementation Status:** Ready for backend integration  
**Frontend Status:** ✅ Already implemented and waiting for API  
**Priority:** High (required for efficient data synchronization)
