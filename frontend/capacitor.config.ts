import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.rovehealth.app',
  appName: 'Rove Health',
  webDir: 'out',
  bundledWebRuntime: false,
  server: {
    // Points to the live production web app — no static export needed
    url: 'https://rovehealth.in',
    cleartext: false // Enforce HTTPS only (no cleartext http)
  },
  android: {
    allowMixedContent: false,
    captureInput: true,
    // Set to true during development for Chrome DevTools remote debugging
    webContentsDebuggingEnabled: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2500,
      launchAutoHide: true,
      backgroundColor: '#FAF9F6', // Rove Health warm paper background
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#FAF9F6'
    }
  }
};

export default config;
