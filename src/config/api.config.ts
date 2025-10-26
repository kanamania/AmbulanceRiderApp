// API Configuration
export const API_CONFIG = {
  // Update this with your actual API URL
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  TIMEOUT: 30000,
  
  // API Endpoints
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      LOGOUT: '/auth/logout',
      REFRESH: '/auth/refresh',
      ME: '/auth/me',
      FORGOT_PASSWORD: '/auth/forgot-password',
      RESET_PASSWORD: '/auth/reset-password',
    },
    USERS: {
      PROFILE: '/users/profile',
      UPDATE_PROFILE: '/users/profile',
    },
    AMBULANCE: {
      LIST: '/ambulances',
      DETAILS: '/ambulances/:id',
      REQUEST: '/ambulances/request',
    },
  },
};

// Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
};
