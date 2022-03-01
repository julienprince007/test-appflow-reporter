import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'reporter.sowellapp.com',
  appName: 'Reporter',
  webDir: 'dist/spa',
  bundledWebRuntime: false,
  android: {
    path: "./src-capacitor/android",
  },
  ios: {
    path: "./src-capacitor/android"
  }
};

export default config;
