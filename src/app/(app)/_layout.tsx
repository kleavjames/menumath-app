import { useAuth } from "@/provider/AuthProvider";
import { Redirect, useSegments } from "expo-router";
import { NativeTabs } from "expo-router/unstable-native-tabs";
import { useUnistyles } from "react-native-unistyles";

const TAB_BAR_HIDDEN_SEGMENTS = new Set([
  "create-recipe",
  "create-ingredient",
  "profile",
  "business",
]);

export default function AppLayout() {
  const { theme } = useUnistyles();
  const { token } = useAuth();
  const segments = useSegments();
  const hideTabBar = segments.some((segment) =>
    TAB_BAR_HIDDEN_SEGMENTS.has(segment),
  );

  if (!token) {
    return <Redirect href="/signin" />;
  }

  return (
    <NativeTabs hidden={hideTabBar} tintColor={theme.colors.primary}>
      <NativeTabs.Trigger name="(ingredients)">
        <NativeTabs.Trigger.Label>Ingredients</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="menucard" renderingMode="template" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="(recipes)">
        <NativeTabs.Trigger.Label>Recipes</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="fork.knife" renderingMode="template" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="(account)">
        <NativeTabs.Trigger.Label>Account</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf="person.text.rectangle"
          renderingMode="template"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
