import { useRef, useState } from "react";
import {
  Pressable,
  TextInput as RNTextInput,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { StyleSheet, withUnistyles } from "react-native-unistyles";

import { Text } from "./Text";

const UniTextInput = withUnistyles(RNTextInput, (theme) => ({
  selectionColor: theme.colors.text,
  cursorColor: theme.colors.text,
}));

type PinCodeProps = {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  autoFocus?: boolean;
  error?: boolean;
  onComplete?: (value: string) => void;
  style?: StyleProp<ViewStyle>;
};

export const PinCode = ({
  value,
  onChange,
  length = 6,
  autoFocus = false,
  error = false,
  onComplete,
  style,
}: PinCodeProps) => {
  const inputRef = useRef<RNTextInput>(null);
  const [isFocused, setIsFocused] = useState(false);

  const digits = value.replace(/\D/g, "").slice(0, length);
  const activeIndex = Math.min(digits.length, length - 1);

  const handleChange = (next: string) => {
    const sanitized = next.replace(/\D/g, "").slice(0, length);
    onChange(sanitized);

    if (sanitized.length === length) {
      onComplete?.(sanitized);
    }
  };

  const focusInput = () => {
    inputRef.current?.focus();
  };

  return (
    <Pressable
      accessibilityRole="none"
      onPress={focusInput}
      style={[styles.container, style]}
    >
      <UniTextInput
        ref={inputRef}
        value={digits}
        onChangeText={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        autoFocus={autoFocus}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="sms-otp"
        maxLength={length}
        caretHidden
        style={styles.hiddenInput}
      />

      {Array.from({ length }, (_, index) => {
        const isActive = isFocused && !error && index === activeIndex;
        const digit = digits[index] ?? "";

        return (
          <View
            key={index}
            style={[
              styles.cell,
              isActive && styles.cellActive,
              error && styles.cellError,
            ]}
          >
            <Text style={styles.digit}>{digit}</Text>
          </View>
        );
      })}
    </Pressable>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: "row",
    alignSelf: "stretch",
    gap: theme.gap(1),
  },
  hiddenInput: {
    position: "absolute",
    opacity: 0,
    width: 1,
    height: 1,
  },
  cell: {
    flex: 1,
    aspectRatio: 0.85,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.background,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
  },
  cellActive: {
    borderColor: theme.colors.text,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  cellError: {
    borderColor: theme.colors.error,
  },
  digit: {
    fontSize: theme.fontSize.xl,
    fontFamily: theme.fontFamily.semiBold,
    color: theme.colors.text,
  },
}));
