# Troubleshooting Guide - Ambulance Rider App

This guide helps you resolve common issues with the Ambulance Rider application.

## Table of Contents

- [Installation Issues](#installation-issues)
- [Authentication Issues](#authentication-issues)
- [API Connection Issues](#api-connection-issues)
- [Token Issues](#token-issues)
- [Routing Issues](#routing-issues)
- [Build Issues](#build-issues)
- [Mobile Issues](#mobile-issues)
- [Development Tools](#development-tools)

---

## Installation Issues

### Issue: `npm install` fails

**Symptoms**:
- Error messages during installation
- Missing dependencies

**Solutions**:

1. **Clear npm cache**:
   ```bash
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Check Node version**:
   ```bash
   node --version  # Should be 16.x or higher
   ```

3. **Use correct registry**:
   ```bash
   npm config set registry https://registry.npmjs.org/
   ```

4. **Try with legacy peer deps**:
   ```bash
   npm install --legacy-peer-deps
   ```

### Issue: TypeScript errors after installation

**Solution**:
```bash
npm install --save-dev typescript@5.1.6
```

---

## Authentication Issues

### Issue: "Login failed" error

**Symptoms**:
- Cannot login with valid credentials
- Error toast appears

**Debugging Steps**:

1. **Check API URL**:
   - Open `.env` file
   - Verify `VITE_API_URL` is correct
   - Ensure backend is running

2. **Check Network Tab**:
   - Open DevTools (F12)
   - Go to Network tab
   - Look for `/auth/login` request
   - Check response status and body

3. **Verify Backend**:
   ```bash
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password123"}'
   ```

4. **Check Console**:
   - Look for JavaScript errors
   - Check for CORS errors

**Common Causes**:
- Wrong API URL in `.env`
- Backend not running
- CORS not configured
- Invalid credentials
- Network connectivity issues

### Issue: "Registration failed" error

**Solutions**:

1. **Check validation**:
   - Password min 6 characters
   - Valid email format
   - Passwords match

2. **Check if email exists**:
   - Try different email
   - Check backend database

3. **Review backend logs**:
   - Check for validation errors
   - Look for database errors

---

## API Connection Issues

### Issue: CORS errors

**Symptoms**:
```
Access to fetch at 'http://localhost:5000/api/auth/login' from origin 
'http://localhost:5173' has been blocked by CORS policy
```

**Solution**:

Backend must include these headers:

```javascript
// Express.js example
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});
```

### Issue: "Network Error" or "Request timeout"

**Solutions**:

1. **Check backend is running**:
   ```bash
   curl http://localhost:5000/api/auth/me
   ```

2. **Verify API URL**:
   - Check `.env` file
   - Ensure no typos
   - Include `/api` if needed

3. **Check firewall**:
   - Disable temporarily to test
   - Add exception for dev server

4. **Increase timeout**:
   Edit `src/config/api.config.ts`:
   ```typescript
   TIMEOUT: 60000, // 60 seconds
   ```

### Issue: 404 Not Found on API calls

**Solutions**:

1. **Check endpoint paths**:
   - Verify in `src/config/api.config.ts`
   - Match with backend routes

2. **Check base URL**:
   ```typescript
   // Should NOT have trailing slash
   BASE_URL: 'http://localhost:5000/api'
   ```

3. **Verify backend routes**:
   - Check backend route definitions
   - Test with curl or Postman

---

## Token Issues

### Issue: Tokens not being stored

**Debugging**:

1. **Check localStorage**:
   - Open DevTools → Application → Local Storage
   - Look for `access_token`, `refresh_token`, `user_data`

2. **Check browser privacy settings**:
   - Ensure cookies/storage enabled
   - Disable private/incognito mode for testing

3. **Check storage quota**:
   ```javascript
   // In browser console
   navigator.storage.estimate().then(estimate => {
     console.log(estimate.usage, estimate.quota);
   });
   ```

**Solution**:
- Clear localStorage and try again
- Check browser settings
- Try different browser

### Issue: Token refresh not working

**Symptoms**:
- Redirected to login after token expires
- 401 errors on API calls

**Debugging**:

1. **Check refresh token endpoint**:
   ```bash
   curl -X POST http://localhost:5000/api/auth/refresh \
     -H "Content-Type: application/json" \
     -d '{"refresh_token":"YOUR_REFRESH_TOKEN"}'
   ```

2. **Check interceptor logic**:
   - Open `src/services/api.service.ts`
   - Add console.logs in response interceptor

3. **Verify token expiration**:
   ```javascript
   // In browser console
   const token = localStorage.getItem('access_token');
   const decoded = JSON.parse(atob(token.split('.')[1]));
   console.log('Expires:', new Date(decoded.exp * 1000));
   ```

**Solutions**:
- Ensure refresh endpoint returns new access_token
- Check token expiration times
- Verify refresh token is valid

### Issue: Infinite redirect loop

**Symptoms**:
- Page keeps redirecting between login and home
- Browser becomes unresponsive

**Solutions**:

1. **Clear all auth data**:
   ```javascript
   // In browser console
   localStorage.clear();
   location.reload();
   ```

2. **Check ProtectedRoute logic**:
   - Open `src/components/ProtectedRoute.tsx`
   - Verify isAuthenticated check

3. **Check token validation**:
   - Open `src/services/auth.service.ts`
   - Review `isAuthenticated()` method

---

## Routing Issues

### Issue: Routes not working

**Symptoms**:
- Blank page
- 404 errors
- Routes don't navigate

**Solutions**:

1. **Check route definitions**:
   - Open `src/App.tsx`
   - Verify all routes are defined

2. **Check exact paths**:
   ```typescript
   // Use exact for specific paths
   <Route exact path="/login" component={Login} />
   ```

3. **Check navigation**:
   ```typescript
   // Use history.push or history.replace
   const history = useHistory();
   history.push('/tabs/tab1');
   ```

### Issue: Protected routes accessible without login

**Solution**:

Ensure routes are wrapped with `ProtectedRoute`:
```typescript
<Route path="/protected">
  <ProtectedRoute>
    <ProtectedPage />
  </ProtectedRoute>
</Route>
```

---

## Build Issues

### Issue: Build fails with TypeScript errors

**Solutions**:

1. **Check TypeScript config**:
   ```bash
   npx tsc --noEmit
   ```

2. **Fix type errors**:
   - Review error messages
   - Add proper type annotations
   - Use `any` temporarily (not recommended)

3. **Update dependencies**:
   ```bash
   npm update
   ```

### Issue: Build fails with memory error

**Solution**:

Increase Node memory:
```bash
NODE_OPTIONS=--max_old_space_size=4096 npm run build
```

Or update `package.json`:
```json
{
  "scripts": {
    "build": "NODE_OPTIONS=--max_old_space_size=4096 vite build"
  }
}
```

---

## Mobile Issues

### Issue: Capacitor sync fails

**Solutions**:

1. **Install Capacitor CLI**:
   ```bash
   npm install @capacitor/cli @capacitor/core
   ```

2. **Initialize Capacitor**:
   ```bash
   npx cap init
   ```

3. **Add platforms**:
   ```bash
   npx cap add ios
   npx cap add android
   ```

### Issue: App crashes on mobile

**Debugging**:

1. **Check device logs**:
   - iOS: Xcode → Window → Devices and Simulators
   - Android: Android Studio → Logcat

2. **Test in browser first**:
   ```bash
   npm run dev
   ```

3. **Check Capacitor config**:
   - Review `capacitor.config.ts`
   - Verify app ID and name

---

## Development Tools

### Browser DevTools

**Network Tab**:
- Monitor API requests
- Check request/response
- View headers and body

**Console Tab**:
- View JavaScript errors
- Check console.log output
- Test code snippets

**Application Tab**:
- View localStorage
- Check cookies
- Monitor storage usage

**React DevTools**:
- Install extension
- Inspect component tree
- View component state/props
- Check context values

### Debugging Authentication

```javascript
// In browser console

// Check if user is logged in
const token = localStorage.getItem('access_token');
console.log('Token:', token);

// Decode JWT token
if (token) {
  const payload = JSON.parse(atob(token.split('.')[1]));
  console.log('Token payload:', payload);
  console.log('Expires:', new Date(payload.exp * 1000));
}

// Check user data
const userData = localStorage.getItem('user_data');
console.log('User:', JSON.parse(userData));

// Clear auth data
localStorage.removeItem('access_token');
localStorage.removeItem('refresh_token');
localStorage.removeItem('user_data');
```

### Testing API Endpoints

```bash
# Test login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Test protected endpoint
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test refresh
curl -X POST http://localhost:5000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refresh_token":"YOUR_REFRESH_TOKEN"}'
```

---

## Quick Fixes

### Reset Everything

```bash
# Clear all caches and reinstall
rm -rf node_modules package-lock.json dist
npm cache clean --force
npm install

# Clear browser data
# DevTools → Application → Clear storage → Clear site data

# Restart dev server
npm run dev
```

### Common Environment Issues

```bash
# Check Node version
node --version  # Should be 16+

# Check npm version
npm --version

# Update npm
npm install -g npm@latest

# Check environment variables
cat .env
```

---

## Getting Help

If you're still experiencing issues:

1. **Check documentation**:
   - README.md
   - AUTH_README.md
   - API_SPECIFICATION.md

2. **Review code**:
   - Check recent changes
   - Compare with working version

3. **Search for errors**:
   - Copy error message
   - Search on Stack Overflow
   - Check GitHub issues

4. **Ask for help**:
   - Provide error messages
   - Share relevant code
   - Describe steps to reproduce

---

## Preventive Measures

### Best Practices

1. **Always use version control**:
   ```bash
   git commit -m "Working version before changes"
   ```

2. **Test in development first**:
   - Don't test in production
   - Use dev environment

3. **Keep dependencies updated**:
   ```bash
   npm outdated
   npm update
   ```

4. **Monitor console**:
   - Keep DevTools open
   - Watch for warnings/errors

5. **Use environment variables**:
   - Don't hardcode URLs
   - Use `.env` files

---

## Additional Resources

- [Ionic Forum](https://forum.ionicframework.com/)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/ionic-framework)
- [React Documentation](https://react.dev)
- [Axios Documentation](https://axios-http.com)

---

**Remember**: Most issues can be resolved by:
1. Checking the console for errors
2. Verifying environment configuration
3. Ensuring backend is running
4. Clearing cache and reinstalling dependencies

If all else fails, start fresh with a clean installation!
