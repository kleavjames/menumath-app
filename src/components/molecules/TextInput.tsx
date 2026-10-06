import { View, type TextInputProps as RNTextInputProps } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { Input, Text } from "@/components/atoms";

interface TextInputProps extends RNTextInputProps {
  label: string;
  state?: "error";
}

export const TextInput = ({ label, state, ...props }: TextInputProps) => {
  return (
    <View style={styles.container}>
      <Text variant="label" color="textSecondary">
        {label}
      </Text>
      <Input state={state} {...props} />
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    gap: theme.gap(1),
  },
}));
