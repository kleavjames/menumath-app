import { Platform, type StyleProp, type ViewStyle } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { Card, Text } from "@/components/atoms";

interface BigInfoCardProps {
  /** Small caption on top, e.g. "Usable cost per kg". */
  label: string;
  /** Large headline value, e.g. "$331.00". */
  value: string;
  /** Optional smaller line below the value, e.g. "$0.3310 per g". */
  subValue?: string;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

export const BigInfoCard = ({
  label,
  value,
  subValue,
  style,
}: BigInfoCardProps) => {
  return (
    <>
      <Card style={[styles.card, style]}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit>
          {value}
        </Text>
        {subValue ? <Text style={styles.subValue}>{subValue}</Text> : null}
      </Card>
    </>
  );
};

const mono = Platform.select({
  ios: "Menlo",
  default: "monospace",
});

const styles = StyleSheet.create((theme) => ({
  card: {
    backgroundColor: theme.colors.text,
    borderWidth: 0,
    borderRadius: theme.borderRadius.xl,
    paddingHorizontal: theme.gap(3),
    paddingVertical: theme.gap(3),
    gap: theme.gap(1),
  },
  label: {
    fontSize: theme.fontSize.md,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.border,
    opacity: 0.75,
  },
  value: {
    fontSize: 40,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.background,
  },
  subValue: {
    fontSize: theme.fontSize.md,
    fontFamily: mono,
    color: theme.colors.border,
    opacity: 0.75,
  },
}));
