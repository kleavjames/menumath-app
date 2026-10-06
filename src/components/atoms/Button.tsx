import {
  Pressable,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { Text } from "./Text";

interface ButtonProps extends Omit<PressableProps, "children" | "style"> {
  children: string;
  variant?: "primary";
  style?: StyleProp<ViewStyle>;
}

export const Button = ({
  children,
  variant,
  disabled,
  style,
  ...props
}: ButtonProps) => {
  styles.useVariants({
    variant,
    disabled: Boolean(disabled),
  });

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
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
  button: {
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "stretch",
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.gap(2),
    paddingHorizontal: theme.gap(3),
    variants: {
      variant: {
        default: {
          backgroundColor: theme.colors.text,
        },
        primary: {
          backgroundColor: theme.colors.text,
        },
      },
      disabled: {
        true: {
          opacity: 0.5,
        },
        false: {
          opacity: 1,
        },
      },
    },
  },
  pressed: {
    opacity: 0.85,
  },
  label: {
    color: theme.colors.background,
    fontSize: theme.fontSize.md,
    fontFamily: theme.fontFamily.semiBold,
  },
}));
