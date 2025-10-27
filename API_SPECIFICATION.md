# AmbulanceRider API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
Most endpoints require authentication using a Bearer token. Include the token in the Authorization header:
```
Authorization: Bearer {token}
```

---

## **Authentication Endpoints**

### **POST** `/api/auth/login`
Login with email and password. Supports telemetry collection.

**Authorization:** None  
**Content-Type:** `application/json`

**Request Body:**
```json
{
  "email": "string",
  "password": "string",
  "telemetry": {
    "deviceType": "Mobile",
    "operatingSystem": "Android",
    "browser": "Chrome",
    "appVersion": "1.0.0",
    "accountType": "Google",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "accuracy": 10.5,
    "screenWidth": 1920,
    "screenHeight": 1080,
    "isOnline": true,
    "batteryLevel": 0.85,
    "timestamp": "2025-10-27T15:00:00Z"
  }
}
```

**Note:** The `telemetry` field is optional. All telemetry sub-fields are also optional.

**Response:** `200 OK`
```json
{
  "token": "string",
  "user": {
    "id": 1,
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "phoneNumber": "string",
    "imagePath": "string?",
    "imageUrl": "string?",
    "roles": ["Admin", "Dispatcher"],
    "createdAt": "2025-10-27T15:00:00Z"
  }
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid credentials

---

### **POST** `/api/auth/register`
Register a new user. Supports telemetry collection.

**Authorization:** None  
**Content-Type:** `application/json`

**Request Body:**
```json
{
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "password": "string",
  "phone": "string?",
  "telemetry": { /* Same as login */ }
}
```

**Response:** `201 Created`

---

### **POST** `/api/auth/forgot-password`
Request password reset. Supports telemetry collection.

**Authorization:** None  
**Content-Type:** `application/json`

**Request Body:**
```json
{
  "email": "string",
  "telemetry": { /* Optional */ }
}
```

**Response:** `200 OK`

---

### **POST** `/api/auth/reset-password`
Reset password with token. Supports telemetry collection.

**Authorization:** None  
**Content-Type:** `application/json`

**Request Body:**
```json
{
  "email": "string",
  "token": "string",
  "newPassword": "string",
  "confirmPassword": "string",
  "telemetry": { /* Optional */ }
}
```

**Response:** `200 OK`

---

## **User Endpoints**

### **GET** `/api/users`
Get all users.

**Authorization:** Admin, Dispatcher  
**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "phoneNumber": "string",
    "imagePath": "string?",
    "imageUrl": "string?",
    "roles": ["Admin"],
    "createdAt": "2025-10-27T15:00:00Z"
  }
]
```

---

### **GET** `/api/users/{id}`
Get user by ID.

**Authorization:** Authenticated  
**Path Parameters:**
- `id` (integer) - User ID

**Response:** `200 OK`
```json
{
  "id": 1,
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "phoneNumber": "string",
  "imagePath": "string?",
  "imageUrl": "string?",
  "roles": ["Admin"],
  "createdAt": "2025-10-27T15:00:00Z"
}
```

**Error Responses:**
- `404 Not Found` - User not found

---

### **POST** `/api/users`
Create a new user.

**Authorization:** Admin  
**Content-Type:** `multipart/form-data`

**Request Body:**
```
firstName: string (required)
lastName: string (required)
email: string (required)
phoneNumber: string (required)
password: string (required)
image: file (optional, jpg/jpeg/png/gif, max 5MB)
roleIds: int[] (required)
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "phoneNumber": "string",
  "imagePath": "uploads/users/guid.jpg",
  "imageUrl": "http://localhost:5000/uploads/users/guid.jpg",
  "roles": ["Admin"],
  "createdAt": "2025-10-27T15:00:00Z"
}
```

**Error Responses:**
- `400 Bad Request` - Invalid data or email already exists

---

### **PUT** `/api/users/{id}`
Update an existing user.

**Authorization:** Admin  
**Content-Type:** `multipart/form-data`  
**Path Parameters:**
- `id` (integer) - User ID

**Request Body:**
```
firstName: string (optional)
lastName: string (optional)
email: string (optional)
phoneNumber: string (optional)
password: string (optional)
image: file (optional, jpg/jpeg/png/gif, max 5MB)
removeImage: bool (optional, default: false)
roleIds: int[] (optional)
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "phoneNumber": "string",
  "imagePath": "uploads/users/guid.jpg",
  "imageUrl": "http://localhost:5000/uploads/users/guid.jpg",
  "roles": ["Admin"],
  "createdAt": "2025-10-27T15:00:00Z"
}
```

**Error Responses:**
- `404 Not Found` - User not found
- `400 Bad Request` - Invalid data

---

### **DELETE** `/api/users/{id}`
Delete a user (soft delete).

**Authorization:** Admin  
**Path Parameters:**
- `id` (integer) - User ID

**Response:** `204 No Content`

**Error Responses:**
- `404 Not Found` - User not found

---

## **Location Endpoints**

### **GET** `/api/locations`
Get all locations.

