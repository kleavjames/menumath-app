import "@/global.css";

import { AuthProvider } from "@/provider/AuthProvider";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useCallback, useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const SPLASH_MIN_DISPLAY_MS = 2000;

SplashScreen.preventAutoHideAsync().catch(() => {
  // Splash may already be hidden (e.g. fast refresh); safe to ignore.
});

export default function RootLayout() {
  const [minDisplayElapsed, setMinDisplayElapsed] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(
      () => setMinDisplayElapsed(true),
      SPLASH_MIN_DISPLAY_MS,
    );
    return () => clearTimeout(timeout);
  }, []);

  const [loaded, error] = useFonts({
    "OpenSans-Italic": require("../../assets/fonts/OpenSans-Italic.ttf"),
    "OpenSans-Light": require("../../assets/fonts/OpenSans-Light.ttf"),
    "OpenSans-LightItalic": require("../../assets/fonts/OpenSans-LightItalic.ttf"),
    "OpenSans-Regular": require("../../assets/fonts/OpenSans-Regular.ttf"),
    "OpenSans-Medium": require("../../assets/fonts/OpenSans-Medium.ttf"),
    "OpenSans-MediumItalic": require("../../assets/fonts/OpenSans-MediumItalic.ttf"),
    "OpenSans-SemiBold": require("../../assets/fonts/OpenSans-SemiBold.ttf"),
    "OpenSans-SemiBoldItalic": require("../../assets/fonts/OpenSans-SemiBoldItalic.ttf"),
    "OpenSans-Bold": require("../../assets/fonts/OpenSans-Bold.ttf"),
    "OpenSans-BoldItalic": require("../../assets/fonts/OpenSans-BoldItalic.ttf"),
    "OpenSans-ExtraBold": require("../../assets/fonts/OpenSans-ExtraBold.ttf"),
    "OpenSans-ExtraBoldItalic": require("../../assets/fonts/OpenSans-ExtraBoldItalic.ttf"),
  });

  const resourcesReady = loaded || !!error;
  const appReady = resourcesReady && minDisplayElapsed;

  const onLayoutRootView = useCallback(() => {
    if (appReady) {
      void SplashScreen.hideAsync();
    }
  }, [appReady]);

  if (!appReady) {
    return null;
  }

  return (
    <AuthProvider>
      <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
        <BottomSheetModalProvider>
          <Stack>
            <Stack.Screen name="signin" options={{ headerShown: false }} />
            <Stack.Screen name="signup" options={{ headerShown: false }} />
            <Stack.Screen
              name="create-business"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="invite-members"
              options={{ headerShown: false }}
            />
            <Stack.Screen name="invite-code" options={{ headerShown: false }} />
            <Stack.Screen name="(app)" options={{ headerShown: false }} />
          </Stack>
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </AuthProvider>
  );
}
