import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'reporter.sowellapp.com',
  appName: 'Reporter',
  webDir: 'dist/spa',
  bundledWebRuntime: false,
  android: {
    path: "src-capacitor"
  },
  ios: {
    path: "src-capacitor"
  }
};

export default config;
