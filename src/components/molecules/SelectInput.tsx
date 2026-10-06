import { SymbolView } from "expo-symbols";
import { View } from "react-native";
import { StyleSheet, withUnistyles } from "react-native-unistyles";

import { Select, Text, type SelectOption } from "@/components/atoms";

const UniSymbol = withUnistyles(SymbolView, (theme) => ({
  tintColor: theme.colors.textSecondary,
}));

interface SelectInputProps {
  label: string;
  options: SelectOption[];
  value?: string;
  onSelect: (value: string) => void;
  placeholder?: string;
  error?: string | null;
}

export const SelectInput = ({
  label,
  options,
  value,
  onSelect,
  placeholder = "Select…",
  error,
}: SelectInputProps) => {
  const selectedOption = options.find((option) => option.value === value);
  const displayText = selectedOption?.label ?? placeholder;

  styles.useVariants({
    state: error ? "error" : undefined,
  });

  return (
    <View style={styles.container}>
      <Text variant="label" color={error ? "error" : "textSecondary"}>
        {label}
      </Text>
      <Select options={options} selected={value} onSelect={onSelect}>
        <View style={styles.trigger}>
          <Text
            style={styles.value}
            color={selectedOption ? "text" : "textSecondary"}
            numberOfLines={1}
          >
            {displayText}
          </Text>
          <UniSymbol
            name={{
              ios: "chevron.down",
              android: "keyboard_arrow_down",
              web: "keyboard_arrow_down",
            }}
            size={20}
          />
        </View>
      </Select>
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
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.gap(2),
    paddingVertical: theme.gap(1.5),
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
  value: {
    flex: 1,
  },
}));