**Authorization:** Authenticated  
**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "name": "string",
    "imagePath": "string?",
    "imageUrl": "string?",
    "createdAt": "2025-10-27T15:00:00Z"
  }
]
```

---

### **GET** `/api/locations/{id}`
Get location by ID.

**Authorization:** Authenticated  
**Path Parameters:**
- `id` (integer) - Location ID

**Response:** `200 OK`
```json
{
  "id": 1,
  "name": "string",
  "imagePath": "uploads/locations/guid.jpg",
  "imageUrl": "http://localhost:5000/uploads/locations/guid.jpg",
  "createdAt": "2025-10-27T15:00:00Z"
}
```

**Error Responses:**
- `404 Not Found` - Location not found

---

### **POST** `/api/locations`
Create a new location.

**Authorization:** Admin, Dispatcher  
**Content-Type:** `multipart/form-data`

**Request Body:**
```
name: string (required)
image: file (optional, jpg/jpeg/png/gif, max 5MB)
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "name": "string",
  "imagePath": "uploads/locations/guid.jpg",
  "imageUrl": "http://localhost:5000/uploads/locations/guid.jpg",
  "createdAt": "2025-10-27T15:00:00Z"
}
```

**Error Responses:**
- `400 Bad Request` - Invalid data

---

### **PUT** `/api/locations/{id}`
Update an existing location.

**Authorization:** Admin, Dispatcher  
**Content-Type:** `multipart/form-data`  
**Path Parameters:**
- `id` (integer) - Location ID

**Request Body:**
```
name: string (optional)
image: file (optional, jpg/jpeg/png/gif, max 5MB)
removeImage: bool (optional, default: false)
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "name": "string",
  "imagePath": "uploads/locations/guid.jpg",
  "imageUrl": "http://localhost:5000/uploads/locations/guid.jpg",
  "createdAt": "2025-10-27T15:00:00Z"
}
```

**Error Responses:**
- `404 Not Found` - Location not found
- `400 Bad Request` - Invalid data

---

### **DELETE** `/api/locations/{id}`
Delete a location.

**Authorization:** Admin  
**Path Parameters:**
- `id` (integer) - Location ID

**Response:** `204 No Content`

**Error Responses:**
- `404 Not Found` - Location not found

---

## **Route Endpoints**

### **GET** `/api/routes`
Get all routes.

**Authorization:** Authenticated  
**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "name": "string",
    "distance": 10.5,
    "estimatedDuration": 30,
    "description": "string?",
    "createdAt": "2025-10-27T15:00:00Z",
    "fromLocation": {
      "id": 1,
      "name": "Location A"
    },
    "toLocation": {
      "id": 2,
      "name": "Location B"
    },
    "fromLocationId": 1,
    "toLocationId": 2
  }
]
```

---

### **GET** `/api/routes/{id}`
Get route by ID.

**Authorization:** Authenticated  
**Path Parameters:**
- `id` (integer) - Route ID

**Response:** `200 OK`
```json
{
  "id": 1,
  "name": "string",
  "distance": 10.5,
  "estimatedDuration": 30,
  "description": "string?",
  "createdAt": "2025-10-27T15:00:00Z",
  "fromLocation": {
    "id": 1,
    "name": "Location A"
  },
  "toLocation": {
    "id": 2,
    "name": "Location B"
  },
  "fromLocationId": 1,
  "toLocationId": 2
}
```

**Error Responses:**
- `404 Not Found` - Route not found

---

### **POST** `/api/routes`
Create a new route.

**Authorization:** Admin, Dispatcher  
**Content-Type:** `application/json`

**Request Body:**
```json
{
  "name": "string",
  "fromLocation": null,
  "toLocation": null,
  "fromLocationId": 1,
  "toLocationId": 2,
  "distance": 10.5,
  "estimatedDuration": 30,
  "description": "string (optional)"
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "name": "string",
  "distance": 10.5,
  "estimatedDuration": 30,
  "description": "string?",
  "createdAt": "2025-10-27T15:00:00Z",
  "fromLocation": {
    "id": 1,
    "name": "Location A"
  },
  "toLocation": {
    "id": 2,
    "name": "Location B"
  },
  "fromLocationId": 1,
  "toLocationId": 2
}
```

---

### **PUT** `/api/routes/{id}`
Update an existing route.

**Authorization:** Admin, Dispatcher  
**Content-Type:** `application/json`  
**Path Parameters:**
- `id` (integer) - Route ID

**Request Body:**
```json
{
  "name": "string (optional)",
  "fromLocation": null,
  "toLocation": null,
  "fromLocationId": 1,
  "toLocationId": 2,
  "distance": 10.5,
  "estimatedDuration": 30,
  "description": "string (optional)"
}
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "name": "string",
  "distance": 10.5,
  "estimatedDuration": 30,
  "description": "string?",
  "createdAt": "2025-10-27T15:00:00Z",
  "fromLocation": {
    "id": 1,
    "name": "Location A"
  },
  "toLocation": {
    "id": 2,
    "name": "Location B"
  },
  "fromLocationId": 1,
  "toLocationId": 2
}
```

**Error Responses:**
- `404 Not Found` - Route not found

---

### **DELETE** `/api/routes/{id}`
Delete a route (soft delete).

**Authorization:** Admin  
**Path Parameters:**
- `id` (integer) - Route ID

**Response:** `204 No Content`

**Error Responses:**
- `404 Not Found` - Route not found

---

## **Vehicle Endpoints**

### **GET** `/api/vehicles`
Get all vehicles.

**Authorization:** Authenticated  
**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "name": "string",
    "imagePath": "string?",
    "imageUrl": "string?",
    "types": ["Ambulance", "Emergency"],
    "createdAt": "2025-10-27T15:00:00Z"
  }
]
```

---

### **GET** `/api/vehicles/types`
Get all vehicle types.

**Authorization:** Authenticated  
**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "name": "Ambulance"
  },
  {
    "id": 2,
    "name": "Emergency"
  }
]
```

---

### **GET** `/api/vehicles/{id}`
Get vehicle by ID.

**Authorization:** Authenticated  
**Path Parameters:**
- `id` (integer) - Vehicle ID

**Response:** `200 OK`
```json
{
  "id": 1,
  "name": "string",
  "imagePath": "uploads/vehicles/guid.jpg",
  "imageUrl": "http://localhost:5000/uploads/vehicles/guid.jpg",
  "types": ["Ambulance", "Emergency"],
  "createdAt": "2025-10-27T15:00:00Z"
}
```

