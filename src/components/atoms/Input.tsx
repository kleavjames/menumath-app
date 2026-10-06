import {
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
} from "react-native";
import { StyleSheet, withUnistyles } from "react-native-unistyles";

const UniTextInput = withUnistyles(RNTextInput, (theme) => ({
  placeholderTextColor: theme.colors.textSecondary,
}));

interface InputProps extends RNTextInputProps {
  state?: "error";
}

export const Input = ({ state, style, ...props }: InputProps) => {
  styles.useVariants({ state });

  return <UniTextInput style={[styles.input, style]} {...props} />;
};

const styles = StyleSheet.create((theme) => ({
  input: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderRadius: 12,
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
    },
  },
}));
