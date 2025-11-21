# Authentication Check for Data Hash Sync

## Summary
Added authentication checks to prevent data hash API calls when user is not logged in.

## Changes Made

### 1. SyncService (`src/services/sync.service.ts`)

#### Added Authentication Check Method
```typescript
/**
 * Check if user is authenticated
 */
private isAuthenticated(): boolean {
  const token = localStorage.getItem('token');
  return !!token;
}
```

#### Updated performInitialSync()
```typescript
async performInitialSync(): Promise<void> {
  // Check if user is authenticated
  if (!this.isAuthenticated()) {
    console.warn('Cannot sync: User is not authenticated');
    return; // Exit early without throwing error
  }

  if (this.syncInProgress) {
    throw new Error('Sync already in progress');
  }

  if (!this.isOnline) {
    throw new Error('Device is offline');
  }

  // ... rest of sync logic
}
```

#### Updated fetchDataHashes()
```typescript
/**
 * Fetch data hashes from API
 * Requires authentication
 */
private async fetchDataHashes(): Promise<DataHashResponse> {
  if (!this.isAuthenticated()) {
    throw new Error('User must be authenticated to fetch data hashes');
  }
  return await apiService.get<DataHashResponse>('/auth/data-hashes');
}
```

### 2. BackgroundSyncService (`src/services/backgroundSync.service.ts`)

#### Updated performPeriodicSync()
```typescript
private async performPeriodicSync(): Promise<void> {
  // Check if user is authenticated
  const token = localStorage.getItem('token');
  if (!token) {
    console.log('User not authenticated, skipping periodic sync');
    return; // Exit early
  }

  if (!navigator.onLine) {
    console.log('Device is offline, skipping periodic sync');
    return;
  }

  try {
    console.log('Performing periodic sync check');
    await syncService.performInitialSync();
  } catch (error) {
    console.error('Periodic sync failed:', error);
  }
}
```

## Behavior

### Before Changes ❌
- Data hash API called even when user not logged in
- 401 Unauthorized errors in console
- Unnecessary API requests
- Poor user experience

### After Changes ✅
- Authentication checked before API call
- Early exit if no token found
- No unnecessary API requests
- Clean console logs
- Better error handling

## Flow Diagram

```
┌─────────────────────────────────────┐
│  Sync Triggered                     │
│  (Initial/Periodic/Background)      │
└──────────────┬──────────────────────┘
               │
               ▼
        ┌──────────────┐
        │ Check Token  │
        │ in Storage   │
        └──────┬───────┘
               │
        ┌──────┴──────┐
        │             │
    No Token      Has Token
        │             │
        ▼             ▼
   ┌────────┐   ┌──────────┐
   │ Log &  │   │ Continue │
   │ Return │   │ Sync     │
   └────────┘   └──────────┘
                     │
                     ▼
              ┌──────────────┐
              │ Fetch Hashes │
              │ from API     │
              └──────────────┘
```

## Console Output

### When Not Authenticated
```
User not authenticated, skipping periodic sync
Cannot sync: User is not authenticated
```

### When Authenticated
```
Performing periodic sync check
Fetching data hashes from API
Initial sync completed successfully
```

## Use Cases

### 1. App Startup (Not Logged In)
```typescript
// User opens app without being logged in
backgroundSyncService.start();
// Output: "User not authenticated, skipping periodic sync"
// No API call made ✅
```

### 2. After Login
```typescript
// User logs in
await authService.login(credentials);
// Token stored in localStorage
await syncService.performInitialSync();
// Output: "Performing initial sync"
// API call made ✅
```

### 3. After Logout
```typescript
// User logs out
await authService.logout();
// Token removed from localStorage
backgroundSyncService.stop(); // Should stop background sync
// No more API calls ✅
```

### 4. Periodic Background Sync
```typescript
// Every 5 minutes
setInterval(() => {
  performPeriodicSync();
  // Checks token first
  // Only syncs if authenticated
}, 5 * 60 * 1000);
```

## Security Benefits

✅ **Prevents Unauthorized Requests**
- No API calls without valid token
- Reduces 401 errors

✅ **Better Resource Management**
- No wasted API calls
- Reduced network traffic
- Better battery life on mobile

✅ **Improved User Experience**
- Clean console logs
- No confusing error messages
- Faster app performance

✅ **Proper Error Handling**
- Graceful exit when not authenticated
- Clear log messages
- No thrown errors for expected behavior

## Testing

### Test 1: Not Logged In
```typescript
// Clear token
localStorage.removeItem('token');

// Try to sync
await syncService.performInitialSync();
// Expected: Returns immediately with warning log
// Expected: No API call made
```

### Test 2: Logged In
```typescript
// Set token
localStorage.setItem('token', 'valid-jwt-token');

// Try to sync
await syncService.performInitialSync();
// Expected: API call made
// Expected: Hashes fetched and stored
```

### Test 3: Background Sync
```typescript
// Start background sync without login
backgroundSyncService.start();
// Wait 30 seconds
// Expected: "User not authenticated, skipping periodic sync"
// Expected: No API calls

// Login
await authService.login(credentials);
// Wait 30 seconds
// Expected: "Performing periodic sync check"
// Expected: API call made
```

### Test 4: Token Expiry
```typescript
// Token expires during session
// Next sync attempt
await syncService.performInitialSync();
// Expected: API returns 401
// Expected: Auth service handles token refresh or logout
```

## Integration Points

### AuthContext
Should stop background sync on logout:
```typescript
const logout = async () => {
  await authService.logout();
  backgroundSyncService.stop(); // Stop background sync
  clearStoredHashes(); // Clear stored hashes
  setUser(null);
};
```

### App Initialization
Should start background sync after login:
```typescript
useEffect(() => {
  if (isAuthenticated && user) {
    backgroundSyncService.start();
    syncService.performInitialSync();
  } else {
    backgroundSyncService.stop();
  }
}, [isAuthenticated, user]);
```

## Related Files

- `src/services/sync.service.ts` - Main sync service
- `src/services/backgroundSync.service.ts` - Background sync service
- `src/services/api.service.ts` - API service with token interceptor
- `src/contexts/AuthContext.tsx` - Authentication context
- `src/utils/hash.util.ts` - Hash utilities

## Future Enhancements

1. **Token Validation**
   - Check token expiry before sync
   - Refresh token if needed

2. **Retry Logic**
   - Retry failed syncs with exponential backoff
   - Handle network errors gracefully

3. **Sync Queue**
   - Queue sync requests when offline
   - Process queue when online

4. **Selective Sync**
   - Sync only changed data
   - Reduce bandwidth usage

---

**Status:** ✅ Implemented  
**Impact:** Prevents unnecessary API calls when not authenticated  
**Breaking Changes:** None  
**Migration Required:** None
