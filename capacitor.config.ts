import type { CapacitorConfig } from '@capacitor/cli';
import { mobileConfig } from './src/config/mobile.config';

const config: CapacitorConfig = {
  appId: mobileConfig.appId,
  appName: mobileConfig.appName,
  webDir: mobileConfig.webDir,
  server: {
    androidScheme: mobileConfig.server.androidScheme,
    iosScheme: mobileConfig.server.iosScheme,
    hostname: mobileConfig.server.hostname,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      launchAutoHide: true,
      backgroundColor: '#090d16',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
    },
  },
};

export default config;
