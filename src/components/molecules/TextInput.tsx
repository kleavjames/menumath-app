import { View, type TextInputProps as RNTextInputProps } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { Input, Text, type InputSize } from "@/components/atoms";

interface TextInputProps extends RNTextInputProps {
  label?: string;
  error?: string | null;
  variant?: "ghost";
  size?: InputSize;
}

export const TextInput = ({ label, error, ...props }: TextInputProps) => {
  const state = error ? "error" : undefined;

  return (
    <View style={styles.container}>
      {label ? (
        <Text variant="label" color={error ? "error" : "textSecondary"}>
          {label}
        </Text>
      ) : null}
      <Input state={state} {...props} />
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
