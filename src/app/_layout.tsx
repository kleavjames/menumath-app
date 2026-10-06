import { NativeTabs } from "expo-router/unstable-native-tabs";

export default function Layout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="house.fill" renderingMode="template" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="explore">
        <NativeTabs.Trigger.Label>Explore</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="globe.fill" renderingMode="template" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
