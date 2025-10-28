# Vite Environment Variable Fix

## Issue
```
Uncaught ReferenceError: process is not defined
    at api.config.ts:4:13
```

## Root Cause
The application was using `process.env` which is a Node.js API that doesn't exist in the browser environment. Vite uses `import.meta.env` instead.

## Files Fixed

### 1. `src/config/api.config.ts`
**Before:**
```typescript
BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
```

**After:**
```typescript
BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
```

### 2. `src/services/dashboard.service.ts`
**Before:**
```typescript
if (process.env.NODE_ENV === 'development') {
```

**After:**
```typescript
if (import.meta.env.DEV) {
```

## Vite Environment Variables Reference

### Built-in Variables
- `import.meta.env.MODE` - The mode the app is running in (development, production, etc.)
- `import.meta.env.DEV` - Boolean, true in development
- `import.meta.env.PROD` - Boolean, true in production
- `import.meta.env.SSR` - Boolean, true if running in server-side rendering

### Custom Variables
All custom environment variables must be prefixed with `VITE_`:
- ✅ `VITE_API_URL`
- ✅ `VITE_APP_NAME`
- ✅ `VITE_APP_VERSION`
- ❌ `REACT_APP_API_URL` (Create React App convention, not for Vite)

## Environment File
The `.env.example` file already uses the correct naming:
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME="Ambulance Rider App"
VITE_APP_VERSION=1.0.0
```

## Status
✅ **Fixed** - Application should now run without the `process is not defined` error.

## Next Steps
1. Ensure you have a `.env` file (copy from `.env.example` if needed)
2. Restart the development server if it's running
3. The application should now load correctly
