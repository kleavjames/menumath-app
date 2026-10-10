import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  type BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import { SymbolView } from "expo-symbols";
import { useCallback, useMemo, type Ref } from "react";
import { Pressable, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet, withUnistyles } from "react-native-unistyles";

import { Card, Text } from "@/components/atoms";
import { formatAmount, formatPrice, toNumber } from "@/helpers/money";
import { unitLabel } from "@/helpers/unit";
import { Recipe } from "@/types/recipe";
import { DetailRow } from "../molecules/DetailRow";

const UniSymbol = withUnistyles(SymbolView, (theme) => ({
  tintColor: theme.colors.text,
}));

const UniDangerSymbol = withUnistyles(SymbolView, (theme) => ({
  tintColor: theme.colors.error,
}));

type CostStatus = "good" | "warn" | "over";

const getCostStatus = (percent: number, target: number): CostStatus => {
  if (percent <= target) return "good";
  if (percent <= target + 5) return "warn";
  return "over";
};

type RecipeViewProps = {
  ref?: Ref<BottomSheetModal>;
  recipe: Recipe | null;
  categoryName?: string;
  symbol: string;
  targetFoodCost: number;
  onEdit: (recipe: Recipe) => void;
  onDelete: (recipe: Recipe) => void;
  onDismiss?: () => void;
};

