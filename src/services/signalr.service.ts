/**
 * SignalR Service
 * 
 * Handles real-time WebSocket connections to the backend SignalR hubs.
 * 
 * Backend hubs:
 * - /hubs/notifications - General notifications
 * - /hubs/trips - Trip updates and status changes
 * 
 * Note: Install @microsoft/signalr package first:
 * npm install @microsoft/signalr
 */

import * as signalR from '@microsoft/signalr';
import notificationService from './notification.service';
import {authService} from "./index";

const SIGNALR_BASE_URL = (import.meta.env.VITE_API_URL as string).replace(/\/api\/?$/, '');

class SignalRService {
  private notificationConnection: signalR.HubConnection | null = null;
  private tripConnection: signalR.HubConnection | null = null;
  private isConnected = false;

  /**
   * Initialize SignalR connections
   */
  async initialize(): Promise<void> {
    const token = authService.getAccessToken();
    
    if (!token) {
      console.log('No auth token available, skipping SignalR initialization');
      return;
    }

    try {
      const results = await Promise.allSettled([
        this.connectToNotificationHub(token),
        this.connectToTripHub(token),
      ]);
      const ok = results.some(r => r.status === 'fulfilled');
      this.isConnected = ok;
      if (ok) {
        console.log('SignalR connections established');
      }
    } catch (error) {
      console.error('Error initializing SignalR:', error);
    }
  }

