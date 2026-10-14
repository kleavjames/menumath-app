import { SymbolView } from "expo-symbols";
import {
  TextInput as RNTextInput,
  View,
  type TextInputProps as RNTextInputProps,
} from "react-native";
import { StyleSheet, withUnistyles } from "react-native-unistyles";

import { Select, type SelectOption } from "./Select";
import { Text } from "./Text";

const UniTextInput = withUnistyles(RNTextInput, (theme) => ({
  placeholderTextColor: theme.colors.textSecondary,
}));

const UniSymbol = withUnistyles(SymbolView, (theme) => ({
  tintColor: theme.colors.textSecondary,
}));

interface InputSelectProps extends Omit<RNTextInputProps, "style"> {
  value: string;
  onChangeText: (text: string) => void;
  options: SelectOption[];
  selected?: string;
  onSelect: (value: string) => void;
  selectPlaceholder?: string;
  state?: "error";
  snapPointsArr?: string[];
}

export const InputSelect = ({
  value,
  onChangeText,
  options,
  selected,
  onSelect,
  placeholder,
  selectPlaceholder = "Unit",
  state,
  snapPointsArr,
  keyboardType = "decimal-pad",
  ...inputProps
}: InputSelectProps) => {
  const selectedOption = options.find((option) => option.value === selected);

  styles.useVariants({ state });

  return (
    <View style={styles.container}>
      <UniTextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
        {...inputProps}
      />
      <View style={styles.divider} />
      <Select
        options={options}
        selected={selected}
        onSelect={onSelect}
        snapPointsArr={snapPointsArr}
      >
        <View style={styles.trigger}>
          <Text color="textSecondary" numberOfLines={1}>
            {selectedOption?.label ?? selectPlaceholder}
          </Text>
          <UniSymbol
            name={{
              ios: "chevron.down",
              android: "keyboard_arrow_down",
              web: "keyboard_arrow_down",
            }}
            size={16}
          />
        </View>
      </Select>
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: "row",
    alignItems: "stretch",
    alignSelf: "flex-start",
    overflow: "hidden",
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderRadius: theme.borderRadius.lg,
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
  input: {
    minWidth: theme.gap(8),
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.gap(2),
    paddingVertical: theme.gap(1.75),
    fontSize: theme.fontSize.xl,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.text,
  },
  divider: {
    width: 1,
    backgroundColor: theme.colors.border,
  },
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.gap(1),
    paddingHorizontal: theme.gap(2),
    paddingVertical: theme.gap(1.75),
  },
}));