**Error Responses:**
- `404 Not Found` - Vehicle not found

---

### **POST** `/api/vehicles`
Create a new vehicle.

**Authorization:** Admin, Dispatcher  
**Content-Type:** `multipart/form-data`

**Request Body:**
```
name: string (required)
image: file (optional, jpg/jpeg/png/gif, max 5MB)
types: string[] (required)
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "name": "string",
  "imagePath": "uploads/vehicles/guid.jpg",
  "imageUrl": "http://localhost:5000/uploads/vehicles/guid.jpg",
  "types": ["Ambulance", "Emergency"],
  "createdAt": "2025-10-27T15:00:00Z"
}
```

**Error Responses:**
- `400 Bad Request` - Invalid data

---

### **PUT** `/api/vehicles/{id}`
Update an existing vehicle.

**Authorization:** Admin, Dispatcher  
**Content-Type:** `multipart/form-data`  
**Path Parameters:**
- `id` (integer) - Vehicle ID

**Request Body:**
```
name: string (optional)
image: file (optional, jpg/jpeg/png/gif, max 5MB)
removeImage: bool (optional, default: false)
types: string[] (optional)
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "name": "string",
  "imagePath": "uploads/vehicles/guid.jpg",
  "imageUrl": "http://localhost:5000/uploads/vehicles/guid.jpg",
  "types": ["Ambulance", "Emergency"],
  "createdAt": "2025-10-27T15:00:00Z"
}
```

**Error Responses:**
- `404 Not Found` - Vehicle not found
- `400 Bad Request` - Invalid data

---

### **DELETE** `/api/vehicles/{id}`
Delete a vehicle (soft delete).

**Authorization:** Admin  
**Path Parameters:**
- `id` (integer) - Vehicle ID

**Response:** `204 No Content`

**Error Responses:**
- `404 Not Found` - Vehicle not found

---

## **Trip Endpoints**

### **GET** `/api/trips`
Get all trips.