  /**
   * Connect to the notification hub
   */
  private async connectToNotificationHub(token: string): Promise<void> {
    this.notificationConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${SIGNALR_BASE_URL}/hubs/notifications`, {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    // Listen for notification events
    this.notificationConnection.on('ReceiveNotification', (notification: {
      title: string;
      message: string;
      type?: string;
      data?: Record<string, unknown>;
    }) => {
      console.log('Received notification:', notification);
      
      notificationService.addNotification({
        title: notification.title,
        body: notification.message,
        data: {
          type: notification.type,
          ...notification.data,
        },
      });
    });

    // Handle reconnection
    this.notificationConnection.onreconnected(() => {
      console.log('Notification hub reconnected');
    });

    this.notificationConnection.onreconnecting(() => {
      console.log('Notification hub reconnecting...');
    });

    this.notificationConnection.onclose(() => {
      console.log('Notification hub connection closed');
      this.isConnected = false;
    });

    await this.notificationConnection.start();
    console.log('Connected to notification hub');
    
    // Join role-based groups for receiving broadcasts
    await this.joinRoleGroups();
  }

  /**
   * Join role-based groups on the notification hub
   */
  private async joinRoleGroups(): Promise<void> {
    if (!this.notificationConnection || this.notificationConnection.state !== signalR.HubConnectionState.Connected) {
      return;
    }

    try {
      const userData = authService.getUserData();
      if (!userData?.roles) return;

      const roles = userData.roles.map((r: string) => r.toLowerCase());
      
      // Join groups based on user roles
      if (roles.includes('admin')) {
        await this.notificationConnection.invoke('JoinGroup', 'admins');
        console.log('Joined admins group');
      }
      if (roles.includes('dispatcher')) {
        await this.notificationConnection.invoke('JoinGroup', 'dispatchers');
        console.log('Joined dispatchers group');
      }
      if (roles.includes('driver')) {
        await this.notificationConnection.invoke('JoinGroup', 'drivers');
        console.log('Joined drivers group');
      }
    } catch (error) {
      console.error('Error joining role groups:', error);
    }
  }

  /**
   * Connect to the trip hub
   */
  private async connectToTripHub(token: string): Promise<void> {
    this.tripConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${SIGNALR_BASE_URL}/hubs/trips`, {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    // Listen for trip events - both frontend naming and backend naming conventions
    this.tripConnection.on('TripCreated', (trip: unknown) => {
      console.log('Trip created:', trip);
      notificationService.addNotification({
        title: 'New Trip',
        body: 'A new trip has been created',
        data: { type: 'trip_created', trip },
      });
    });

    // Backend sends TripStatusChanged
    this.tripConnection.on('TripStatusChanged', (data: {
      tripId?: number;
      TripId?: number;
      status?: string;
      NewStatus?: string;
      OldStatus?: string;
      message?: string;
      Message?: string;
    }) => {
      const tripId = data.tripId || data.TripId;
      const status = data.status || data.NewStatus;
      const message = data.message || data.Message || `Trip ${tripId} status changed to ${status}`;
      console.log('Trip status changed:', data);
      notificationService.addNotification({
        title: 'Trip Status Update',
        body: message,
        data: { type: 'trip_status_changed', tripId, status, ...data },
      });
    });

    // Backend sends ReceiveTripStatusChange (alternative event name)
    this.tripConnection.on('ReceiveTripStatusChange', (data: unknown) => {
      console.log('Received trip status change:', data);
      const d = data as Record<string, unknown>;
      notificationService.addNotification({
        title: 'Trip Status Update',
        body: `Trip status has been updated`,
        data: { type: 'trip_status_changed', ...d },
      });
    });

    this.tripConnection.on('TripUpdated', (trip: unknown) => {
      console.log('Trip updated:', trip);
    });

    // Backend sends ReceiveTripUpdate
    this.tripConnection.on('ReceiveTripUpdate', (data: unknown) => {
      console.log('Received trip update:', data);
    });

    // Location updates for tracking
    this.tripConnection.on('ReceiveLocationUpdate', (data: {
      TripId: number;
      Latitude: number;
      Longitude: number;
      Timestamp: string;
    }) => {
      console.log('Location update received:', data);
    });

    // Handle reconnection
    this.tripConnection.onreconnected(() => {
      console.log('Trip hub reconnected');
    });

    this.tripConnection.onreconnecting(() => {
      console.log('Trip hub reconnecting...');
    });

    this.tripConnection.onclose(() => {
      console.log('Trip hub connection closed');
    });

    await this.tripConnection.start();
    console.log('Connected to trip hub');
  }

  /**
   * Disconnect from all hubs
   */
  async disconnect(): Promise<void> {
    try {
      if (this.notificationConnection) {
        await this.notificationConnection.stop();
        this.notificationConnection = null;
      }

      if (this.tripConnection) {
        await this.tripConnection.stop();
        this.tripConnection = null;
      }

      this.isConnected = false;
      console.log('SignalR connections closed');
    } catch (error) {
      console.error('Error disconnecting SignalR:', error);
    }
  }

  /**
   * Check if connected
   */
  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  /**
   * Send a message to a hub (example method)
   */
  async sendMessage(hubName: 'notifications' | 'trips', method: string, ...args: unknown[]): Promise<void> {
    const connection = hubName === 'notifications' ? this.notificationConnection : this.tripConnection;
    
    if (!connection || connection.state !== signalR.HubConnectionState.Connected) {
      console.error(`${hubName} hub is not connected`);
      return;
    }

    try {
      await connection.invoke(method, ...args);
    } catch (error) {
      console.error(`Error sending message to ${hubName} hub:`, error);
    }
  }

  /**
   * Subscribe to updates for a specific trip
   */
  async subscribeToTrip(tripId: number): Promise<void> {
    if (!this.tripConnection || this.tripConnection.state !== signalR.HubConnectionState.Connected) {
      console.error('Trip hub is not connected');
      return;
    }
    try {
      await this.tripConnection.invoke('SubscribeToTrip', tripId);
      console.log(`Subscribed to trip ${tripId}`);
    } catch (error) {
      console.error(`Error subscribing to trip ${tripId}:`, error);
    }
  }

  /**
   * Unsubscribe from updates for a specific trip
   */
  async unsubscribeFromTrip(tripId: number): Promise<void> {
    if (!this.tripConnection || this.tripConnection.state !== signalR.HubConnectionState.Connected) {
      return;
    }
    try {
      await this.tripConnection.invoke('UnsubscribeFromTrip', tripId);
      console.log(`Unsubscribed from trip ${tripId}`);
    } catch (error) {
      console.error(`Error unsubscribing from trip ${tripId}:`, error);
    }
  }

  /**
   * Register event listener for SignalR events
   */
  on(event: string, callback: (...args: unknown[]) => void): void {
    // Register on both connections if available
    if (this.notificationConnection) {
      this.notificationConnection.on(event, callback);
    }
    if (this.tripConnection) {
      this.tripConnection.on(event, callback);
    }
  }

  /**
   * Remove event listener for SignalR events
   */
  off(event: string, callback?: (...args: unknown[]) => void): void {
    // Remove from both connections if available
    if (this.notificationConnection) {
      if (callback) {
        this.notificationConnection.off(event, callback);
      } else {
        this.notificationConnection.off(event);
      }
    }
    if (this.tripConnection) {
      if (callback) {
        this.tripConnection.off(event, callback);
      } else {
        this.tripConnection.off(event);
      }
    }
  }
}

export default new SignalRService();
