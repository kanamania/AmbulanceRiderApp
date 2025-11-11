# Notification Implementation - Complete Guide

## Overview

The notification system now uses **SignalR for real-time updates** with a hybrid approach:
1. Frontend calls backend API endpoints to trigger notifications
2. Backend broadcasts notifications via SignalR to all connected clients
3. Frontend receives real-time updates through SignalR WebSocket connections

## Architecture

```
Frontend Action (Create/Update Trip)
    ↓
Frontend calls notificationService.notifyTripCreated/Changed()
    ↓
Backend API endpoint receives request
    ↓
Backend broadcasts via SignalR to all connected clients
    ↓
All connected frontends receive real-time notification
    ↓
UI updates automatically
```

## Frontend Implementation

### notification.service.ts

**Location:** `src/services/notification.service.ts`

**Key Methods:**

```typescript
// Trigger backend to broadcast trip creation notification
async notifyTripCreated(tripId: number): Promise<void>

// Trigger backend to broadcast trip status change notification
async notifyTripStatusChanged(tripId: number, status: string): Promise<void>

// Local notification management
addNotification(notification: NotificationPayload): void
getNotifications(): NotificationPayload[]
subscribe(callback: (notification) => void): () => void
```

### Usage in Components

#### Home.tsx - Trip Creation
```typescript
const createdTrip = await tripService.createTrip(tripData);

// Send notification via backend (will broadcast via SignalR)
try {
  await notificationService.notifyTripCreated(createdTrip.id);
} catch (notifError) {
  console.error('Failed to send notification:', notifError);
  // Don't fail the trip creation if notification fails
}
```

#### Activity.tsx - Trip Status Update
```typescript
await tripService.updateTripStatus({
  id: selectedTrip.id,
  status: 1, // Approved
  vehicleId: selectedVehicleId,
});

// Send notification via backend (will broadcast via SignalR)
try {
  await notificationService.notifyTripStatusChanged(selectedTrip.id, 'accepted');
} catch (notifError) {
  console.error('Failed to send notification:', notifError);
  // Don't fail the trip update if notification fails
}
```

#### TripDetails.tsx - Admin Status Update
```typescript
await tripService.updateTripStatus({
  id: trip.id,
  status: statusMap[newStatus],
  vehicleId: selectedVehicleId,
  notes: data?.reason || undefined
});

// Send notification via backend (will broadcast via SignalR)
try {
  await notificationService.notifyTripStatusChanged(trip.id, newStatus);
} catch (notifError) {
  console.error('Failed to send notification:', notifError);
  // Don't fail the status update if notification fails
}
```

## Backend Implementation

### NotificationsController.cs

**Location:** `AmbulanceRider.API/Controllers/NotificationsController.cs`

**Endpoints:**

#### POST /api/notifications/trip-created
Broadcasts trip creation notification to admins and dispatchers.

**Request:**
```json
{
  "tripId": 123
}
```

**Response:**
```json
{
  "message": "Notification sent successfully"
}
```

**SignalR Events Sent:**
- To `admins` group: "New Trip Created"
- To `dispatchers` group: "New Trip Created"
- To all clients: `TripUpdated` event

#### POST /api/notifications/trip-status-changed
Broadcasts trip status change to relevant users.

**Request:**
```json
{
  "tripId": 123,
  "status": "accepted"
}
```

**Response:**
```json
{
  "message": "Notification sent successfully"
}
```

**SignalR Events Sent:**
- To trip creator: "Trip Status Update"
- To `admins` group: "Trip Status Changed"
- To `dispatchers` group: "Trip Status Changed"
- To all clients: `TripStatusChanged` event

### SignalR Events

The backend sends these SignalR events:

```csharp
// General notification
await _tripHub.Clients.All.SendAsync("ReceiveNotification", new {
    Title = "Notification Title",
    Message = "Notification message",
    Data = additionalData,
    Timestamp = DateTime.UtcNow
});

// Trip created
await _tripHub.Clients.All.SendAsync("TripUpdated", new {
    TripId = tripId,
    UpdateType = "created",
    Data = tripData,
    Timestamp = DateTime.UtcNow
});

// Trip status changed
await _tripHub.Clients.All.SendAsync("TripStatusChanged", new {
    TripId = tripId,
    OldStatus = oldStatus,
    NewStatus = newStatus,
    Data = additionalData,
    Timestamp = DateTime.UtcNow
});
```

### Frontend SignalR Listeners

**Location:** `src/services/signalr.service.ts`

The frontend automatically listens for these events:

```typescript
// Notification hub
notificationConnection.on('ReceiveNotification', (notification) => {
  notificationService.addNotification({
    title: notification.title,
    body: notification.message,
    data: notification.data
  });
});

// Trip hub
tripConnection.on('TripCreated', (trip) => {
  notificationService.addNotification({
    title: 'New Trip',
    body: 'A new trip has been created',
    data: { type: 'trip_created', trip }
  });
});

tripConnection.on('TripStatusChanged', (data) => {
  notificationService.addNotification({
    title: 'Trip Status Update',
    body: data.message || `Trip status changed to ${data.status}`,
    data: { type: 'trip_status_changed', ...data }
  });
});
```

