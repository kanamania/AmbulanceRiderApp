# Backend Integration Plan

## Overview
This document outlines the plan to integrate the Ambulance Rider App frontend with the existing backend API as defined in `API_SPECIFICATION.md`.

---

## Current Status

### ✅ Frontend - COMPLETE
- All UI components implemented
- Admin panel fully functional
- Authentication flow ready
- Trip booking system ready
- Vehicle management ready
- User management ready
- All services configured to call backend API

### 🔄 Backend - EXISTS (needs verification)
- Backend API exists at `http://localhost:5000/api`
- All endpoints defined in API_SPECIFICATION.md
- Needs to be started and tested

---

## Integration Plan

### Phase 1: Backend Verification ✅
**Status:** In Progress

#### Step 1.1: Verify Backend is Running
```bash
# Check if backend server is running
curl http://localhost:5000/api/health

# Expected: 200 OK or similar health check response
```

**Action Items:**
- [ ] Start the backend server
- [ ] Verify it's listening on port 5000
- [ ] Check health/status endpoint

#### Step 1.2: Verify Environment Configuration
```bash
# Frontend .env file
VITE_API_URL=http://localhost:5000/api
```

**Status:** ✅ Verified - .env file is correctly configured

---

### Phase 2: Authentication Testing
**Status:** Pending

#### Step 2.1: Test Login Endpoint
```bash
# POST /api/auth/login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123"
  }'
```

**Expected Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "firstName": "Admin",
    "lastName": "User",
    "email": "admin@example.com",
    "roles": ["Admin"]
  }
}
```

**Action Items:**
- [ ] Test login with valid credentials
- [ ] Test login with invalid credentials
- [ ] Verify JWT token is returned
- [ ] Test token storage in frontend

#### Step 2.2: Test Registration Endpoint
```bash
# POST /api/auth/register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "password": "password123",
    "phoneNumber": "1234567890"
  }'
```

**Action Items:**
- [ ] Test user registration
- [ ] Verify email uniqueness validation
- [ ] Test password validation
- [ ] Verify auto-login after registration

#### Step 2.3: Test Password Reset Flow
```bash
# POST /api/auth/forgot-password
curl -X POST http://localhost:5000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'

# POST /api/auth/reset-password
curl -X POST http://localhost:5000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "token": "reset-token-here",
    "newPassword": "newpassword123",
    "confirmPassword": "newpassword123"
  }'
```

**Action Items:**
- [ ] Test forgot password email sending
- [ ] Test reset password with token
- [ ] Verify token expiration
- [ ] Test frontend flow

---

### Phase 3: User Management Testing
**Status:** Pending

#### Step 3.1: Test Get Users (Admin)
```bash
# GET /api/users
curl http://localhost:5000/api/users \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Action Items:**
- [ ] Test with Admin role
- [ ] Test with Dispatcher role
- [ ] Test with User role (should fail)
- [ ] Verify pagination if implemented
- [ ] Test search/filter functionality

#### Step 3.2: Test Create User (Admin)
```bash
# POST /api/users (multipart/form-data)
curl -X POST http://localhost:5000/api/users \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "firstName=John" \
  -F "lastName=Doe" \
  -F "email=john@example.com" \
  -F "phoneNumber=1234567890" \
  -F "password=password123" \
  -F "roleIds=4"
```

**Action Items:**
- [ ] Test user creation
- [ ] Test with image upload
- [ ] Test role assignment
- [ ] Verify validation errors

#### Step 3.3: Test Update User (Admin)
```bash
# PUT /api/users/{id}
curl -X PUT http://localhost:5000/api/users/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "firstName=Jane"
```

**Action Items:**
- [ ] Test user update
- [ ] Test image upload/removal
- [ ] Test role changes
- [ ] Verify permissions

#### Step 3.4: Test Delete User (Admin)
```bash
# DELETE /api/users/{id}
curl -X DELETE http://localhost:5000/api/users/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Action Items:**
- [ ] Test user deletion
- [ ] Verify soft delete if implemented
- [ ] Test cascade effects

---

### Phase 4: Location Management Testing
**Status:** Pending

#### Step 4.1: Test Get Locations
```bash
# GET /api/locations
curl http://localhost:5000/api/locations \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Action Items:**
- [ ] Test location listing
- [ ] Verify image URLs are correct
- [ ] Test with different user roles

#### Step 4.2: Test Create/Update/Delete Locations
**Action Items:**
- [ ] Test location creation with image
- [ ] Test location update
- [ ] Test location deletion
- [ ] Verify admin/dispatcher permissions

---

### Phase 5: Vehicle Management Testing
**Status:** Pending

#### Step 5.1: Test Vehicle Types
```bash
# GET /api/vehicles/types
curl http://localhost:5000/api/vehicles/types \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Action Items:**
- [ ] Test getting vehicle types
- [ ] Verify types match frontend expectations

#### Step 5.2: Test Vehicle CRUD
```bash
# GET /api/vehicles
curl http://localhost:5000/api/vehicles \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Action Items:**
- [ ] Test vehicle listing with filters
- [ ] Test vehicle creation
- [ ] Test vehicle update
- [ ] Test vehicle deletion
- [ ] Test status updates
- [ ] Verify maintenance date handling

---

### Phase 6: Trip Management Testing
**Status:** Pending

#### Step 6.1: Test Trip Types
```bash
# GET /api/triptypes/active
curl http://localhost:5000/api/triptypes/active \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Action Items:**
- [ ] Test getting active trip types
- [ ] Verify dynamic attributes are returned
- [ ] Test trip type CRUD operations

#### Step 6.2: Test Trip Booking
```bash
# POST /api/trips
curl -X POST http://localhost:5000/api/trips \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "tripTypeId": 1,
    "fromLocationId": 1,
    "toLocationId": 2,
    "fromAddress": "123 Main St",
    "toAddress": "456 Oak Ave",
    "fromLatitude": 40.7128,
    "fromLongitude": -74.0060,
    "toLatitude": 40.7580,
    "toLongitude": -73.9855,
    "attributeValues": {}
  }'
