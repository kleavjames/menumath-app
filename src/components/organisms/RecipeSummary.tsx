import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { Text } from "@/components/atoms";
import { formatAmount, formatPrice } from "@/helpers";

type CostStatus = "good" | "warn" | "over";

type RecipeSummaryProps = {
  symbol: string;
  costPerServing: number;
  recipeCost: number;
  profitPerServing: number;
  hasPrice: boolean;
  targetFoodCost: number;
  bottomInset: number;
};

const getCostStatus = (percent: number, target: number): CostStatus => {
  if (percent <= target) return "good";
  if (percent <= target + 5) return "warn";
  return "over";
};

export const RecipeSummary = ({
  symbol,
  costPerServing,
  recipeCost,
  profitPerServing,
  hasPrice,
  targetFoodCost,
  bottomInset,
}: RecipeSummaryProps) => {
  const status = getCostStatus(recipeCost, targetFoodCost);

  return (
    <View style={styles.summary(bottomInset)}>
      <View style={styles.summaryRow}>
        <View style={styles.summaryItem}>
          <Text variant="caption" color="textSecondary">
            Cost / serving
          </Text>
          <Text style={styles.summaryValue}>
            {symbol}
            {formatPrice(costPerServing)}
          </Text>
        </View>
        <View style={[styles.summaryItem, styles.summaryItemCenter]}>
          <Text variant="caption" color="textSecondary">
            Food cost
          </Text>
          <Text style={styles.summaryValue}>
            {hasPrice ? `${recipeCost.toFixed(2)}%` : "—"}
          </Text>
        </View>
        <View style={[styles.summaryItem, styles.summaryItemRight]}>
          <Text variant="caption" color="textSecondary">
            Profit / serving
          </Text>
          <Text style={styles.summaryValue}>
            {hasPrice
              ? `${profitPerServing < 0 ? "-" : ""}${symbol}${formatPrice(Math.abs(profitPerServing))}`
              : "—"}
          </Text>
        </View>
      </View>

      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            status === "good" && styles.fillGood,
            status === "warn" && styles.fillWarn,
            status === "over" && styles.fillOver,
            { width: `${Math.min(recipeCost, 100)}%` },
          ]}
        />
        <View
          style={[
            styles.targetMarker,
            { left: `${Math.min(targetFoodCost, 100)}%` },
          ]}
        />
      </View>
      <View style={styles.trackLabels}>
        <Text variant="caption" color="textSecondary">
          0%
        </Text>
        <Text variant="caption" color="textSecondary">
          Target {formatAmount(targetFoodCost, 1)}%
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  summary: (bottom: number) => ({
    gap: theme.gap(1),
    backgroundColor: theme.colors.background,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingHorizontal: theme.gap(3),
    paddingTop: theme.gap(2),
    paddingBottom: bottom,
  }),
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  summaryItem: {
    flex: 1,
    gap: theme.gap(0.5),
  },
  summaryItemCenter: {
    alignItems: "center",
  },
  summaryItemRight: {
    alignItems: "flex-end",
  },
  summaryValue: {
    fontSize: theme.fontSize.lg,
    fontFamily: theme.fontFamily.semiBold,
    color: theme.colors.text,
  },
  track: {
    height: 6,
    borderRadius: 9999,
    backgroundColor: theme.colors.surface,
    justifyContent: "center",
  },
  fill: {
    height: 6,
    borderRadius: 9999,
  },
  fillGood: {
    backgroundColor: "#2F8F55",
  },
  fillWarn: {
    backgroundColor: theme.colors.secondary,
  },
  fillOver: {
    backgroundColor: theme.colors.error,
  },
  targetMarker: {
    position: "absolute",
    width: 2,
    height: 14,
    marginLeft: -1,
    borderRadius: 1,
    backgroundColor: theme.colors.text,
  },
  trackLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
}));
