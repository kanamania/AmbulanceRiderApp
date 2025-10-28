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
  licensePlate: string;
  make: string;
  model: string;
  year: number;
  color?: string;
  imageUrl?: string;
  vehicleTypeId: number;
  vehicleType?: VehicleType;
  status: VehicleStatus;
  capacity: number;
  mileage?: number;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  inServiceSince?: string;
  notes?: string;
  isActive: boolean;
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
  licensePlate: string;
  make: string;
  model: string;
  year: number;
  color?: string;
  vehicleTypeId: number;
  status: VehicleStatus;
  capacity: number;
  mileage?: number;
  lastMaintenanceDate?: string | null;
  nextMaintenanceDate?: string | null;
  notes?: string;
  isActive: boolean;
}
