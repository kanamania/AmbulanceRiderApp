# Dynamic Trip Types Feature - Implementation Guide

## Overview
The trip booking form now supports **dynamic custom attributes** based on trip types. Trip types and their attributes are fetched from the backend API upon login and stored for the session.

## Features Implemented

### 1. **Trip Type Management**
- Trip types are fetched automatically on login
- Stored in AuthContext for global access
- Cached in localStorage for persistence
- Refreshed in background on app initialization

### 2. **Dynamic Form Fields**
The system supports 6 different data types for custom attributes:
- **text** - Single-line text input
- **textarea** - Multi-line text input
- **number** - Numeric input with min/max validation
- **date** - Date picker with calendar interface
- **boolean** - Checkbox for yes/no values
- **select** - Dropdown with predefined options

### 3. **Attribute Configuration**
Each attribute can have:
- **Label**: Display name for the field
- **Description**: Help text shown below the field
- **Placeholder**: Hint text in the input
- **Required**: Whether the field must be filled
- **Validation Rules**: JSON-based rules (e.g., min/max for numbers)
- **Options**: JSON array for select dropdowns
- **Display Order**: Controls the order of fields
- **Active Status**: Show/hide attributes

## Implementation Details

### New Files Created

#### 1. `src/services/tripType.service.ts`
Service for fetching trip types from the API:
```typescript
- getAllTripTypes(): Get all trip types
- getActiveTripTypes(): Get only active trip types
- getTripTypeById(id): Get specific trip type with attributes
```

#### 2. `src/components/DynamicFormField.tsx`
Reusable component that renders form fields based on attribute data type:
- Automatically handles different input types
- Parses validation rules and options
- Shows descriptions and required indicators
- Supports all 6 data types

### Modified Files

#### 1. `src/types/index.ts`
Added new interfaces:
- `TripTypeAttribute`: Defines custom attribute structure
- `TripType`: Trip type with array of attributes
- Updated `Trip` and `CreateTripData` to include `tripTypeId` and `attributeValues`

#### 2. `src/types/auth.types.ts`
- Added `tripTypes: TripType[]` to `AuthContextType`

#### 3. `src/contexts/AuthContext.tsx`
Enhanced to manage trip types:
- Fetches trip types on login
- Loads cached trip types on app initialization
- Clears trip types on logout
- Stores in localStorage for persistence

#### 4. `src/pages/Home.tsx`
Major enhancements:
- Added trip type selection dropdown
- Dynamic "Additional Information" section
- Renders custom attributes based on selected trip type
- Validates required attributes before submission
- Includes `tripTypeId` and `attributeValues` in trip creation

#### 5. `src/config/api.config.ts`
Added trip type endpoints:
```typescript
TRIP_TYPES: {
  LIST: '/triptypes',
  ACTIVE: '/triptypes/active',
  GET: (id) => `/triptypes/${id}`,
  CREATE: '/triptypes',
  UPDATE: (id) => `/triptypes/${id}`,
  DELETE: (id) => `/triptypes/${id}`,
}
```

## User Flow

### 1. Login
```
User logs in → AuthContext fetches trip types → Stored in memory and localStorage
```

### 2. Booking Form
```
1. User selects trip type (optional)
2. Dynamic attributes appear based on trip type
3. User fills in required and optional attributes
4. Form validates all required fields including dynamic attributes
5. Trip created with attributeValues object
```

### 3. Trip Type Change
```
User changes trip type → Attribute values reset → New attributes displayed
```

## API Integration

### Trip Type Response Structure
```json
{
  "id": 1,
  "name": "Emergency",
  "description": "Emergency medical transport",
  "color": "#FF0000",
  "icon": "alert-circle",
  "isActive": true,
  "displayOrder": 1,
  "createdAt": "2025-10-27T20:00:00Z",
  "attributes": [
    {
      "id": 1,
      "tripTypeId": 1,
      "name": "patient_age",
      "label": "Patient Age",
      "description": "Age of the patient",
      "dataType": "number",
      "isRequired": true,
      "displayOrder": 1,
      "options": null,
      "defaultValue": null,
      "validationRules": "{\"min\": 0, \"max\": 120}",
      "placeholder": "Enter patient age",
      "isActive": true,
      "createdAt": "2025-10-27T20:05:00Z"
    }
  ]
}
```

### Create Trip with Attributes
```json
POST /trips
{
  "tripTypeId": 1,
  "fromAddress": "123 Main St",
  "toAddress": "456 Hospital Ave",
  "fromLatitude": 9.0054,
  "fromLongitude": 38.7636,
  "toLatitude": 9.0234,
  "toLongitude": 38.7856,
  "patientName": "John Doe",
  "emergencyType": "cardiac",
  "notes": "Urgent case",
  "attributeValues": {
    "patient_age": 45,
    "blood_type": "O+",
    "has_insurance": true,
    "emergency_contact": "+251912345678"
  }
}
```

