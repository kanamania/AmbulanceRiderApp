import { TelemetryData } from '../types/telemetry.types';

/**
 * Collects telemetry data from the browser/device
 * All data collection is optional and gracefully handles failures
 */
export class TelemetryCollector {
  /**
   * Collect basic telemetry data
   */
  static async collectBasicTelemetry(): Promise<TelemetryData> {
    const telemetry: TelemetryData = {
      timestamp: new Date().toISOString(),
    };

    try {
      // Device type detection
      telemetry.deviceType = this.getDeviceType();
      
      // Operating system
      telemetry.operatingSystem = this.getOperatingSystem();
      
      // Browser info
      const browserInfo = this.getBrowserInfo();
      telemetry.browser = browserInfo.name;
      telemetry.browserVersion = browserInfo.version;
      
      // Screen info
      telemetry.screenWidth = window.screen.width;
      telemetry.screenHeight = window.screen.height;
      telemetry.orientation = window.screen.orientation?.type?.includes('portrait') ? 'portrait' : 'landscape';
      
      // Network info
      telemetry.isOnline = navigator.onLine;
      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
      if (connection) {
        telemetry.connectionType = connection.effectiveType === '4g' || connection.effectiveType === '3g' 
          ? 'cellular' 
          : connection.type === 'wifi' ? 'wifi' : 'ethernet';
      }
      
      // Battery info (if available)
      if ('getBattery' in navigator) {
        try {
          const battery = await (navigator as any).getBattery();
          telemetry.batteryLevel = battery.level;
          telemetry.isCharging = battery.charging;
        } catch (e) {
          // Battery API not available or permission denied
        }
      }
      
      // App version (from package.json or environment)
      telemetry.appVersion = '1.0.0'; // TODO: Get from build config
      
    } catch (error) {
      console.warn('Error collecting telemetry:', error);
    }

    return telemetry;
  }

  /**
   * Collect telemetry with GPS location
   */
  static async collectTelemetryWithLocation(): Promise<TelemetryData> {
    const telemetry = await this.collectBasicTelemetry();

    try {
      const position = await this.getCurrentPosition();
      if (position) {
        telemetry.latitude = position.coords.latitude;
        telemetry.longitude = position.coords.longitude;
        telemetry.accuracy = position.coords.accuracy;
        telemetry.altitude = position.coords.altitude || undefined;
        telemetry.speed = position.coords.speed || undefined;
        telemetry.heading = position.coords.heading || undefined;
        telemetry.locationTimestamp = new Date(position.timestamp).toISOString();
      }
    } catch (error) {
      console.warn('Location not available:', error);
      // Continue without location data
    }

    return telemetry;
  }

  /**
   * Get current GPS position
   */
  private static getCurrentPosition(): Promise<GeolocationPosition | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => resolve(position),
        (error) => {
          console.warn('Geolocation error:', error);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );
    });
  }

  /**
   * Detect device type
   */
  private static getDeviceType(): 'Mobile' | 'Desktop' | 'Tablet' {
    const ua = navigator.userAgent;
    
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
      return 'Tablet';
    }
    
    if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
      return 'Mobile';
    }
    
    return 'Desktop';
  }

  /**
   * Detect operating system
   */
  private static getOperatingSystem(): 'Android' | 'iOS' | 'Windows' | 'macOS' | 'Linux' | undefined {
    const ua = navigator.userAgent;
    
    if (/android/i.test(ua)) return 'Android';
    if (/iPad|iPhone|iPod/.test(ua)) return 'iOS';
    if (/Win/.test(ua)) return 'Windows';
    if (/Mac/.test(ua)) return 'macOS';
    if (/Linux/.test(ua)) return 'Linux';
    
    return undefined;
  }

  /**
   * Get browser name and version
   */
  private static getBrowserInfo(): { name?: 'Chrome' | 'Firefox' | 'Safari' | 'Edge'; version?: string } {
    const ua = navigator.userAgent;
    let name: 'Chrome' | 'Firefox' | 'Safari' | 'Edge' | undefined;
    let version: string | undefined;

    if (ua.indexOf('Edg/') > -1) {
      name = 'Edge';
      version = ua.match(/Edg\/(\d+)/)?.[1];
    } else if (ua.indexOf('Chrome') > -1) {
      name = 'Chrome';
      version = ua.match(/Chrome\/(\d+)/)?.[1];
    } else if (ua.indexOf('Safari') > -1) {
      name = 'Safari';
      version = ua.match(/Version\/(\d+)/)?.[1];
    } else if (ua.indexOf('Firefox') > -1) {
      name = 'Firefox';
      version = ua.match(/Firefox\/(\d+)/)?.[1];
    }

    return { name, version };
  }
}
