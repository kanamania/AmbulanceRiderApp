// API Configuration
export const API_CONFIG = {
  // Update this with your actual API URL
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  TIMEOUT: 30000,
  
  // API Endpoints
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
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
    TRIPS: {
      LIST: '/trips',
      GET: (id: number) => `/trips/${id}`,
      CREATE: '/trips',
      UPDATE: (id: number) => `/trips/${id}`,
      DELETE: (id: number) => `/trips/${id}`,
      BY_STATUS: (status: string) => `/trips/status/${status}`,
      PENDING: '/trips/pending',
      BY_ROUTE: (routeId: number) => `/trips/route/${routeId}`,
      BY_DRIVER: (driverId: number) => `/trips/driver/${driverId}`,
      APPROVE: (id: number) => `/trips/${id}/approve`,
      START: (id: number) => `/trips/${id}/start`,
      COMPLETE: (id: number) => `/trips/${id}/complete`,
      CANCEL: (id: number) => `/trips/${id}/cancel`,
      UPDATE_STATUS: (id: number) => `/trips/${id}/status`,
      STATUS_LOGS: (id: number) => `/trips/${id}/status-logs`,
    },
    TRIP_TYPES: {
      LIST: '/triptypes',
      ACTIVE: '/triptypes/active',
      GET: (id: number) => `/triptypes/${id}`,
      CREATE: '/triptypes',
      UPDATE: (id: number) => `/triptypes/${id}`,
      DELETE: (id: number) => `/triptypes/${id}`,
      CREATE_ATTRIBUTE: '/triptypes/attributes',
      UPDATE_ATTRIBUTE: (id: number) => `/triptypes/attributes/${id}`,
      DELETE_ATTRIBUTE: (id: number) => `/triptypes/attributes/${id}`,
    },
    TELEMETRY: {
      LOG: '/telemetry',
      BATCH: '/telemetry/batch',
      TIMESERIES: '/telemetry/timeseries',
      USER_TIMESERIES: (userId: string) => `/telemetry/user/${userId}/timeseries`,
      ME_TIMESERIES: '/telemetry/me/timeseries',
    },
  },
};

// Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  USER_DATA: 'user_data',
};
