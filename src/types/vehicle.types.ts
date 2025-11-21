export type VehicleStatus = 'available' | 'in_use' | 'maintenance' | 'out_of_service';

export interface VehicleType {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Vehicle {
  id: number;
  name: string;
  plateNumber: string;
  image?: string;
  vehicleTypeId: number;
  vehicleType?: VehicleType;
  createdAt?: string;
  updatedAt?: string;
}

export interface VehicleFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: VehicleStatus;
  vehicleTypeId?: number;
  isActive?: boolean;
}

export interface VehicleFormData {
  name: string;
  plateNumber: string;
  image?: File | string;
  vehicleTypeId: number;
}
