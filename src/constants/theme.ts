import { StyleSheet } from "react-native-unistyles";

/**
 * MenuMath palette
 * Primary: splash brand blue (#208AEF) — clear, numeric, trustworthy
 * Secondary: warm amber — food pricing / margin energy without fighting the blue
 */
const lightTheme = {
  colors: {
    primary: "#208AEF",
    secondary: "#E89B2D",
  },
  gap: (v: number) => v * 8,
};

const darkTheme = {
  colors: {
    primary: "#4BA3F5",
    secondary: "#F0B14A",
  },
  gap: (v: number) => v * 8,
};

const appThemes = {
  light: lightTheme,
  dark: darkTheme,
};

const breakpoints = {
  xs: 0,
  sm: 300,
  md: 500,
  lg: 800,
  xl: 1200,
};

type AppBreakpoints = typeof breakpoints;
type AppThemes = typeof appThemes;

declare module "react-native-unistyles" {
  export interface UnistylesThemes extends AppThemes {}
  export interface UnistylesBreakpoints extends AppBreakpoints {}
}

StyleSheet.configure({
  settings: {
    adaptiveThemes: true,
  },
  breakpoints,
  themes: appThemes,
});
