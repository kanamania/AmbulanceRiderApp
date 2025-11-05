import { PushNotifications, Token, PushNotificationSchema, ActionPerformed } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import apiService from './api.service';

export interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

class NotificationService {
  private isInitialized = false;
  private deviceToken: string | null = null;

  /**
   * Initialize push notifications
   * This should be called once when the app starts
   */
  async initialize(): Promise<void> {
    // Only initialize on native platforms
    if (!Capacitor.isNativePlatform()) {
      console.log('Push notifications are only available on native platforms');
      return;
    }

    if (this.isInitialized) {
      return;
    }

    try {
      // Request permission to use push notifications
      const permStatus = await PushNotifications.requestPermissions();

      if (permStatus.receive === 'granted') {
        // Register with Apple / Google to receive push via APNS/FCM
        await PushNotifications.register();
        this.isInitialized = true;
        console.log('Push notifications initialized successfully');
      } else {
        console.warn('Push notification permission not granted');
      }

      // Setup listeners
      this.setupListeners();
    } catch (error) {
      console.error('Error initializing push notifications:', error);
    }
  }

  /**
   * Setup notification event listeners
   */
  private setupListeners(): void {
    // On successful registration
    PushNotifications.addListener('registration', (token: Token) => {
      console.log('Push registration success, token: ' + token.value);
      this.deviceToken = token.value;
      this.sendTokenToServer(token.value);
    });

    // On registration error
    PushNotifications.addListener('registrationError', (err: unknown) => {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error('Error on registration: ' + JSON.stringify(error));
    });

    // Show notification when app is in foreground
    PushNotifications.addListener(
      'pushNotificationReceived',
      (notification: PushNotificationSchema) => {
        console.log('Push notification received: ', notification);
        // You can show a local notification or update the UI
        this.handleNotificationReceived(notification);
      }
    );

    // Handle notification tap
    PushNotifications.addListener(
      'pushNotificationActionPerformed',
      (notification: ActionPerformed) => {
        console.log('Push notification action performed', notification);
        this.handleNotificationAction(notification);
      }
    );
  }

  /**
   * Send device token to backend server
   */
  private async sendTokenToServer(token: string): Promise<void> {
    try {
      await apiService.post('/notifications/register-device', {
        token,
        platform: Capacitor.getPlatform(),
      });
      console.log('Device token sent to server successfully');
    } catch (error) {
      console.error('Error sending device token to server:', error);
    }
  }

  /**
   * Handle notification received while app is in foreground
   */
  private handleNotificationReceived(notification: PushNotificationSchema): void {
    // You can implement custom logic here
    // For example, show a toast or update the UI
    console.log('Notification received:', notification.title, notification.body);
  }

  /**
   * Handle notification tap/action
   */
  private handleNotificationAction(action: ActionPerformed): void {
    const data = action.notification.data;
    
    // Navigate based on notification type
    if (data?.type === 'trip_created' || data?.type === 'trip_status_changed') {
      // You can use a router or event emitter to navigate
      console.log('Navigate to trip:', data.tripId);
      // Example: window.location.href = `/admin/trips/${data.tripId}`;
    }
  }

  /**
   * Get the current device token
   */
  getDeviceToken(): string | null {
    return this.deviceToken;
  }

  /**
   * Check if push notifications are available
   */
  isAvailable(): boolean {
    return Capacitor.isNativePlatform();
  }

  /**
   * Send a local notification (for testing or immediate feedback)
   */
  async sendLocalNotification(payload: NotificationPayload): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      console.log('Local notifications only available on native platforms');
      return;
    }

    try {
      // Note: You might need to add @capacitor/local-notifications plugin for this
      console.log('Local notification:', payload);
    } catch (error) {
      console.error('Error sending local notification:', error);
    }
  }

  /**
   * Request notification for trip creation (called by users)
   */
  async notifyTripCreated(tripId: number): Promise<void> {
    try {
      await apiService.post('/notifications/trip-created', { tripId });
      console.log('Trip creation notification sent');
    } catch (error) {
      console.error('Error sending trip creation notification:', error);
    }
  }

  /**
   * Request notification for trip status change
   */
  async notifyTripStatusChanged(tripId: number, status: string): Promise<void> {
    try {
      await apiService.post('/notifications/trip-status-changed', {
        tripId,
        status,
      });
      console.log('Trip status change notification sent');
    } catch (error) {
      console.error('Error sending trip status change notification:', error);
    }
  }

  /**
   * Unregister from push notifications
   */
  async unregister(): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    try {
      await PushNotifications.removeAllListeners();
      this.isInitialized = false;
      this.deviceToken = null;
      console.log('Push notifications unregistered');
    } catch (error) {
      console.error('Error unregistering push notifications:', error);
    }
  }
}

export default new NotificationService();
