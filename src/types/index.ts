// Re-export auth types
export * from './auth.types';
export * from './telemetry.types';

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

// Trip Type Attribute types
export interface TripTypeAttribute {
  id: number;
  tripTypeId: number;
  name: string;
  label: string;
  description?: string;
  dataType: 'text' | 'textarea' | 'number' | 'date' | 'boolean' | 'select';
  isRequired: boolean;
  displayOrder: number;
  options?: string; // JSON string for select options
  defaultValue?: string;
  validationRules?: string; // JSON string
  placeholder?: string;
  isActive: boolean;
  createdAt: string;
}

// Create trip type attribute request
export interface CreateTripTypeAttributeRequest {
  tripTypeId: number;
  name: string;
  label: string;
  description?: string;
  dataType: 'text' | 'textarea' | 'number' | 'date' | 'boolean' | 'select';
  isRequired: boolean;
  displayOrder: number;
  options?: string;
  defaultValue?: string;
  validationRules?: string;
  placeholder?: string;
  isActive: boolean;
}

// Update trip type attribute request
export interface UpdateTripTypeAttributeRequest {
  name?: string;
  label?: string;
  description?: string;
  dataType?: 'text' | 'textarea' | 'number' | 'date' | 'boolean' | 'select';
  isRequired?: boolean;
  displayOrder?: number;
  options?: string;
  defaultValue?: string;
  validationRules?: string;
  placeholder?: string;
  isActive?: boolean;
}

// Create trip type request
export interface CreateTripTypeRequest {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  isActive: boolean;
  displayOrder: number;
}

// Update trip type request
export interface UpdateTripTypeRequest {
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
  isActive?: boolean;
  displayOrder?: number;
}

// Trip Type types
export interface TripType {
  id: number;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  attributes: TripTypeAttribute[];
}

// Trip types
export interface Trip {
  id: number;
  userId: number;
  tripTypeId?: number;
  fromLocationId?: number;
  toLocationId?: number;
  fromAddress: string;
  toAddress: string;
  fromLatitude: number;
  fromLongitude: number;
  toLatitude: number;
  toLongitude: number;
  patientName?: string;
  emergencyType?: string;
  notes?: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  attributeValues?: Record<string, any>; // Dynamic attribute values
}

export interface CreateTripData {
  tripTypeId?: number;
  fromLocationId?: number;
  toLocationId?: number;
  fromAddress: string;
  toAddress: string;
  fromLatitude: number;
  fromLongitude: number;
  toLatitude: number;
  toLongitude: number;
  patientName?: string;
  emergencyType?: string;
  notes?: string;
  attributeValues?: Record<string, any>; // Dynamic attribute values
  telemetry?: import('./telemetry.types').TelemetryData;
}

// Trip approval request
export interface ApproveTripRequest {
  approve: boolean;
  rejectionReason?: string;
  telemetry?: import('./telemetry.types').TelemetryData;
}

// Trip start request
export interface StartTripRequest {
  actualStartTime: string;
  telemetry?: import('./telemetry.types').TelemetryData;
}

// Trip complete request
export interface CompleteTripRequest {
  actualEndTime: string;
  notes?: string;
  telemetry?: import('./telemetry.types').TelemetryData;
}

// Trip cancel request
export interface CancelTripRequest {
  reason?: string;
}

// Trip status update request
export interface UpdateTripStatusRequest {
  id: number;
  status: number; // 0=Pending, 1=Approved, 2=Rejected, 3=InProgress, 4=Completed, 5=Cancelled
  notes?: string;
  rejectionReason?: string;
  forceComplete?: boolean;
}

// Trip status log
export interface TripStatusLog {
  id: number;
  tripId: number;
  fromStatus: string;
  toStatus: string;
  changedBy: string;
  changedAt: string;
  notes?: string;
  rejectionReason?: string;
  isForceComplete: boolean;
  userRole: string;
  userName: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
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