**Authorization:** Authenticated  
**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "name": "string",
    "description": "string?",
    "scheduledStartTime": "2025-10-27T15:00:00Z",
    "actualStartTime": "2025-10-27T15:05:00Z",
    "actualEndTime": "2025-10-27T16:00:00Z",
    "status": "Completed",
    "rejectionReason": null,
    "fromLatitude": 40.7128,
    "fromLongitude": -74.0060,
    "toLatitude": 40.7589,
    "toLongitude": -73.9851,
    "fromLocationName": "Starting Point",
    "toLocationName": "Destination",
    "vehicleId": 1,
    "vehicle": {...},
    "driverId": 2,
    "driver": {...},
    "approvedBy": 3,
    "approver": {...},
    "approvedAt": "2025-10-27T14:00:00Z",
    "createdAt": "2025-10-27T13:00:00Z",
    "createdBy": "guid"
  }
]
```

**Note:** Trips now use coordinate-based locations (latitude/longitude) instead of predefined routes.

---

### **GET** `/api/trips/{id}`
Get trip by ID.

**Authorization:** Authenticated  
**Path Parameters:**
- `id` (integer) - Trip ID

**Response:** `200 OK` - Same as single trip object above  
**Error Responses:**
- `404 Not Found` - Trip not found

---

### **GET** `/api/trips/status/{status}`
Get trips by status.

**Authorization:** Authenticated  
**Path Parameters:**
- `status` (enum) - Trip status: `Pending`, `Approved`, `Rejected`, `InProgress`, `Completed`, `Cancelled`

**Response:** `200 OK` - Array of trip objects

---

### **GET** `/api/trips/pending`
Get all pending trips awaiting approval.

**Authorization:** Admin, Dispatcher  
**Response:** `200 OK` - Array of pending trip objects

---

### **GET** `/api/trips/route/{routeId}`
Get trips by route.

**Authorization:** Authenticated  
**Path Parameters:**
- `routeId` (integer) - Route ID

**Response:** `200 OK` - Array of trip objects

---

### **GET** `/api/trips/driver/{driverId}`
Get trips by driver.

**Authorization:** Authenticated  
**Path Parameters:**
- `driverId` (integer) - Driver (User) ID

**Response:** `200 OK` - Array of trip objects

---

### **POST** `/api/trips`
Create a new trip. Supports telemetry collection with GPS location.

**Authorization:** Admin, Dispatcher, Driver, User ⭐ UPDATED  
**Content-Type:** `application/json`

**Request Body:**
```json
{
  "name": "string",
  "description": "string (optional)",
  "scheduledStartTime": "2025-10-27T15:00:00Z",
  "fromLatitude": 40.7128,
  "fromLongitude": -74.0060,
  "toLatitude": 40.7589,
  "toLongitude": -73.9851,
  "fromLocationName": "Starting Point (optional)",
  "toLocationName": "Destination (optional)",
  "vehicleId": 1,
  "driverId": 2,
  "tripTypeId": 1,
  "attributeValues": [
    {
      "tripTypeAttributeId": 1,
      "value": "Patient Name"
    }
  ],
  "telemetry": {
    "deviceType": "Mobile",
    "operatingSystem": "Android",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "accuracy": 10.5,
    "batteryLevel": 0.85,
    "timestamp": "2025-10-27T15:00:00Z"
  }
}
```

**Note:**
- The authenticated user who creates the trip is automatically set as the trip creator (`createdBy`)
- `telemetry` field is optional but recommended for GPS tracking
- GPS coordinates in telemetry can help verify trip location accuracy

**Response:** `201 Created`
```json
{
  "id": 1,
  "name": "string",
  "description": "string?",
  "scheduledStartTime": "2025-10-27T15:00:00Z",
  "actualStartTime": null,
  "actualEndTime": null,
  "status": "Pending",
  "rejectionReason": null,
  "fromLatitude": 40.7128,
  "fromLongitude": -74.0060,
  "toLatitude": 40.7589,
  "toLongitude": -73.9851,
  "fromLocationName": "Starting Point",
  "toLocationName": "Destination",
  "vehicleId": 1,
  "vehicle": {...},
  "driverId": 2,
  "driver": {...},
  "approvedBy": null,
  "approver": null,
  "approvedAt": null,
  "createdAt": "2025-10-27T13:00:00Z",
  "createdBy": "guid"
}
```

**Error Responses:**
- `400 Bad Request` - Invalid data or referenced entities not found

---

### **PUT** `/api/trips/{id}`
Update an existing trip (only pending trips can be updated). Supports telemetry collection.

**Authorization:** Admin, Dispatcher, Driver, User ⭐ UPDATED  
**Content-Type:** `application/json`  
**Path Parameters:**
- `id` (integer) - Trip ID

**Request Body:**
```json
{
  "name": "string (optional)",
  "description": "string (optional)",
  "scheduledStartTime": "2025-10-27T15:00:00Z (optional)",
  "fromLatitude": 40.7128,
  "fromLongitude": -74.0060,
  "toLatitude": 40.7589,
  "toLongitude": -73.9851,
  "fromLocationName": "Starting Point (optional)",
  "toLocationName": "Destination (optional)",
  "vehicleId": 1,
  "driverId": 2,
  "tripTypeId": 1,
  "attributeValues": [
    {
      "tripTypeAttributeId": 1,
      "value": "Updated Value"
    }
  ],
  "telemetry": {
    "deviceType": "Mobile",
    "operatingSystem": "Android",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "timestamp": "2025-10-27T15:00:00Z"
  }
}
```

**Response:** `200 OK` - Returns updated TripDto  
**Error Responses:**
- `404 Not Found` - Trip not found
- `400 Bad Request` - Only pending trips can be updated

---

### **POST** `/api/trips/{id}/approve`
Approve or reject a trip. Supports telemetry collection.

**Authorization:** Admin, Dispatcher  
**Content-Type:** `application/json`  
**Path Parameters:**
- `id` (integer) - Trip ID

**Request Body:**
```json
{
  "approve": true,
  "rejectionReason": "string (required if approve is false)",
  "telemetry": {
    "deviceType": "Desktop",
    "operatingSystem": "Windows",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "timestamp": "2025-10-27T14:00:00Z"
  }
}
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "name": "string",
  "status": "Approved",
  "approvedBy": 3,
  "approver": {...},
  "approvedAt": "2025-10-27T14:00:00Z",
  ...
}
```

**Error Responses:**
- `404 Not Found` - Trip not found
- `400 Bad Request` - Only pending trips can be approved/rejected, or rejection reason missing

---

### **POST** `/api/trips/{id}/start`
Start a trip (change status to in-progress). Supports telemetry with GPS location.

**Authorization:** Admin, Dispatcher, Driver, User ⭐ UPDATED  
**Content-Type:** `application/json`  
**Path Parameters:**
- `id` (integer) - Trip ID

**Request Body:**
```json
{
  "actualStartTime": "2025-10-27T15:05:00Z",
  "telemetry": {
    "deviceType": "Mobile",
    "operatingSystem": "iOS",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "accuracy": 5.0,
    "speed": 0.0,
    "heading": 90.0,
    "batteryLevel": 0.75,
    "timestamp": "2025-10-27T15:05:00Z"
  }
}
```

**Note:** GPS coordinates in telemetry help verify the driver is at the starting location.

**Response:** `200 OK` - Returns updated TripDto with status `InProgress`  
**Error Responses:**
- `404 Not Found` - Trip not found
- `400 Bad Request` - Only approved trips can be started
- `403 Forbidden` - Only trip creator or Admin/Dispatcher can start

---

### **POST** `/api/trips/{id}/complete`
Complete a trip. Supports telemetry with GPS location.

**Authorization:** Admin, Dispatcher, Driver, User ⭐ UPDATED  
**Content-Type:** `application/json`  
**Path Parameters:**
- `id` (integer) - Trip ID

**Request Body:**
```json
{
  "actualEndTime": "2025-10-27T16:00:00Z",
  "notes": "Trip completed successfully (optional)",
  "telemetry": {
    "deviceType": "Mobile",
    "operatingSystem": "iOS",
    "latitude": 40.7589,
    "longitude": -73.9851,
    "accuracy": 5.0,
    "speed": 0.0,
    "batteryLevel": 0.60,
    "timestamp": "2025-10-27T16:00:00Z"
  }
}
```

**Note:** GPS coordinates in telemetry help verify the driver reached the destination.

**Response:** `200 OK` - Returns updated TripDto with status `Completed`  
**Error Responses:**
- `404 Not Found` - Trip not found
- `400 Bad Request` - Only in-progress trips can be completed
- `403 Forbidden` - Only trip creator or Admin/Dispatcher can complete

---

### **POST** `/api/trips/{id}/cancel`
Cancel a trip.

**Authorization:** Admin, Dispatcher, Driver, User ⭐ UPDATED  
**Path Parameters:**
- `id` (integer) - Trip ID

**Request Body (Optional):**
```json
{
  "reason": "Cancellation reason (optional)"
}
```

**Response:** `200 OK` - Returns updated TripDto with status `Cancelled`  
**Error Responses:**
- `404 Not Found` - Trip not found
- `400 Bad Request` - Completed trips cannot be cancelled
- `403 Forbidden` - Only trip creator or Admin/Dispatcher can cancel

---

### **PUT** `/api/trips/{id}/status` ⭐ NEW
Update trip status (unified endpoint for all status changes).

**Authorization:** Authenticated  
**Content-Type:** `application/json`  
**Path Parameters:**
- `id` (integer) - Trip ID

**Request Body:**
```json
{
  "id": 1,
  "status": 4,
  "notes": "Optional notes about the status change",
  "rejectionReason": "Required for rejections",
  "forceComplete": false
}
```

**Status Values:**
- `0` = Pending
- `1` = Approved
- `2` = Rejected
- `3` = InProgress
- `4` = Completed
- `5` = Cancelled

**Response:** `200 OK` - Returns updated TripDto  
**Error Responses:**
- `404 Not Found` - Trip not found
- `400 Bad Request` - Invalid status transition
- `403 Forbidden` - Insufficient permissions for this status change

**Permission Rules:**
- **Approve/Reject**: Admin, Dispatcher only
- **Start/Complete/Cancel**: Trip creator, Admin, or Dispatcher
- **Force Complete**: Admin, Dispatcher only (sets `forceComplete: true`)

**Note:** This endpoint automatically logs all status changes to the audit trail.

---

### **GET** `/api/trips/{id}/status-logs` ⭐ NEW
Get complete status change history for a trip.

**Authorization:** Authenticated  
**Path Parameters:**
- `id` (integer) - Trip ID

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "tripId": 5,
    "fromStatus": "Pending",
    "toStatus": "Approved",
    "changedBy": "guid",
    "changedAt": "2025-10-27T14:00:00Z",
    "notes": "All requirements met",
    "rejectionReason": null,
    "isForceComplete": false,
    "userRole": "Admin/Dispatcher",
    "userName": "John Doe",
    "user": {
      "id": "guid",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com"
    }
  }
]
```

