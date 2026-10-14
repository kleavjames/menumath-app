import ExpoCheckbox from "expo-checkbox";
import { Pressable, View, type StyleProp, type ViewStyle } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { Text } from "@/components/atoms";

export type CheckboxProps = {
  label: string;
  value: boolean;
  onValueChange: (checked: boolean) => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export const Checkbox = ({
  label,
  value,
  onValueChange,
  disabled = false,
  style,
}: CheckboxProps) => {
  const { theme } = useUnistyles();

  const handleToggle = () => {
    if (disabled) return;
    onValueChange(!value);
  };

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: value, disabled }}
      accessibilityLabel={label}
      disabled={disabled}
      onPress={handleToggle}
      style={({ pressed }) => [
        styles.row,
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      <View pointerEvents="none">
        <ExpoCheckbox
          value={value}
          disabled={disabled}
          color={theme.colors.text}
          style={styles.box}
        />
      </View>
      <Text color={disabled ? "textSecondary" : "text"} style={styles.label}>
        {label}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create((theme) => ({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.gap(1.5),
    alignSelf: "flex-start",
  },
  pressed: {
    opacity: 0.85,
  },
  box: {
    borderRadius: theme.borderRadius.xs,
    borderWidth: 1,
  },
  label: {
    flexShrink: 1,
    fontSize: theme.fontSize.sm,
  },
}));
