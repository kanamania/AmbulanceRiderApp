# Admin Controls for Locations and Trip Types

## Overview
This document describes the admin/dispatcher controls for managing locations and trip types in the Global Express.

## Implementation Summary

### 1. Location Management (`/admin/locations`)
**Access**: Admin only

**Features**:
- ✅ View all locations with search functionality
- ✅ Create new locations
- ✅ Edit existing locations
- ✅ Delete locations
- ✅ Pull-to-refresh support
- ✅ Fully internationalized (English & Swahili)

**File**: `src/pages/admin/LocationManagement.tsx`

**Navigation**: 
- Settings page → Admin Controls → Locations
- Direct URL: `/admin/locations`

**API Endpoints**:
- `GET /locations` - List all locations
- `POST /locations` - Create location
- `PUT /locations/:id` - Update location
- `DELETE /locations/:id` - Delete location

### 2. Trip Type Management (`/admin/trip-types`)
**Access**: Admin only

**Features**:
- ✅ View all trip types with search functionality
- ✅ Create new trip types with:
  - Name
  - Description
  - Color (for UI theming)
  - Display order
  - Active/Inactive status
- ✅ Edit existing trip types
- ✅ Delete trip types
- ✅ View attribute count for each trip type
- ✅ Pull-to-refresh support
- ✅ Fully internationalized (English & Swahili)

**File**: `src/pages/admin/TripTypeManagement.tsx`

**Navigation**: 
- Settings page → Admin Controls → Trip Types
- Direct URL: `/admin/trip-types`

**API Endpoints**:
- `GET /triptypes` - List all trip types
- `GET /triptypes/active` - List active trip types
- `POST /triptypes` - Create trip type
- `PUT /triptypes/:id` - Update trip type
- `DELETE /triptypes/:id` - Delete trip type
- `POST /triptypes/attributes` - Create attribute
- `PUT /triptypes/attributes/:id` - Update attribute
- `DELETE /triptypes/attributes/:id` - Delete attribute

## Settings Page Integration

The Settings page (`src/pages/Settings.tsx`) now includes navigation links for both admin controls:

### Admin Controls Section
For Admin users, the following menu items are available:
1. **Dashboard** - System statistics and analytics
2. **Users** - User and role management (Admin only)
3. **Vehicles** - Fleet management
4. **Trip Management** - View and manage all trips
5. **Locations** - Manage pickup/destination locations (Admin only) ⭐ NEW
6. **Trip Types** - Configure trip types and attributes (Admin only) ⭐ NEW
7. **System Settings** - System preferences (Admin only)

### Icons Used
- **Locations**: `location` icon from ionicons
- **Trip Types**: `list` icon from ionicons

## Translation Keys Added

### English (`src/locales/en.json`)
```json
"location": {
  "noLocations": "No locations found",
  "noLocationsMessage": "Add locations to manage pickup and destination points"
},
"tripType": {
  "tripTypes": "Trip Types",
  "addTripType": "Add Trip Type",
  "editTripType": "Edit Trip Type",
  "deleteTripType": "Delete Trip Type",
  "tripTypeName": "Trip Type Name",
  "tripTypeDescription": "Description",
  "tripTypeColor": "Color",
  "tripTypeIcon": "Icon",
  "displayOrder": "Display Order",
  "attributes": "Attributes",
  "noTripTypes": "No trip types found",
  "noTripTypesMessage": "Add trip types to categorize your trips",
  "tripTypeCreated": "Trip type created successfully",
  "tripTypeUpdated": "Trip type updated successfully",
  "tripTypeDeleted": "Trip type deleted successfully"
}
```

