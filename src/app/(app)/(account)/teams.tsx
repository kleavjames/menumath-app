import * as Clipboard from "expo-clipboard";
import { Stack } from "expo-router";
import { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";

import {
  Button,
  Card,
  Input,
  showToast,
  Text,
  ToggleButton,
} from "@/components/atoms";
import { useAccountUserStore } from "@/store/accountUser";

const INVITE_CODE_ROLE_OPTIONS = [
  { label: "Joins as Manager", value: "manager" },
  { label: "Joins as Staff", value: "staff" },
];

const EMAIL_ROLE_OPTIONS = [
  { label: "Manager", value: "manager" },
  { label: "Staff", value: "staff" },
];

type InviteRole = "manager" | "staff";

const ROLE_DESCRIPTIONS: Record<InviteRole, string> = {
  manager: "Managers can edit recipes, costs, and manage team access.",
  staff:
    "Staff can view recipes and ingredient lists, but not costs or prices.",
};

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
  const [codeRole, setCodeRole] = useState<InviteRole>("staff");
  const [email, setEmail] = useState("");
  const [emailRole, setEmailRole] = useState<InviteRole>("staff");
  const [emailError, setEmailError] = useState<string | null>(null);

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

  const handleInvite = () => {
    const trimmed = email.trim();
    if (!trimmed) {
      setEmailError("Email is required");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setEmailError("Enter a valid email");
      return;
    }

    setEmail("");
    setEmailError(null);
    showToast(`Invite sent to ${trimmed}`, { variant: "default" });
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerTransparent: true,
          title: "Team",
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
                onChange={(value) => setCodeRole(value as InviteRole)}
              />

              <View style={styles.buttonRow}>
                <Button
                  variant="outline"
                  style={styles.halfButton}
                  onPress={handleCopyCode}
                >
                  Copy code
                </Button>
                <Button style={styles.halfButton} onPress={handleGenerateCode}>
                  Generate new
                </Button>
              </View>

              <Text variant="caption" color="textSecondary">
                {codeHelpText}
              </Text>
            </Card>

            <Card>
              <Text style={styles.cardTitle}>Invite by email</Text>

              <View style={styles.field}>
                <Input
                  value={email}
                  onChangeText={(value) => {
                    setEmail(value);
                    if (emailError) setEmailError(null);
                  }}
                  placeholder="name@email.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  textContentType="emailAddress"
                  state={emailError ? "error" : undefined}
                  returnKeyType="send"
                  onSubmitEditing={handleInvite}
                />
                {emailError ? (
                  <Text variant="caption" color="error">
                    {emailError}
                  </Text>
                ) : null}
              </View>

              <View style={styles.inviteRow}>
                <ToggleButton
                  options={EMAIL_ROLE_OPTIONS}
                  value={emailRole}
                  onChange={(value) => setEmailRole(value as InviteRole)}
                  style={styles.emailRoleToggle}
                />
                <Button style={styles.inviteButton} onPress={handleInvite}>
                  Invite
                </Button>
              </View>

              <Text variant="caption" color="textSecondary">
                {ROLE_DESCRIPTIONS[emailRole]}
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
  field: {
    gap: theme.gap(1),
  },
  inviteRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.gap(1.5),
  },
  emailRoleToggle: {
    flex: 1,
  },
  inviteButton: {
    flexShrink: 0,
    alignSelf: "auto",
    paddingHorizontal: theme.gap(2.5),
  },
}));
