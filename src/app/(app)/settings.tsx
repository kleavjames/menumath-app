import { router } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useState } from "react";
import { Alert, Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet, withUnistyles } from "react-native-unistyles";

import { Card, StepperInput, Text } from "@/components/atoms";
import { useAuth } from "../../../provider/AuthProvider";
import { signOut } from "../../../service/api/auth";
import { useAccountUserStore } from "../../../store/accountUser";
import { ApiError } from "../../../types/common";

const UniChevron = withUnistyles(SymbolView, (theme) => ({
  tintColor: theme.colors.textSecondary,
}));

type SettingsRowProps = {
  label: string;
  value?: string;
  subtitle?: string;
  onPress?: () => void;
  showChevron?: boolean;
  trailing?: React.ReactNode;
};

const SettingsRow = ({
  label,
  value,
  subtitle,
  onPress,
  showChevron = true,
  trailing,
}: SettingsRowProps) => {
  const content = (
    <View style={styles.row}>
      <View style={styles.rowCopy}>
        <Text>{label}</Text>
        {subtitle ? (
          <Text variant="caption" color="textSecondary">
            {subtitle}
          </Text>
        ) : null}
      </View>
      <View style={styles.rowTrailing}>
        {trailing ??
          (value ? <Text color="textSecondary">{value}</Text> : null)}
        {showChevron ? (
          <UniChevron
            name={{
              ios: "chevron.right",
              android: "chevron_right",
              web: "chevron_right",
            }}
            size={16}
          />
        ) : null}
      </View>
    </View>
  );

  if (!onPress) {
    return content;
  }

  return (
    <Pressable
      accessibilityRole="button"
      style={({ pressed }) => [pressed && styles.rowPressed]}
      onPress={onPress}
    >
      {content}
    </Pressable>
  );
};

export default function SettingsScreen() {
  const { logout } = useAuth();
  const insets = useSafeAreaInsets();

  const clearAccountUser = useAccountUserStore(
    (state) => state.clearAccountUser,
  );

  const [targetFoodCost, setTargetFoodCost] = useState(30);

  const onSignOut = async () => {
    try {
      await signOut();
      clearAccountUser();
      logout();
      router.replace("/signin");
    } catch (error) {
      if (error instanceof ApiError) {
        console.error(error.message);
      } else {
        console.error(error);
      }
    }
  };

  const handleSignOut = async () => {
    Alert.alert("Sign out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign out", onPress: onSignOut },
    ]);
  };

  return (
    <View
      style={[
        styles.screen,
        {
          paddingTop: insets.top + 8,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text variant="hero" style={styles.headline}>
          Settings
        </Text>

        <Card style={styles.listCard}>
          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.profileRow,
              pressed && styles.rowPressed,
            ]}
            onPress={() => {
              // TODO: open profile
            }}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarLabel}>J</Text>
            </View>
            <View style={styles.profileCopy}>
              <Text style={styles.profileName}>jamesada</Text>
              <Text variant="caption" color="textSecondary">
                test@gmail.com
              </Text>
            </View>
            <UniChevron
              name={{
                ios: "chevron.right",
                android: "chevron_right",
                web: "chevron_right",
              }}
              size={16}
            />
          </Pressable>
        </Card>

        <View style={styles.section}>
          <Text
            variant="caption"
            color="textSecondary"
            style={styles.sectionLabel}
          >
            Business
          </Text>
          <Card style={styles.listCard}>
            <SettingsRow
              label="Business"
              value="Lark & Crumb"
              onPress={() => {
                // TODO: edit business
              }}
            />
            <View style={styles.divider} />
            <SettingsRow
              label="Team"
              value="3 members"
              onPress={() => {
                // TODO: open team
              }}
            />
          </Card>
        </View>

        <View style={styles.section}>
          <Text
            variant="caption"
            color="textSecondary"
            style={styles.sectionLabel}
          >
            Costing
          </Text>
          <Card style={styles.listCard}>
            <SettingsRow
              label="Currency"
              value="USD · $"
              onPress={() => {
                // TODO: change currency
              }}
            />
            <View style={styles.divider} />
            <SettingsRow
              label="Units"
              value="Metric"
              onPress={() => {
                // TODO: change units
              }}
            />
            <View style={styles.divider} />
            <SettingsRow
              label="Target food cost"
              subtitle="Flag recipes above this"
              showChevron={false}
              trailing={
                <StepperInput
                  value={targetFoodCost}
                  onChange={setTargetFoodCost}
                  min={1}
                  max={100}
                  suffix="%"
                />
              }
            />
          </Card>
        </View>

        <Card style={styles.listCard}>
          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.signOutRow,
              pressed && styles.rowPressed,
            ]}
            onPress={handleSignOut}
          >
            <Text color="error">Sign out</Text>
          </Pressable>
        </Card>

        <Text variant="caption" color="textSecondary" style={styles.version}>
          MenuMath 1.0.0
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.gap(3),
  },
  content: {
    gap: theme.gap(3),
    paddingBottom: theme.gap(4),
  },
  headline: {
    fontSize: 28,
    lineHeight: 34,
  },
  section: {
    gap: theme.gap(1),
  },
  sectionLabel: {
    paddingHorizontal: theme.gap(0.5),
    fontFamily: theme.fontFamily.medium,
  },
  listCard: {
    padding: 0,
    gap: 0,
    overflow: "hidden",
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.gap(1.5),
    paddingVertical: theme.gap(2),
    paddingHorizontal: theme.gap(2.5),
  },
  avatar: {
    width: theme.gap(5),
    height: theme.gap(5),
    borderRadius: 9999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.border,
  },
  avatarLabel: {
    fontSize: theme.fontSize.md,
    fontFamily: theme.fontFamily.semiBold,
    color: theme.colors.text,
  },
  profileCopy: {
    flex: 1,
    gap: theme.gap(0.25),
  },
  profileName: {
    fontFamily: theme.fontFamily.semiBold,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.gap(2),
    paddingVertical: theme.gap(2),
    paddingHorizontal: theme.gap(2.5),
  },
  rowCopy: {
    flex: 1,
    gap: theme.gap(0.375),
  },
  rowTrailing: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.gap(1),
  },
  rowPressed: {
    opacity: 0.7,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginLeft: theme.gap(2.5),
  },
  signOutRow: {
    paddingVertical: theme.gap(2),
    paddingHorizontal: theme.gap(2.5),
  },
  version: {
    textAlign: "center",
    fontFamily: theme.fontFamily.regular,
  },
}));
