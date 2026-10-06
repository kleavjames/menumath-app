/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { useUnistyles } from "react-native-unistyles";

export function useTheme() {
  const { theme } = useUnistyles();

  return theme.colors;
}
