# End User Documentation

**Last Updated:** 2025-12-04T09:30:00+03:00  
**Version:** 0.0.22

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Authentication](#authentication)
3. [Dashboard](#dashboard)
4. [Trip Management](#trip-management)
5. [Admin Panel](#admin-panel)
6. [Settings](#settings)
7. [Troubleshooting](#troubleshooting)

---

## Getting Started

### System Requirements

| Platform | Minimum Requirements |
|----------|---------------------|
| **Web** | Chrome 90+, Firefox 88+, Safari 14+, Edge 90+ |
| **Android** | Android 8.0+ (API 26+) |
| **iOS** | iOS 13+ |

### Installation

#### Web
Navigate to the application URL in your browser.

#### Android
1. Download APK from provided link or Google Play Store
2. Enable "Install from unknown sources" if needed
3. Install and open the app

#### iOS
1. Download from App Store
2. Install and open the app

### First Login
1. Open the application
2. Enter email and password provided by administrator
3. Tap **Login**
4. Update your profile and change password (recommended)

---

## Authentication

### Login
1. Enter your registered email
2. Enter your password
3. Tap **Login**

### Registration
1. Tap **Create Account** on login screen
2. Fill in required fields:
   - First Name
   - Last Name
   - Email
   - Phone Number
   - Password (min 8 characters)
3. Tap **Register**

### Forgot Password
1. Tap **Forgot Password?** on login screen
2. Enter your registered email
3. Check email for reset link
4. Follow link to set new password

### Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

---

## Dashboard

The home screen shows your activity overview.

### User Dashboard
| Widget | Description |
|--------|-------------|
| **My Trips** | Your recent and active trips |
| **Pending Approval** | Trips awaiting admin approval |
| **Quick Actions** | Create trip, view history |

### Admin Dashboard
| Widget | Description |
|--------|-------------|
| **Total Trips** | All trips in system |
| **Active Trips** | Currently in-progress trips |
| **Pending Trips** | Trips awaiting approval |
| **Users** | Total registered users |
| **Vehicles** | Active vehicles |

---

## Trip Management

### Trip Status Flow

```
Pending → Approved → In Progress → Completed
    ↓         ↓           ↓
 Rejected  Cancelled   Cancelled
```

### Creating a Trip

1. Navigate to **Trips** tab
2. Tap **+ New Trip**
3. Fill in trip details:
   - **Trip Name** - Descriptive name
   - **Trip Type** - Select category
   - **From Location** - Tap map or enter address
   - **To Location** - Tap map or enter address
   - **Scheduled Time** - When trip should start
   - **Description** - Optional notes
4. Add dimensions if applicable (for pricing)
5. Tap **Create Trip**

### Trip Types
Dynamic trip types configured by admin:

| Type | Description |
|------|-------------|
| Emergency | Urgent medical transport |
| Routine | Scheduled transport |
| Transfer | Inter-facility transfer |
| Delivery | Package delivery |

### Managing Your Trips

#### View Trip Details
1. Go to **Trips** tab
2. Tap on any trip card
3. View full details, status history

#### Cancel a Trip
1. Open trip details
2. Tap **Cancel Trip**
3. Enter cancellation reason
4. Confirm

#### Start a Trip (Drivers)
1. Open assigned approved trip
2. Tap **Start Trip**
3. GPS location is recorded

#### Complete a Trip
1. Open in-progress trip
2. Tap **Complete Trip**
3. Add optional notes
4. Confirm completion

### Trip Filters
Filter trips by:
- Status (Pending, Approved, In Progress, Completed, Cancelled)
- Date range
- Trip type

---

## Admin Panel

*Available to Admin and Dispatcher roles only*

### Accessing Admin Panel
1. Tap menu icon (☰)
2. Select **Admin**

### User Management

#### View Users
Navigate to **Admin** → **Users**

#### Create User
1. Tap **+ Add User**
2. Fill in user details
3. Assign roles
4. Tap **Create**

#### Edit User
1. Find user in list
2. Tap **Edit**
3. Modify fields
4. Tap **Save**

#### User Roles

| Role | Permissions |
|------|-------------|
| **Admin** | Full system access |
| **Dispatcher** | Trip management, approvals |
| **Driver** | Execute assigned trips |
| **User** | Create and manage own trips |

### Vehicle Management

#### View Vehicles
Navigate to **Admin** → **Vehicles**

#### Add Vehicle
1. Tap **+ Add Vehicle**
2. Enter vehicle details:
   - Name
   - Plate Number
   - Vehicle Type
   - Image (optional)
3. Assign drivers
4. Tap **Save**

#### Assign Drivers to Vehicle
1. Edit vehicle
2. Select drivers from list
3. Save changes

### Trip Approval

#### Approve a Trip
1. Go to **Admin** → **Trips** → **Pending**
2. Review trip details
3. Select vehicle and driver
4. Tap **Approve**

#### Reject a Trip
1. Open pending trip
2. Tap **Reject**
3. Enter rejection reason
4. Confirm

### Location Management
Navigate to **Admin** → **Locations**

- Add/edit/delete predefined locations
- Locations appear in trip location selection

### Trip Type Management
Navigate to **Admin** → **Trip Types**

- Configure trip categories
- Add custom attributes per type

---

## Settings

### Profile Settings
1. Tap profile icon or **Settings**
2. Update personal information:
   - Name
   - Phone number
   - Profile picture

### Change Password
1. Go to **Settings** → **Security**
2. Enter current password
3. Enter new password (twice)
4. Tap **Update Password**

### Language
1. Go to **Settings** → **Language**
2. Select preferred language
3. App restarts with new language

### Theme
1. Go to **Settings** → **Appearance**
2. Choose:
   - Light Mode
   - Dark Mode
   - System Default

### Notifications
1. Go to **Settings** → **Notifications**
2. Toggle notification types:
   - Trip updates
   - Approval requests
   - System alerts

---

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Cannot login | Verify email/password, check internet connection |
| Session expired | Login again (tokens expire after 24 hours) |
| Map not loading | Enable location permissions, check internet |
| Trip not saving | Check all required fields, verify internet |
| Notifications not working | Enable in device settings and app settings |

### Error Messages

| Error | Meaning | Action |
|-------|---------|--------|
| 401 Unauthorized | Session expired | Login again |
| 403 Forbidden | No permission | Contact admin |
| 404 Not Found | Resource doesn't exist | Refresh page |
| Network Error | No internet | Check connection |

### Clearing Cache
If experiencing issues:
1. Go to **Settings** → **About**
2. Tap **Clear Cache**
3. Login again

### Contact Support
- Email: support@globalexpress.co.tz
- Phone: Contact your administrator

---

## Keyboard Shortcuts (Web)

| Shortcut | Action |
|----------|--------|
| `Ctrl + N` | New trip |
| `Ctrl + S` | Save form |
| `Esc` | Close modal |
| `Enter` | Submit form |

---

## Mobile Gestures

| Gesture | Action |
|---------|--------|
| Pull down | Refresh list |
| Swipe left/right | Navigate tabs |
| Long press | Context menu |

---

## Privacy & Data

### Data Collection
- Location data (with permission) for trip tracking
- Device information for telemetry
- Usage analytics for improvements

### Data Storage
- Credentials stored securely in device keychain
- Trip data cached locally for offline access
- Syncs with server when online

### Permissions Required

| Permission | Purpose |
|------------|---------|
| Location | Trip tracking, map features |
| Camera | Profile picture, vehicle images |
| Notifications | Trip updates, alerts |
| Storage | Cache, offline data |