### Swahili (`src/locales/sw.json`)
```json
"location": {
  "noLocations": "Hakuna maeneo",
  "noLocationsMessage": "Ongeza maeneo ili kusimamia sehemu za kuchukua na marudio"
},
"tripType": {
  "tripTypes": "Aina za Safari",
  "addTripType": "Ongeza Aina ya Safari",
  "editTripType": "Hariri Aina ya Safari",
  "deleteTripType": "Futa Aina ya Safari",
  "tripTypeName": "Jina la Aina ya Safari",
  "tripTypeDescription": "Maelezo",
  "tripTypeColor": "Rangi",
  "tripTypeIcon": "Ikoni",
  "displayOrder": "Mpangilio wa Kuonyesha",
  "attributes": "Sifa",
  "noTripTypes": "Hakuna aina za safari",
  "noTripTypesMessage": "Ongeza aina za safari ili kuweka safari zako katika makundi",
  "tripTypeCreated": "Aina ya safari imeundwa kwa mafanikio",
  "tripTypeUpdated": "Aina ya safari imesasishwa kwa mafanikio",
  "tripTypeDeleted": "Aina ya safari imefutwa kwa mafanikio"
}
```

## Routes Configuration

Both routes are protected and only accessible to Admin users:

```typescript
// Location Management
<Route path="locations" element={
  <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
    <LocationManagement />
  </ProtectedRoute>
} />

// Trip Type Management
<Route path="trip-types" element={
  <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
    <TripTypeManagement />
  </ProtectedRoute>
} />
```

## Services

### Location Service (`src/services/location.service.ts`)
- `getAllLocations()` - Fetch all locations
- `getLocationById(id)` - Get single location
- `createLocation(data)` - Create new location
- `updateLocation(id, data)` - Update location
- `deleteLocation(id)` - Delete location

### Trip Type Service (`src/services/tripType.service.ts`)
- `getAllTripTypes()` - Fetch all trip types with attributes
- `getActiveTripTypes()` - Fetch only active trip types
- `getTripTypeById(id)` - Get single trip type
- `createTripType(data)` - Create new trip type
- `updateTripType(id, data)` - Update trip type
- `deleteTripType(id)` - Delete trip type
- `createAttribute(data)` - Create trip type attribute
- `updateAttribute(id, data)` - Update attribute
- `deleteAttribute(id)` - Delete attribute

## User Experience

### Location Management
1. Navigate to Settings → Admin Controls → Locations
2. View list of all locations with search
3. Click "Add Location" to create new location
4. Click edit icon to modify existing location
5. Click delete icon to remove location (with confirmation)
6. Pull down to refresh the list

### Trip Type Management
1. Navigate to Settings → Admin Controls → Trip Types
2. View list of all trip types with:
   - Color-coded badges
   - Active/Inactive status
   - Attribute count
   - Display order
3. Click "Add Trip Type" to create new type
4. Configure:
   - Name (required)
   - Description
   - Color (for UI theming)
   - Display order
   - Active status
5. Click edit icon to modify existing trip type
6. Click delete icon to remove trip type (with confirmation)
7. Pull down to refresh the list

## Testing Checklist

- [ ] Admin can access both Locations and Trip Types pages
- [ ] Non-admin users cannot access these pages
- [ ] Dispatcher users cannot access these pages (Admin only)
- [ ] Create, Read, Update, Delete operations work for locations
- [ ] Create, Read, Update, Delete operations work for trip types
- [ ] Search functionality works on both pages
- [ ] Pull-to-refresh works on both pages
- [ ] All translations display correctly in English
- [ ] All translations display correctly in Swahili
- [ ] Navigation from Settings page works correctly
- [ ] Empty states display when no data exists
- [ ] Confirmation dialogs appear before deletion
- [ ] Success/error toasts display appropriately

## Notes

- Both pages follow the same design pattern as VehicleManagement for consistency
- All user-facing text is internationalized
- Both pages use the AdminLayout component
- Error handling is implemented with user-friendly toast messages
- The pages are responsive and work on mobile and desktop
- Color picker is available for trip type customization
- Trip types support dynamic attributes (managed separately)

## Future Enhancements

- Add image upload support for locations
- Add icon picker for trip types (currently uses default list icon)
- Add bulk operations (delete multiple items)
- Add export/import functionality
- Add sorting options
- Add filtering by active/inactive status
- Add trip type attribute management UI
- Add location coordinates/map integration
