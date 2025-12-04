# API Specifications

**Last Updated:** 2025-12-04T09:30:00+03:00  
**Version:** 0.0.22  
**Backend Version:** 0.0.19  
**Base URL:** `http://localhost:5000/api` (Development)  
**Production URL:** `https://app.globalexpress.co.tz/api`

---

## Overview

This document defines the API integration between the Global Express mobile app (this project) and the backend API (AmbulanceRider). For complete backend API documentation, see `../AmbulanceRider/api-specifications.md`.

---

## Authentication

### Token Format
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Token Expiration
- **Access Token:** 24 hours
- **Refresh Token:** 7 days

### Flow
1. Login with credentials → Receive access + refresh tokens
2. Include access token in all requests
3. When access token expires, use refresh token to get new tokens
4. On refresh token expiry, redirect to login

---

## Endpoints Used by App

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /auth/login | User login |
| POST | /auth/register | User registration |
| POST | /auth/refresh | Refresh tokens |
| POST | /auth/logout | Logout user |
| POST | /auth/forgot-password | Request password reset |
| POST | /auth/reset-password | Reset password |
| GET | /auth/me | Get current user |
| PUT | /auth/profile | Update profile |
| POST | /auth/change-password | Change password |
| POST | /auth/profile/image | Upload profile image |
| DELETE | /auth/profile/image | Remove profile image |

### Trips

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /trips | Get all trips |
| GET | /trips/{id} | Get trip by ID |
| GET | /trips/status/{status} | Get trips by status |
| GET | /trips/pending | Get pending trips |
| GET | /trips/driver/{driverId} | Get driver's trips |
| POST | /trips | Create trip |
| PUT | /trips/{id} | Update trip |
| DELETE | /trips/{id} | Delete trip |
| PUT | /trips/{id}/status | Update trip status |
| POST | /trips/{id}/approve | Approve trip |
| POST | /trips/{id}/reject | Reject trip |
| POST | /trips/{id}/start | Start trip |
| POST | /trips/{id}/complete | Complete trip |
| POST | /trips/{id}/cancel | Cancel trip |
| GET | /trips/{id}/status-logs | Get status history |

### Trip Types

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /triptypes | Get all trip types |
| GET | /triptypes/{id} | Get trip type by ID |
| POST | /triptypes | Create trip type |
| PUT | /triptypes/{id} | Update trip type |
| DELETE | /triptypes/{id} | Delete trip type |

### Vehicles

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /vehicles | Get all vehicles |
| GET | /vehicles/{id} | Get vehicle by ID |
| POST | /vehicles | Create vehicle |
| PUT | /vehicles/{id} | Update vehicle |
| DELETE | /vehicles/{id} | Delete vehicle |
| GET | /vehicles/types | Get vehicle types |

### Locations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /locations | Get all locations |
| GET | /locations/{id} | Get location by ID |
| POST | /locations | Create location |
| PUT | /locations/{id} | Update location |
| DELETE | /locations/{id} | Delete location |

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /users | Get all users |
| GET | /users/{id} | Get user by ID |
| POST | /users | Create user |
| PUT | /users/{id} | Update user |
| DELETE | /users/{id} | Delete user |
| GET | /users/drivers | Get all drivers |

### Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /dashboard/stats | Get dashboard stats |
| GET | /dashboard/company/{id}/stats | Get company stats |

### System

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /system/data | Bulk fetch with hash sync |
| GET | /health | Health check |

---

## Data Models

### User
```typescript
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  name: string;
  phoneNumber?: string;
  imagePath?: string;
  imageUrl?: string;
  roles: string[];
  companyId?: string;
  createdAt: string;
  updatedAt?: string;
}
```

### Trip
```typescript
interface Trip {
  id: number;
  name: string;
  description?: string;
  status: TripStatus;
  fromLatitude: number;
  fromLongitude: number;
  toLatitude: number;
  toLongitude: number;
  fromLocationName?: string;
  toLocationName?: string;
  vehicleId?: number;
  vehicle?: Vehicle;
  driverId?: string;
  driver?: User;
  tripTypeId?: number;
  tripType?: TripType;
  scheduledStartTime: string;
  actualStartTime?: string;
  actualEndTime?: string;
  rejectionReason?: string;
  approvedBy?: string;
  approver?: User;
  approvedAt?: string;
  createdBy: string;
  creator?: User;
  createdAt: string;
}

enum TripStatus {
  Pending = 0,
  Approved = 1,
  Rejected = 2,
  InProgress = 3,
  Completed = 4,
  Cancelled = 5
}
```

