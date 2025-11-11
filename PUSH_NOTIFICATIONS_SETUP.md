# SignalR Real-Time Notifications Setup Guide

## Issue Fixed ✅
The app was crashing after opening because it was trying to use Firebase Cloud Messaging (FCM) for push notifications, but you're using **SignalR** for real-time updates instead.

### Root Cause
- App was initializing Capacitor's `PushNotifications` plugin which requires Firebase
- No Firebase configuration existed (and isn't needed)
- The plugin crashed when trying to register without Firebase

### Solution
- **Removed** all Firebase/FCM dependencies
- **Removed** Capacitor PushNotifications plugin initialization
- **Implemented** SignalR-based real-time notification system
- App now connects to your backend's SignalR hubs for real-time updates

## Architecture

### Backend (AmbulanceRider API)
Your backend already has SignalR configured with two hubs:
- **`/hubs/notifications`** - General notifications (NotificationHub)
- **`/hubs/trips`** - Trip updates and status changes (TripHub)

### Frontend (This App)
The app now uses:
- **`signalr.service.ts`** - Manages WebSocket connections to SignalR hubs
- **`notification.service.ts`** - Stores and manages notification history
- **AuthContext** - Initializes SignalR on login, disconnects on logout

## How It Works

### 1. User Login Flow
```
User logs in → AuthContext.login()
  ↓
SignalR service initializes
  ↓
Connects to /hubs/notifications
  ↓
Connects to /hubs/trips
  ↓
Real-time updates start flowing
```

### 2. Receiving Notifications
When the backend sends a SignalR message:
```
Backend: hubContext.Clients.All.SendAsync("ReceiveNotification", data)
  ↓
Frontend: signalRService receives event
  ↓
notificationService.addNotification() stores it
  ↓
UI components subscribed to notifications update
```

### 3. User Logout Flow
```
User logs out → AuthContext.logout()
  ↓
SignalR service disconnects
  ↓
All hub connections closed
  ↓
Notification history cleared
```

## Installation

### Install SignalR Client
```powershell
npm install @microsoft/signalr
```

### Sync Capacitor
```powershell
npx cap sync android
```

### Rebuild the App
```powershell
# Open in Android Studio
npx cap open android

# Clean and rebuild
# Build > Clean Project
# Build > Rebuild Project
```

## Configuration

### Environment Variables
Make sure your `.env` file has the correct API URL:
```env
VITE_API_URL=https://your-api-url.com
```

The SignalR service will connect to:
- `https://your-api-url.com/hubs/notifications`
- `https://your-api-url.com/hubs/trips`

### Backend Requirements
Your backend must:
1. ✅ Have SignalR configured (already done)
2. ✅ Have NotificationHub and TripHub (already done)
3. ✅ Accept JWT Bearer tokens for authentication (already done)
4. Send events that match the frontend listeners

## Backend Events

### Notification Hub Events
The frontend listens for:
```csharp
// Backend sends:
await Clients.All.SendAsync("ReceiveNotification", new {
    title = "Notification Title",
    message = "Notification message",
    type = "notification_type",
    data = new { /* additional data */ }
});
```

### Trip Hub Events
The frontend listens for:
```csharp
// Trip created
await Clients.All.SendAsync("TripCreated", tripObject);

// Trip status changed
await Clients.All.SendAsync("TripStatusChanged", new {
    tripId = 123,
    status = "InProgress",
    message = "Trip is now in progress"
});

// Trip updated
await Clients.All.SendAsync("TripUpdated", tripObject);
```

## Usage in Components

### Subscribe to Notifications
```typescript
import { notificationService } from '../services';

function MyComponent() {
  useEffect(() => {
    // Subscribe to new notifications
    const unsubscribe = notificationService.subscribe((notification) => {
      console.log('New notification:', notification);
      // Update UI, show toast, etc.
    });

    // Cleanup on unmount
    return () => unsubscribe();
  }, []);

  // Get all notifications
  const notifications = notificationService.getNotifications();
}
```

### Check SignalR Connection Status
```typescript
import { signalRService } from '../services';

const isConnected = signalRService.getConnectionStatus();
```

### Send Messages to Hub (if needed)
```typescript
import { signalRService } from '../services';

// Example: Send a custom message
await signalRService.sendMessage('trips', 'UpdateLocation', {
  latitude: 123.456,
  longitude: 789.012
});
```

## Files Modified

### Created
- ✅ `src/services/signalr.service.ts` - SignalR connection management
- ✅ `SIGNALR_NOTIFICATIONS_SETUP.md` - This documentation

### Modified
- ✅ `src/services/notification.service.ts` - Simplified to store notifications only
- ✅ `src/services/index.ts` - Export signalRService
- ✅ `src/contexts/AuthContext.tsx` - Initialize/disconnect SignalR on login/logout
- ✅ `src/App.tsx` - Removed PushNotifications initialization
- ✅ `android/app/src/main/AndroidManifest.xml` - Removed POST_NOTIFICATIONS permission

### Removed
- ✅ `android/app/google-services.json` - Not needed (was placeholder)

## Troubleshooting

### SignalR not connecting
1. Check API URL in `.env` file
2. Verify backend is running and accessible
3. Check browser/app console for connection errors
4. Verify JWT token is valid

### Notifications not appearing
1. Check SignalR connection status: `signalRService.getConnectionStatus()`
2. Verify backend is sending events with correct method names
3. Check console logs for received events
4. Ensure component is subscribed to notificationService

### Connection drops frequently
- SignalR has automatic reconnection enabled
- Check network stability
- Verify backend isn't terminating connections

### CORS errors
Your backend already has CORS configured for SignalR:
```csharp
.SetIsOriginAllowed(_ => true); // Allow SignalR connections
```

## Testing

### Test SignalR Connection
1. Login to the app
2. Check console for: `"SignalR initialized after login"`
3. Check console for: `"Connected to notification hub"` and `"Connected to trip hub"`

### Test Notifications
From your backend, send a test notification:
```csharp
await _hubContext.Clients.All.SendAsync("ReceiveNotification", new {
    title = "Test",
    message = "This is a test notification",
    type = "test"
});
```

You should see it in the app console and in `notificationService.getNotifications()`.

## Next Steps

1. ✅ App no longer crashes on startup
2. ✅ SignalR service created and integrated
3. 🔄 Install `@microsoft/signalr` package
4. 🔄 Test SignalR connection after login
5. 🔄 Verify notifications are received from backend
6. 🔄 Build UI components to display notifications
7. 🔄 Add notification badges/indicators in the app

## Additional Resources

- [SignalR JavaScript Client Docs](https://learn.microsoft.com/en-us/aspnet/core/signalr/javascript-client)
- [Your Backend API Docs](../AmbulanceRider/API_DOCUMENTATION.md)
- Backend SignalR Hubs:
  - `../AmbulanceRider/AmbulanceRider.API/Hubs/NotificationHub.cs`
  - `../AmbulanceRider/AmbulanceRider.API/Hubs/TripHub.cs`