export const RecipeView = ({
  ref,
  recipe,
  categoryName,
  symbol,
  targetFoodCost,
  onEdit,
  onDelete,
  onDismiss,
}: RecipeViewProps) => {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();

  const snapPoints = useMemo(() => ["90%"], []);
  const maxDynamicContentSize = useMemo(
    () => windowHeight * 0.9,
    [windowHeight],
  );

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior="close"
      />
    ),
    [],
  );

  const status = recipe
    ? getCostStatus(recipe.recipeCost, targetFoodCost)
    : "good";
  const steps = [...(recipe?.steps ?? [])].sort((a, b) => a.order - b.order);
  const ingredients = recipe?.ingredients ?? [];

  return (
    <BottomSheetModal
      ref={ref}
      index={0}
      enableDynamicSizing
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      snapPoints={snapPoints}
      maxDynamicContentSize={maxDynamicContentSize}
      onDismiss={onDismiss}
    >
      <BottomSheetScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 16 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {recipe ? (
          <>
            <View style={styles.header}>
              <View style={styles.headerCopy}>
                <Text variant="title" numberOfLines={2}>
                  {recipe.name}
                </Text>
              </View>

              <View style={styles.actions}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Edit ${recipe.name}`}
                  style={({ pressed }) => [
                    styles.actionButton,
                    pressed && styles.actionButtonPressed,
                  ]}
                  onPress={() => onEdit(recipe)}
                >
                  <UniSymbol
                    name={{ ios: "pencil", android: "edit", web: "edit" }}
                    size={16}
                  />
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Delete ${recipe.name}`}
                  style={({ pressed }) => [
                    styles.actionButton,
                    pressed && styles.actionButtonPressed,
                  ]}
                  onPress={() => onDelete(recipe)}
                >
                  <UniDangerSymbol
                    name={{ ios: "trash", android: "delete", web: "delete" }}
                    size={16}
                  />
                </Pressable>
              </View>
            </View>

            <View
              style={[
                styles.badge,
                status === "good" && styles.badgeGood,
                status === "warn" && styles.badgeWarn,
                status === "over" && styles.badgeOver,
              ]}
            >
              <Text
                style={[
                  styles.badgeLabel,
                  status === "good" && styles.badgeLabelGood,
                  status === "warn" && styles.badgeLabelWarn,
                  status === "over" && styles.badgeLabelOver,
                ]}
              >
                {status === "good"
                  ? "On target"
                  : status === "warn"
                    ? "Near target"
                    : "Over target"}
              </Text>
            </View>

            <Card style={styles.detailsCard}>
              <DetailRow
                label="Food cost"
                value={`${recipe.recipeCost.toFixed(1)}%`}
              />
              <DetailRow
                label="Cost / serving"
                value={`${symbol}${formatPrice(recipe.costPerServing)}`}
                withDivider
              />
              <DetailRow
                label="Price / serving"
                value={`${symbol}${formatPrice(recipe.pricePerServing)}`}
                withDivider
              />
              <DetailRow
                label="Profit / serving"
                value={`${recipe.profit < 0 ? "-" : ""}${symbol}${formatPrice(Math.abs(recipe.profit))}`}
                withDivider
              />
              <DetailRow
                label="Margin"
                value={`${recipe.margin.toFixed(1)}%`}
                withDivider
              />
            </Card>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Ingredients
                {ingredients.length > 0 ? (
                  <Text style={styles.sectionCount}> {ingredients.length}</Text>
                ) : null}
              </Text>
              {ingredients.length === 0 ? (
                <Text color="textSecondary">No ingredients yet.</Text>
              ) : (
                <Card style={styles.detailsCard}>
                  {ingredients.map((line, index) => (
                    <View key={line.id}>
                      {index > 0 ? <View style={styles.divider} /> : null}
                      <View style={styles.line}>
                        <View style={styles.lineInfo}>
                          <Text style={styles.lineName} numberOfLines={1}>
                            {line.ingredient?.name ?? "Ingredient"}
                          </Text>
                          <Text variant="caption" color="textSecondary">
                            {formatAmount(toNumber(line.quantity))}{" "}
                            {unitLabel(line.unit)}
                          </Text>
                        </View>
                        <Text style={styles.lineCost}>
                          {symbol}
                          {formatPrice(toNumber(line.pricePerUnit))}
                        </Text>
                      </View>
                    </View>
                  ))}
                </Card>
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Method
                {steps.length > 0 ? (
                  <Text style={styles.sectionCount}> {steps.length}</Text>
                ) : null}
              </Text>
              {steps.length === 0 ? (
                <Text color="textSecondary">No steps yet.</Text>
              ) : (
                <Card style={styles.detailsCard}>
                  {steps.map((step, index) => (
                    <View key={`${step.order}-${index}`}>
                      {index > 0 ? <View style={styles.divider} /> : null}
                      <View style={styles.stepRow}>
                        <View style={styles.stepNumber}>
                          <Text style={styles.stepNumberText}>
                            {step.order}
                          </Text>
                        </View>
                        <Text style={styles.stepText}>{step.text}</Text>
                      </View>
                    </View>
                  ))}
                </Card>
              )}
            </View>
          </>
        ) : null}
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
};

const styles = StyleSheet.create((theme) => ({
  content: {
    gap: theme.gap(2),
    paddingHorizontal: theme.gap(3),
    paddingTop: theme.gap(1),
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: theme.gap(2),
  },
  headerCopy: {
    flex: 1,
    gap: theme.gap(0.5),
  },
  actions: {
    flexDirection: "row",
    gap: theme.gap(1),
  },
  actionButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  actionButtonPressed: {
    opacity: 0.7,
  },
  badge: {
    alignSelf: "flex-start",
    borderRadius: 9999,
    paddingVertical: theme.gap(0.5),
    paddingHorizontal: theme.gap(1.25),
    marginTop: -theme.gap(1),
  },
  badgeGood: {
    backgroundColor: "#D9EFE0",
  },
  badgeWarn: {
    backgroundColor: "#F7E4B8",
  },
  badgeOver: {
    backgroundColor: "#F6D5C8",
  },
  badgeLabel: {
    fontSize: theme.fontSize.xs,
    fontFamily: theme.fontFamily.medium,
  },
  badgeLabelGood: {
    color: "#1F6B3A",
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
  },
  badgeLabelWarn: {
    color: "#8A5A12",
  },
  badgeLabelOver: {
    color: "#9A3F2A",
  },
  detailsCard: {
    padding: 0,
    gap: 0,
    overflow: "hidden",
  },
  section: {
    gap: theme.gap(1.5),
  },
  sectionTitle: {
    fontSize: theme.fontSize.md,
    fontFamily: theme.fontFamily.semiBold,
    color: theme.colors.text,
  },
  sectionCount: {
    fontSize: theme.fontSize.md,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.textSecondary,
  },
  line: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.gap(2),
    paddingVertical: theme.gap(2),
    paddingHorizontal: theme.gap(2.5),
  },
  lineInfo: {
    flex: 1,
    gap: theme.gap(0.5),
  },
  lineName: {
    fontSize: theme.fontSize.md,
    fontFamily: theme.fontFamily.semiBold,
    color: theme.colors.text,
  },
  lineCost: {
    fontSize: theme.fontSize.sm,
    fontFamily: theme.fontFamily.medium,
    color: theme.colors.text,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: theme.gap(1.5),
    paddingVertical: theme.gap(2),
    paddingHorizontal: theme.gap(2.5),
  },
  stepNumber: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9999,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  stepNumberText: {
    fontSize: theme.fontSize.xs,
    fontFamily: theme.fontFamily.semiBold,
    color: theme.colors.text,
  },
  stepText: {
    flex: 1,
    fontSize: theme.fontSize.md,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.text,
  },
}));
