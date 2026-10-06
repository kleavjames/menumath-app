import { useState } from "react";
import { KeyboardAvoidingView, Platform, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";

import { Button, PinCode, Text } from "@/components/atoms";
import { BackButton } from "@/components/molecules";

const DEMO_CODE = "482913";

const InviteCode = () => {
  const insets = useSafeAreaInsets();
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);

  const handleJoinTeam = () => {
    if (code.length !== 6) return;
    // TODO: validate invite code and join team
    setError(false);
  };

  return (
    <View
      style={[
        styles.screen,
        {
          paddingTop: insets.top,
          paddingBottom: insets.bottom + 16,
        },
      ]}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.content}>
          <BackButton />

          <View style={styles.hero}>
            <Text variant="hero" style={styles.headline}>
              Join your team
            </Text>
            <Text color="textSecondary">
              Enter the 6-digit code from your invitation email.
            </Text>
          </View>

          <View style={styles.pinSection}>
            <PinCode
              value={code}
              onChange={(value) => {
                setCode(value);
                if (error) setError(false);
              }}
              autoFocus
              error={error}
              onComplete={handleJoinTeam}
            />
          </View>

          <View style={styles.footer}>
            <Button onPress={handleJoinTeam} disabled={code.length !== 6}>
              Join team
            </Button>
            <Text variant="label" color="textSecondary" style={styles.help}>
              No code? Ask your manager to resend your invitation.
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

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
    flex: 1,
    gap: theme.gap(4),
  },
  hero: {
    gap: theme.gap(1.5),
  },
  headline: {
    fontSize: 28,
    lineHeight: 34,
  },
  pinSection: {
    gap: theme.gap(1.5),
  },
  footer: {
    marginTop: "auto",
    gap: theme.gap(2.5),
  },
  help: {
    textAlign: "center",
    lineHeight: 20,
  },
}));

export default InviteCode;
