/**
 * Notification Service
 * 
 * This service handles real-time notifications via SignalR.
 * The backend uses SignalR hubs at:
 * - /hubs/notifications - For general notifications
 * - /hubs/trips - For trip-related updates
 * 
 * Note: This does NOT use Firebase Cloud Messaging or APNs.
 * All real-time updates come through SignalR WebSocket connections.
 */

import apiService from './api.service';

export interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

class NotificationService {
  private notifications: NotificationPayload[] = [];
  private listeners: Array<(notification: NotificationPayload) => void> = [];

  /**
   * Add a notification to the history
   */
  addNotification(notification: NotificationPayload): void {
    this.notifications.unshift(notification);
    // Keep only last 50 notifications
    if (this.notifications.length > 50) {
      this.notifications = this.notifications.slice(0, 50);
    }
    
    // Notify all listeners
    this.listeners.forEach(listener => listener(notification));
    
    console.log('Notification added:', notification);
  }

  /**
   * Get all notifications
   */
  getNotifications(): NotificationPayload[] {
    return [...this.notifications];
  }

  /**
   * Clear all notifications
   */
  clearNotifications(): void {
    this.notifications = [];
  }

  /**
   * Subscribe to new notifications
   */
  subscribe(callback: (notification: NotificationPayload) => void): () => void {
    this.listeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Show a local notification (for in-app display)
   */
  showNotification(payload: NotificationPayload): void {
    this.addNotification(payload);
    
    // You can add toast/alert logic here if needed
    console.log('Showing notification:', payload.title);
  }

  /**
   * Notify about trip creation
   * Sends a request to backend which will broadcast via SignalR
   */
  async notifyTripCreated(tripId: number): Promise<void> {
    try {
      await apiService.post('/notifications/trip-created', { tripId });
      console.log('Trip creation notification sent to backend');
    } catch (error) {
      console.error('Error sending trip creation notification:', error);
      throw error;
    }
  }

  /**
   * Notify about trip status change
   * Sends a request to backend which will broadcast via SignalR
   */
  async notifyTripStatusChanged(tripId: number, status: string): Promise<void> {
    try {
      await apiService.post('/notifications/trip-status-changed', {
        tripId,
        status,
      });
      console.log('Trip status change notification sent to backend');
    } catch (error) {
      console.error('Error sending trip status change notification:', error);
      throw error;
    }
  }
}

export default new NotificationService();
