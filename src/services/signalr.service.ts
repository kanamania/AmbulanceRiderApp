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

const API_URL = import.meta.env.VITE_API_URL || 'https://localhost:5001';

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
      await this.connectToNotificationHub(token);
      await this.connectToTripHub(token);
      this.isConnected = true;
      console.log('SignalR connections established');
    } catch (error) {
      console.error('Error initializing SignalR:', error);
    }
  }

  /**
   * Connect to the notification hub
   */
  private async connectToNotificationHub(token: string): Promise<void> {
    this.notificationConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${API_URL}/hubs/notifications`, {
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
  }

  /**
   * Connect to the trip hub
   */
  private async connectToTripHub(token: string): Promise<void> {
    this.tripConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${API_URL}/hubs/trips`, {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    // Listen for trip events
    this.tripConnection.on('TripCreated', (trip: unknown) => {
      console.log('Trip created:', trip);
      
      notificationService.addNotification({
        title: 'New Trip',
        body: 'A new trip has been created',
        data: { type: 'trip_created', trip },
      });
    });

    this.tripConnection.on('TripStatusChanged', (data: {
      tripId: number;
      status: string;
      message?: string;
    }) => {
      console.log('Trip status changed:', data);
      
      notificationService.addNotification({
        title: 'Trip Status Update',
        body: data.message || `Trip status changed to ${data.status}`,
        data: { type: 'trip_status_changed', ...data },
      });
    });

    this.tripConnection.on('TripUpdated', (trip: unknown) => {
      console.log('Trip updated:', trip);
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
}

export default new SignalRService();