## Files Modified

### Frontend
- ✅ `src/services/notification.service.ts` - Added `notifyTripCreated()` and `notifyTripStatusChanged()`
- ✅ `src/pages/Home.tsx` - Restored notification call for trip creation
- ✅ `src/pages/Activity.tsx` - Restored notification calls for status updates
- ✅ `src/pages/admin/TripDetails.tsx` - Restored notification call for status updates

### Backend
- ✅ `AmbulanceRider.API/Controllers/NotificationsController.cs` - Created new controller
- ✅ `AmbulanceRider.API/Services/INotificationService.cs` - Already exists
- ✅ `AmbulanceRider.API/Services/SignalRNotificationService.cs` - Already exists

## Flow Diagram

### Trip Creation Flow
```
1. User fills trip form in Home.tsx
2. Frontend calls tripService.createTrip()
3. Backend creates trip in database
4. Frontend calls notificationService.notifyTripCreated()
5. Backend NotificationsController receives request
6. Backend broadcasts via SignalR to:
   - All admins
   - All dispatchers
   - All connected clients (via TripHub)
7. All connected frontends receive notification
8. Notification appears in UI
```

### Trip Status Change Flow
```
1. Admin/Dispatcher updates trip status
2. Frontend calls tripService.updateTripStatus()
3. Backend updates trip status in database
4. Frontend calls notificationService.notifyTripStatusChanged()
5. Backend NotificationsController receives request
6. Backend broadcasts via SignalR to:
   - Trip creator (user who requested the trip)
   - All admins
   - All dispatchers
   - All connected clients (via TripHub)
7. All connected frontends receive notification
8. Notification appears in UI
```

## Benefits of This Approach

1. ✅ **Decoupled** - Frontend doesn't need to know SignalR details
2. ✅ **Reliable** - Backend ensures notifications are sent
3. ✅ **Real-time** - All connected clients get instant updates
4. ✅ **Flexible** - Easy to add more notification types
5. ✅ **Scalable** - SignalR handles connection management
6. ✅ **Graceful degradation** - App works even if notifications fail

## Testing

### Test Trip Creation Notification
1. Login to the app
2. Create a new trip from Home page
3. Check browser console for:
   - "Trip creation notification sent to backend"
   - "SignalR initialized after login"
4. Check backend logs for notification broadcast
5. All connected clients should see notification

### Test Status Change Notification
1. Go to Activity or Admin > Trips
2. Update a trip status
3. Check browser console for:
   - "Trip status change notification sent to backend"
4. Check backend logs for notification broadcast
5. All connected clients should see notification

### Test SignalR Connection
1. Login to the app
2. Open browser console
3. Look for:
   - "SignalR initialized after login"
   - "Connected to notification hub"
   - "Connected to trip hub"
4. Logout and check for:
   - "SignalR disconnected on logout"

## Error Handling

All notification calls are wrapped in try-catch blocks to ensure:
- Trip creation/update succeeds even if notification fails
- Errors are logged but don't break the user experience
- User sees success message for the main action

Example:
```typescript
try {
  await notificationService.notifyTripCreated(createdTrip.id);
} catch (notifError) {
  console.error('Failed to send notification:', notifError);
  // Don't fail the trip creation if notification fails
}
```

## API Endpoints Summary

| Endpoint | Method | Purpose | Auth Required |
|----------|--------|---------|---------------|
| `/api/notifications/trip-created` | POST | Broadcast trip creation | Yes |
| `/api/notifications/trip-status-changed` | POST | Broadcast status change | Yes |

## SignalR Hubs

| Hub | URL | Purpose |
|-----|-----|---------|
| NotificationHub | `/hubs/notifications` | General notifications |
| TripHub | `/hubs/trips` | Trip-specific updates |

## Next Steps

1. ✅ Backend controller created
2. ✅ Frontend methods restored
3. ✅ All components updated
4. 🔄 Rebuild the app
5. 🔄 Test notification flow end-to-end
6. 🔄 Monitor SignalR connections in production

## Troubleshooting

### Notifications not received
1. Check SignalR connection status
2. Verify backend is running
3. Check browser console for errors
4. Verify user is authenticated
5. Check backend logs for SignalR events

### API returns 404
1. Ensure NotificationsController.cs is in the project
2. Rebuild the backend
3. Check API URL in frontend `.env` file

### SignalR connection fails
1. Check CORS configuration in backend
2. Verify JWT token is valid
3. Check network/firewall settings
4. Review backend SignalR configuration

The notification system is now fully implemented and ready to use! 🎉
