import { router, Stack } from "expo-router";
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

import { Card, Text } from "@/components/atoms";
import { TextInput } from "@/components/molecules";
import { formatRole, getInitials } from "@/helpers/format";
import { useAccountUserStore } from "@/store/accountUser";

type FieldErrors = {
  fullName?: string;
  username?: string;
};

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const user = useAccountUserStore((state) => state.user);
  const membership = useAccountUserStore((state) => state.membership);

  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [username, setUsername] = useState(user?.username ?? "");
  const [errors, setErrors] = useState<FieldErrors>({});

  const clearError = (field: keyof FieldErrors) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const validate = () => {
    const next: FieldErrors = {};

    if (!fullName.trim()) {
      next.fullName = "Full name is required";
    }

    const trimmedUsername = username.trim();
    if (trimmedUsername && !/^[a-zA-Z0-9_-]+$/.test(trimmedUsername)) {
      next.username = "Enter a valid username";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    router.back();
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerTransparent: true,
          title: "Profile",
          headerLeft: () => (
            <Pressable onPressIn={router.back} style={styles.headerButton}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
          ),
          headerRight: () => (
            <Pressable onPressIn={handleSave} style={styles.headerButton}>
              <Text style={styles.saveButtonText}>Save</Text>
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
            <View style={styles.avatar}>
              <Text style={styles.avatarLabel}>{getInitials(fullName)}</Text>
            </View>

            <TextInput
              label="Full name"
              value={fullName}
              onChangeText={(value) => {
                setFullName(value);
                clearError("fullName");
              }}
              placeholder="Your full name"
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
              placeholder="your-username"
              keyboardType="default"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="off"
              textContentType="username"
              error={errors.username}
            />

            <Card>
              <View style={styles.roleRow}>
                <Text color="textSecondary">Role</Text>
                <Text>{formatRole(membership?.role)}</Text>
              </View>
            </Card>

            {/* <Button variant="outline">Change password</Button> */}
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
  avatar: {
    alignSelf: "center",
    width: theme.gap(10),
    height: theme.gap(10),
    borderRadius: 9999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.border,
    marginTop: theme.gap(1),
  },
  avatarLabel: {
    fontSize: theme.fontSize.xl,
    fontFamily: theme.fontFamily.semiBold,
    color: theme.colors.text,
  },
  roleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: theme.gap(0.5),
  },
  headerButton: {
    paddingHorizontal: theme.gap(2),
    paddingVertical: theme.gap(1),
  },
  cancelButtonText: {
    color: theme.colors.text,
  },
  saveButtonText: {
    color: theme.colors.primary,
    fontFamily: theme.fontFamily.semiBold,
  },
}));
