import { useState } from "react";
import { KeyboardAvoidingView, Platform, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";

import { Button, PinCode, showToast, Text } from "@/components/atoms";
import { BackButton } from "@/components/molecules";
import { useAuth } from "@/provider/AuthProvider";
import { redeemCode } from "@/service/api";
import { useAccountUserStore, useCreateAccountStore } from "@/store";
import { ApiError } from "@/types";
import { router } from "expo-router";

const InviteCode = () => {
  const insets = useSafeAreaInsets();
  const { login } = useAuth();

  const fullName = useCreateAccountStore((state) => state.fullName);
  const username = useCreateAccountStore((state) => state.username);
  const password = useCreateAccountStore((state) => state.password);
  const setAccountUser = useAccountUserStore((state) => state.setAccountUser);

  const [code, setCode] = useState("");
  const [error, setError] = useState(false);

  const handleJoinTeam = async () => {
    if (code.length !== 6) return;
    try {
      const response = await redeemCode({
        code,
        fullName,
        username,
        password,
      });
      login(response.accessToken);
      setAccountUser(response);
      showToast("Joined team successfully", { variant: "default" });
      router.replace("/(app)/(recipes)");
    } catch (error) {
      if (error instanceof ApiError) {
        showToast(error.message, { variant: "error" });
      } else {
        showToast("An unknown error occurred", { variant: "error" });
      }
    } finally {
      setError(false);
    }
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
              Enter the 6-character code from your invitation email.
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

          <View style={styles.footer(insets.bottom)}>
            <Button onPress={handleJoinTeam} disabled={code.length !== 6}>
              Join team
            </Button>
            <Text variant="body" color="textSecondary" style={styles.help}>
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
  footer: (inset: number) => ({
    marginTop: "auto",
    gap: theme.gap(2.5),
    paddingBottom: inset,
  }),
  help: {
    textAlign: "center",
    lineHeight: 20,
  },
}));

export default InviteCode;
