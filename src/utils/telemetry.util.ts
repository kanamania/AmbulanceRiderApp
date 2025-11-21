import { TelemetryData } from '../types/telemetry.types';
import { App } from '@capacitor/app';
import { APP_CONSTANTS } from './constants';

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
      
      // Device model
      telemetry.deviceModel = this.getDeviceModel();
      
      // Operating system
      telemetry.operatingSystem = this.getOperatingSystem();
      
      // OS version
      telemetry.osVersion = this.getOSVersion();
      
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
      const connection = (navigator as unknown as { connection?: { effectiveType?: string; type?: string }, mozConnection?: { effectiveType?: string; type?: string }, webkitConnection?: { effectiveType?: string; type?: string } }).connection || 
        (navigator as unknown as { connection?: { effectiveType?: string; type?: string }, mozConnection?: { effectiveType?: string; type?: string }, webkitConnection?: { effectiveType?: string; type?: string } }).mozConnection || 
        (navigator as unknown as { connection?: { effectiveType?: string; type?: string }, mozConnection?: { effectiveType?: string; type?: string }, webkitConnection?: { effectiveType?: string; type?: string } }).webkitConnection;
      if (connection) {
        telemetry.connectionType = connection.effectiveType === '4g' || connection.effectiveType === '3g' 
          ? 'cellular' 
          : connection.type === 'wifi' ? 'wifi' : 'ethernet';
      }
      
      // Battery info (if available)
      if ('getBattery' in navigator) {
        try {
          const battery = await (navigator as unknown as { getBattery?: () => Promise<{ level: number; charging: boolean }> }).getBattery?.();
          if (battery) {
            telemetry.batteryLevel = battery.level;
            telemetry.isCharging = battery.charging;
          }
        } catch {
          // Battery API not available or permission denied
        }
      }
      
      // App version
      telemetry.appVersion = APP_CONSTANTS.APP_VERSION;
      
      // Account type detection
      telemetry.accountType = this.getAccountType();

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
          if ((error as GeolocationPositionError)?.code === 1) {
            App.exitApp();
            return;
          }
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
   * Get device model
   */
  private static getDeviceModel(): string | undefined {
    const ua = navigator.userAgent;
    
    // Try to extract device model from user agent
    // iOS devices
    const iosMatch = ua.match(/\(([^)]+)\)/);
    if (iosMatch && /iPhone|iPad|iPod/.test(ua)) {
      return iosMatch[1].split(';')[0].trim();
    }
    
    // Android devices
    const androidMatch = ua.match(/Android[^;]+;\s*([^)]+)/);
    if (androidMatch) {
      return androidMatch[1].trim();
    }
    
    // Desktop/Generic
    const platformMatch = ua.match(/\(([^)]+)\)/);
    if (platformMatch) {
      return platformMatch[1].split(';')[0].trim();
    }
    
    return undefined;
  }

  /**
   * Get OS version
   */
  private static getOSVersion(): string | undefined {
    const ua = navigator.userAgent;
    
    // Android version
    const androidMatch = ua.match(/Android\s([0-9.]+)/);
    if (androidMatch) return androidMatch[1];
    
    // iOS version
    const iosMatch = ua.match(/OS\s([0-9_]+)/);
    if (iosMatch) return iosMatch[1].replace(/_/g, '.');
    
    // Windows version
    const winMatch = ua.match(/Windows NT\s([0-9.]+)/);
    if (winMatch) {
      const version = winMatch[1];
      // Map NT versions to Windows versions
      const versionMap: { [key: string]: string } = {
        '10.0': '10/11',
        '6.3': '8.1',
        '6.2': '8',
        '6.1': '7',
      };
      return versionMap[version] || version;
    }
    
    // macOS version
    const macMatch = ua.match(/Mac OS X\s([0-9_]+)/);
    if (macMatch) return macMatch[1].replace(/_/g, '.');
    
    return undefined;
  }

  /**
   * Detect account type (Google/Apple/None)
   */
  private static getAccountType(): 'Google' | 'Apple' | 'None' {
    // Check for Google account indicators
    if (typeof (window as unknown as { gapi?: unknown }).gapi !== 'undefined' ||
        typeof (window as unknown as { google?: unknown }).google !== 'undefined') {
      return 'Google';
    }
    
    // Check for Apple account indicators
    if (typeof (window as unknown as { AppleID?: unknown }).AppleID !== 'undefined' ||
        /AppleWebKit/.test(navigator.userAgent) && /iPhone|iPad|iPod/.test(navigator.userAgent)) {
      // Note: This is a heuristic, actual Apple ID detection requires AppleID SDK
      return 'Apple';
    }
    
    return 'None';
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
