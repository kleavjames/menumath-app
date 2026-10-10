import { useAuth } from "@/provider/AuthProvider";
import { Redirect, useSegments } from "expo-router";
import { NativeTabs } from "expo-router/unstable-native-tabs";

const TAB_BAR_HIDDEN_SEGMENTS = new Set(["create-recipe", "create-ingredient"]);

export default function AppLayout() {
  const { token } = useAuth();
  const segments = useSegments();
  const hideTabBar = segments.some((segment) =>
    TAB_BAR_HIDDEN_SEGMENTS.has(segment),
  );

  if (!token) {
    return <Redirect href="/signin" />;
  }

  return (
    <NativeTabs hidden={hideTabBar}>
      <NativeTabs.Trigger name="(ingredients)">
        <NativeTabs.Trigger.Label>Ingredients</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="menucard" renderingMode="template" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="(recipes)">
        <NativeTabs.Trigger.Label>Recipes</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="fork.knife" renderingMode="template" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings">
        <NativeTabs.Trigger.Label>Settings</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="gearshape.fill" renderingMode="template" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
