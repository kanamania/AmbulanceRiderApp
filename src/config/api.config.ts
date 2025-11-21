// API Configuration
export const API_CONFIG = {
  // Base URL for API requests
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  
  // Request timeout in milliseconds
  TIMEOUT: 30000,
  
  // Endpoints configuration
  ENDPOINTS: {
    // Dashboard endpoints
    DASHBOARD: {
      STATS: '/dashboard/stats',
      ACTIVITIES: '/dashboard/activities',
      HEALTH: '/dashboard/health',
      TRIP_STATS: '/dashboard/trip-stats',
      REVENUE: '/dashboard/revenue',
    },
    
    // Admin endpoints
    ADMIN: {
      USERS: {
        BASE: '/admin/users',
        BY_ID: (id: string | number) => `/admin/users/${id}`,
        ROLES: '/admin/users/roles',
        STATUS: (id: string | number) => `/admin/users/${id}/status`,
      },
      VEHICLES: {
        BASE: '/admin/vehicles',
        BY_ID: (id: string | number) => `/admin/vehicles/${id}`,
        MAINTENANCE: (id: string | number) => `/admin/vehicles/${id}/maintenance`,
      },
      TRIPS: {
        BASE: '/admin/trips',
        BY_ID: (id: string | number) => `/admin/trips/${id}`,
        ASSIGN_DRIVER: (id: string | number) => `/admin/trips/${id}/assign-driver`,
      },
      SYSTEM: {
        SETTINGS: '/admin/system/settings',
        LOGS: '/admin/system/logs',
        BACKUP: '/admin/system/backup',
      },
    },
    
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
    SYSTEM: {
      DATA_HASHES: '/system/data',
    },
  },
};

// Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  USER_DATA: 'user_data',
};