## Attribute Data Type Examples

### 1. Text Field
```json
{
  "name": "emergency_contact",
  "label": "Emergency Contact",
  "dataType": "text",
  "isRequired": true,
  "placeholder": "Enter phone number"
}
```

### 2. Number Field with Validation
```json
{
  "name": "patient_age",
  "label": "Patient Age",
  "dataType": "number",
  "isRequired": true,
  "validationRules": "{\"min\": 0, \"max\": 120}",
  "placeholder": "Enter age"
}
```

### 3. Select Dropdown
```json
{
  "name": "blood_type",
  "label": "Blood Type",
  "dataType": "select",
  "isRequired": false,
  "options": "[\"A+\", \"A-\", \"B+\", \"B-\", \"O+\", \"O-\", \"AB+\", \"AB-\"]"
}
```

### 4. Boolean Checkbox
```json
{
  "name": "has_insurance",
  "label": "Has Medical Insurance",
  "dataType": "boolean",
  "isRequired": false,
  "description": "Check if patient has active medical insurance"
}
```

### 5. Date Picker
```json
{
  "name": "last_checkup_date",
  "label": "Last Medical Checkup",
  "dataType": "date",
  "isRequired": false
}
```

### 6. Textarea
```json
{
  "name": "medical_history",
  "label": "Medical History",
  "dataType": "textarea",
  "isRequired": false,
  "placeholder": "Enter any relevant medical history"
}
```

## Validation

### Required Field Validation
- All required attributes are validated before form submission
- User-friendly error messages show which field is missing
- Validation includes both static fields (patient name) and dynamic attributes

### Data Type Validation
- Number fields: min/max validation from validationRules
- Text fields: Standard text input validation
- Select fields: Must choose from predefined options
- Boolean fields: True/false values
- Date fields: Valid date format

## Storage and Caching

### localStorage Keys
- `trip_types`: Cached trip types array
- Cleared on logout
- Refreshed on login and app initialization

### Memory Storage
- Trip types stored in AuthContext state
- Accessible via `useAuth()` hook
- Available throughout the application

## Usage Example

```tsx
import { useAuth } from '../contexts/AuthContext';

const MyComponent: React.FC = () => {
  const { tripTypes } = useAuth();
  
  return (
    <div>
      {tripTypes.map(type => (
        <div key={type.id}>
          <h3>{type.name}</h3>
          <p>{type.description}</p>
          <p>Attributes: {type.attributes.length}</p>
        </div>
      ))}
    </div>
  );
};
```

## Benefits

### 1. **Flexibility**
- Add new trip types without code changes
- Modify attributes dynamically from backend
- Support different workflows for different trip types

### 2. **Scalability**
- Unlimited custom attributes per trip type
- Support for complex data collection
- Easy to extend with new data types

### 3. **User Experience**
- Only show relevant fields based on trip type
- Clear labeling and descriptions
- Validation prevents errors

### 4. **Data Quality**
- Required fields ensure complete data
- Validation rules maintain data integrity
- Structured attribute values for easy querying

## Testing Checklist

- [ ] Trip types fetch on login
- [ ] Trip types load from cache on app start
- [ ] Trip type selection shows/hides attributes
- [ ] All 6 data types render correctly
- [ ] Required attribute validation works
- [ ] Optional attributes can be left empty
- [ ] Form submission includes attributeValues
- [ ] Trip type change resets attribute values
- [ ] Logout clears trip types from cache
- [ ] Error handling for failed API calls

## Troubleshooting

### Trip Types Not Loading
1. Check if user is logged in
2. Verify `/triptypes/active` endpoint is working
3. Check browser console for errors
4. Clear localStorage and re-login

### Attributes Not Displaying
1. Verify trip type has active attributes
2. Check `isActive` flag on attributes
3. Ensure attributes array is not empty
4. Check displayOrder for proper sorting

### Validation Errors
1. Verify validationRules JSON is valid
2. Check required field values are not empty
3. Ensure data types match attribute definitions

### Options Not Showing in Select
1. Verify options field contains valid JSON array
2. Check array format: `["Option1", "Option2"]` or `[{"value": "1", "label": "Option 1"}]`
3. Ensure options is not null or empty

## Future Enhancements

1. **Conditional Attributes**: Show/hide attributes based on other field values
2. **File Upload Attributes**: Support for document/image uploads
3. **Multi-Select**: Allow multiple selections in dropdown
4. **Attribute Groups**: Organize attributes into collapsible sections
5. **Default Values**: Pre-fill attributes with default values
6. **Attribute Dependencies**: Link attributes together (e.g., if age < 18, show guardian field)
7. **Custom Validation**: More complex validation rules
8. **Attribute Templates**: Reusable attribute sets across trip types

## Summary

The dynamic trip types feature provides a powerful, flexible system for collecting custom data during trip booking. It's fully integrated with the authentication flow, provides excellent user experience, and maintains data integrity through validation.
