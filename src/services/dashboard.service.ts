import apiService from './api.service';
import { API_CONFIG } from '../config/api.config';

interface DashboardStats {
  totalUsers: number;
  activeTrips: number;
  completedTrips: number;
  totalVehicles: number;
  pendingRequests: number;
  availableDrivers: number;
}

/**
 * Fetches dashboard statistics from the API
 */
export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    const response = await apiService.get<DashboardStats>(
      API_CONFIG.ENDPOINTS.DASHBOARD.STATS
    );
    return response;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    // Return mock data in case of error for development
    if (import.meta.env.DEV) {
      return {
        totalUsers: 1245,
        activeTrips: 18,
        completedTrips: 982,
        totalVehicles: 42,
        pendingRequests: 7,
        availableDrivers: 23,
      };
    }
    throw error;
  }
};

/**
 * Fetches recent activities for the dashboard
 */
export const getRecentActivities = async (limit: number = 10) => {
  try {
    const response = await apiService.get(
      `${API_CONFIG.ENDPOINTS.DASHBOARD.ACTIVITIES}?limit=${limit}`
    );
    return response;
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    return [];
  }
};

/**
 * Fetches system health metrics
 */
export const getSystemHealth = async () => {
  try {
    const response = await apiService.get(API_CONFIG.ENDPOINTS.DASHBOARD.HEALTH);
    return response;
  } catch (error) {
    console.error('Error fetching system health:', error);
    return null;
  }
};

/**
 * Fetches trip statistics for the dashboard
 */
export const getTripStatistics = async (period: 'day' | 'week' | 'month' = 'week') => {
  try {
    const response = await apiService.get(
      `${API_CONFIG.ENDPOINTS.DASHBOARD.TRIP_STATS}?period=${period}`
    );
    return response;
  } catch (error) {
    console.error('Error fetching trip statistics:', error);
    return null;
  }
};

export default {
  getDashboardStats,
  getRecentActivities,
  getSystemHealth,
  getTripStatistics,
};
