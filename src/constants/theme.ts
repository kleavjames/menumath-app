import { StyleSheet } from "react-native-unistyles";

/**
 * MenuMath palette
 * Primary: splash brand blue (#208AEF) — clear, numeric, trustworthy
 * Secondary: warm amber — food pricing / margin energy without fighting the blue
 */
const fontFamily = {
  regular: "OpenSans-Regular",
  italic: "OpenSans-Italic",
  light: "OpenSans-Light",
  lightItalic: "OpenSans-LightItalic",
  medium: "OpenSans-Medium",
  mediumItalic: "OpenSans-MediumItalic",
  semiBold: "OpenSans-SemiBold",
  semiBoldItalic: "OpenSans-SemiBoldItalic",
  bold: "OpenSans-Bold",
  boldItalic: "OpenSans-BoldItalic",
  extraBold: "OpenSans-ExtraBold",
  extraBoldItalic: "OpenSans-ExtraBoldItalic",
};

const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  display: 24,
};

const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
};

const lightTheme = {
  colors: {
    primary: "#5AC38F",
    secondary: "#E89B2D",
    text: "#17160F",
    textSecondary: "#5E5C54",
    border: "#E2DFD7",
    background: "#FFFFFF",
    surface: "#F5F3EE",
    error: "#D0312D",
  },
  borderRadius,
  fontFamily,
  fontSize,
  gap: (v: number) => v * 8,
};

const darkTheme = {
  colors: {
    primary: "#5AC38F",
    secondary: "#F0B14A",
    text: "#17160F",
    textSecondary: "#5E5C54",
    border: "#E2DFD7",
    background: "#FFFFFF",
    surface: "#F5F3EE",
    error: "#D0312D",
  },
  borderRadius,
  fontFamily,
  fontSize,
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
