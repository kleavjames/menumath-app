import { Redirect } from "expo-router";
import { NativeTabs } from "expo-router/unstable-native-tabs";
import { useAuth } from "../../../provider/AuthProvider";

export default function AppLayout() {
  const { token } = useAuth();

  if (!token) {
    return <Redirect href="/signin" />;
  }

  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Recipes</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="list.bullet" renderingMode="template" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="(ingredients)">
        <NativeTabs.Trigger.Label>Ingredients</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="list.bullet" renderingMode="template" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings">
        <NativeTabs.Trigger.Label>Settings</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="gearshape.fill" renderingMode="template" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
