import * as Clipboard from "expo-clipboard";
import { router, Stack } from "expo-router";
import { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";

import {
  Button,
  Card,
  showToast,
  Text,
  ToggleButton,
} from "@/components/atoms";
import { INVITE_CODE_ROLE_OPTIONS } from "@/constants/business";
import { useAccountUserStore } from "@/store/accountUser";
import { MembershipRole } from "@/types/user";

const generateInviteCode = () =>
  Array.from({ length: 6 }, () => Math.floor(Math.random() * 10)).join("");

const InviteCodeDisplay = ({ code }: { code: string }) => {
  const digits = code.padEnd(6, " ").slice(0, 6).split("");

  return (
    <View style={styles.codeRow}>
      {digits.map((digit, index) => (
        <View key={index} style={styles.codeCell}>
          <Text style={styles.codeDigit}>{digit.trim()}</Text>
        </View>
      ))}
    </View>
  );
};

export default function TeamsScreen() {
  const insets = useSafeAreaInsets();
  const business = useAccountUserStore((state) => state.business);
  const businessName = business?.name ?? "your business";

  const [inviteCode, setInviteCode] = useState("482913");
  const [codeRole, setCodeRole] = useState<MembershipRole>(
    MembershipRole.STAFF,
  );

  const codeHelpText = useMemo(
    () =>
      `Share this code with staff. They enter it at sign-up to join ${businessName}. Generating a new code turns off the old one.`,
    [businessName],
  );

  const handleCopyCode = async () => {
    await Clipboard.setStringAsync(inviteCode);
    showToast("Code copied", { variant: "default" });
  };

  const handleGenerateCode = () => {
    setInviteCode(generateInviteCode());
    showToast("New invite code generated", { variant: "default" });
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerTransparent: true,
          title: "Team",
          headerLeft: () => (
            <Pressable onPressIn={router.back} style={styles.headerButton}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
          ),
        }}
      />
      <View
        style={[
          styles.screen,
          { paddingTop: insets.top * 2, paddingBottom: insets.bottom },
        ]}
      >
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Card>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Invite code</Text>
                <Text variant="caption" color="textSecondary">
                  Expires in 7 days
                </Text>
              </View>

              <InviteCodeDisplay code={inviteCode} />

              <ToggleButton
                options={INVITE_CODE_ROLE_OPTIONS}
                value={codeRole}
                onChange={(value) => setCodeRole(value as MembershipRole)}
              />

              <View style={styles.buttonRow}>
                <Button
                  variant="outline"
                  style={styles.halfButton}
                  textStyle={styles.buttonText}
                  onPress={handleCopyCode}
                >
                  Copy code
                </Button>
                <Button
                  style={styles.halfButton}
                  textStyle={styles.buttonText}
                  onPress={handleGenerateCode}
                >
                  Generate new
                </Button>
              </View>

              <Text variant="caption" color="textSecondary">
                {codeHelpText}
              </Text>
            </Card>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </>
  );
}

const styles = StyleSheet.create((theme) => ({
  flex: {
    flex: 1,
  },
  screen: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.gap(3),
  },
  content: {
    gap: theme.gap(3),
    paddingBottom: theme.gap(4),
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.gap(2),
  },
  cardTitle: {
    fontFamily: theme.fontFamily.semiBold,
    fontSize: theme.fontSize.md,
  },
  buttonText: {
    fontFamily: theme.fontFamily.semiBold,
    fontSize: theme.fontSize.xs,
  },
  codeRow: {
    flexDirection: "row",
    gap: theme.gap(1),
  },
  codeCell: {
    flex: 1,
    aspectRatio: 0.85,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
  },
  codeDigit: {
    fontSize: theme.fontSize.xl,
    fontFamily: theme.fontFamily.semiBold,
    color: theme.colors.text,
  },
  buttonRow: {
    flexDirection: "row",
    gap: theme.gap(1.5),
  },
  halfButton: {
    flex: 1,
  },
  headerButton: {
    paddingHorizontal: theme.gap(2),
    paddingVertical: theme.gap(1),
  },
  cancelButtonText: {
    color: theme.colors.text,
  },
}));