**Note:** Returns logs in chronological order (newest first). Includes complete audit trail with user information.

---

### **DELETE** `/api/trips/{id}`
Delete a trip (soft delete).

**Authorization:** Admin  
**Path Parameters:**
- `id` (integer) - Trip ID

**Response:** `204 No Content`  
**Error Responses:**
- `404 Not Found` - Trip not found

---

## **Trip Type Endpoints** ⭐ NEW

### **GET** `/api/triptypes`
Get all trip types with their attributes.

**Authorization:** Authenticated  
**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "name": "Emergency",
    "description": "Emergency medical transport",
    "color": "#FF0000",
    "icon": "alert-circle",
    "isActive": true,
    "displayOrder": 1,
    "createdAt": "2025-10-27T20:00:00Z",
    "attributes": [
      {
        "id": 1,
        "tripTypeId": 1,
        "name": "patient_age",
        "label": "Patient Age",
        "description": "Age of the patient",
        "dataType": "number",
        "isRequired": true,
        "displayOrder": 1,
        "options": null,
        "defaultValue": null,
        "validationRules": "{\"min\": 0, \"max\": 120}",
        "placeholder": "Enter patient age",
        "isActive": true,
        "createdAt": "2025-10-27T20:05:00Z"
      }
    ]
  }
]
```

---

### **GET** `/api/triptypes/active`
Get only active trip types.

**Authorization:** Authenticated  
**Response:** `200 OK` - Same format as above, filtered to active types only

---

### **GET** `/api/triptypes/{id}`
Get a specific trip type with all its attributes.

**Authorization:** Authenticated  
**Path Parameters:**
- `id` (integer) - Trip Type ID

**Response:** `200 OK` - Single trip type object  
**Error Responses:**
- `404 Not Found` - Trip type not found

---

### **POST** `/api/triptypes`
Create a new trip type.

**Authorization:** Admin, Dispatcher  
**Content-Type:** `application/json`

**Request Body:**
```json
{
  "name": "Emergency",
  "description": "Emergency medical transport",
  "color": "#FF0000",
  "icon": "alert-circle",
  "isActive": true,
  "displayOrder": 1
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "name": "Emergency",
  "description": "Emergency medical transport",
  "color": "#FF0000",
  "icon": "alert-circle",
  "isActive": true,
  "displayOrder": 1,
  "createdAt": "2025-10-27T20:00:00Z",
  "attributes": []
}
```

**Error Responses:**
- `400 Bad Request` - Invalid data

---

### **PUT** `/api/triptypes/{id}`
Update an existing trip type.

**Authorization:** Admin, Dispatcher  
**Content-Type:** `application/json`  
**Path Parameters:**
- `id` (integer) - Trip Type ID

**Request Body:** (all fields optional)
```json
{
  "name": "Emergency - Updated",
  "description": "Updated description",
  "color": "#CC0000",
  "icon": "alert-triangle",
  "isActive": true,
  "displayOrder": 2
}
```

**Response:** `200 OK` - Returns updated TripTypeDto  
**Error Responses:**
- `404 Not Found` - Trip type not found

---

### **DELETE** `/api/triptypes/{id}`
Delete a trip type (soft delete).

**Authorization:** Admin  
**Path Parameters:**
- `id` (integer) - Trip Type ID

**Response:** `204 No Content`  
**Error Responses:**
- `404 Not Found` - Trip type not found

---

### **POST** `/api/triptypes/attributes`
Create a new custom attribute for a trip type.

**Authorization:** Admin, Dispatcher  
**Content-Type:** `application/json`

**Request Body:**
```json
{
  "tripTypeId": 1,
  "name": "patient_age",
  "label": "Patient Age",
  "description": "Age of the patient in years",
  "dataType": "number",
  "isRequired": true,
  "displayOrder": 1,
  "options": null,
  "defaultValue": null,
  "validationRules": "{\"min\": 0, \"max\": 120}",
  "placeholder": "Enter patient age",
  "isActive": true
}
```

**Data Types:**
- `text` - Single-line text input
- `textarea` - Multi-line text input
- `number` - Numeric input
- `date` - Date picker
- `boolean` - Checkbox
- `select` - Dropdown (requires `options` as JSON array)

**Response:** `201 Created` - Returns created TripTypeAttributeDto  
**Error Responses:**
- `400 Bad Request` - Invalid data

---

### **PUT** `/api/triptypes/attributes/{id}`
Update an existing attribute.

**Authorization:** Admin, Dispatcher  
**Content-Type:** `application/json`  
**Path Parameters:**
- `id` (integer) - Attribute ID

**Request Body:** (all fields optional)
```json
{
  "name": "patient_age_years",
  "label": "Patient Age (Years)",
  "description": "Updated description",
  "dataType": "number",
  "isRequired": false,
  "displayOrder": 2,
  "validationRules": "{\"min\": 0, \"max\": 150}",
  "isActive": true
}
```

**Response:** `200 OK` - Returns updated TripTypeAttributeDto  
**Error Responses:**
- `404 Not Found` - Attribute not found

---

### **DELETE** `/api/triptypes/attributes/{id}`
Delete an attribute (soft delete).

**Authorization:** Admin  
**Path Parameters:**
- `id` (integer) - Attribute ID

**Response:** `204 No Content`  
**Error Responses:**
- `404 Not Found` - Attribute not found

---

## **File Upload Endpoints**

### **POST** `/api/fileupload/vehicle-image`
Upload a vehicle image.

**Authorization:** Admin, Dispatcher  
**Content-Type:** `multipart/form-data`

**Request Body:**
```
file: file (required, jpg/jpeg/png/gif, max 5MB)
```

**Response:** `200 OK`
```json
{
  "filePath": "uploads/vehicles/guid.jpg",
  "fileUrl": "http://localhost:5000/uploads/vehicles/guid.jpg"
}
```

**Error Responses:**
- `400 Bad Request` - No file uploaded, file too large, or invalid file type

---

### **DELETE** `/api/fileupload/vehicle-image`
Delete a vehicle image.

**Authorization:** Admin, Dispatcher  
**Query Parameters:**
- `filePath` (string) - Path to the file to delete

**Response:** `204 No Content`

**Error Responses:**
- `400 Bad Request` - File path is required
- `404 Not Found` - File not found
- `500 Internal Server Error` - Error deleting file

---

## **Authorization Roles**

The API uses role-based authorization with the following roles:

- **Admin** - Full access to all endpoints, can approve/reject/force complete trips
- **Dispatcher** - Can manage locations, routes, vehicles, and trips; can approve/reject/force complete
- **Driver** - Can create and manage their own trips (complete, cancel, start)
- **User** - Can create and manage their own trips (complete, cancel, start)
- **Authenticated** - Basic access to read operations

**Note:** Driver and User roles have identical permissions for trip management. Both can create trips and manage trips they created.

---

## **Common Response Codes**

- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `204 No Content` - Request successful with no content to return
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Authentication required or invalid credentials
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

## **File Upload Specifications**

- **Allowed formats:** JPG, JPEG, PNG, GIF
- **Maximum file size:** 5MB
- **Upload locations:**
    - Users: `wwwroot/uploads/users/`
    - Locations: `wwwroot/uploads/locations/`
    - Vehicles: `wwwroot/uploads/vehicles/`

---

## **Trip Workflow**

The trip module follows a structured approval and lifecycle workflow with complete audit trail.

### **Trip Statuses**
1. **Pending** - Initial status when trip is created, awaiting approval
2. **Approved** - Trip has been approved by Admin or Dispatcher
3. **Rejected** - Trip has been rejected (requires rejection reason)
4. **InProgress** - Trip has started (creator has begun the journey)
5. **Completed** - Trip has been completed successfully
6. **Cancelled** - Trip has been cancelled (cannot cancel completed trips)

### **Workflow Steps**
1. **Create Trip** (Admin/Dispatcher/Driver/User) → Status: `Pending`
    - Creator is automatically tracked via `createdBy` field
    - Optional: Select trip type and provide custom attribute values
2. **Approve/Reject Trip** (Admin/Dispatcher only) → Status: `Approved` or `Rejected`
    - Rejection requires a rejection reason
3. **Start Trip** (Trip creator or Admin/Dispatcher) → Status: `InProgress` (only if approved)
4. **Complete Trip** (Trip creator or Admin/Dispatcher) → Status: `Completed` (only if in progress)
    - Optional notes can be added
5. **Cancel Trip** (Trip creator or Admin/Dispatcher) → Status: `Cancelled` (anytime except completed)
    - Optional cancellation reason
6. **Force Complete** (Admin/Dispatcher only) → Status: `Completed` (from any status)
    - Bypasses normal workflow, sets `isForceComplete` flag

### **Business Rules**
- Only **pending** trips can be updated or approved/rejected
- Only **approved** trips can be started
- Only **in-progress** trips can be completed (unless force complete)
- **Completed** trips cannot be cancelled or modified
- Rejection requires a rejection reason
- Trips use coordinate-based locations (latitude/longitude)
- Trips are optionally associated with a vehicle and driver
- **Trip ownership**: Users can only manage trips they created (via `createdBy`)
- **Admin override**: Admin/Dispatcher can manage any trip

### **Audit Trail** ⭐ NEW
- All status changes are automatically logged to `trip_status_logs` table
- Logs include: from/to status, user, role, timestamp, notes, rejection reasons
- Complete audit trail accessible via `/api/trips/{id}/status-logs`
- Logs are read-only and preserved even if trip is deleted (soft delete)

---

## **Notes**

1. All endpoints except `/api/auth/login` require authentication via Bearer token
2. Soft delete is implemented for Users, Locations, Vehicles, Trips, and Trip Types
3. Image uploads automatically generate unique filenames using GUIDs
4. When updating with `removeImage: true`, the existing image will be deleted
5. All datetime values are in ISO 8601 format (UTC)
6. The `BaseUrl` configuration can be set in `appsettings.json` or will default to the request host
7. Trip approval workflow requires Admin or Dispatcher role
8. Trip status transitions are enforced by business logic
9. **Driver and User roles have identical permissions** for trip management
10. Trip ownership is tracked via `createdBy` field (separate from `driverId`)
11. Users can only manage trips they created; Admins can manage any trip
12. All status changes are automatically logged for audit compliance
13. Trips now use coordinate-based locations instead of predefined routes
14. **Trip Types support dynamic custom attributes** with 6 data types (text, textarea, number, date, boolean, select)
15. Attribute values are stored per trip and can be retrieved with trip details
16. Trip type management (create/update/delete) requires Admin or Dispatcher role
17. **Telemetry collection is optional** - All auth and trip endpoints accept optional telemetry data
18. Telemetry never blocks main operations - Collection failures are logged but don't cause errors
19. **Timeseries telemetry** - Batch logging and time-based queries for high-volume data ⭐ NEW
20. **User privacy controls** - Users can only access their own telemetry timeseries data ⭐ NEW

---

## **Telemetry System** ⭐ NEW

The API collects optional telemetry data for analytics, debugging, and security monitoring. Telemetry is privacy-conscious and never blocks main operations.

### **Telemetry Data Structure**

All telemetry fields are optional:

```json
{
  "telemetry": {
    // Device Information
    "deviceType": "Mobile | Desktop | Tablet",
    "deviceModel": "string",
    "operatingSystem": "Android | iOS | Windows | macOS | Linux",
    "osVersion": "string",
    "browser": "Chrome | Firefox | Safari | Edge",
    "browserVersion": "string",
    "appVersion": "1.0.0",
    
    // Account Information
    "googleAccount": "email@gmail.com",  // Requires OAuth
    "appleAccount": "email@icloud.com",  // Requires Sign in with Apple
    "accountType": "Google | Apple | None",
    
    // Installed Apps
    "installedApps": "[\"App1\", \"App2\"]",  // JSON array
    "installedAppsCount": 5,
    
    // GPS/Location
    "latitude": 40.7128,
    "longitude": -74.0060,
    "accuracy": 10.5,  // meters
    "altitude": 100.0,  // meters
    "speed": 5.5,  // m/s
    "heading": 180.0,  // degrees
    "locationTimestamp": "2025-10-27T15:00:00Z",
    
    // Network
    "ipAddress": "192.168.1.1",
    "connectionType": "wifi | cellular | ethernet",
    "isOnline": true,
    
    // Screen
    "screenWidth": 1920,
    "screenHeight": 1080,
    "orientation": "portrait | landscape",
    
    // Battery
    "batteryLevel": 0.85,  // 0-1
    "isCharging": false,
    
    // Timestamp
    "timestamp": "2025-10-27T15:00:00Z"
  }
}
```

### **Endpoints with Telemetry Support**

**Authentication:**
- `POST /api/auth/register` - Logs user registration
- `POST /api/auth/login` - Logs successful/failed login attempts
- `POST /api/auth/forgot-password` - Logs password reset requests
- `POST /api/auth/reset-password` - Logs password reset completions

**Trips:**
- `POST /api/trips` - Logs trip creation with GPS location
- `PUT /api/trips/{id}` - Logs trip updates
- `POST /api/trips/{id}/approve` - Logs approval/rejection
- `POST /api/trips/{id}/start` - Logs trip start with location
- `POST /api/trips/{id}/complete` - Logs trip completion with location

### **Event Types Logged**

- `Register` - User registration
- `Login` - Successful login
- `LoginFailed` - Failed login attempt
- `ForgotPassword` - Password reset request
- `ResetPassword` - Password reset completion
- `TripCreate` - Trip creation
- `TripUpdate` - Trip modification
- `TripApprove` - Trip approval
- `TripReject` - Trip rejection
- `TripStart` - Trip started
- `TripComplete` - Trip completed

### **Privacy & Compliance**

- All telemetry is **optional** and gracefully handled if missing
- GPS location requires **explicit user permission**
- Account emails require **OAuth integration** (currently only type is detected)
- Installed apps list is **limited** to browser plugins in web context
- No sensitive data (passwords, tokens) is ever logged
- Users can be anonymized (UserId is optional for some events)
- Complies with **GDPR** - users can request data deletion

### **Web Browser Limitations**

**Account Information:**
- Web apps cannot access actual Google/Apple account emails without OAuth
- Currently only detects account type based on OS
- Full access requires OAuth integration or native app

**Installed Apps:**
- Web browsers restrict access to system-level installed apps
- Only browser plugins/extensions are accessible
- PWA can use `getInstalledRelatedApps()` for related apps only
- Full access requires native app (Capacitor/Cordova)

### **Database Storage**

Telemetry is stored in the `telemetries` table with:
- Indexed queries on EventType, UserId, CreatedAt
- Optional relationship with User (SetNull on delete)
- All fields are nullable for flexibility
- Maximum field lengths configured for performance

### **Usage Example**

```json
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123",
  "telemetry": {
    "deviceType": "Mobile",
    "operatingSystem": "Android",
    "accountType": "Google",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "accuracy": 10.5,
    "batteryLevel": 0.85,
    "isOnline": true
  }
}
```

The telemetry will be logged with event type "Login" and associated with the authenticated user.

---

## **Telemetry Timeseries Endpoints** ⭐ NEW

### **POST** `/api/telemetry`
Log a single telemetry event.

**Authorization:** Optional (can be anonymous)  
**Content-Type:** `application/json`

**Request Body:**
```json
{
  "eventType": "LocationUpdate",
  "eventDetails": "Driver en route to pickup",
  "telemetry": {
    "latitude": 40.7128,
    "longitude": -74.0060,
    "speed": 15.5,
    "batteryLevel": 0.85,
    "timestamp": "2025-10-27T22:00:00Z",
    "deviceType": "Mobile",
    "operatingSystem": "Android"
  }
}
```

**Response:** `200 OK`
```json
{
  "message": "Telemetry logged successfully"
}
```

---

### **POST** `/api/telemetry/batch`
Log multiple telemetry events in a batch (for timeseries data).

**Authorization:** Optional (authenticated user ID will be used if available)  
**Content-Type:** `application/json`

**Request Body:**
```json
{
  "events": [
    {
      "eventType": "LocationUpdate",
      "eventDetails": "Periodic location update",
      "telemetry": {
        "latitude": 40.7128,
        "longitude": -74.0060,
        "speed": 15.5,
        "batteryLevel": 0.85,
        "timestamp": "2025-10-27T22:00:00Z"
      }
    },
    {
      "eventType": "LocationUpdate",
      "eventDetails": "Periodic location update",
      "telemetry": {
        "latitude": 40.7130,
        "longitude": -74.0062,
        "speed": 16.2,
        "batteryLevel": 0.84,
        "timestamp": "2025-10-27T22:01:00Z"
      }
    }
  ]
}
```

**Response:** `200 OK`
```json
{
  "message": "Batch telemetry logged successfully",
  "count": 2
}
```

**Use Cases:**
- Real-time location tracking during trips
- Offline data synchronization
- Periodic metric collection (battery, network, etc.)
- Route history recording

---

### **POST** `/api/telemetry/timeseries`
Query telemetry data within a time range.

**Authorization:** Admin, Dispatcher  
**Content-Type:** `application/json`

**Request Body:**
```json
{
  "startTime": "2025-10-27T20:00:00Z",
  "endTime": "2025-10-27T23:00:00Z",
  "eventType": "LocationUpdate",
  "limit": 1000
}
```

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "eventType": "LocationUpdate",
    "eventDetails": "Periodic location update",
    "userId": "123e4567-e89b-12d3-a456-426614174000",
    "userName": "John Doe",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "speed": 15.5,
    "batteryLevel": 0.85,
    "createdAt": "2025-10-27T22:00:00Z",
    "eventTimestamp": "2025-10-27T22:00:00Z"
  },
  {
    "id": 2,
    "eventType": "LocationUpdate",
    "eventDetails": "Periodic location update",
    "userId": "123e4567-e89b-12d3-a456-426614174000",
    "userName": "John Doe",
    "latitude": 40.7130,
    "longitude": -74.0062,
    "speed": 16.2,
    "batteryLevel": 0.84,
    "createdAt": "2025-10-27T22:01:00Z",
    "eventTimestamp": "2025-10-27T22:01:00Z"
  }
]
```

