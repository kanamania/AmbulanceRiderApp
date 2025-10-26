# Installation Checklist

Use this checklist to ensure proper installation and setup of the Ambulance Rider App.

## Pre-Installation

### System Requirements
- [ ] Node.js 16.x or higher installed
- [ ] npm 8.x or higher installed
- [ ] Git installed (optional)
- [ ] Code editor installed (VS Code recommended)
- [ ] Modern web browser (Chrome, Firefox, Safari)

### Verify Installations
```bash
node --version    # Should show v16.x or higher
npm --version     # Should show 8.x or higher
```

---

## Installation Steps

### 1. Project Setup
- [ ] Navigate to project directory
- [ ] Open terminal/command prompt
- [ ] Verify you're in the correct directory

### 2. Install Dependencies
```bash
npm install
```

**Checklist**:
- [ ] Command completed without errors
- [ ] `node_modules` folder created
- [ ] `package-lock.json` created
- [ ] All dependencies installed successfully

**If errors occur**:
- [ ] Try: `npm cache clean --force`
- [ ] Try: `rm -rf node_modules package-lock.json && npm install`
- [ ] Try: `npm install --legacy-peer-deps`

### 3. Environment Configuration
```bash
cp .env.example .env
```

**Checklist**:
- [ ] `.env` file created
- [ ] Open `.env` in editor
- [ ] Update `VITE_API_URL` with your backend URL
- [ ] Save the file

**Example `.env`**:
```env
VITE_API_URL=http://localhost:8000/api
```

### 4. Verify Configuration Files

**Check these files exist**:
- [ ] `package.json`
- [ ] `tsconfig.json`
- [ ] `vite.config.ts`
- [ ] `ionic.config.json`
- [ ] `.env`
- [ ] `.gitignore`

---

## Backend Setup

### Backend Requirements
- [ ] Backend API is running
- [ ] Backend implements required endpoints
- [ ] CORS is configured on backend
- [ ] Backend URL is accessible

### Test Backend Connection
```bash
# Test if backend is reachable
curl http://localhost:8000/api/auth/me
```

**Checklist**:
- [ ] Backend responds (even if 401 Unauthorized is OK)
- [ ] No connection refused errors
- [ ] No timeout errors

### Required Backend Endpoints
- [ ] POST `/api/auth/register`
- [ ] POST `/api/auth/login`
- [ ] POST `/api/auth/logout`
- [ ] POST `/api/auth/refresh`
- [ ] GET `/api/auth/me`

---

## First Run

### Start Development Server
```bash
npm run dev
```

**Checklist**:
- [ ] Server starts without errors
- [ ] Shows "Local: http://localhost:5173"
- [ ] No compilation errors
- [ ] Browser opens automatically (or manually open the URL)

### Verify App Loads
- [ ] App loads in browser
- [ ] Login page is visible
- [ ] No console errors (F12 → Console)
- [ ] No network errors (F12 → Network)

---

## Test Authentication Flow

### 1. Test Registration
- [ ] Click "Register here" link
- [ ] Registration page loads
- [ ] Fill in the form:
  - [ ] Name: Test User
  - [ ] Email: test@example.com
  - [ ] Phone: +1234567890 (optional)
  - [ ] Password: password123
  - [ ] Confirm Password: password123
- [ ] Click "Register" button
- [ ] Check for success message
- [ ] Verify redirect to main app

### 2. Check Token Storage
**Open DevTools (F12) → Application → Local Storage**:
- [ ] `access_token` exists
- [ ] `refresh_token` exists
- [ ] `user_data` exists

### 3. Test Protected Routes
- [ ] Can access `/tabs/tab1`
- [ ] Can access `/tabs/tab2`
- [ ] Can access `/tabs/tab3`
- [ ] Can access `/profile`
- [ ] Tab navigation works

### 4. Test Profile
- [ ] Click Profile tab
- [ ] Profile page loads
- [ ] User information displayed
- [ ] Click "Edit Profile"
- [ ] Can edit name/email/phone
- [ ] Click "Save Changes"
- [ ] Success message appears

### 5. Test Logout
- [ ] Click logout button (in profile)
- [ ] Redirected to login page
- [ ] Tokens cleared from localStorage
- [ ] Cannot access protected routes

### 6. Test Login
- [ ] Enter email: test@example.com
- [ ] Enter password: password123
- [ ] Click "Login"
- [ ] Success message appears
- [ ] Redirected to main app
- [ ] Tokens stored in localStorage

---

## Browser DevTools Checks

### Console Tab
- [ ] No JavaScript errors
- [ ] No warning messages (or only minor ones)
- [ ] API calls logging (if enabled)

