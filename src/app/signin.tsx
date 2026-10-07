import { router } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";

import { Button, Text } from "@/components/atoms";
import { TextInput } from "@/components/molecules";
import { useAuth } from "../../provider/AuthProvider";

type FieldErrors = {
  username?: string;
  password?: string;
};

const SignIn = () => {
  const { login } = useAuth();
  const insets = useSafeAreaInsets();
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

    if (!username.trim()) {
      next.username = "Username is required";
    }

    if (!password.trim()) {
      next.password = "Password is required";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSignIn = () => {
    if (!validate()) return;
    // login(username, password);
  };

  return (
    <View
      style={[
        styles.screen,
        {
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom,
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
          <View style={styles.brand}>
            <View style={styles.logo}>
              <Text style={styles.logoMark}>M÷</Text>
            </View>
            <Text variant="title">MenuMath</Text>
          </View>

          <View style={styles.hero}>
            <Text variant="hero" style={styles.headline}>
              Know what every plate costs.
            </Text>
            <Text color="textSecondary">
              Sign in to manage recipes, ingredients and margins.
            </Text>
          </View>

          <View style={styles.form}>
            <TextInput
              label="Username"
              value={username}
              placeholder="Your username"
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
            <View style={styles.passwordBlock}>
              <TextInput
                label="Password"
                value={password}
                placeholder="Your password"
                onChangeText={(value) => {
                  setPassword(value);
                  clearError("password");
                }}
                secureTextEntry
                autoComplete="password"
                textContentType="password"
                error={errors.password}
              />
              <Pressable
                accessibilityRole="link"
                hitSlop={8}
                style={styles.forgotPassword}
                onPress={() => {}}
              >
                <Text variant="label" color="textSecondary">
                  Forgot password?
                </Text>
              </Pressable>
            </View>
          </View>

          <Button onPress={handleSignIn}>Sign in</Button>
        </ScrollView>
      </KeyboardAvoidingView>

      <Text variant="label" color="textSecondary" style={styles.footer}>
        New to MenuMath?{" "}
        <Text
          variant="label"
          style={styles.link}
          onPress={() => router.push("/signup")}
        >
          Create an account
        </Text>
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
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.gap(1.5),
  },
  logo: {
    width: 36,
    height: 36,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.text,
    alignItems: "center",
    justifyContent: "center",
  },
  logoMark: {
    color: theme.colors.background,
    fontSize: theme.fontSize.sm,
    fontFamily: theme.fontFamily.bold,
  },
  hero: {
    gap: theme.gap(2),
  },
  headline: {
    fontSize: 28,
    lineHeight: 34,
  },
  form: {
    gap: theme.gap(2.5),
  },
  passwordBlock: {
    gap: theme.gap(1),
  },
  forgotPassword: {
    alignSelf: "flex-end",
  },
  footer: {
    textAlign: "center",
  },
  link: {
    textDecorationLine: "underline",
    fontFamily: theme.fontFamily.semiBold,
  },
}));

export default SignIn;
