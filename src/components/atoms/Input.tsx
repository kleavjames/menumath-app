import { SymbolView } from "expo-symbols";
import { useState, type ReactNode } from "react";
import {
  Pressable,
  TextInput as RNTextInput,
  View,
  type TextInputProps as RNTextInputProps,
} from "react-native";
import { StyleSheet, withUnistyles } from "react-native-unistyles";

const UniTextInput = withUnistyles(RNTextInput, (theme) => ({
  placeholderTextColor: theme.colors.textSecondary,
}));

const UniSymbol = withUnistyles(SymbolView, (theme) => ({
  tintColor: theme.colors.textSecondary,
}));

export type InputSize = "sm" | "md" | "lg" | "xl" | "display";

interface InputProps extends RNTextInputProps {
  state?: "error";
  /** "ghost" is a borderless, large, bold input for title-like fields. */
  variant?: "ghost";
  /** Overrides the font size. Omitted keeps the current size for the variant. */
  size?: InputSize;
  rightIcon?: ReactNode;
  onIconPress?: () => void;
}

export const Input = ({
  state,
  variant,
  size,
  style,
  secureTextEntry,
  rightIcon,
  onIconPress,
  ...props
}: InputProps) => {
  const [isPasswordField] = useState(() => Boolean(secureTextEntry));
  const [isSecure, setIsSecure] = useState(isPasswordField);
  const showIcon = isPasswordField || Boolean(rightIcon);

  styles.useVariants({
    state,
    hasIcon: showIcon,
    variant,
    size,
  });

  const handleIconPress = () => {
    if (isPasswordField) {
      setIsSecure((prev) => !prev);
    }
    onIconPress?.();
  };

  return (
    <View style={styles.container}>
      <UniTextInput
        style={[styles.input, style]}
        secureTextEntry={isPasswordField ? isSecure : secureTextEntry}
        {...props}
      />
      {showIcon ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            isPasswordField
              ? isSecure
                ? "Show password"
                : "Hide password"
              : "Input action"
          }
          hitSlop={8}
          style={styles.iconButton}
          onPress={handleIconPress}
        >
          {isPasswordField ? (
            <UniSymbol
              name={
                isSecure
                  ? { ios: "eye", android: "visibility" }
                  : {
                      ios: "eye.slash",
                      android: "visibility_off",
                    }
              }
              size={20}
            />
          ) : (
            rightIcon
          )}
        </Pressable>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    position: "relative",
    justifyContent: "center",
  },
  input: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.gap(2),
    paddingVertical: theme.gap(1.5),
    fontSize: theme.fontSize.md,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.text,
    variants: {
      state: {
        default: {
          borderColor: theme.colors.border,
        },
        error: {
          borderColor: theme.colors.error,
        },
      },
      hasIcon: {
        true: {
          paddingRight: theme.gap(5),
        },
        false: {
          paddingRight: theme.gap(2),
        },
      },
      variant: {
        default: {},
        ghost: {
          backgroundColor: "transparent",
          borderWidth: 0,
          paddingHorizontal: 0,
          fontSize: theme.fontSize.display,
          fontFamily: theme.fontFamily.bold,
        },
      },
      size: {
        default: {},
        sm: { fontSize: theme.fontSize.sm },
        md: { fontSize: theme.fontSize.md },
        lg: { fontSize: theme.fontSize.lg },
        xl: { fontSize: theme.fontSize.xl },
        display: { fontSize: theme.fontSize.display },
      },
    },
  },
  iconButton: {
    position: "absolute",
    right: theme.gap(2),
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
}));