### Network Tab
- [ ] API requests visible
- [ ] Requests have proper headers
- [ ] Authorization header present on protected requests
- [ ] Responses are 200 OK (or expected status)

### Application Tab
- [ ] Local Storage has auth tokens
- [ ] Session Storage (if used)
- [ ] Cookies (if used)

---

## Mobile Testing (Optional)

### iOS Setup
```bash
npm install @capacitor/ios
npx cap add ios
npm run build
npx cap sync
npx cap open ios
```

**Checklist**:
- [ ] iOS platform added
- [ ] Xcode opens
- [ ] Can build in simulator
- [ ] App runs on simulator

### Android Setup
```bash
npm install @capacitor/android
npx cap add android
npm run build
npx cap sync
npx cap open android
```

**Checklist**:
- [ ] Android platform added
- [ ] Android Studio opens
- [ ] Can build in emulator
- [ ] App runs on emulator

---

## Production Build Test

### Build for Production
```bash
npm run build
```

**Checklist**:
- [ ] Build completes without errors
- [ ] `dist` folder created
- [ ] Files in `dist` folder
- [ ] No TypeScript errors
- [ ] No build warnings (or only minor ones)

### Preview Production Build
```bash
npm run preview
```

**Checklist**:
- [ ] Preview server starts
- [ ] App loads correctly
- [ ] All features work
- [ ] No console errors

---

## Common Issues Checklist

### Installation Issues
- [ ] If install fails, clear cache: `npm cache clean --force`
- [ ] If still fails, delete node_modules and reinstall
- [ ] Check Node version is 16+
- [ ] Check npm version is 8+

### API Connection Issues
- [ ] Backend is running
- [ ] API URL in `.env` is correct
- [ ] CORS is configured on backend
- [ ] No firewall blocking connection

### Authentication Issues
- [ ] Backend endpoints are implemented
- [ ] Request/response format matches spec
- [ ] Tokens are being returned
- [ ] Tokens are being stored

### Build Issues
- [ ] TypeScript errors fixed
- [ ] All imports are correct
- [ ] No syntax errors
- [ ] Dependencies are installed

---

## Final Verification

### Functionality
- [ ] Registration works
- [ ] Login works
- [ ] Logout works
- [ ] Protected routes work
- [ ] Profile editing works
- [ ] Token refresh works (test by waiting for expiration)

### Performance
- [ ] App loads quickly
- [ ] Navigation is smooth
- [ ] No lag or freezing
- [ ] API calls are fast

### User Experience
- [ ] UI looks good
- [ ] Forms are easy to use
- [ ] Error messages are clear
- [ ] Success messages appear
- [ ] Loading indicators show

### Code Quality
- [ ] No console errors
- [ ] No console warnings (or minimal)
- [ ] Code is formatted
- [ ] TypeScript types are correct

---

## Documentation Review

### Read These Files
- [ ] README.md - Project overview
- [ ] QUICK_START.md - Quick start guide
- [ ] AUTH_README.md - Authentication details
- [ ] API_SPECIFICATION.md - API requirements
- [ ] TROUBLESHOOTING.md - Common issues

### Understand
- [ ] How authentication works
- [ ] How to make API calls
- [ ] How to add new pages
- [ ] How to configure the app
- [ ] Where to find help

---

## Next Steps Checklist

### Immediate
- [ ] Customize branding (colors, logo, name)
- [ ] Update environment variables for your API
- [ ] Test with real backend
- [ ] Add custom features

### Short Term
- [ ] Implement ambulance request feature
- [ ] Add location tracking
- [ ] Customize UI/UX
- [ ] Add more pages

### Long Term
- [ ] Deploy to staging
- [ ] Test on real devices
- [ ] Deploy to production
- [ ] Publish to app stores

---

## Success Criteria

You're ready to develop when:
- [x] All dependencies installed
- [x] Environment configured
- [x] Dev server runs
- [x] Can register/login
- [x] Protected routes work
- [x] No critical errors
- [x] Documentation reviewed

---

## Support Resources

If you encounter issues:

1. **Check Documentation**
   - README.md
   - TROUBLESHOOTING.md
   - QUICK_START.md

2. **Debug Tools**
   - Browser DevTools (F12)
   - Console for errors
   - Network tab for API calls
   - Application tab for storage

3. **Common Fixes**
   - Clear cache and reinstall
   - Check environment variables
   - Verify backend is running
   - Review error messages

4. **Get Help**
   - Check documentation
   - Search error messages
   - Review code
   - Ask for assistance

---

## Installation Complete! ✅

If all items are checked, your installation is complete and you're ready to start developing!

**Happy Coding! 🚀**

---

*Use this checklist each time you set up the project on a new machine or help someone else install it.*
