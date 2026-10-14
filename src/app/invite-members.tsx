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

import {
  Button,
  Card,
  Input,
  Stepper,
  Text,
  ToggleButton,
} from "@/components/atoms";
import { BackButton } from "@/components/molecules";
import { MemberList } from "@/components/organisms";

const ROLE_OPTIONS = [
  { label: "Manager", value: "manager" },
  { label: "Staff", value: "staff" },
] as const;

type Role = (typeof ROLE_OPTIONS)[number]["value"];

const ROLE_DESCRIPTIONS: Record<Role, string> = {
  manager: "Managers can edit recipes, costs, and manage team access.",
  staff:
    "Staff can view recipes and ingredient lists, but not costs or prices.",
};

export type Invite = {
  username: string;
  role: Role;
};

const InviteMembers = () => {
  const insets = useSafeAreaInsets();
  const [username, setUsername] = useState("");
  const [role, setRole] = useState<Role>("staff");
  const [invites, setInvites] = useState<Invite[]>([]);
  const [error, setError] = useState<string | null>(null);

  const isValidEmail = (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

  const handleAddInvite = () => {
    const trimmed = username.trim().toLowerCase();

    if (!trimmed) {
      setError("Username is required");
      return;
    }

    if (invites.some((invite) => invite.username === trimmed)) {
      setError("Already on the invite list");
      return;
    }

    setInvites((prev) => [...prev, { username: trimmed, role }]);
    setUsername("");
    setError(null);
  };

  const handleRemoveInvite = (usernameToRemove: string) => {
    setInvites((prev) =>
      prev.filter((invite) => invite.username !== usernameToRemove),
    );
  };

  const handleContinue = () => {
    // TODO: submit invites and finish onboarding
  };

  const handleSkip = () => {
    // TODO: finish onboarding without invites
  };

  return (
    <View
      style={[
        styles.screen,
        {
          paddingTop: insets.top,
          marginBottom: insets.bottom,
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
          <Stepper current={2} total={2} />

          <View style={styles.hero}>
            <Text variant="hero" style={styles.headline}>
              Invite members
            </Text>
            <Text color="textSecondary">
              Optional — you can always invite people later.
            </Text>
          </View>

          <Card>
            <View style={styles.field}>
              <Input
                value={username}
                onChangeText={(value) => {
                  setUsername(value);
                  if (error) setError(null);
                }}
                placeholder="Enter username"
                keyboardType="default"
                autoCapitalize="none"
                autoComplete="username"
                textContentType="username"
                autoCorrect={false}
                state={error ? "error" : undefined}
                returnKeyType="done"
                onSubmitEditing={handleAddInvite}
              />
              {error ? (
                <Text variant="caption" color="error">
                  {error}
                </Text>
              ) : null}
            </View>

            <ToggleButton
              options={[...ROLE_OPTIONS]}
              value={role}
              onChange={(value) => setRole(value as Role)}
            />

            <Text variant="caption" color="textSecondary">
              {ROLE_DESCRIPTIONS[role]}
            </Text>

            <Button variant="outline" onPress={handleAddInvite}>
              Add to invite list
            </Button>
          </Card>

          {invites.length > 0 ? (
            <View style={styles.list}>
              <Text variant="label" color="textSecondary">
                Invite list
              </Text>
              {invites.map((invite) => (
                <MemberList
                  key={invite.username}
                  member={invite}
                  onRemove={handleRemoveInvite}
                />
              ))}
            </View>
          ) : null}

          <View style={styles.actions}>
            <Button onPress={handleContinue}>Continue</Button>
            <Pressable
              accessibilityRole="link"
              onPress={handleSkip}
              hitSlop={8}
            >
              <Text variant="label" color="textSecondary" style={styles.skip}>
                Skip for now
              </Text>
            </Pressable>
          </View>
        </ScrollView>
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
  field: {
    gap: theme.gap(1),
  },
  list: {
    gap: theme.gap(0.5),
  },
  actions: {
    marginTop: "auto",
    gap: theme.gap(2.5),
  },
  skip: {
    textAlign: "center",
    textDecorationLine: "underline",
  },
}));

export default InviteMembers;
