import { SymbolView } from "expo-symbols";
import { Pressable, View } from "react-native";
import { StyleSheet, withUnistyles } from "react-native-unistyles";

import { Text } from "@/components/atoms";

const UniChevron = withUnistyles(SymbolView, (theme) => ({
  tintColor: theme.colors.textSecondary,
}));

export type AccountsRowProps = {
  label: string;
  value?: string;
  subtitle?: string;
  onPress?: () => void;
  showChevron?: boolean;
  trailing?: React.ReactNode;
};

export const AccountsRow = ({
  label,
  value,
  subtitle,
  onPress,
  showChevron = true,
  trailing,
}: AccountsRowProps) => {
  const content = (
    <View style={styles.row}>
      <View style={styles.rowCopy}>
        <Text>{label}</Text>
        {subtitle ? (
          <Text variant="caption" color="textSecondary">
            {subtitle}
          </Text>
        ) : null}
      </View>
      <View style={styles.rowTrailing}>
        {trailing ??
          (value ? <Text color="textSecondary">{value}</Text> : null)}
        {showChevron ? (
          <UniChevron
            name={{
              ios: "chevron.right",
              android: "chevron_right",
              web: "chevron_right",
            }}
            size={16}
          />
        ) : null}
      </View>
    </View>
  );

  if (!onPress) {
    return content;
  }

  return (
    <Pressable
      accessibilityRole="button"
      style={({ pressed }) => [pressed && styles.rowPressed]}
      onPress={onPress}
    >
      {content}
    </Pressable>
  );
};

const styles = StyleSheet.create((theme) => ({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.gap(2),
    paddingVertical: theme.gap(2),
    paddingHorizontal: theme.gap(2.5),
  },
  rowCopy: {
    flex: 1,
    gap: theme.gap(0.375),
  },
  rowTrailing: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.gap(1),
  },
  rowPressed: {
    opacity: 0.7,
  },
}));
