import { useAuth } from "@/provider/AuthProvider";
import LucideIcon from "@react-native-vector-icons/lucide";
import { Redirect, Tabs, useSegments } from "expo-router";
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
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarStyle: hideTabBar ? { display: "none" } : undefined,
      }}
    >
      <Tabs.Screen
        name="(recipes)"
        options={{
          headerShown: false,
          title: "Recipes",
          tabBarIcon: ({ color }) => (
            <LucideIcon name="fork-knife" size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="(ingredients)"
        options={{
          headerShown: false,
          title: "Ingredients",
          tabBarIcon: ({ color }) => (
            <LucideIcon name="shopping-cart" size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="(account)"
        options={{
          headerShown: false,
          title: "Account",
          tabBarIcon: ({ color }) => (
            <LucideIcon name="user" size={20} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
