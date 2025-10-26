# Backend API Specification for Ambulance Rider App

This document provides the complete API specification that your backend must implement to work with the Ambulance Rider mobile application.

## Base Configuration

- **Base URL**: `http://your-domain.com/api`
- **Content-Type**: `application/json`
- **Authentication**: Bearer Token (JWT)

## Authentication Endpoints

### 1. Register New User

**Endpoint**: `POST /auth/register`

**Description**: Creates a new user account and returns authentication tokens.

**Request Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "SecurePassword123!",
  "phone": "+1234567890"
}
```

**Validation Rules**:
- `name`: Required, string, min 2 characters
- `email`: Required, valid email format, unique
- `password`: Required, min 6 characters
- `phone`: Optional, valid phone format

**Success Response** (201 Created):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwidHlwZSI6InJlZnJlc2giLCJpYXQiOjE1MTYyMzkwMjJ9.4Adcj0vVL_4qVXBKG9P6tTzNvVHqJf8xz5K8vXqLqzQ",
  "expires_in": 3600,
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "role": "user",
    "phone": "+1234567890",
    "avatar": null,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

**Error Responses**:

400 Bad Request - Validation Error:
```json
{
  "message": "Validation failed",
  "errors": {
    "email": ["The email has already been taken."],
    "password": ["The password must be at least 6 characters."]
  }
}
```

500 Internal Server Error:
```json
{
  "message": "Registration failed. Please try again later."
}
```

---

### 2. User Login

**Endpoint**: `POST /auth/login`

**Description**: Authenticates a user and returns JWT tokens.

**Request Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePassword123!"
}
```

**Success Response** (200 OK):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 3600,
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "role": "user",
    "phone": "+1234567890",
    "avatar": "https://example.com/avatars/user.jpg",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

**Error Responses**:

401 Unauthorized - Invalid Credentials:
```json
{
  "message": "Invalid email or password"
}
```

400 Bad Request - Missing Fields:
```json
{
  "message": "Email and password are required"
}
```

---

### 3. Refresh Access Token

**Endpoint**: `POST /auth/refresh`

**Description**: Generates a new access token using a valid refresh token.

**Request Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Success Response** (200 OK):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 3600
}
```

**Error Responses**:

401 Unauthorized - Invalid/Expired Token:
```json
{
  "message": "Invalid or expired refresh token"
}
```

---

### 4. Get Current User

**Endpoint**: `GET /auth/me`

**Description**: Returns the authenticated user's information.

**Request Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response** (200 OK):
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "role": "user",
    "phone": "+1234567890",
    "avatar": "https://example.com/avatars/user.jpg",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-20T14:45:00Z"
  }
}
```

**Error Responses**:

401 Unauthorized - Missing/Invalid Token:
```json
{
  "message": "Unauthenticated"
}
```

---

### 5. Logout

**Endpoint**: `POST /auth/logout`

**Description**: Invalidates the user's refresh token.

**Request Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Success Response** (200 OK):
```json
{
  "message": "Successfully logged out"
}
```

**Error Responses**:

401 Unauthorized:
```json
{
  "message": "Unauthenticated"
}
```

---

### 6. Forgot Password

**Endpoint**: `POST /auth/forgot-password`

**Description**: Sends a password reset email to the user.

**Request Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "email": "john.doe@example.com"
}
```

**Success Response** (200 OK):
```json
{
  "message": "Password reset instructions sent to your email"
}
```

**Error Responses**:

404 Not Found - Email not registered:
```json
{
  "message": "No account found with this email address"
}
```

400 Bad Request:
```json
{
  "message": "Email is required"
}
```

---

### 7. Reset Password

**Endpoint**: `POST /auth/reset-password`

**Description**: Resets the user's password using a valid reset token.

**Request Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "token": "reset_token_from_email",
  "password": "newSecurePassword123"
}
```

**Success Response** (200 OK):
```json
{
  "message": "Password reset successfully"
}
```

**Error Responses**:

400 Bad Request - Invalid/Expired Token:
```json
{
  "message": "Invalid or expired reset token"
}
```

400 Bad Request - Validation Error:
```json
{
  "message": "Password must be at least 6 characters"
}
```

---

## User Profile Endpoints

### 8. Get User Profile

**Endpoint**: `GET /users/profile`

**Description**: Retrieves the authenticated user's profile.

**Request Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response** (200 OK):
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "role": "user",
    "phone": "+1234567890",
    "avatar": "https://example.com/avatars/user.jpg",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-20T14:45:00Z"
  }
}
```

---

### 9. Update User Profile

**Endpoint**: `PUT /users/profile`

**Description**: Updates the authenticated user's profile information.

**Request Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Request Body**:
```json
{
  "name": "John Updated Doe",
  "phone": "+1987654321",
  "avatar": "https://example.com/avatars/new-avatar.jpg"
}
```

**Success Response** (200 OK):
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Updated Doe",
    "email": "john.doe@example.com",
    "role": "user",
    "phone": "+1987654321",
    "avatar": "https://example.com/avatars/new-avatar.jpg",
    "updatedAt": "2024-01-21T09:15:00Z"
  }
}
```

