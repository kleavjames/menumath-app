import { router } from "expo-router";
import { SymbolView } from "expo-symbols";
import { Pressable } from "react-native";
import { StyleSheet, withUnistyles } from "react-native-unistyles";

const UniSymbol = withUnistyles(SymbolView, (theme) => ({
  tintColor: theme.colors.text,
}));

export const BackButton = () => {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Go back"
      hitSlop={12}
      style={styles.backButton}
      onPress={router.back}
    >
      <UniSymbol
        name={{
          ios: "chevron.left",
          android: "arrow_back_ios",
        }}
        size={22}
      />
    </Pressable>
  );
};

const styles = StyleSheet.create((theme) => ({
  backButton: {
    alignSelf: "flex-start",
    paddingVertical: theme.gap(0.5),
  },
}));
