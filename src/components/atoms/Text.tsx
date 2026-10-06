import { Text as RNText, TextProps as RNTextProps } from "react-native";
import { StyleSheet } from "react-native-unistyles";

interface TextProps extends RNTextProps {
  children: React.ReactNode;
  color?: "primary" | "secondary" | "text" | "textSecondary" | "error";
  variant?: "hero" | "title" | "body" | "caption" | "label";
}

export const Text = ({
  children,
  variant = "body",
  color = "text",
  style,
  ...props
}: TextProps) => {
  styles.useVariants({
    variant,
    color,
  });

  return (
    <RNText style={[styles.text, style]} {...props}>
      {children}
    </RNText>
  );
};

const styles = StyleSheet.create((theme) => ({
  text: {
    variants: {
      color: {
        primary: {
          color: theme.colors.primary,
        },
        secondary: {
          color: theme.colors.secondary,
        },
        text: {
          color: theme.colors.text,
        },
        textSecondary: {
          color: theme.colors.textSecondary,
        },
        error: {
          color: theme.colors.error,
        },
      },
      variant: {
        hero: {
          fontSize: theme.fontSize.display,
          fontFamily: theme.fontFamily.bold,
        },
        title: {
          fontSize: theme.fontSize.xl,
          fontFamily: theme.fontFamily.semiBold,
        },
        body: {
          fontSize: theme.fontSize.md,
          fontFamily: theme.fontFamily.regular,
        },
        caption: {
          fontSize: theme.fontSize.xs,
          fontFamily: theme.fontFamily.regular,
        },
        label: {
          fontSize: theme.fontSize.sm,
          fontFamily: theme.fontFamily.medium,
        },
      },
    },
  },
}));
