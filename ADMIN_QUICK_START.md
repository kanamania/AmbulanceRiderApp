# Admin Panel Quick Start Guide

## 🚀 Getting Started in 5 Minutes

This guide will help you quickly set up and test the admin panel.

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend API running (see API_SPECIFICATION.md)

## Installation

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Update .env with your API URL
# REACT_APP_API_URL=http://localhost:5000/api
```

## Running the Application

```bash
# Start development server
npm start

# Application will open at http://localhost:3000
```

## Test Accounts

For testing, you'll need accounts with different roles:

### Admin Account
```
Email: admin@globalexpress.co.tz
Password: Admin123!
Access: Full system access
```

### Dispatcher Account
```
Email: dispatcher@globalexpress.co.tz
Password: Dispatch123!
Access: Vehicle and trip management
```

### Driver Account
```
Email: driver@globalexpress.co.tz
Password: Driver123!
Access: No admin panel access (will be redirected)
```

### User Account
```
Email: user@globalexpress.co.tz
Password: User123!
Access: No admin panel access (will be redirected)
```

## Accessing the Admin Panel

1. **Login**: Navigate to `/login` and use admin credentials
2. **Dashboard**: After login, you'll be redirected to `/admin/dashboard`
3. **Navigation**: Use the sidebar to access different sections

## Admin Panel Routes

| Route | Description | Access |
|-------|-------------|--------|
| `/admin/dashboard` | Main dashboard with statistics | Admin, Dispatcher |
| `/admin/users` | User management | Admin |
| `/admin/vehicles` | Vehicle management | Admin, Dispatcher |
| `/admin/trips` | Trip monitoring | Admin, Dispatcher |
| `/admin/settings` | System settings | Admin |

## Quick Feature Test

### 1. Dashboard (2 minutes)
```
1. Login as admin
2. View dashboard at /admin/dashboard
3. Check statistics cards
4. Click quick action links
```

### 2. User Management (3 minutes)
```
1. Navigate to /admin/users
2. Search for a user
3. Click "Add User" button
4. Fill in the form:
   - First Name: John
   - Last Name: Doe
   - Email: john.doe@test.com
   - Phone: +1234567890
   - Password: Test123!
   - Role: User
5. Click "Add User"
6. Verify user appears in list
```

### 3. Vehicle Management (3 minutes)
```
1. Navigate to /admin/vehicles
2. Click "Add Vehicle"
3. Fill in the form:
   - License Plate: ABC-1234
   - Make: Ford
   - Model: Transit
   - Year: 2024
   - Vehicle Type: Ambulance
   - Status: Available
   - Capacity: 4
4. Click "Add Vehicle"
5. Filter by status: "Available"
6. Search for "ABC-1234"
```

### 4. Trip Management (3 minutes)
```
1. Navigate to /admin/trips
2. Filter by status: "Pending"
3. Click on a trip to view details
4. Update status to "Accepted"
5. View status history timeline
6. Click "Open in Maps" for locations
```

### 5. System Settings (2 minutes)
```
1. Navigate to /admin/settings
2. Update site name
3. Toggle notification settings
4. Click "Save Changes"
5. Verify success message
```

## Common Issues & Solutions

### Issue: "Cannot connect to API"
**Solution**: 
- Check if backend is running
- Verify REACT_APP_API_URL in .env
- Check CORS settings on backend

### Issue: "Access Denied" when accessing admin routes
**Solution**: 
- Ensure you're logged in with Admin or Dispatcher role
- Check user roles in database
- Clear localStorage and login again

### Issue: "Images not uploading"
**Solution**: 
- Check backend file upload configuration
- Verify file size limits
- Check file upload endpoint

### Issue: "Form validation errors"
**Solution**: 
- Check all required fields are filled
- Verify email format
- Check password meets requirements (min 8 characters)

## Development Tips

### Hot Reload
The app uses hot reload. Changes to files will automatically refresh the browser.

### Browser DevTools
- Open DevTools (F12)
- Check Console for errors
- Use Network tab to inspect API calls
- Use React DevTools for component inspection

### Mock Data
If backend is not ready, you can use mock data:

```typescript
// In any service file
async getVehicles() {
  // Comment out API call
  // return await apiService.get('/vehicles');
  
  // Return mock data
  return {
    data: [
      {
        id: 1,
        licensePlate: 'ABC-1234',
        make: 'Ford',
        model: 'Transit',
        status: 'available'
      }
    ],
    total: 1,
    page: 1,
    pageSize: 10
  };
}
```

### Debugging Authentication
```typescript
// Check current user
const { user, isAuthenticated } = useAuth();
console.log('User:', user);
console.log('Authenticated:', isAuthenticated);

// Check roles
const { hasRole } = useAuth();
console.log('Is Admin:', hasRole(ROLES.ADMIN));
```

## File Structure Overview

```
src/
├── pages/admin/          # Admin pages
│   ├── Dashboard.tsx
│   ├── UserManagement.tsx
│   ├── VehicleManagement.tsx
│   ├── TripManagement.tsx
│   └── SystemSettings.tsx
├── layouts/              # Layout components
│   └── AdminLayout.tsx
├── routes/               # Route configuration
│   └── admin.routes.tsx
├── services/             # API services
│   ├── user.service.ts
│   ├── vehicle.service.ts
│   └── trip.service.ts
├── contexts/             # React contexts
│   └── AuthContext.tsx
└── utils/                # Utilities
    └── role.utils.ts
```

## Next Steps

1. **Customize Branding**
   - Update colors in `src/theme/variables.css`
   - Replace logo in `public/`
   - Update site name in settings

2. **Add More Features**
   - Implement real-time updates
   - Add charts to dashboard
   - Create custom reports

3. **Deploy to Production**
   - Build: `npm run build`
   - Deploy `build/` folder to hosting
   - Configure environment variables
   - Set up HTTPS

## Useful Commands

```bash
# Development
npm start                 # Start dev server
npm run build            # Production build
npm test                 # Run tests

# Code Quality
npm run lint             # Run ESLint
npm run format           # Format code

# Dependencies
npm install              # Install dependencies
npm update               # Update dependencies
npm audit                # Check for vulnerabilities
```

## Resources

- [Ionic Documentation](https://ionicframework.com/docs)
- [React Documentation](https://react.dev)
- [React Hook Form](https://react-hook-form.com)
- [Yup Validation](https://github.com/jquense/yup)

## Support

For issues or questions:
1. Check TROUBLESHOOTING.md
2. Review API_SPECIFICATION.md
3. Check browser console for errors
4. Review network requests in DevTools

## Testing Checklist

- [ ] Login with different roles
- [ ] Access admin dashboard
- [ ] Create a new user
- [ ] Edit existing user
- [ ] Delete user
- [ ] Create a new vehicle
- [ ] Edit vehicle details
- [ ] Filter vehicles by status
- [ ] View trip details
- [ ] Update trip status
- [ ] Modify system settings
- [ ] Test on mobile device
- [ ] Test responsive design

## Performance Tips

1. **Optimize Images**: Compress images before upload
2. **Lazy Loading**: Routes are already lazy-loaded
3. **Pagination**: Use pagination for large datasets
4. **Debouncing**: Search is debounced (300ms)
5. **Caching**: Consider implementing API response caching

## Security Reminders

- ✅ Never commit `.env` file
- ✅ Use HTTPS in production
- ✅ Validate all inputs
- ✅ Implement rate limiting
- ✅ Keep dependencies updated
- ✅ Use strong passwords
- ✅ Enable two-factor authentication

---

**Ready to go!** 🎉

Start the app with `npm start` and login with admin credentials to explore the admin panel.
