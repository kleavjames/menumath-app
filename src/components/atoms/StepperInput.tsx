import { SymbolView } from "expo-symbols";
import { Pressable, View, type StyleProp, type ViewStyle } from "react-native";
import { StyleSheet, withUnistyles } from "react-native-unistyles";

import { Text } from "./Text";

const UniSymbol = withUnistyles(SymbolView, (theme) => ({
  tintColor: theme.colors.text,
}));

interface StepperProps {
  value: number;
  onChange: (value: number) => void;
  step?: number;
  min?: number;
  max?: number;
  suffix?: string;
  style?: StyleProp<ViewStyle>;
}

export const StepperInput = ({
  value,
  onChange,
  step = 1,
  min,
  max,
  suffix = "",
  style,
}: StepperProps) => {
  const canDecrement = min === undefined || value - step >= min;
  const canIncrement = max === undefined || value + step <= max;

  const decrement = () => {
    if (!canDecrement) return;
    onChange(value - step);
  };

  const increment = () => {
    if (!canIncrement) return;
    onChange(value + step);
  };

  return (
    <View style={[styles.container, style]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Decrease"
        disabled={!canDecrement}
        hitSlop={8}
        onPress={decrement}
        style={styles.button}
      >
        <UniSymbol
          name={{ ios: "minus", android: "remove", web: "remove" }}
          size={16}
        />
      </Pressable>

      <Text style={styles.value}>
        {value}
        {suffix}
      </Text>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Increase"
        disabled={!canIncrement}
        hitSlop={8}
        onPress={increment}
        style={styles.button}
      >
        <UniSymbol
          name={{ ios: "plus", android: "add", web: "add" }}
          size={16}
        />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: theme.gap(2),
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.gap(1),
    paddingHorizontal: theme.gap(2),
  },
  button: {
    alignItems: "center",
    justifyContent: "center",
  },
  value: {
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
    fontFamily: theme.fontFamily.regular,
    minWidth: theme.gap(5),
    textAlign: "center",
  },
}));
