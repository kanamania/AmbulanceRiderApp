# Quick Start Guide - Ambulance Rider App

Get up and running in 5 minutes!

## Prerequisites

- Node.js 16+ installed
- npm or yarn package manager
- A backend API (see API_SPECIFICATION.md)

## Installation Steps

### 1. Install Dependencies

```bash
npm install
```

This installs all required packages including:
- Ionic React framework
- Axios for HTTP requests
- JWT decode library
- All other dependencies

### 2. Configure Environment

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and set your API URL:

```env
VITE_API_URL=http://localhost:8000/api
```

**Important**: Replace with your actual backend API URL!

### 3. Start Development Server

```bash
npm run dev
```

The app will start at: `http://localhost:5173`

## First Time Usage

### 1. Register a New Account

1. Open the app in your browser
2. Click "Register here" on the login page
3. Fill in your details:
   - Full Name
   - Email
   - Phone (optional)
   - Password (min 6 characters)
   - Confirm Password
4. Click "Register"

### 2. Login

1. Enter your email and password
2. Click "Login"
3. You'll be redirected to the main app

### 3. Explore the App

After logging in, you'll see:
- **Home Tab**: Main dashboard
- **Services Tab**: Available services
- **History Tab**: Your request history
- **Profile Tab**: Your user profile

## Project Structure

```
src/
├── config/          # Configuration files
├── contexts/        # React contexts (Auth)
├── services/        # API services
├── types/           # TypeScript types
├── components/      # Reusable components
├── pages/           # App pages
├── utils/           # Utility functions
└── theme/           # Ionic theme
```

## Key Files

- `src/App.tsx` - Main app component with routing
- `src/contexts/AuthContext.tsx` - Authentication state
- `src/services/api.service.ts` - HTTP client
- `src/services/auth.service.ts` - Auth operations
- `.env` - Environment configuration

## Available Scripts

```bash
# Development
npm run dev          # Start dev server

# Build
npm run build        # Build for production

# Testing
npm run test.unit    # Run unit tests
npm run test.e2e     # Run E2E tests

# Linting
npm run lint         # Run ESLint
```

## Testing Authentication

### Manual Test Flow

1. **Register**:
   - Navigate to `/register`
   - Fill form and submit
   - Check localStorage for tokens
   - Verify redirect to `/tabs/tab1`

2. **Login**:
   - Navigate to `/login`
   - Enter credentials
   - Verify tokens in localStorage
   - Check redirect to main app

3. **Protected Routes**:
   - Clear localStorage
   - Try accessing `/tabs/tab1`
   - Should redirect to `/login`
   - Login and verify access

4. **Logout**:
   - Click logout in profile
   - Verify tokens cleared
   - Check redirect to login

### Using Browser DevTools

1. **Check Tokens**:
   - Open DevTools (F12)
   - Go to Application → Local Storage
   - Look for `access_token`, `refresh_token`, `user_data`

2. **Monitor API Calls**:
   - Open DevTools → Network tab
   - Filter by "Fetch/XHR"
   - Watch API requests/responses

3. **Debug Auth State**:
   - Install React DevTools extension
   - Inspect AuthContext state
   - Check user object and isAuthenticated

## Common Issues & Solutions

### Issue: "Cannot connect to API"

**Solution**:
1. Check backend is running
2. Verify API URL in `.env`
3. Check CORS configuration on backend
4. Look for errors in browser console

### Issue: "Login failed"

**Solution**:
1. Verify credentials are correct
2. Check Network tab for API response
3. Ensure backend auth endpoint works
4. Check backend logs

### Issue: "Infinite redirect loop"

**Solution**:
1. Clear localStorage
2. Check token validation logic
3. Verify refresh endpoint works
4. Check AuthContext initialization

### Issue: "CORS error"

**Solution**:
Backend must include these headers:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

## Next Steps

1. ✅ Install and configure
2. ✅ Test authentication
3. 📝 Customize UI/UX
4. 📝 Add ambulance features
5. 📝 Integrate real API
6. 📝 Test on mobile devices
7. 📝 Deploy to production

## Mobile Development

### Add iOS Platform

```bash
npm install @capacitor/ios
npx cap add ios
npx cap sync
npx cap open ios
```

### Add Android Platform

```bash
npm install @capacitor/android
npx cap add android
npx cap sync
npx cap open android
```

## Useful Commands

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear build cache
rm -rf dist

# Update dependencies
npm update

# Check for outdated packages
npm outdated
```

## Resources

- 📖 [Full Documentation](./AUTH_README.md)
- 🔧 [API Specification](./API_SPECIFICATION.md)
- 📋 [Setup Guide](./SETUP_GUIDE.md)
- 📝 [Implementation Summary](./IMPLEMENTATION_SUMMARY.md)

## Support

If you encounter issues:

1. Check this guide
2. Review the documentation
3. Check browser console for errors
4. Verify API responses in Network tab
5. Check backend logs

## Success Checklist

- [ ] Dependencies installed
- [ ] Environment configured
- [ ] Dev server running
- [ ] Can access login page
- [ ] Can register new account
- [ ] Can login successfully
- [ ] Tokens stored in localStorage
- [ ] Can access protected routes
- [ ] Can view/edit profile
- [ ] Can logout successfully

## You're All Set! 🎉

Your Ambulance Rider app is now ready for development. Start building amazing features!

For detailed information, see the complete documentation in `AUTH_README.md`.