```

**Action Items:**
- [ ] Test trip creation
- [ ] Test with dynamic attributes
- [ ] Test with telemetry data
- [ ] Verify validation

#### Step 6.3: Test Trip Status Management
```bash
# PUT /api/trips/{id}/status
curl -X PUT http://localhost:5000/api/trips/1/status \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "id": 1,
    "status": 1,
    "notes": "Approved"
  }'
```

**Action Items:**
- [ ] Test status updates (approve, reject, start, complete, cancel)
- [ ] Test status logs
- [ ] Verify role permissions
- [ ] Test force complete functionality

---

### Phase 7: Admin Dashboard Testing
**Status:** Pending

#### Step 7.1: Test Dashboard Stats
```bash
# GET /api/dashboard/stats
curl http://localhost:5000/api/dashboard/stats \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "totalUsers": 1245,
  "activeTrips": 18,
  "completedTrips": 982,
  "totalVehicles": 42,
  "pendingRequests": 7,
  "availableDrivers": 23
}
```

**Action Items:**
- [ ] Test dashboard statistics
- [ ] Test recent activities
- [ ] Test trip statistics
- [ ] Test system health
- [ ] Verify admin-only access

---

### Phase 8: File Upload Testing
**Status:** Pending

**Action Items:**
- [ ] Test user image upload
- [ ] Test location image upload
- [ ] Test vehicle image upload
- [ ] Verify file size limits (5MB)
- [ ] Verify file type validation (jpg, jpeg, png, gif)
- [ ] Test image removal
- [ ] Verify uploaded images are accessible

---

### Phase 9: Telemetry Testing
**Status:** Pending

#### Step 9.1: Test Telemetry Logging
```bash
# POST /api/telemetry
curl -X POST http://localhost:5000/api/telemetry \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "deviceType": "Mobile",
    "operatingSystem": "Android",
    "browser": "Chrome",
    "latitude": 40.7128,
    "longitude": -74.0060
  }'
```

**Action Items:**
- [ ] Test telemetry logging
- [ ] Test batch telemetry
- [ ] Test telemetry with auth endpoints
- [ ] Verify data is stored correctly

---

### Phase 10: CORS & Security Testing
**Status:** Pending

**Action Items:**
- [ ] Verify CORS headers allow frontend origin
- [ ] Test preflight OPTIONS requests
- [ ] Verify JWT token validation
- [ ] Test token expiration
- [ ] Test role-based authorization
- [ ] Verify secure headers (HTTPS in production)

---

## Testing Checklist

### Prerequisites
- [ ] Backend server is running on port 5000
- [ ] Database is set up and migrations are run
- [ ] Frontend dev server is running on port 5173
- [ ] .env file is configured correctly

### Manual Testing Steps
1. **Start Backend Server**
   ```bash
   # Navigate to backend directory and start
   cd backend
   npm start
   ```

2. **Start Frontend Server**
   ```bash
   # In project root
   npm run dev
   ```

3. **Test Authentication Flow**
   - Open http://localhost:5173
   - Try to register a new user
   - Login with credentials
   - Test password reset flow
   - Verify token persistence

4. **Test User Roles**
   - Login as Admin
   - Access admin panel
   - Test user management
   - Login as regular User
   - Verify restricted access

5. **Test Trip Booking**
   - Create a new trip
   - Test with different trip types
   - Fill dynamic attributes
   - Submit and verify

6. **Test Admin Features**
   - View dashboard statistics
   - Manage users (CRUD)
   - Manage vehicles (CRUD)
   - Manage trips (status updates)
   - View trip logs

---

## Common Issues & Solutions

### Issue 1: CORS Errors
**Symptom:** `Access to XMLHttpRequest blocked by CORS policy`

**Solution:**
```javascript
// Backend needs to allow frontend origin
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
```

### Issue 2: 401 Unauthorized
**Symptom:** All API calls return 401

**Solution:**
- Check if token is being sent in Authorization header
- Verify token is valid and not expired
- Check backend JWT secret matches

### Issue 3: 404 Not Found
**Symptom:** Endpoints return 404

**Solution:**
- Verify backend routes are registered
- Check API base URL in .env
- Ensure backend is running

### Issue 4: Image Upload Fails
**Symptom:** Image upload returns error

**Solution:**
- Check file size (max 5MB)
- Verify file type (jpg, jpeg, png, gif)
- Ensure uploads directory exists
- Check multipart/form-data handling

---

## Next Steps

1. **Start Backend Server**
   - Ensure backend is running
   - Check logs for any errors

2. **Run Integration Tests**
   - Follow testing checklist above
   - Document any issues found

3. **Fix Any Discrepancies**
   - Update frontend if API differs
   - Update backend if needed
   - Document changes

4. **Create Test Users**
   - Admin user
   - Dispatcher user
   - Driver user
   - Regular user

5. **Seed Test Data**
   - Locations
   - Vehicles
   - Trip types
   - Sample trips

6. **Deploy to Staging**
   - Deploy backend
   - Deploy frontend
   - Test in staging environment

---

## Documentation Updates Needed

- [ ] Update README with backend setup instructions
- [ ] Create BACKEND_SETUP.md guide
- [ ] Document environment variables
- [ ] Create API testing guide
- [ ] Document deployment process

---

**Status:** Plan Created ✅  
**Next Action:** Start backend server and begin Phase 1 testing
