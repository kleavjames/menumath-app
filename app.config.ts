import { ConfigContext, ExpoConfig } from "expo/config";
import { version } from "./package.json";

const getPlatformAppVersion = (): string => {
  const platform = process.env.EAS_BUILD_PLATFORM;
  const iosVersion = process.env.APP_VERSION_IOS;
  const androidVersion = process.env.APP_VERSION_ANDROID;

  if (platform === "ios" && iosVersion) return iosVersion;
  if (platform === "android" && androidVersion) return androidVersion;

  return version;
};

export default ({ config }: ConfigContext): ExpoConfig => {
  const appVersion = getPlatformAppVersion();

  return {
    ...config,
    name: "MenuMath",
    slug: "menumath",
    version: appVersion,
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "menumathapp",
    userInterfaceStyle: "automatic",
    ios: {
      bundleIdentifier: "com.kleavantjames.menumath",
      icon: "./assets/expo.icon",
    },
    android: {
      package: "com.kleavantjames.menumath",
      adaptiveIcon: {
        backgroundColor: "#E6F4FE",
        foregroundImage: "./assets/images/android-icon-foreground.png",
        backgroundImage: "./assets/images/android-icon-background.png",
        monochromeImage: "./assets/images/android-icon-monochrome.png",
      },
      predictiveBackGestureEnabled: false,
    },
    web: {
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          backgroundColor: "#208AEF",
          android: {
            image: "./assets/images/splash-icon.png",
            imageWidth: 76,
          },
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    runtimeVersion: version,
    extra: {
      eas: {
        projectId: "d8501ffb-feef-43e3-a2fd-b613ea1b885c",
      },
    },
  };
};
