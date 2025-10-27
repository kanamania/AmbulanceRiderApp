// API Configuration
export const API_CONFIG = {
  // Update this with your actual API URL
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  TIMEOUT: 30000,
  
  // API Endpoints
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      FORGOT_PASSWORD: '/auth/forgot-password',
      RESET_PASSWORD: '/auth/reset-password',
    },
    USERS: {
      LIST: '/users',
      GET: (id: number) => `/users/${id}`,
      CREATE: '/users',
      UPDATE: (id: number) => `/users/${id}`,
      DELETE: (id: number) => `/users/${id}`,
    },
    LOCATIONS: {
      LIST: '/locations',
      GET: (id: number) => `/locations/${id}`,
      CREATE: '/locations',
      UPDATE: (id: number) => `/locations/${id}`,
      DELETE: (id: number) => `/locations/${id}`,
    },
    ROUTES: {
      LIST: '/routes',
      GET: (id: number) => `/routes/${id}`,
      CREATE: '/routes',
      UPDATE: (id: number) => `/routes/${id}`,
      DELETE: (id: number) => `/routes/${id}`,
    },
    VEHICLES: {
      LIST: '/vehicles',
      TYPES: '/vehicles/types',
      GET: (id: number) => `/vehicles/${id}`,
      CREATE: '/vehicles',
      UPDATE: (id: number) => `/vehicles/${id}`,
      DELETE: (id: number) => `/vehicles/${id}`,
    },
    FILE_UPLOAD: {
      VEHICLE_IMAGE: '/fileupload/vehicle-image',
      DELETE_VEHICLE_IMAGE: '/fileupload/vehicle-image',
    },
  },
};

// Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  USER_DATA: 'user_data',
};
