import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { Text } from "../atoms";

type DetailRowProps = {
  label: string;
  value: string;
  withDivider?: boolean;
};

export const DetailRow = ({ label, value, withDivider }: DetailRowProps) => (
  <View>
    {withDivider ? <View style={styles.divider} /> : null}
    <View style={styles.detailRow}>
      <Text color="textSecondary">{label}</Text>
      <Text style={styles.detailValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  </View>
);

const styles = StyleSheet.create((theme) => ({
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.gap(2),
    paddingVertical: theme.gap(2),
    paddingHorizontal: theme.gap(2.5),
  },
  detailValue: {
    flexShrink: 1,
    fontFamily: theme.fontFamily.medium,
  },
}));
