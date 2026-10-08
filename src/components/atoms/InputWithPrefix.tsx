import {
  TextInput as RNTextInput,
  View,
  type TextInputProps as RNTextInputProps,
} from "react-native";
import { StyleSheet, withUnistyles } from "react-native-unistyles";

import { Text } from "./Text";

const UniTextInput = withUnistyles(RNTextInput, (theme) => ({
  placeholderTextColor: theme.colors.textSecondary,
}));

interface InputWithPrefixProps extends Omit<RNTextInputProps, "style"> {
  /** Leading symbol shown before the value, e.g. "$". */
  prefix?: string;
  /** Trailing symbol shown after the value, e.g. "%". */
  suffix?: string;
  state?: "error";
}

export const InputWithPrefix = ({
  prefix,
  suffix,
  state,
  keyboardType = "decimal-pad",
  ...props
}: InputWithPrefixProps) => {
  styles.useVariants({ state });

  // A suffix-only input reads like "100 %", so the value hugs the suffix.
  const alignRight = Boolean(suffix) && !prefix;

  return (
    <View style={styles.container}>
      {prefix ? (
        <Text style={styles.affix} color="textSecondary">
          {prefix}
        </Text>
      ) : null}
      <UniTextInput
        {...props}
        style={[styles.input, alignRight ? styles.inputRight : null]}
        keyboardType={keyboardType}
      />
      {suffix ? (
        <Text style={styles.affix} color="textSecondary">
          {suffix}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.gap(2),
    gap: theme.gap(1),
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
  affix: {
    fontSize: theme.fontSize.md,
  },
  input: {
    flex: 1,
    paddingVertical: theme.gap(1.5),
    fontSize: theme.fontSize.md,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.text,
  },
  inputRight: {
    textAlign: "right",
  },
}));
