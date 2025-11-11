import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'tz.co.globalexpress.app',
  appName: 'Global Express',
  webDir: 'dist',
  server: {
    // Allow cleartext traffic for local development
    cleartext: true,
    // If you need to access localhost API from Android device/emulator
    // androidScheme: 'http'
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    }
  }
};

export default config;
