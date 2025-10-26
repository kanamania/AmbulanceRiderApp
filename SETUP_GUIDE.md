# Ambulance Rider App - Setup Guide

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- `axios` - HTTP client for API requests
- `jwt-decode` - JWT token decoding
- All Ionic and React dependencies

### 2. Configure API Endpoint

Copy the example environment file:
```bash
cp .env.example .env
```

Edit `.env` and set your API URL:
```env
VITE_API_URL=http://localhost:8000/api
```

**Important:** Replace `http://localhost:8000/api` with your actual backend API URL.

### 3. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Authentication Setup

### Backend API Requirements

Your backend API must implement these endpoints:

1. **POST** `/api/auth/register` - User registration
2. **POST** `/api/auth/login` - User login
3. **POST** `/api/auth/logout` - User logout
4. **POST** `/api/auth/refresh` - Refresh access token
5. **GET** `/api/auth/me` - Get current user info

See `AUTH_README.md` for detailed API specifications.

### Testing the Authentication

1. **Start the app**: `npm run dev`
2. **Navigate to Register**: Click "Register here" on login page
3. **Create an account**: Fill in the registration form
4. **Login**: Use your credentials to login
5. **Access protected routes**: You should now see the main app with tabs

## Project Structure

```
src/
├── config/
│   └── api.config.ts          # API configuration
├── contexts/
│   └── AuthContext.tsx        # Auth state management
├── services/
│   ├── api.service.ts         # HTTP client
│   └── auth.service.ts        # Auth operations
├── types/
│   └── auth.types.ts          # TypeScript types
├── components/
│   └── ProtectedRoute.tsx     # Route protection
├── pages/
│   ├── Login.tsx              # Login page
│   ├── Register.tsx           # Registration page
│   ├── Profile.tsx            # User profile
│   ├── Tab1.tsx               # Home tab
│   ├── Tab2.tsx               # Services tab
│   └── Tab3.tsx               # History tab
└── App.tsx                    # Main app component
```

## Features Implemented

### ✅ Authentication
- User registration with validation
- User login with JWT tokens
- Automatic token refresh
- Secure logout

### ✅ Authorization
- Protected routes (tabs require authentication)
- Public routes (login, register)
- Automatic redirect to login if not authenticated

### ✅ User Management
- User profile page
- Profile editing
- User data persistence

### ✅ Security
- JWT token storage in localStorage
- Automatic token refresh on expiration
- Request interceptors for auth headers
- Response interceptors for error handling

## Available Routes

### Public Routes
- `/login` - Login page
- `/register` - Registration page

### Protected Routes (require authentication)
- `/tabs/tab1` - Home tab
- `/tabs/tab2` - Services tab
- `/tabs/tab3` - History tab
- `/profile` - User profile page

## Development Workflow

### 1. Making API Calls

Use the `apiService` for all API requests:

```typescript
import apiService from '../services/api.service';

// GET request
const data = await apiService.get('/endpoint');

// POST request
await apiService.post('/endpoint', { key: 'value' });

// PUT request
await apiService.put('/endpoint/:id', { key: 'value' });

// DELETE request
await apiService.delete('/endpoint/:id');
```

### 2. Using Authentication Context

Access auth state in any component:

```typescript
import { useAuth } from '../contexts/AuthContext';

const MyComponent = () => {
  const { user, isAuthenticated, login, logout } = useAuth();
  
  // Use auth state and methods
};
```

### 3. Creating Protected Pages

Wrap routes with `ProtectedRoute`:

```typescript
<Route path="/protected">
  <ProtectedRoute>
    <MyProtectedPage />
  </ProtectedRoute>
</Route>
```

## Building for Production

### Web Build
```bash
npm run build
```

Output will be in the `dist/` directory.

### Mobile Build (iOS/Android)

1. **Add Capacitor platforms**:
```bash
npm install @capacitor/cli @capacitor/core
npx cap init
npx cap add ios
npx cap add android
```

2. **Build and sync**:
```bash
npm run build
npx cap sync
```

3. **Open in native IDE**:
```bash
npx cap open ios
# or
npx cap open android
```

## Troubleshooting

### Cannot connect to API
- Check that your backend is running
- Verify the API URL in `.env`
- Check browser console for CORS errors
- Ensure backend has CORS enabled

### Login/Register not working
- Open browser DevTools → Network tab
- Check the API request/response
- Verify the response format matches expected structure
- Check backend logs for errors

### Tokens not persisting
- Check localStorage in DevTools → Application tab
- Verify tokens are being saved
- Check for localStorage quota issues

### Redirect loop
- Clear localStorage
- Check `ProtectedRoute` logic
- Verify token validation in `auth.service.ts`

## Next Steps

1. **Customize the UI**: Update pages in `src/pages/`
2. **Add more features**: Create new pages and services
3. **Integrate real API**: Update `.env` with production API
4. **Add ambulance features**: Implement ambulance request/tracking
5. **Deploy**: Build and deploy to hosting service

## Additional Resources

- [Ionic Documentation](https://ionicframework.com/docs)
- [React Documentation](https://react.dev)
- [Axios Documentation](https://axios-http.com)
- [JWT.io](https://jwt.io) - JWT debugger

## Support

For detailed authentication documentation, see `AUTH_README.md`.

For general Ionic/React questions, refer to the official documentation.
