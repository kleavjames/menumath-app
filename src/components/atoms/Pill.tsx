import { View, type StyleProp, type ViewStyle } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { Text } from "./Text";

interface PillProps {
  children: string;
  style?: StyleProp<ViewStyle>;
}

export const Pill = ({ children, style }: PillProps) => {
  return (
    <View style={[styles.pill, style]}>
      <Text style={styles.label}>{children}</Text>
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  pill: {
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
    borderRadius: 9999,
    paddingVertical: theme.gap(1),
    paddingHorizontal: theme.gap(2),
    backgroundColor: theme.colors.text,
  },
  label: {
    color: theme.colors.background,
    fontSize: theme.fontSize.sm,
    fontFamily: theme.fontFamily.medium,
  },
}));
