import { router } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet, withUnistyles } from "react-native-unistyles";

import { Card, Pill, Text } from "@/components/atoms";
import { SearchInput } from "@/components/molecules";

const UniSymbol = withUnistyles(SymbolView, (theme) => ({
  tintColor: theme.colors.background,
}));

const CATEGORIES = ["All", "Mains", "Sides", "Bakery", "Desserts"] as const;

type Category = (typeof CATEGORIES)[number] | "Drinks";

type CostStatus = "good" | "warn" | "over";

type Recipe = {
  id: string;
  name: string;
  category: Exclude<Category, "All">;
  yieldCount?: number;
  priceEach: number;
  costPerServing: number;
  foodCostPercent: number;
};

const TARGET_FOOD_COST = 30;

const RECIPES: Recipe[] = [
  {
    id: "1",
    name: "Margherita pizza",
    category: "Mains",
    priceEach: 9,
    costPerServing: 2.68,
    foodCostPercent: 29.8,
  },
  {
    id: "2",
    name: "Caprese salad",
    category: "Sides",
    priceEach: 9.5,
    costPerServing: 3.9,
    foodCostPercent: 41.1,
  },
  {
    id: "3",
    name: "Butter croissant",
    category: "Bakery",
    yieldCount: 12,
    priceEach: 4.5,
    costPerServing: 0.79,
    foodCostPercent: 17.5,
  },
  {
    id: "4",
    name: "Vanilla custard tart",
    category: "Desserts",
    yieldCount: 6,
    priceEach: 4,
    costPerServing: 1.23,
    foodCostPercent: 30.7,
  },
  {
    id: "5",
    name: "Flat white",
    category: "Drinks",
    priceEach: 4.8,
    costPerServing: 0.74,
    foodCostPercent: 15.4,
  },
];

