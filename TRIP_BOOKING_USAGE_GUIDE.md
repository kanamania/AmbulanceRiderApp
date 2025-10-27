# Trip Booking Feature - Usage Guide

## Quick Start

The enhanced Home page now provides a comprehensive trip booking form with flexible location selection options.

## How to Use

### 1. Accessing the Booking Form
Navigate to the Home page after logging in. You'll see the "Request an Ambulance" form.

### 2. Selecting Pickup Location

**Option A: Use Predefined Location**
1. Click the "Select Predefined Location" dropdown under "Pickup Location"
2. Choose from available locations (fetched from your backend API)
3. The address field will auto-fill with the location name
4. **Important**: You must still use "Pick on Map" to set coordinates

**Option B: Use Custom Location (Map Picker)**
1. Click the "Pick on Map" button
2. A full-screen map modal will open
3. Tap/click anywhere on the map to select your location
4. The selected coordinates will be shown at the bottom
5. Click "Confirm Location" to proceed
6. The system will automatically fetch the address using reverse geocoding
7. Both the address and coordinates will be filled in the form

### 3. Selecting Destination

Follow the same process as pickup location:
- Use predefined location dropdown OR
- Use "Pick on Map" for custom location

### 4. Enter Patient Information

**Required Fields:**
- **Patient Name**: Enter the patient's full name

**Optional Fields:**
- **Emergency Type**: Select from:
  - Cardiac
  - Trauma
  - Respiratory
  - Neurological
  - Other
- **Additional Notes**: Any relevant information about the emergency

### 5. Review Your Route

Once both locations have coordinates, a map preview will automatically appear showing:
- Pickup location marker
- Destination location marker
- Visual representation of the route

### 6. Submit Your Request

1. Review all information
2. Click "Request Ambulance" button
3. Wait for confirmation
4. Success message will appear if the request is created
5. Form will reset automatically for new requests

## Important Notes

### Coordinates Are Required
- Even if you select a predefined location, you must use "Pick on Map" to set coordinates
- This ensures accurate GPS positioning for the ambulance service
- The validation will prevent submission without coordinates

### Address Auto-Fill
- When using "Pick on Map", the address is automatically fetched from OpenStreetMap
- This may take a few seconds depending on your internet connection
- If geocoding fails, coordinates will be used as the address

### Form Validation
The form validates:
- ✓ Both pickup and destination addresses are filled
- ✓ All coordinates (latitude/longitude) are set
- ✓ Patient name is provided
- ✓ All required fields are complete

### Error Handling
- Errors appear as red toast notifications at the top of the screen
- Success messages appear as green toast notifications
- Loading indicators show during API calls

## API Backend Requirements

Your backend must implement the following endpoint:

### POST /trips

**Request Body:**
```json
{
  "fromLocationId": 1,           // Optional: null if custom location
  "toLocationId": 2,             // Optional: null if custom location
  "fromAddress": "123 Main St, City",
  "toAddress": "456 Hospital Ave, City",
  "fromLatitude": 9.0054,
  "fromLongitude": 38.7636,
  "toLatitude": 9.0234,
  "toLongitude": 38.7856,
  "patientName": "John Doe",
  "emergencyType": "cardiac",    // Optional
  "notes": "Patient has chest pain" // Optional
}
```

**Success Response (201 Created):**
```json
{
  "id": 123,
  "userId": 456,
  "fromAddress": "123 Main St, City",
  "toAddress": "456 Hospital Ave, City",
  "fromLatitude": 9.0054,
  "fromLongitude": 38.7636,
  "toLatitude": 9.0234,
  "toLongitude": 38.7856,
  "patientName": "John Doe",
  "emergencyType": "cardiac",
  "notes": "Patient has chest pain",
  "status": "pending",
  "createdAt": "2025-10-27T18:52:00Z",
  "updatedAt": "2025-10-27T18:52:00Z"
}
```

## Troubleshooting

### Map Not Loading
- Check internet connection
- Ensure OpenStreetMap tiles are accessible
- Check browser console for errors

### Address Not Auto-Filling
- Wait a few seconds after selecting location
- Check internet connection
- Nominatim geocoding service may be temporarily unavailable
- Coordinates will still be saved even if address fetch fails

### Predefined Locations Not Showing
- Ensure backend `/locations` endpoint is working
- Check authentication token is valid
- Verify API base URL in `.env` file

### Form Submission Fails
- Check all required fields are filled
- Verify coordinates are set (use map picker)
- Check backend `/trips` endpoint is implemented
- Verify authentication token is valid
- Check browser console for detailed error messages

## Development Notes

### Environment Variables
Ensure your `.env` file has:
```
VITE_API_URL=http://localhost:5000/api
```

### Testing Without Backend
If your backend is not ready:
1. The form will still work for UI testing
2. Submission will fail with an error message
3. You can test location selection and map picking
4. Map preview will work with selected coordinates

### Mobile Testing
- Use browser DevTools device emulation
- Test on actual mobile device using Ionic's serve command
- Map interactions work with touch events
- Forms are responsive and mobile-optimized

## Features Summary

✅ Predefined location selection from API  
✅ Interactive map-based coordinate picking  
✅ Automatic reverse geocoding for addresses  
✅ Real-time map preview of route  
✅ Complete form validation  
✅ Patient information fields  
✅ Emergency type categorization  
✅ Success/error notifications  
✅ Form auto-reset after submission  
✅ Responsive design for mobile and desktop  
✅ Loading states during API calls  

## Support

For issues or questions:
1. Check the browser console for error messages
2. Verify backend API is running and accessible
3. Review the TRIP_BOOKING_IMPLEMENTATION.md for technical details
4. Check network tab in DevTools for API call failures
