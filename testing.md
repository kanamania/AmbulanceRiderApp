# Testing Documentation

**Last Updated:** 2025-12-04T09:30:00+03:00  
**Version:** 0.0.22

---

## Testing Status Overview

| Test Type | Status | Coverage | Tool |
|-----------|--------|----------|------|
| Unit Tests | ❌ Not Implemented | 0% | Vitest |
| E2E Tests | ❌ Not Implemented | 0% | Cypress |
| Component Tests | ❌ Not Implemented | 0% | React Testing Library |
| Manual Testing | ✅ Ongoing | N/A | Browser/Device |

**Current Approach:** Manual testing via browser and mobile devices.

---

## Test Environment

### Prerequisites
- Node.js 16+
- npm or yarn
- Backend API running (see ../AmbulanceRider)

### Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run unit tests (when implemented)
npm run test.unit

# Run E2E tests (when implemented)
npm run test.e2e
```

### Environment Configuration
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Global Express
```

---

## Manual Testing Procedures

### Authentication Tests

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| Valid Login | Enter valid email/password, tap Login | Redirect to dashboard |
| Invalid Login | Enter wrong password, tap Login | Error message displayed |
| Registration | Fill all fields, tap Register | Account created, redirect to login |
| Forgot Password | Enter email, submit | Success message, check email |
| Token Refresh | Wait for token expiry, perform action | Seamless token refresh |
| Logout | Tap logout button | Redirect to login, tokens cleared |

### Trip Management Tests

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| Create Trip | Fill trip form, submit | Trip created with Pending status |
| View Trip | Tap trip card | Trip details displayed |
| Cancel Trip | Open trip, tap Cancel, confirm | Trip status changed to Cancelled |
| Start Trip | Open approved trip, tap Start | Status changes to In Progress |
| Complete Trip | Open in-progress trip, tap Complete | Status changes to Completed |
| Filter Trips | Select status filter | List filtered accordingly |

### Admin Panel Tests

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| View Users | Navigate to Admin > Users | User list displayed |
| Create User | Fill form, submit | User created |
| Edit User | Click edit, modify, save | User updated |
| Delete User | Click delete, confirm | User removed |
| Approve Trip | Select vehicle/driver, approve | Trip status changes to Approved |
| Reject Trip | Enter reason, reject | Trip status changes to Rejected |

### Offline/Cache Tests

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| Cache Load | Login, navigate, go offline | Cached data displays |
| Cache Sync | Go online after changes | Data syncs with server |
| Cache Clear | Clear cache in settings | App fetches fresh data |

---

## Test Data

### Test Accounts

| Email | Password | Role |
|-------|----------|------|
| admin@test.com | Admin123! | Admin |
| dispatcher@test.com | Dispatch123! | Dispatcher |
| driver@test.com | Driver123! | Driver |
| user@test.com | User123! | User |

### Test Locations

| Name | Latitude | Longitude |
|------|----------|-----------|
| Hospital A | -6.7924 | 39.2083 |
| Clinic B | -6.8000 | 39.2500 |
| Office C | -6.7800 | 39.2200 |

---

## Planned Test Implementation

### Phase 1: Unit Tests

**Services to Test:**
- [ ] auth.service.ts - Login, register, token management
- [ ] api.service.ts - HTTP requests, error handling
- [ ] cache.service.ts - IndexedDB operations
- [ ] dataHash.service.ts - Hash comparison, sync logic

**Utilities to Test:**
- [ ] validators.ts - Email, phone, password validation
- [ ] formatters.ts - Date, currency, distance formatting
- [ ] storage.ts - localStorage operations

**Example Test Structure:**
```typescript
// auth.service.test.ts
describe('AuthService', () => {
  describe('login', () => {
    it('should return tokens on valid credentials', async () => {
      // Test implementation
    });
    
    it('should throw error on invalid credentials', async () => {
      // Test implementation
    });
  });
});
```

### Phase 2: Component Tests

**Components to Test:**
- [ ] Login.tsx - Form validation, submission
- [ ] Register.tsx - Form validation, submission
- [ ] TripCard.tsx - Status display, actions
- [ ] TripForm.tsx - Field validation, map integration
- [ ] ProtectedRoute.tsx - Auth guard behavior

### Phase 3: E2E Tests

**User Flows:**
- [ ] Complete authentication flow (register → login → logout)
- [ ] Trip lifecycle (create → approve → start → complete)
- [ ] Admin user management (create → edit → delete)
- [ ] Settings changes (theme, language, profile)

**Cypress Test Structure:**
```typescript
// auth.cy.ts
describe('Authentication', () => {
  it('should login successfully', () => {
    cy.visit('/login');
    cy.get('[data-testid="email"]').type('admin@test.com');
    cy.get('[data-testid="password"]').type('Admin123!');
    cy.get('[data-testid="login-btn"]').click();
    cy.url().should('include', '/dashboard');
  });
});
```

---

## API Testing

### Using curl

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"Admin123!"}'
```

**Get Trips:**
```bash
curl -X GET http://localhost:5000/api/trips \
  -H "Authorization: Bearer {token}"
```

**Create Trip:**
```bash
curl -X POST http://localhost:5000/api/trips \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "name": "Test Trip",
    "fromLatitude": -6.7924,
    "fromLongitude": 39.2083,
    "toLatitude": -6.8000,
    "toLongitude": 39.2500,
    "scheduledStartTime": "2025-12-05T10:00:00Z"
  }'
```

---

## Known Testing Gaps

### Critical

| Area | Gap | Risk |
|------|-----|------|
| Authentication | No token expiry tests | Security |
| Form Validation | No boundary tests | Data integrity |
| Offline Mode | No sync conflict tests | Data loss |

### Medium

| Area | Gap | Risk |
|------|-----|------|
| Accessibility | No a11y tests | Usability |
| Performance | No load tests | UX |
| Cross-browser | Limited testing | Compatibility |

---

## CI/CD Integration (Planned)

```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test.unit
      - run: npm run test.e2e
```

---

## Test Metrics Targets

| Metric | Target | Current |
|--------|--------|---------|
| Unit Test Coverage | 60% | 0% |
| E2E Test Coverage | 40% | 0% |
| Test Pass Rate | 100% | N/A |
| Test Execution Time | < 3 min | N/A |

---

## Debugging Tips

### Common Test Issues

| Issue | Solution |
|-------|----------|
| API not reachable | Ensure backend is running on localhost:5000 |
| Token expired | Clear localStorage, login again |
| Stale cache | Clear IndexedDB in browser dev tools |
| Component not rendering | Check React key props, state updates |

### Browser DevTools
- **Network tab** - API request/response inspection
- **Application tab** - localStorage, IndexedDB, cookies
- **Console** - Error messages, logs
- **React DevTools** - Component state inspection
