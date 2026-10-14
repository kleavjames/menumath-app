import { SymbolView } from "expo-symbols";
import {
  TextInput as RNTextInput,
  View,
  type TextInputProps as RNTextInputProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { StyleSheet, withUnistyles } from "react-native-unistyles";

const UniTextInput = withUnistyles(RNTextInput, (theme) => ({
  placeholderTextColor: theme.colors.textSecondary,
}));

const UniSymbol = withUnistyles(SymbolView, (theme) => ({
  tintColor: theme.colors.textSecondary,
}));

interface SearchInputProps extends Omit<RNTextInputProps, "style"> {
  style?: StyleProp<ViewStyle>;
}

export const SearchInput = ({
  style,
  placeholder = "Search recipes",
  ...props
}: SearchInputProps) => {
  return (
    <View style={[styles.container, style]}>
      <UniSymbol
        name={{
          ios: "magnifyingglass",
          android: "search",
          web: "search",
        }}
        size={18}
      />
      <UniTextInput
        style={styles.input}
        placeholder={placeholder}
        returnKeyType="search"
        autoCorrect={false}
        autoCapitalize="none"
        clearButtonMode="while-editing"
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "stretch",
    gap: theme.gap(1.5),
    backgroundColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.gap(2),
    paddingVertical: theme.gap(1.5),
  },
  input: {
    flex: 1,
    padding: 0,
    margin: 0,
    fontSize: theme.fontSize.md,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.text,
  },
}));
