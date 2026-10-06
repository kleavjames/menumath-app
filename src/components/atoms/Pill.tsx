import {
  Pressable,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { Text } from "./Text";

interface PillProps extends Omit<PressableProps, "children" | "style"> {
  children: string;
  selected?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const Pill = ({
  children,
  selected = false,
  disabled,
  style,
  ...props
}: PillProps) => {
  styles.useVariants({
    selected,
  });

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      disabled={disabled}
      style={({ pressed }) => [
        styles.pill,
        pressed && !disabled && styles.pressed,
        style,
      ]}
      {...props}
    >
      <Text style={styles.label}>{children}</Text>
    </Pressable>
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
    borderWidth: 1,
    variants: {
      selected: {
        true: {
          backgroundColor: theme.colors.text,
          borderColor: theme.colors.text,
        },
        false: {
          backgroundColor: theme.colors.background,
          borderColor: theme.colors.border,
        },
      },
    },
  },
  pressed: {
    opacity: 0.85,
  },
  label: {
    fontSize: theme.fontSize.sm,
    fontFamily: theme.fontFamily.medium,
    variants: {
      selected: {
        true: {
          color: theme.colors.background,
        },
        false: {
          color: theme.colors.text,
        },
      },
    },
  },
}));
