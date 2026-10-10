import { Invite } from "@/app/invite-members";
import { SymbolView } from "expo-symbols";
import { Pressable, View } from "react-native";
import { StyleSheet, withUnistyles } from "react-native-unistyles";
import { Text } from "../atoms";

type Member = {
  member: Invite;
  onRemove: (email: string) => void;
};

const UniSymbol = withUnistyles(SymbolView, (theme) => ({
  tintColor: theme.colors.textSecondary,
}));

export const MemberList = ({ member, onRemove }: Member) => {
  return (
    <View key={member.username} style={styles.inviteRow}>
      <View style={styles.inviteCopy}>
        <Text numberOfLines={1}>{member.username}</Text>
        <Text variant="caption" color="textSecondary">
          {member.role === "manager" ? "Manager" : "Staff"}
        </Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Remove ${member.username}`}
        hitSlop={8}
        onPress={() => onRemove(member.username)}
      >
        <UniSymbol name="xmark" size={16} />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  inviteRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.gap(2),
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.gap(1.5),
    paddingHorizontal: theme.gap(2),
  },
  inviteCopy: {
    flex: 1,
    gap: theme.gap(1),
  },
}));
