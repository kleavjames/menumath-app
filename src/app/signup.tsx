import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";

import { Button, Text } from "@/components/atoms";
import { BackButton, TextInput } from "@/components/molecules";
import { router } from "expo-router";

type FieldErrors = {
  fullName?: string;
  username?: string;
  password?: string;
};

const SignUp = () => {
  const insets = useSafeAreaInsets();
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});

  const clearError = (field: keyof FieldErrors) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const validate = (): boolean => {
    const next: FieldErrors = {};

    if (!fullName.trim()) {
      next.fullName = "Full name is required";
    }
    if (!username.trim()) {
      next.username = "Username is required";
    }
    if (!password) {
      next.password = "Password is required";
    } else if (password.length < 8) {
      next.password = "Password must be at least 8 characters";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  // TODO:
  const handleCreateAccount = () => {
    router.push("/create-business");
    // if (!validate()) return;
    // TODO: submit signup
  };

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
              onChangeText={(value) => {
                setFullName(value);
                clearError("fullName");
              }}
              autoCapitalize="words"
              autoComplete="name"
              textContentType="name"
              error={errors.fullName}
            />
            <TextInput
              label="Username"
              value={username}
              onChangeText={(value) => {
                setUsername(value);
                clearError("username");
              }}
              keyboardType="default"
              autoCapitalize="none"
              autoComplete="username"
              textContentType="username"
              error={errors.username}
            />
            <TextInput
              label="Password"
              value={password}
              onChangeText={(value) => {
                setPassword(value);
                clearError("password");
              }}
              secureTextEntry
              autoComplete="new-password"
              textContentType="newPassword"
              error={errors.password}
            />
          </View>

          <Button onPress={handleCreateAccount}>Create account</Button>
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
