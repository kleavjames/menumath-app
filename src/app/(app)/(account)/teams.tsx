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
import { INVITE_CODE_ROLE_OPTIONS } from "@/constants";
import { formatRole, getInitials } from "@/helpers";
import { useRole, useTeamMembers } from "@/hooks";
import { generateCode } from "@/service/api";
import { useAccountUserStore, useInvitationCodeStore } from "@/store";
import { ApiError, MembershipRole } from "@/types";

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
  const { teamMembers } = useTeamMembers();
  const { isOwner } = useRole();

  const invitationCode = useInvitationCodeStore(
    (state) => state.invitationCode,
  );
  const expiresAt = useInvitationCodeStore((state) => state.expiresAt);
  const setExpiresAt = useInvitationCodeStore((state) => state.setExpiresAt);
  const setInvitationCode = useInvitationCodeStore(
    (state) => state.setInvitationCode,
  );

  const [codeRole, setCodeRole] = useState<MembershipRole>(
    MembershipRole.STAFF,
  );

  const codeHelpText = useMemo(
    () =>
      `Share this code with staff. They enter it at sign-up to join ${businessName}. Generating a new code turns off the old one.`,
    [businessName],
  );

  const expiresAtMs = useMemo(() => {
    if (!expiresAt) return null;
    const date = expiresAt instanceof Date ? expiresAt : new Date(expiresAt);
    const ms = date.getTime();
    return Number.isNaN(ms) ? null : ms;
  }, [expiresAt]);

  const isCodeExpired = expiresAtMs !== null && expiresAtMs <= Date.now();
  const daysUntilExpiry =
    expiresAtMs === null
      ? null
      : Math.ceil((expiresAtMs - Date.now()) / (1000 * 60 * 60 * 24));

  const handleCopyCode = async () => {
    await Clipboard.setStringAsync(invitationCode);
    showToast("Code copied", { variant: "default" });
  };

  const handleGenerateCode = async () => {
    try {
      const response = await generateCode({
        businessId: business?.id ?? "",
        role: codeRole,
        expiresInDays: 7,
      });
      setInvitationCode(response.code);
      setExpiresAt(new Date(response.expiresAt));
      showToast("New invite code generated", { variant: "default" });
    } catch (error) {
      if (error instanceof ApiError) {
        showToast(error.message, { variant: "error" });
      } else {
        showToast("An unexpected error occurred", { variant: "error" });
      }
    }
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
            {isOwner ? (
              <Card>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>Invite code</Text>
                  {expiresAtMs !== null ? (
                    <Text
                      variant="caption"
                      color={isCodeExpired ? "error" : "textSecondary"}
                    >
                      {isCodeExpired
                        ? "Code expired"
                        : `Expires in ${daysUntilExpiry} days`}
                    </Text>
                  ) : null}
                </View>

                <InviteCodeDisplay code={invitationCode} />

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
            ) : null}

            <View style={styles.section}>
              <Text
                variant="caption"
                color="textSecondary"
                style={styles.sectionLabel}
              >
                Members
              </Text>
              <Card style={styles.listCard}>
                {teamMembers.length === 0 ? (
                  <View style={styles.emptyRow}>
                    <Text variant="caption" color="textSecondary">
                      No team members yet
                    </Text>
                  </View>
                ) : (
                  teamMembers.map((member, index) => (
                    <View key={member.id}>
                      {index > 0 ? <View style={styles.divider} /> : null}
                      <View style={styles.memberRow}>
                        <View style={styles.avatar}>
                          <Text style={styles.avatarLabel}>
                            {getInitials(member.fullName)}
                          </Text>
                        </View>
                        <View style={styles.memberCopy}>
                          <Text style={styles.memberName} numberOfLines={1}>
                            {member.fullName}
                          </Text>
                          <Text
                            variant="caption"
                            color="textSecondary"
                            numberOfLines={1}
                          >
                            {member.username}
                          </Text>
                        </View>
                        <Text variant="caption" color="textSecondary">
                          {formatRole(member.membership.role)}
                        </Text>
                      </View>
                    </View>
                  ))
                )}
              </Card>
            </View>
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
  memberRow: {
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
  memberCopy: {
    flex: 1,
    gap: theme.gap(0.25),
  },
  memberName: {
    fontFamily: theme.fontFamily.semiBold,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginLeft: theme.gap(2.5),
  },
  emptyRow: {
    paddingVertical: theme.gap(2),
    paddingHorizontal: theme.gap(2.5),
  },
}));
