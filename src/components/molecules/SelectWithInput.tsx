import { View, type TextInputProps as RNTextInputProps } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { InputWithSelect, Text, type SelectOption } from "@/components/atoms";

interface SelectWithInputProps
  extends Omit<RNTextInputProps, "style" | "value" | "onChangeText"> {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  options: SelectOption[];
  selected?: string;
  onSelect: (value: string) => void;
  selectPlaceholder?: string;
  snapPointsArr?: string[];
  error?: string | null;
}

export const SelectWithInput = ({
  label,
  error,
  ...props
}: SelectWithInputProps) => {
  return (
    <View style={styles.container}>
      <Text variant="label" color={error ? "error" : "textSecondary"}>
        {label}
      </Text>
      <InputWithSelect state={error ? "error" : undefined} {...props} />
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
