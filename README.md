# Global Express

A modern, full-featured mobile application built with Ionic React and TypeScript, featuring complete JWT authentication and authorization.

![Ionic](https://img.shields.io/badge/Ionic-8.5.0-blue)
![React](https://img.shields.io/badge/React-19.0.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.1.6-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## 🚀 Features

### ✅ Authentication & Authorization
- **User Registration** - Complete signup flow with validation
- **User Login** - Secure JWT-based authentication
- **Forgot Password** - Email-based password reset
- **Reset Password** - Secure password reset with tokens
- **Token Management** - Automatic token refresh and storage
- **Protected Routes** - Route guards for authenticated access
- **Persistent Sessions** - Auth state persists across refreshes
- **Secure Logout** - Complete token cleanup

### ✅ User Management
- **User Profile** - View and edit profile information
- **Avatar Support** - Profile picture management
- **Role-Based Access** - Support for different user roles

### ✅ Modern UI/UX
- **Ionic Components** - Beautiful, native-like UI
- **Responsive Design** - Works on all screen sizes
- **Dark Mode Support** - System-based theme switching
- **Loading States** - Proper loading indicators
- **Toast Notifications** - User feedback for actions
- **Form Validation** - Real-time input validation

### ✅ Developer Experience
- **TypeScript** - Full type safety
- **Modular Architecture** - Clean, maintainable code
- **Utility Functions** - Validators, formatters, storage helpers
- **Comprehensive Documentation** - Detailed guides and specs
- **Error Handling** - Robust error management

## 📋 Table of Contents

- [Quick Start](#-quick-start)
- [Installation](#-installation)
- [Project Structure](#-project-structure)
- [Documentation](#-documentation)
- [Configuration](#-configuration)
- [Development](#-development)
- [Building](#-building)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your API URL

# 3. Start development server
npm run dev

# 4. Open in browser
# http://localhost:5173
```

See [QUICK_START.md](./QUICK_START.md) for detailed instructions.

## 📦 Installation

### Prerequisites

- **Node.js** 16.x or higher
- **npm** or **yarn**
- **Backend API** (see [API_SPECIFICATION.md](./API_SPECIFICATION.md))

### Install Dependencies

```bash
npm install
```

This installs:
- `@ionic/react` - Ionic framework for React
- `axios` - HTTP client for API requests
- `jwt-decode` - JWT token decoding
- `react-router-dom` - Routing library
- All other required dependencies

## 📁 Project Structure

```
Global Express/
├── src/
│   ├── config/
│   │   └── api.config.ts          # API configuration
│   ├── contexts/
│   │   └── AuthContext.tsx        # Authentication context
│   ├── services/
│   │   ├── api.service.ts         # HTTP client
│   │   └── auth.service.ts        # Auth operations
│   ├── types/
│   │   └── auth.types.ts          # TypeScript interfaces
│   ├── components/
│   │   └── ProtectedRoute.tsx     # Route guard
│   ├── pages/
│   │   ├── Login.tsx              # Login page
│   │   ├── Register.tsx           # Registration page
│   │   ├── Profile.tsx            # User profile
│   │   ├── Tab1.tsx               # Home tab
│   │   ├── Tab2.tsx               # Services tab
│   │   └── Settings.tsx               # History tab
│   ├── utils/
│   │   ├── validators.ts          # Validation functions
│   │   ├── formatters.ts          # Formatting utilities
│   │   ├── storage.ts             # Storage helpers
│   │   └── constants.ts           # App constants
│   ├── theme/
│   │   └── variables.css          # Ionic theme
│   ├── App.tsx                    # Main app component
│   └── main.tsx                   # Entry point
├── public/                        # Static assets
├── .env                           # Environment variables
├── .env.example                   # Environment template
├── package.json                   # Dependencies
├── tsconfig.json                  # TypeScript config
├── vite.config.ts                 # Vite config
└── ionic.config.json              # Ionic config
```

## 📚 Documentation

### Getting Started
- **[QUICK_START.md](./QUICK_START.md)** - Get started in 5 minutes
- **[ADMIN_QUICK_START.md](./ADMIN_QUICK_START.md)** - Admin panel quick start
- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Detailed setup instructions
- **[INSTALLATION_CHECKLIST.md](./INSTALLATION_CHECKLIST.md)** - Installation steps

### Feature Guides
- **[AUTH_README.md](./AUTH_README.md)** - Complete authentication guide
- **[PASSWORD_RESET_GUIDE.md](./PASSWORD_RESET_GUIDE.md)** - Password reset flow
- **[TRIP_BOOKING_USAGE_GUIDE.md](./TRIP_BOOKING_USAGE_GUIDE.md)** - Trip booking guide
- **[DYNAMIC_TRIP_TYPES_GUIDE.md](./DYNAMIC_TRIP_TYPES_GUIDE.md)** - Dynamic trip types
- **[VEHICLE_MANAGEMENT_IMPLEMENTATION.md](./VEHICLE_MANAGEMENT_IMPLEMENTATION.md)** - Vehicle management

### Admin Panel
- **[ADMIN_PANEL_COMPLETE.md](./ADMIN_PANEL_COMPLETE.md)** - Complete admin documentation
- **[IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md)** - Project status & completion

### Technical
- **[API_SPECIFICATION.md](./API_SPECIFICATION.md)** - Backend API requirements
- **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Common issues and solutions

## ⚙️ Configuration

### Environment Variables

Create a `.env` file:

```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Global Express
VITE_APP_VERSION=1.0.0
```

### API Configuration

Edit `src/config/api.config.ts`:

```typescript
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  TIMEOUT: 30000,
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      // ...
    }
  }
};
```

## 🛠️ Development

### Start Development Server

```bash
npm run dev
```

App runs at `http://localhost:5173`

### Available Scripts

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run test.unit    # Run unit tests
npm run test.e2e     # Run E2E tests
npm run lint         # Run ESLint
```

### Making API Calls

```typescript
import apiService from './services/api.service';

// GET request
const data = await apiService.get('/endpoint');

// POST request
await apiService.post('/endpoint', { data });
```

### Using Authentication

```typescript
import { useAuth } from './contexts/AuthContext';

const MyComponent = () => {
  const { user, isAuthenticated, login, logout } = useAuth();
  
  // Your component logic
};
```

## 🏗️ Building

### Web Build

```bash
npm run build
```

Output: `dist/` directory

### Mobile Build

#### iOS

```bash
npm install @capacitor/ios
npx cap add ios
npm run build
npx cap sync
npx cap open ios
```

#### Android

```bash
npm install @capacitor/android
npx cap add android
npm run build
npx cap sync
npx cap open android
```

## 🧪 Testing

### Unit Tests

```bash
npm run test.unit
```

### E2E Tests

```bash
npm run test.e2e
```

### Manual Testing

1. **Authentication Flow**:
   - Register new account
   - Login with credentials
   - Access protected routes
   - Logout

2. **Token Management**:
   - Check tokens in localStorage
   - Verify auto-refresh on expiration
   - Test logout token cleanup

3. **Protected Routes**:
   - Try accessing without auth
   - Verify redirect to login
   - Test access after login

## 🚀 Deployment

### Web Deployment

1. Build the app:
   ```bash
   npm run build
   ```

2. Deploy `dist/` folder to:
   - Netlify
   - Vercel
   - Firebase Hosting
   - AWS S3 + CloudFront
   - Any static hosting service

### Mobile Deployment

#### iOS App Store

1. Build in Xcode
2. Archive the app
3. Submit to App Store Connect

#### Google Play Store

1. Build signed APK/AAB in Android Studio
2. Upload to Google Play Console
3. Submit for review

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

### Common Issues

**Cannot connect to API**
- Check backend is running
- Verify API URL in `.env`
- Check CORS configuration

**Login failed**
- Verify credentials
- Check Network tab for errors
- Review backend logs

**CORS errors**
- Configure backend CORS headers
- Allow your domain in backend

### Getting Help

1. Check the documentation
2. Review browser console
3. Check Network tab for API errors
4. Verify backend is running
5. Check backend logs

## 🔗 Resources

- [Ionic Documentation](https://ionicframework.com/docs)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Vite Documentation](https://vitejs.dev)
- [Axios Documentation](https://axios-http.com)

## 📊 Tech Stack

- **Framework**: Ionic React 8.5.0
- **UI Library**: React 19.0.0
- **Language**: TypeScript 5.1.6
- **Build Tool**: Vite 5.2.0
- **HTTP Client**: Axios 1.6.0
- **Routing**: React Router 5.3.4
- **State Management**: React Context API
- **Authentication**: JWT (JSON Web Tokens)
- **Testing**: Vitest + Cypress

## ✨ Features Roadmap

### Completed ✅
- [x] User authentication & authorization
- [x] Role-based access control (RBAC)
- [x] Protected routes with role guards
- [x] User profile management
- [x] Password reset flow
- [x] Admin dashboard with statistics
- [x] User management (CRUD)
- [x] Vehicle management (CRUD)
- [x] Trip management & monitoring
- [x] System settings configuration
- [x] Dynamic trip types
- [x] Trip booking system
- [x] Responsive design (mobile/tablet/desktop)

### Planned 📋
- [ ] Email verification
- [ ] Two-factor authentication
- [ ] Real-time updates (WebSocket)
- [ ] Advanced analytics & charts
- [ ] Push notifications
- [ ] Payment integration
- [ ] Mobile native apps
- [ ] Offline mode support

## 👥 Authors

- Your Name - Initial work

## 🙏 Acknowledgments

- Ionic team for the amazing framework
- React team for the excellent library
- All contributors and supporters

---

**Made with ❤️ using Ionic React**

For detailed documentation, see the docs folder or individual markdown files in the project root.
