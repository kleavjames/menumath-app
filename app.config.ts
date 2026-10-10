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
    icon: "./assets/images/menumath-1024.png",
    scheme: "menumathapp",
    userInterfaceStyle: "automatic",
    ios: {
      bundleIdentifier: "com.kleavantjames.menumath",
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
      },
    },
    android: {
      package: "com.kleavantjames.menumath",
      adaptiveIcon: {
        backgroundColor: "#E6F4FE",
        foregroundImage: "./assets/images/menumath-foreground.png",
        backgroundImage: "./assets/images/menumath-background.png",
        monochromeImage: "./assets/images/menumath-monochrome.png",
      },
      predictiveBackGestureEnabled: false,
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          backgroundColor: "#000000",
          image: "./assets/images/menumath-foreground.png",
          imageWidth: 200,
          android: {
            image: "./assets/images/menumath-foreground.png",
            imageWidth: 200,
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
