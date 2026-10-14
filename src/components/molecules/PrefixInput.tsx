import { View, type TextInputProps as RNTextInputProps } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { InputWithPrefix, Text } from "@/components/atoms";

interface PrefixInputProps extends Omit<RNTextInputProps, "style"> {
  label?: string;
  /** Symbol shown before the value, e.g. "$". */
  prefix?: string;
  /** Symbol shown after the value, e.g. "%". */
  suffix?: string;
  error?: string | null;
}

export const PrefixInput = ({ label, error, ...props }: PrefixInputProps) => {
  return (
    <View style={styles.container}>
      {label ? (
        <Text variant="label" color={error ? "error" : "textSecondary"}>
          {label}
        </Text>
      ) : null}
      <InputWithPrefix state={error ? "error" : undefined} {...props} />
      {error ? (
        <Text variant="caption" color="error">
          {error}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    gap: theme.gap(1),
  },
}));