const formatMoney = (value: number) =>
  `$${value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const getCostStatus = (percent: number): CostStatus => {
  if (percent <= TARGET_FOOD_COST) return "good";
  if (percent <= TARGET_FOOD_COST + 5) return "warn";
  return "over";
};

const buildRecipeMeta = (recipe: Recipe) => {
  const parts: string[] = [recipe.category];
  if (recipe.yieldCount) {
    parts.push(`Yields ${recipe.yieldCount}`);
  }
  parts.push(`${formatMoney(recipe.priceEach)} each`);
  return parts.join(" · ");
};

export default function RecipesScreen() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("All");

  const filteredRecipes = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return RECIPES.filter((recipe) => {
      const matchesCategory =
        category === "All" || recipe.category === category;
      const matchesQuery =
        !normalizedQuery ||
        recipe.name.toLowerCase().includes(normalizedQuery) ||
        recipe.category.toLowerCase().includes(normalizedQuery);

      return matchesCategory && matchesQuery;
    });
  }, [category, query]);

  const avgFoodCost =
    RECIPES.reduce((sum, recipe) => sum + recipe.foodCostPercent, 0) /
    RECIPES.length;
  const overTargetCount = RECIPES.filter(
    (recipe) => recipe.foodCostPercent > TARGET_FOOD_COST,
  ).length;

  return (
    <View
      style={[
        styles.screen,
        {
          paddingTop: insets.top + 8,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text variant="hero" style={styles.headline}>
              Recipes
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="New recipe"
              style={({ pressed }) => [
                styles.newButton,
                pressed && styles.newButtonPressed,
              ]}
              onPress={() => router.push("/create-recipe")}
            >
              <UniSymbol
                name={{ ios: "plus", android: "add", web: "add" }}
                size={14}
              />
              <Text style={styles.newButtonLabel}>New</Text>
            </Pressable>
          </View>
          <Text color="textSecondary">
            {RECIPES.length} recipes · avg food cost {avgFoodCost.toFixed(1)}% ·{" "}
            {overTargetCount} over target
          </Text>
        </View>

        <SearchInput value={query} onChangeText={setQuery} />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filters}
        >
          {CATEGORIES.map((item) => (
            <Pill
              key={item}
              selected={category === item}
              onPress={() => setCategory(item)}
            >
              {item}
            </Pill>
          ))}
        </ScrollView>

        <View style={styles.listSection}>
          <View style={styles.columnHeaders}>
            <Text
              variant="caption"
              color="textSecondary"
              style={styles.columnLabel}
            >
              Recipe
            </Text>
            <Text
              variant="caption"
              color="textSecondary"
              style={styles.columnLabel}
            >
              Cost / serving
            </Text>
          </View>

          <Card style={styles.listCard}>
            {filteredRecipes.length === 0 ? (
              <Text color="textSecondary" style={styles.empty}>
                No recipes match your search.
              </Text>
            ) : (
              filteredRecipes.map((recipe, index) => {
                const status = getCostStatus(recipe.foodCostPercent);

                return (
                  <View key={recipe.id}>
                    {index > 0 ? <View style={styles.divider} /> : null}
                    <Pressable
                      accessibilityRole="button"
                      style={({ pressed }) => [
                        styles.row,
                        pressed && styles.rowPressed,
                      ]}
                      onPress={() => {
                        // TODO: open recipe
                      }}
                    >
                      <View style={styles.rowLeft}>
                        <Text style={styles.recipeName}>{recipe.name}</Text>
                        <Text variant="caption" color="textSecondary">
                          {buildRecipeMeta(recipe)}
                        </Text>
                      </View>
                      <View style={styles.rowRight}>
                        <Text style={styles.cost}>
                          {formatMoney(recipe.costPerServing)}
                        </Text>
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
                            {recipe.foodCostPercent.toFixed(1)}%
                          </Text>
                        </View>
                      </View>
                    </Pressable>
                  </View>
                );
              })
            )}
          </Card>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.gap(3),
  },
  content: {
    gap: theme.gap(2.5),
    paddingBottom: theme.gap(4),
  },
  header: {
    gap: theme.gap(1),
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.gap(2),
  },
  headline: {
    fontSize: 28,
    lineHeight: 34,
  },
  newButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.gap(0.75),
    backgroundColor: theme.colors.text,
    borderRadius: 9999,
    paddingVertical: theme.gap(1),
    paddingHorizontal: theme.gap(1.75),
  },
  newButtonPressed: {
    opacity: 0.85,
  },
  newButtonLabel: {
    color: theme.colors.background,
    fontSize: theme.fontSize.sm,
    fontFamily: theme.fontFamily.semiBold,
  },
  filters: {
    flexDirection: "row",
    gap: theme.gap(1),
    paddingRight: theme.gap(1),
  },
  listSection: {
    gap: theme.gap(1.5),
  },
  columnHeaders: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: theme.gap(0.5),
  },
  columnLabel: {
    fontFamily: theme.fontFamily.medium,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  listCard: {
    padding: 0,
    gap: 0,
    overflow: "hidden",
  },
  empty: {
    padding: theme.gap(2.5),
    textAlign: "center",
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.gap(2),
    paddingVertical: theme.gap(2),
    paddingHorizontal: theme.gap(2.5),
  },
  rowPressed: {
    opacity: 0.7,
  },
  rowLeft: {
    flex: 1,
    gap: theme.gap(0.5),
  },
  recipeName: {
    fontSize: theme.fontSize.md,
    fontFamily: theme.fontFamily.semiBold,
    color: theme.colors.text,
  },
  rowRight: {
    alignItems: "flex-end",
    gap: theme.gap(0.75),
  },
  cost: {
    fontSize: theme.fontSize.md,
    fontFamily: theme.fontFamily.medium,
    color: theme.colors.text,
  },
  badge: {
    borderRadius: 9999,
    paddingVertical: theme.gap(0.375),
    paddingHorizontal: theme.gap(1),
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
  badgeLabelWarn: {
    color: "#8A5A12",
  },
  badgeLabelOver: {
    color: "#9A3F2A",
  },
}));
