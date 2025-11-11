/**
 * Application constants
 */

export const APP_CONSTANTS = {
  // App Info
  APP_NAME: 'Global Express',
  APP_VERSION: '1.0.0',

  // Token Expiration
  ACCESS_TOKEN_EXPIRY: 3600, // 1 hour in seconds
  REFRESH_TOKEN_EXPIRY: 2592000, // 30 days in seconds

  // Validation
  MIN_PASSWORD_LENGTH: 6,
  MAX_PASSWORD_LENGTH: 128,
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 100,

  // API
  API_TIMEOUT: 30000, // 30 seconds
  MAX_RETRY_ATTEMPTS: 3,

  // Pagination
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,

  // File Upload
  MAX_FILE_SIZE: 5242880, // 5MB in bytes
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],

  // Map
  DEFAULT_MAP_ZOOM: 13,
  DEFAULT_LOCATION: {
    lat: 40.7128,
    lng: -74.0060,
  },

  // Ambulance
  AMBULANCE_SEARCH_RADIUS: 10, // kilometers
  MAX_AMBULANCE_WAIT_TIME: 30, // minutes

  // User Roles
  ROLES: {
    USER: 'user',
    DRIVER: 'driver',
    ADMIN: 'admin',
  },

  // Emergency Types
  EMERGENCY_TYPES: [
    'cardiac',
    'respiratory',
    'trauma',
    'stroke',
    'allergic_reaction',
    'poisoning',
    'burns',
    'other',
  ],

  // Request Status
  REQUEST_STATUS: {
    PENDING: 'pending',
    ACCEPTED: 'accepted',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
  },

  // Ambulance Status
  AMBULANCE_STATUS: {
    AVAILABLE: 'available',
    BUSY: 'busy',
    OFFLINE: 'offline',
  },
};

export const ERROR_MESSAGES = {
  // Authentication
  INVALID_CREDENTIALS: 'Invalid email or password',
  UNAUTHORIZED: 'You are not authorized to perform this action',
  SESSION_EXPIRED: 'Your session has expired. Please login again',
  
  // Validation
  REQUIRED_FIELD: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_PHONE: 'Please enter a valid phone number',
  PASSWORD_TOO_SHORT: 'Password must be at least 6 characters',
  PASSWORDS_DONT_MATCH: 'Passwords do not match',
  
  // Network
  NETWORK_ERROR: 'Network error. Please check your connection',
  SERVER_ERROR: 'Server error. Please try again later',
  TIMEOUT_ERROR: 'Request timeout. Please try again',
  
  // Generic
  SOMETHING_WENT_WRONG: 'Something went wrong. Please try again',
  NOT_FOUND: 'The requested resource was not found',
};

export const SUCCESS_MESSAGES = {
  // Authentication
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logout successful',
  REGISTER_SUCCESS: 'Registration successful',
  
  // Profile
  PROFILE_UPDATED: 'Profile updated successfully',
  PASSWORD_CHANGED: 'Password changed successfully',
  
  // Ambulance
  REQUEST_SENT: 'Ambulance request sent successfully',
  REQUEST_CANCELLED: 'Request cancelled successfully',
};

export const ROUTES = {
  // Public
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  
  // Protected
  HOME: '/tabs/tab1',
  SERVICES: '/tabs/tab2',
  HISTORY: '/tabs/tab3',
  PROFILE: '/profile',
  
  // Tabs
  TABS: '/tabs',
  TAB1: '/tabs/tab1',
  TAB2: '/tabs/tab2',
  TAB3: '/tabs/tab3',
};
