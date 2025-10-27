// Telemetry data structure for API requests
export interface TelemetryData {
  // Device Information
  deviceType?: 'Mobile' | 'Desktop' | 'Tablet';
  deviceModel?: string;
  operatingSystem?: 'Android' | 'iOS' | 'Windows' | 'macOS' | 'Linux';
  osVersion?: string;
  browser?: 'Chrome' | 'Firefox' | 'Safari' | 'Edge';
  browserVersion?: string;
  appVersion?: string;
  
  // Account Information
  googleAccount?: string;
  appleAccount?: string;
  accountType?: 'Google' | 'Apple' | 'None';
  
  // Installed Apps
  installedApps?: string; // JSON array
  installedAppsCount?: number;
  
  // GPS/Location
  latitude?: number;
  longitude?: number;
  accuracy?: number; // meters
  altitude?: number; // meters
  speed?: number; // m/s
  heading?: number; // degrees
  locationTimestamp?: string;
  
  // Network
  ipAddress?: string;
  connectionType?: 'wifi' | 'cellular' | 'ethernet';
  isOnline?: boolean;
  
  // Screen
  screenWidth?: number;
  screenHeight?: number;
  orientation?: 'portrait' | 'landscape';
  
  // Battery
  batteryLevel?: number; // 0-1
  isCharging?: boolean;
  
  // Timestamp
  timestamp?: string;
}

// Telemetry event for logging
export interface TelemetryEvent {
  eventType: string;
  eventDetails?: string;
  telemetry: TelemetryData;
}

// Batch telemetry request
export interface BatchTelemetryRequest {
  events: TelemetryEvent[];
}

// Batch telemetry response
export interface BatchTelemetryResponse {
  message: string;
  count: number;
}

// Telemetry log response
export interface TelemetryLogResponse {
  message: string;
}

// Timeseries query request
export interface TimeseriesQueryRequest {
  startTime: string;
  endTime: string;
  eventType?: string;
  limit?: number;
}

// Timeseries data point
export interface TelemetryTimeseriesDto {
  id: number;
  eventType: string;
  eventDetails?: string;
  userId?: string;
  userName?: string;
  latitude?: number;
  longitude?: number;
  speed?: number;
  batteryLevel?: number;
  deviceType?: string;
  operatingSystem?: string;
  createdAt: string;
  eventTimestamp: string;
}
