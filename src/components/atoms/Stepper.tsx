import { View, type StyleProp, type ViewStyle } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { Text } from "./Text";

interface StepperProps {
  current: number;
  total: number;
  style?: StyleProp<ViewStyle>;
}

export const Stepper = ({ current, total, style }: StepperProps) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.tracks}>
        {Array.from({ length: total }, (_, index) => {
          const isActive = index < current;
          return (
            <View
              key={index}
              style={isActive ? styles.segmentActive : styles.segment}
            />
          );
        })}
      </View>
      <Text color="textSecondary" variant="caption" style={styles.label}>
        {current}/{total}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.gap(1.5),
  },
  tracks: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.gap(0.75),
  },
  segment: {
    flex: 1,
    height: 6,
    borderRadius: 9999,
    backgroundColor: theme.colors.border,
  },
  segmentActive: {
    flex: 1,
    height: 6,
    borderRadius: 9999,
    backgroundColor: theme.colors.text,
  },
  label: {
    fontFamily: theme.fontFamily.medium,
  },
}));