**Query Parameters:**
- `startTime` (required) - Start of time range (ISO 8601)
- `endTime` (required) - End of time range (ISO 8601)
- `eventType` (optional) - Filter by event type
- `limit` (optional) - Maximum records to return (default: 1000)

---

### **GET** `/api/telemetry/user/{userId}/timeseries`
Get timeseries telemetry data for a specific user.

**Authorization:** User (own data only), Admin, Dispatcher (any user)  
**Path Parameters:**
- `userId` (guid) - User ID

**Query Parameters:**
- `startTime` (required) - Start of time range (ISO 8601)
- `endTime` (required) - End of time range (ISO 8601)
- `eventType` (optional) - Filter by event type

**Example:**
```
GET /api/telemetry/user/123e4567-e89b-12d3-a456-426614174000/timeseries?startTime=2025-10-27T20:00:00Z&endTime=2025-10-27T23:00:00Z&eventType=LocationUpdate
```

**Response:** `200 OK` - Array of TelemetryTimeseriesDto (same as timeseries endpoint)

**Error Responses:**
- `403 Forbidden` - User attempting to access another user's data
- `404 Not Found` - User not found

---

### **GET** `/api/telemetry/me/timeseries`
Get timeseries telemetry data for the current authenticated user.

**Authorization:** Required (any authenticated user)

