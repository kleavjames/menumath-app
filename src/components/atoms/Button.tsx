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
  variant?: "fill" | "outline";
  style?: StyleProp<ViewStyle>;
}

export const Button = ({
  children,
  variant = "fill",
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
    borderWidth: 1,
    paddingVertical: theme.gap(2),
    paddingHorizontal: theme.gap(3),
    variants: {
      variant: {
        fill: {
          backgroundColor: theme.colors.text,
          borderColor: theme.colors.text,
        },
        outline: {
          backgroundColor: "transparent",
          borderColor: theme.colors.text,
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
    fontSize: theme.fontSize.md,
    fontFamily: theme.fontFamily.semiBold,
    variants: {
      variant: {
        fill: {
          color: theme.colors.background,
        },
        outline: {
          color: theme.colors.text,
        },
      },
    },
  },
}));
