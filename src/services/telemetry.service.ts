import apiService from './api.service';
import { API_CONFIG } from '../config/api.config';
import {
  TelemetryEvent,
  BatchTelemetryRequest,
  BatchTelemetryResponse,
  TelemetryLogResponse,
  TimeseriesQueryRequest,
  TelemetryTimeseriesDto,
} from '../types';

class TelemetryService {
  /**
   * Log a single telemetry event
   * Authorization: Optional (can be anonymous)
   */
  async logEvent(event: TelemetryEvent): Promise<TelemetryLogResponse> {
    try {
      const response = await apiService.post<TelemetryLogResponse>(
        API_CONFIG.ENDPOINTS.TELEMETRY.LOG,
        event
      );
      return response;
    } catch (error) {
      console.error('Failed to log telemetry event:', error);
      // Don't throw - telemetry should never block main operations
      return { message: 'Telemetry logging failed silently' };
    }
  }

  /**
   * Log multiple telemetry events in a batch
   * Authorization: Optional (authenticated user ID will be used if available)
   */
  async logBatch(request: BatchTelemetryRequest): Promise<BatchTelemetryResponse> {
    try {
      const response = await apiService.post<BatchTelemetryResponse>(
        API_CONFIG.ENDPOINTS.TELEMETRY.BATCH,
        request
      );
      return response;
    } catch (error) {
      console.error('Failed to log batch telemetry:', error);
      // Don't throw - telemetry should never block main operations
      return { message: 'Batch telemetry logging failed silently', count: 0 };
    }
  }

  /**
   * Query telemetry data within a time range
   * Authorization: Admin, Dispatcher
   */
  async queryTimeseries(request: TimeseriesQueryRequest): Promise<TelemetryTimeseriesDto[]> {
    try {
      const response = await apiService.post<TelemetryTimeseriesDto[]>(
        API_CONFIG.ENDPOINTS.TELEMETRY.TIMESERIES,
        request
      );
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to query telemetry timeseries';
      throw new Error(message);
    }
  }

  /**
   * Get timeseries telemetry data for a specific user
   * Authorization: User (own data only), Admin, Dispatcher (any user)
   */
  async getUserTimeseries(
    userId: string,
    startTime: string,
    endTime: string,
    eventType?: string
  ): Promise<TelemetryTimeseriesDto[]> {
    try {
      const params = new URLSearchParams({
        startTime,
        endTime,
        ...(eventType && { eventType }),
      });

      const response = await apiService.get<TelemetryTimeseriesDto[]>(
        `${API_CONFIG.ENDPOINTS.TELEMETRY.USER_TIMESERIES(userId)}?${params.toString()}`
      );
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get user telemetry timeseries';
      throw new Error(message);
    }
  }

  /**
   * Get timeseries telemetry data for the current authenticated user
   * Authorization: Required (any authenticated user)
   */
  async getMyTimeseries(
    startTime: string,
    endTime: string,
    eventType?: string
  ): Promise<TelemetryTimeseriesDto[]> {
    try {
      const params = new URLSearchParams({
        startTime,
        endTime,
        ...(eventType && { eventType }),
      });

      const response = await apiService.get<TelemetryTimeseriesDto[]>(
        `${API_CONFIG.ENDPOINTS.TELEMETRY.ME_TIMESERIES}?${params.toString()}`
      );
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get my telemetry timeseries';
      throw new Error(message);
    }
  }

  /**
   * Helper: Create a location update event
   */
  createLocationEvent(
    latitude: number,
    longitude: number,
    speed?: number,
    heading?: number,
    accuracy?: number,
    details?: string
  ): TelemetryEvent {
    return {
      eventType: 'LocationUpdate',
      eventDetails: details || 'Periodic location update',
      telemetry: {
        latitude,
        longitude,
        speed,
        heading,
        accuracy,
        timestamp: new Date().toISOString(),
      },
    };
  }

  /**
   * Helper: Batch location updates for efficient logging
   */
  async logLocationBatch(locations: Array<{
    latitude: number;
    longitude: number;
    speed?: number;
    heading?: number;
    accuracy?: number;
    timestamp?: string;
    details?: string;
  }>): Promise<BatchTelemetryResponse> {
    const events: TelemetryEvent[] = locations.map(loc => ({
      eventType: 'LocationUpdate',
      eventDetails: loc.details || 'Periodic location update',
      telemetry: {
        latitude: loc.latitude,
        longitude: loc.longitude,
        speed: loc.speed,
        heading: loc.heading,
        accuracy: loc.accuracy,
        timestamp: loc.timestamp || new Date().toISOString(),
      },
    }));

    return this.logBatch({ events });
  }
}

export default new TelemetryService();
