# SignalR Quick Start Guide

## The Fix - What Changed

**Problem**: App crashed after opening because it tried to use Firebase push notifications (which you don't use).

**Solution**: Removed Firebase dependencies and implemented SignalR for real-time notifications from your backend.

## Rebuild Steps

```powershell
# 1. Sync Capacitor
npx cap sync android

# 2. Open in Android Studio
npx cap open android

# 3. In Android Studio:
#    - Build > Clean Project
#    - Build > Rebuild Project
#    - Run on device/emulator
```

## What Happens Now

### ✅ On App Start
- No more crash!
- App opens normally without requesting notification permissions

### ✅ On User Login
- SignalR automatically connects to your backend
- Establishes WebSocket connections to:
  - `/hubs/notifications`
  - `/hubs/trips`

### ✅ Real-Time Updates
- Backend sends SignalR events
- App receives them instantly
- Notifications stored in `notificationService`
- UI can subscribe and display them

### ✅ On User Logout
- SignalR disconnects cleanly
- No lingering connections

## Backend Events to Send

Your backend can send these events (examples):

### General Notification
```csharp
await _notificationHub.Clients.All.SendAsync("ReceiveNotification", new {
    title = "New Trip Assigned",
    message = "You have been assigned to Trip #123",
    type = "trip_assignment",
    data = new { tripId = 123 }
});
```

### Trip Status Changed
```csharp
await _tripHub.Clients.All.SendAsync("TripStatusChanged", new {
    tripId = 123,
    status = "InProgress",
    message = "Trip is now in progress"
});
```

### Trip Created
```csharp
await _tripHub.Clients.All.SendAsync("TripCreated", tripObject);
```

## Testing

1. **Build and run the app** - Should open without crashing
2. **Login** - Check console for "SignalR initialized after login"
3. **Send test notification from backend** - Should appear in app
4. **Logout** - Check console for "SignalR disconnected on logout"

## Key Files

- **`src/services/signalr.service.ts`** - Manages SignalR connections
- **`src/services/notification.service.ts`** - Stores notifications
- **`src/contexts/AuthContext.tsx`** - Initializes SignalR on login
- **`PUSH_NOTIFICATIONS_SETUP.md`** - Full documentation

## Environment Check

Verify your `.env` file has:
```env
VITE_API_URL=https://your-backend-url.com
```

SignalR will connect to:
- `https://your-backend-url.com/hubs/notifications`
- `https://your-backend-url.com/hubs/trips`

## Common Issues

### "SignalR not connecting"
- Check if backend is running
- Verify API URL in `.env`
- Check if user is logged in (SignalR needs JWT token)

### "Still crashing"
- Run `npx cap sync android`
- Clean and rebuild in Android Studio
- Check Android Studio logcat for errors

## Next Steps

1. ✅ Rebuild the app
2. Test login/logout flow
3. Send test notifications from backend
4. Build UI to display notifications (optional)
5. Add notification badges/indicators (optional)

That's it! The app should now work without crashing. 🎉
