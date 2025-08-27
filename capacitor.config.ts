import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.apechomes_attendancechecker',
  appName: 'apechomes_attendancechecker',
  webDir: 'dist',
  plugins: {
    SplashScreen: {
      launchShowDuration: 6000,
      launchAutoHide: true,
      backgroundColor: "#0c314f",
      androidSplashResourceName: "splash",
      androidScaleType: "FIT_CENTER",
      // showSpinner: false,
      // androidSpinnerStyle: "large",
      // iosSpinnerStyle: "small",
      // spinnerColor: "#999999",
      splashFullScreen: false,
      splashImmersive: true,
      layoutName: "launch_screen",
      // useDialog: true,
    }
  }
};



export default config;
