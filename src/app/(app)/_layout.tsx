import { useAuth } from "@/provider/AuthProvider";
import { Icon, Redirect, Tabs, useSegments } from "expo-router";
import { useUnistyles } from "react-native-unistyles";

const TAB_BAR_HIDDEN_SEGMENTS = new Set([
  "create-recipe",
  "create-ingredient",
  "profile",
  "business",
  "teams",
]);

export const unstable_settings = {
  initialRouteName: "(recipes)",
};

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
    <Tabs screenOptions={{ tabBarActiveTintColor: theme.colors.primary }}>
      <Tabs.Screen
        name="(recipes)"
        options={{
          headerShown: false,
          title: "Recipes",
          tabBarIcon: ({ color }) => (
            <Icon sf="fork.knife" renderingMode="template" />
          ),
        }}
      />
      <Tabs.Screen
        name="(ingredients)"
        options={{
          headerShown: false,
          title: "Ingredients",
          tabBarIcon: () => <Icon sf="menucard" renderingMode="template" />,
        }}
      />
      <Tabs.Screen
        name="(account)"
        options={{
          headerShown: false,
          title: "Account",
          tabBarIcon: () => (
            <Icon sf="person.text.rectangle" renderingMode="template" />
          ),
        }}
      />
    </Tabs>
  );

  // return (
  //   <NativeTabs hidden={hideTabBar} tintColor={theme.colors.primary}>
  //     <NativeTabs.Trigger name="(recipes)">
  //       <NativeTabs.Trigger.Label>Recipes</NativeTabs.Trigger.Label>
  //       <NativeTabs.Trigger.Icon sf="fork.knife" renderingMode="template" />
  //     </NativeTabs.Trigger>
  //     <NativeTabs.Trigger name="(ingredients)">
  //       <NativeTabs.Trigger.Label>Ingredients</NativeTabs.Trigger.Label>
  //       <NativeTabs.Trigger.Icon sf="menucard" renderingMode="template" />
  //     </NativeTabs.Trigger>
  //     <NativeTabs.Trigger name="(account)">
  //       <NativeTabs.Trigger.Label>Account</NativeTabs.Trigger.Label>
  //       <NativeTabs.Trigger.Icon
  //         sf="person.text.rectangle"
  //         renderingMode="template"
  //       />
  //     </NativeTabs.Trigger>
  //   </NativeTabs>
  // );
}