### Vehicle
```typescript
interface Vehicle {
  id: number;
  name: string;
  plateNumber: string;
  vehicleTypeId: number;
  image?: string;
  imageUrl?: string;
  assignedDrivers?: User[];
  createdAt: string;
}
```

### TripType
```typescript
interface TripType {
  id: number;
  name: string;
  description?: string;
  imagePath?: string;
  imageUrl?: string;
  attributes?: TripTypeAttribute[];
  isActive: boolean;
}
```

### Location
```typescript
interface Location {
  id: number;
  name: string;
  imagePath?: string;
  imageUrl?: string;
  createdAt: string;
}
```

---

## Response Formats

### Success Response
```json
{
  "data": { ... },
  "message": "Success",
  "timestamp": "2025-12-04T09:30:00Z"
}
```

### Error Response
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [...]
  },
  "timestamp": "2025-12-04T09:30:00Z"
}
```

### Pagination
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 100,
    "totalPages": 5
  }
}
```

---

## Status Codes

| Code | Description |
|------|-------------|
| 200 | OK - Success |
| 201 | Created - Resource created |
| 204 | No Content - Success, no body |
| 400 | Bad Request - Invalid data |
| 401 | Unauthorized - Auth required |
| 403 | Forbidden - No permission |
| 404 | Not Found - Resource missing |
| 422 | Unprocessable - Validation error |
| 500 | Server Error - Backend issue |

---

## Hash-Based Data Sync

The app uses hash-based synchronization to minimize data transfer.

### Endpoint
```
GET /api/system/data?includeTrips=true&includeLocations=true...
```

### Query Parameters
| Parameter | Description |
|-----------|-------------|
| includeTrips | Include trips data |
| includeLocations | Include locations data |
| includeVehicles | Include vehicles data |
| includeTripTypes | Include trip types data |

### Response
```json
{
  "trips": {
    "hash": "abc123...",
    "data": [...],
    "count": 50
  },
  "locations": {
    "hash": "def456...",
    "data": [...],
    "count": 10
  }
}
```

### Sync Logic
1. Store entity hashes locally
2. Request only entities where local hash differs from server
3. Update local cache and hash on change

---

## SignalR Hubs

### Notification Hub
**URL:** `/hubs/notifications`

| Event | Description |
|-------|-------------|
| ReceiveNotification | General notification |
| TripStatusChanged | Trip status update |
| NewTripCreated | New trip created |

### Usage
```typescript
const connection = new signalR.HubConnectionBuilder()
  .withUrl(`${API_URL}/hubs/notifications`, {
    accessTokenFactory: () => getAccessToken()
  })
  .build();

connection.on('TripStatusChanged', (tripId, newStatus) => {
  // Handle trip status change
});
```

---

## File Uploads

### Image Upload
- **Content-Type:** multipart/form-data
- **Max Size:** 5MB
- **Formats:** JPG, JPEG, PNG, GIF

### Example
```typescript
const formData = new FormData();
formData.append('image', file);

await apiService.post('/auth/profile/image', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
```

---

## Error Handling

### Network Errors
```typescript
try {
  const response = await apiService.get('/trips');
} catch (error) {
  if (error.code === 'NETWORK_ERROR') {
    // Handle offline state
  } else if (error.response?.status === 401) {
    // Handle auth expiry
  }
}
```

### Token Refresh
The API service automatically handles token refresh on 401 responses.

---

## CORS

### Development
All origins allowed.

### Production
Configured origins:
- https://app.globalexpress.co.tz
- Mobile app origins

---

## Telemetry

Optional telemetry can be included with requests:

```json
{
  "telemetry": {
    "deviceType": "Mobile",
    "operatingSystem": "Android",
    "browser": "Chrome",
    "appVersion": "1.0.0",
    "latitude": -6.7924,
    "longitude": 39.2083,
    "accuracy": 10.5,
    "batteryLevel": 0.85,
    "isOnline": true,
    "timestamp": "2025-12-04T09:30:00Z"
  }
}
```

Supported on: login, register, trip create/update/status actions.
