import { router } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useCallback, useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet, withUnistyles } from "react-native-unistyles";

import { Card, showToast, StepperInput, Text } from "@/components/atoms";
import { BuildVersion } from "@/components/molecules";
import { AccountsRow } from "@/components/templates/AccountsRow";
import { formatCapitalized, getInitials } from "@/helpers";
import { useDebounce, useRole, useTeamMembers } from "@/hooks";
import { useAuth } from "@/provider/AuthProvider";
import { signOut, updateBusiness } from "@/service/api";
import { useAccountUserStore, useInvitationCodeStore } from "@/store";
import { ApiError, Currency, UnitSystem } from "@/types";

const TARGET_FOOD_COST_DEBOUNCE_MS = 1000;

const UniChevron = withUnistyles(SymbolView, (theme) => ({
  tintColor: theme.colors.textSecondary,
}));

export default function SettingsScreen() {
  const { logout } = useAuth();
  const insets = useSafeAreaInsets();
  const { canInteract, isOwner } = useRole();
  const { teamMembersCount } = useTeamMembers();

  const business = useAccountUserStore((state) => state.business);
  const businessId = useAccountUserStore((state) => state.businessId);
  const user = useAccountUserStore((state) => state.user);
  const setUpdatedBusiness = useAccountUserStore(
    (state) => state.setUpdatedBusiness,
  );
  const clearAccountUser = useAccountUserStore(
    (state) => state.clearAccountUser,
  );
  const clearInvitationCode = useInvitationCodeStore(
    (state) => state.clearInvitationCode,
  );

  const [targetFoodCost, setTargetFoodCost] = useState(
    Number(business?.targetFoodCost ?? 50),
  );

  const debouncedTargetFoodCost = useDebounce(
    targetFoodCost,
    TARGET_FOOD_COST_DEBOUNCE_MS,
  );

  const handleUpdateTargetFoodCost = useCallback(async () => {
    try {
      const response = await updateBusiness(businessId!, {
        targetFoodCost: debouncedTargetFoodCost,
      });
      setUpdatedBusiness(response);
      setTargetFoodCost(Number(response.targetFoodCost));
      showToast("Target food cost updated successfully");
    } catch (error) {
      if (error instanceof ApiError) {
        showToast(error.message, { variant: "error" });
      } else {
        showToast("An unknown error occurred", { variant: "error" });
      }
    }
  }, [debouncedTargetFoodCost, businessId, canInteract]);

  useEffect(() => {
    const savedTargetFoodCost = Number(business?.targetFoodCost ?? 50);
    if (debouncedTargetFoodCost === savedTargetFoodCost) return;
    if (!businessId || !canInteract) return;

    (async () => {
      await handleUpdateTargetFoodCost();
    })();
  }, [
    debouncedTargetFoodCost,
    business?.targetFoodCost,
    businessId,
    canInteract,
  ]);

  const onSignOut = async () => {
    try {
      await signOut();
      clearAccountUser();
      clearInvitationCode();
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
          Account
        </Text>

        <Card style={styles.listCard}>
          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.profileRow,
              pressed && styles.rowPressed,
            ]}
            onPress={() => router.push("/profile")}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarLabel}>
                {getInitials(user?.fullName ?? "")}
              </Text>
            </View>
            <View style={styles.profileCopy}>
              <Text style={styles.profileName}>{user?.fullName}</Text>
              <Text variant="caption" color="textSecondary">
                {user?.username}
              </Text>
            </View>
            <UniChevron
              name={{
                ios: "chevron.right",
                android: "chevron_right",
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
            <AccountsRow
              disabled={!isOwner}
              label="Business"
              value={business?.name ?? "No business"}
              onPress={() => router.push("/business")}
            />
            <View style={styles.divider} />
            <AccountsRow
              label="Team"
              value={`${teamMembersCount} members`}
              onPress={() => router.push("/teams")}
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
            <AccountsRow
              disabled={!canInteract}
              label="Currency"
              value={business?.currency ?? Currency.USD}
              onPress={() => router.push("/currency")}
            />
            <View style={styles.divider} />
            <AccountsRow
              disabled={!canInteract}
              label="Units"
              value={formatCapitalized(business?.unitSystem ?? UnitSystem.BOTH)}
              onPress={() => router.push("/unitSystem")}
            />
            <View style={styles.divider} />
            <AccountsRow
              disabled={!canInteract}
              label="Target food cost"
              subtitle="Flag recipes above this"
              showChevron={false}
              trailing={
                <StepperInput
                  value={targetFoodCost}
                  onChange={setTargetFoodCost}
                  min={20}
                  max={80}
                  disabled={!canInteract}
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

        <BuildVersion />
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
