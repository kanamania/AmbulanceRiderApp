# JWT Authentication & Authorization - Global Express

This document describes the JWT authentication and authorization implementation in the Global Express Ionic React application.

## Overview

The app implements a complete JWT-based authentication system with:
- User registration and login
- Automatic token refresh
- Protected routes
- Persistent authentication state
- Secure token storage

## Architecture

### File Structure

```
src/
├── config/
│   └── api.config.ts          # API endpoints and configuration
├── contexts/
│   └── AuthContext.tsx        # Authentication context provider
├── services/
│   ├── api.service.ts         # HTTP client with interceptors
│   └── auth.service.ts        # Authentication service
├── types/
│   └── auth.types.ts          # TypeScript interfaces
├── components/
│   └── ProtectedRoute.tsx     # Route guard component
└── pages/
    ├── Login.tsx              # Login page
    ├── Register.tsx           # Registration page
    └── Profile.tsx            # User profile page
```

## Key Components

### 1. API Service (`api.service.ts`)

Axios-based HTTP client with:
- **Request Interceptor**: Automatically adds JWT token to headers
- **Response Interceptor**: Handles 401 errors and token refresh
- **Generic Methods**: GET, POST, PUT, PATCH, DELETE

```typescript
// Usage example
import apiService from './services/api.service';

const data = await apiService.get('/endpoint');
await apiService.post('/endpoint', { data });
```

### 2. Auth Service (`auth.service.ts`)

Handles all authentication operations:
- `login(credentials)` - Authenticate user
- `register(data)` - Register new user
- `logout()` - Clear auth data
- `getCurrentUser()` - Fetch user info
- `isAuthenticated()` - Check token validity
- `getAccessToken()` - Retrieve stored token

### 3. Auth Context (`AuthContext.tsx`)

React Context providing:
- `user` - Current user object
- `isAuthenticated` - Authentication status
- `isLoading` - Loading state
- `login()` - Login function
- `register()` - Registration function
- `logout()` - Logout function
- `updateUser()` - Update user data

```typescript
// Usage in components
import { useAuth } from '../contexts/AuthContext';

const MyComponent = () => {
  const { user, isAuthenticated, login, logout } = useAuth();
  // ...
};
```

### 4. Protected Route (`ProtectedRoute.tsx`)

Route guard that:
- Shows loading spinner while checking auth
- Redirects to `/login` if not authenticated
- Renders children if authenticated

```typescript
<Route path="/protected">
  <ProtectedRoute>
    <ProtectedPage />
  </ProtectedRoute>
</Route>
```

## Authentication Flow

### Registration Flow

1. User fills registration form
2. `register()` called with user data
3. API returns JWT tokens + user data
4. Tokens stored in localStorage
5. User state updated in context
6. Redirect to main app

### Login Flow

1. User enters credentials
2. `login()` called with email/password
3. API validates and returns tokens
4. Tokens stored in localStorage
5. User state updated
6. Redirect to main app

### Token Refresh Flow

1. API request returns 401 Unauthorized
2. Response interceptor catches error
3. Refresh token sent to `/auth/refresh`
4. New access token received
5. Original request retried with new token
6. If refresh fails, redirect to login

### Logout Flow

1. `logout()` called
2. API notified (optional)
3. Tokens cleared from localStorage
4. User state cleared
5. Redirect to login page

## API Integration

### Required Backend Endpoints

Your backend API must implement these endpoints:

#### POST `/api/auth/register`
```json
Request: {
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+1234567890"
}

Response: {
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc...",
  "expires_in": 3600,
  "user": {
    "id": "1",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

#### POST `/api/auth/login`
```json
Request: {
  "email": "john@example.com",
  "password": "password123"
}

Response: {
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc...",
  "expires_in": 3600,
  "user": { ... }
}
```

#### POST `/api/auth/refresh`
```json
Request: {
  "refresh_token": "eyJhbGc..."
}

Response: {
  "access_token": "new_token_here",
  "expires_in": 3600
}
```

#### GET `/api/auth/me`
```json
Headers: {
  "Authorization": "Bearer eyJhbGc..."
}

Response: {
  "user": {
    "id": "1",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "phone": "+1234567890"
  }
}
```

#### POST `/api/auth/logout`
```json
Headers: {
  "Authorization": "Bearer eyJhbGc..."
}

Response: {
  "message": "Logged out successfully"
}
```

## Configuration

### Environment Variables

Create a `.env` file:

```env
VITE_API_URL=http://localhost:5000/api
```

### API Configuration

Edit `src/config/api.config.ts`:

```typescript
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  TIMEOUT: 30000,
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      // ...
    }
  }
};
```

## Security Features

### Token Storage
- Tokens stored in localStorage
- Automatic cleanup on logout
- Cleared on refresh failure

### Token Validation
- JWT expiration checked before requests
- Automatic refresh on expiration
- Redirect to login on invalid tokens

### Request Security
- Authorization header auto-added
- HTTPS recommended for production
- CORS properly configured

### Best Practices Implemented
- ✅ Tokens not exposed in URLs
- ✅ Refresh tokens for long sessions
- ✅ Automatic token rotation
- ✅ Secure storage patterns
- ✅ Error handling for auth failures

## Usage Examples

### Making Authenticated Requests

```typescript
import apiService from '../services/api.service';

// GET request
const ambulances = await apiService.get('/ambulances');

// POST request
const result = await apiService.post('/ambulances/request', {
  location: { lat: 40.7128, lng: -74.0060 }
});
```

### Checking Authentication

```typescript
import { useAuth } from '../contexts/AuthContext';

const MyComponent = () => {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) {
    return <div>Please login</div>;
  }
  
  return <div>Welcome {user?.name}</div>;
};
```

### Manual Login

```typescript
const { login } = useAuth();

try {
  await login({
    email: 'user@example.com',
    password: 'password123'
  });
  // Success - user is now logged in
} catch (error) {
  // Handle error
  console.error(error.message);
}
```

## Installation & Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your API URL
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Build for production**:
   ```bash
   npm run build
   ```

## Testing

### Test User Registration
1. Navigate to `/register`
2. Fill in the form
3. Submit
4. Check localStorage for tokens
5. Verify redirect to main app

### Test Login
1. Navigate to `/login`
2. Enter credentials
3. Submit
4. Verify tokens in localStorage
5. Check user state in React DevTools

### Test Protected Routes
1. Clear localStorage
2. Try accessing `/tabs/tab1`
3. Should redirect to `/login`
4. Login and verify access granted

### Test Token Refresh
1. Login successfully
2. Manually expire access token in localStorage
3. Make an API request
4. Verify token refresh occurs
5. Check new token in localStorage

## Troubleshooting

### "Login failed" Error
- Check API URL in `.env`
- Verify backend is running
- Check network tab for errors
- Verify credentials are correct

### Infinite Redirect Loop
- Clear localStorage
- Check token expiration logic
- Verify refresh endpoint works

### CORS Errors
- Configure backend CORS headers
- Add your domain to allowed origins
- Check preflight requests

### Token Not Sent
- Check request interceptor
- Verify token in localStorage
- Check Authorization header format

## Future Enhancements

- [ ] Biometric authentication
- [ ] Remember me functionality
- [ ] Social login (Google, Facebook)
- [ ] Two-factor authentication
- [ ] Password reset flow
- [ ] Email verification
- [ ] Role-based access control
- [ ] Token encryption
- [ ] Secure storage for mobile (Capacitor Preferences)

## Support

For issues or questions:
1. Check this documentation
2. Review the code comments
3. Check browser console for errors
4. Verify API responses in Network tab
