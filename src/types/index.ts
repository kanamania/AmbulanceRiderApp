// Re-export auth types
export * from './auth.types';

// Location types
export interface Location {
  id: number;
  name: string;
  imagePath?: string;
  imageUrl?: string;
  createdAt: string;
}

export interface CreateLocationData {
  name: string;
  image?: File;
}

export interface UpdateLocationData {
  name?: string;
  image?: File;
  removeImage?: boolean;
}

// Route types
export interface Route {
  id: number;
  name: string;
  distance: number;
  estimatedDuration: number;
  description?: string;
  createdAt: string;
  fromLocation: {
    id: number;
    name: string;
  };
  toLocation: {
    id: number;
    name: string;
  };
  fromLocationId: number;
  toLocationId: number;
}

export interface CreateRouteData {
  name: string;
  fromLocationId: number;
  toLocationId: number;
  distance: number;
  estimatedDuration: number;
  description?: string;
}

export interface UpdateRouteData {
  name?: string;
  fromLocationId?: number;
  toLocationId?: number;
  distance?: number;
  estimatedDuration?: number;
  description?: string;
}

// Vehicle types
export interface VehicleType {
  id: number;
  name: string;
}

export interface Vehicle {
  id: number;
  name: string;
  imagePath?: string;
  imageUrl?: string;
  types: string[];
  createdAt: string;
}

export interface CreateVehicleData {
  name: string;
  image?: File;
  types: string[];
}

export interface UpdateVehicleData {
  name?: string;
  image?: File;
  removeImage?: boolean;
  types?: string[];
}

// User management types (for admin)
export interface CreateUserData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  image?: File;
  roleIds: number[];
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  password?: string;
  image?: File;
  removeImage?: boolean;
  roleIds?: number[];
}

// File upload types
export interface FileUploadResponse {
  filePath: string;
  fileUrl: string;
}

// Common API response types
export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}