**Query Parameters:**
- `startTime` (required) - Start of time range (ISO 8601)
- `endTime` (required) - End of time range (ISO 8601)
- `eventType` (optional) - Filter by event type

**Example:**
```
GET /api/telemetry/me/timeseries?startTime=2025-10-27T20:00:00Z&endTime=2025-10-27T23:00:00Z
```

**Response:** `200 OK` - Array of TelemetryTimeseriesDto

**Use Cases:**
- User viewing their own location history
- Personal analytics dashboard
- Privacy-compliant data access

---

## **Timeseries Use Cases**

### **1. Real-time Location Tracking**
Track driver/ambulance location during trips by logging location updates every 30 seconds and batching them every 5 minutes.

### **2. Trip Route Visualization**
Retrieve all location updates for a trip to display the complete route taken on a map.

### **3. Performance Analytics**
Analyze driver behavior (average speed, battery drain, distance traveled) over time periods.

### **4. Offline Data Sync**
Collect telemetry offline and sync in batches when connection is restored.

### **5. Compliance & Auditing**
Track user activity and system events for compliance and security auditing.

---

## **Timeseries Best Practices**

### **Batch Size Recommendations**
- **Real-time tracking**: Batch every 5-10 location updates (2.5-5 minutes at 30s intervals)
- **Background sync**: Batch up to 100 events
- **Offline sync**: Split large queues into batches of 100-200 events

### **Query Limits**
- Default limit: 1000 records
- Maximum recommended: 5000 records per query
- For larger datasets, use pagination with time windows

### **Privacy & Security**
- Users can only query their own telemetry data
- Admin/Dispatcher can query all data
- All telemetry fields are optional
- GPS location requires explicit user permission
- No sensitive data (passwords, tokens) is ever logged

---
