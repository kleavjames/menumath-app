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

interface InputWithSelectProps
  extends Omit<RNTextInputProps, "style" | "value" | "onChangeText"> {
  /** Left side: the value the user types. */
  value: string;
  onChangeText: (text: string) => void;
  /** Right side: dynamic dropdown options. */
  options: SelectOption[];
  selected?: string;
  onSelect: (value: string) => void;
  selectPlaceholder?: string;
  state?: "error";
  snapPointsArr?: string[];
}

export const InputWithSelect = ({
  value,
  onChangeText,
  options,
  selected,
  onSelect,
  selectPlaceholder = "Select",
  state,
  snapPointsArr = ["25%", "50%"],
  keyboardType = "decimal-pad",
  ...inputProps
}: InputWithSelectProps) => {
  const selectedOption = options.find((option) => option.value === selected);

  styles.useVariants({ state });

  return (
    <View style={styles.container}>
      <UniTextInput
        {...inputProps}
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
      />

      <View style={styles.selectWrapper}>
        <Select
          options={options}
          selected={selected}
          onSelect={onSelect}
          snapPointsArr={snapPointsArr}
        >
          <View style={styles.trigger}>
            <Text
              style={styles.triggerLabel}
              color={selectedOption ? "text" : "textSecondary"}
              numberOfLines={1}
            >
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
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: "row",
    alignItems: "stretch",
    overflow: "hidden",
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderRadius: theme.borderRadius.md,
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
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.gap(2),
    paddingVertical: theme.gap(1.5),
    fontSize: theme.fontSize.md,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.text,
  },
  selectWrapper: {
    minWidth: theme.gap(10),
    justifyContent: "center",
    borderLeftWidth: 1,
    borderLeftColor: theme.colors.border,
  },
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.gap(1),
    paddingHorizontal: theme.gap(2),
    paddingVertical: theme.gap(1.5),
  },
  triggerLabel: {
    flexShrink: 1,
  },
}));
