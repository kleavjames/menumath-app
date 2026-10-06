import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";

import { Button, Text } from "@/components/atoms";
import { BackButton, TextInput } from "@/components/molecules";

const SignUp = () => {
  const insets = useSafeAreaInsets();
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  return (
    <View
      style={[
        styles.screen,
        {
          paddingTop: insets.top + 8,
          paddingBottom: insets.bottom + 16,
        },
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
          <BackButton />
          <View style={styles.hero}>
            <Text variant="hero" style={styles.headline}>
              Create your account
            </Text>
            <Text color="textSecondary">You'll set up your business next.</Text>
          </View>

          <View style={styles.form}>
            <TextInput
              label="Full name"
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
              autoComplete="name"
              textContentType="name"
            />
            <TextInput
              label="Username"
              value={username}
              onChangeText={setUsername}
              keyboardType="default"
              autoCapitalize="none"
              autoComplete="username"
              textContentType="username"
            />
            <TextInput
              label="Password"
              placeholder="At least 8 characters"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="new-password"
              textContentType="newPassword"
            />
          </View>

          <Button onPress={() => {}}>Create account</Button>
        </ScrollView>
      </KeyboardAvoidingView>

      <Text variant="label" color="textSecondary" style={styles.footer}>
        By continuing you agree to the{" "}
        <Text variant="label" color="textSecondary" style={styles.link}>
          Terms of Service
        </Text>{" "}
        and{" "}
        <Text variant="label" color="textSecondary" style={styles.link}>
          Privacy Policy
        </Text>
        .
      </Text>
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
    flexGrow: 1,
    gap: theme.gap(4),
    paddingBottom: theme.gap(3),
  },
  hero: {
    gap: theme.gap(1.5),
  },
  headline: {
    fontSize: 28,
    lineHeight: 34,
  },
  form: {
    gap: theme.gap(2.5),
  },
  footer: {
    textAlign: "center",
    lineHeight: 18,
  },
  link: {
    textDecorationLine: "underline",
  },
}));

export default SignUp;