**Error Responses**:

400 Bad Request:
```json
{
  "message": "Validation failed",
  "errors": {
    "name": ["The name field is required."]
  }
}
```

---

## Ambulance Endpoints (Example)

### 10. List Available Ambulances

**Endpoint**: `GET /ambulances`

**Description**: Returns a list of available ambulances.

**Request Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Query Parameters**:
- `lat` (optional): Latitude for location-based search
- `lng` (optional): Longitude for location-based search
- `radius` (optional): Search radius in kilometers (default: 10)

**Success Response** (200 OK):
```json
{
  "ambulances": [
    {
      "id": "amb-001",
      "vehicle_number": "AMB-1234",
      "driver_name": "Mike Johnson",
      "phone": "+1234567890",
      "status": "available",
      "location": {
        "lat": 40.7128,
        "lng": -74.0060
      },
      "distance": 2.5
    }
  ],
  "total": 1
}
```

---

### 11. Request Ambulance

**Endpoint**: `POST /ambulances/request`

**Description**: Creates a new ambulance request.

**Request Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Request Body**:
```json
{
  "pickup_location": {
    "lat": 40.7128,
    "lng": -74.0060,
    "address": "123 Main St, New York, NY 10001"
  },
  "destination": {
    "lat": 40.7589,
    "lng": -73.9851,
    "address": "456 Hospital Ave, New York, NY 10002"
  },
  "patient_name": "Jane Doe",
  "emergency_type": "cardiac",
  "notes": "Patient experiencing chest pain"
}
```

**Success Response** (201 Created):
```json
{
  "request_id": "req-12345",
  "status": "pending",
  "ambulance": null,
  "estimated_arrival": null,
  "created_at": "2024-01-21T10:30:00Z"
}
```

---

## JWT Token Structure

### Access Token Payload

```json
{
  "sub": "550e8400-e29b-41d4-a716-446655440000",
  "email": "john.doe@example.com",
  "name": "John Doe",
  "role": "user",
  "iat": 1640995200,
  "exp": 1640998800,
  "type": "access"
}
```

**Claims**:
- `sub`: User ID (subject)
- `email`: User email
- `name`: User name
- `role`: User role (user, driver, admin)
- `iat`: Issued at timestamp
- `exp`: Expiration timestamp (1 hour from iat)
- `type`: Token type (access)

### Refresh Token Payload

```json
{
  "sub": "550e8400-e29b-41d4-a716-446655440000",
  "iat": 1640995200,
  "exp": 1643587200,
  "type": "refresh"
}
```

**Claims**:
- `sub`: User ID
- `iat`: Issued at timestamp
- `exp`: Expiration timestamp (30 days from iat)
- `type`: Token type (refresh)

---

## Error Response Format

All error responses follow this standard format:

```json
{
  "message": "Human-readable error message",
  "errors": {
    "field_name": ["Error description for this field"]
  }
}
```

---

## HTTP Status Codes

- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Authentication required or failed
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `422 Unprocessable Entity` - Validation failed
- `500 Internal Server Error` - Server error

---

## CORS Configuration

Your backend must allow requests from the mobile app:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, Accept
Access-Control-Max-Age: 86400
```

For production, replace `*` with your specific domain.

---

## Rate Limiting

Recommended rate limits:
- Authentication endpoints: 5 requests per minute per IP
- General API endpoints: 60 requests per minute per user
- Ambulance request: 3 requests per hour per user

---

## Security Headers

Your API should include these security headers:

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

---

## Testing the API

### Using cURL

**Register**:
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "phone": "+1234567890"
  }'
```

**Login**:
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Get User**:
```bash
curl -X GET http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## Database Schema Recommendations

### Users Table

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(50) DEFAULT 'user',
  avatar TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Refresh Tokens Table

```sql
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Implementation Checklist

- [ ] User registration endpoint
- [ ] User login endpoint
- [ ] Token refresh endpoint
- [ ] Get current user endpoint
- [ ] Logout endpoint
- [ ] Get profile endpoint
- [ ] Update profile endpoint
- [ ] JWT token generation
- [ ] JWT token validation
- [ ] Password hashing (bcrypt recommended)
- [ ] CORS configuration
- [ ] Error handling
- [ ] Input validation
- [ ] Rate limiting
- [ ] Security headers

---

## Additional Notes

1. **Password Security**: Use bcrypt or argon2 for password hashing
2. **Token Storage**: Store refresh tokens in database with expiration
3. **Token Rotation**: Implement refresh token rotation for better security
4. **Email Verification**: Consider adding email verification flow
5. **Password Reset**: Implement password reset functionality
6. **Logging**: Log all authentication attempts for security auditing
7. **IP Tracking**: Track login IPs for security monitoring

---

## Support

For questions about this API specification, refer to the main documentation or contact the development team.
