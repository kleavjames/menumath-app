import type { IngredientCategory } from "@/app/(app)/(ingredients)";
import { router, useFocusEffect } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useCallback, useMemo, useState } from "react";
import { Keyboard, Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet, withUnistyles } from "react-native-unistyles";

import { Card, showToast, Text } from "@/components/atoms";
import { SearchInput } from "@/components/molecules";
import { Categories } from "@/components/organisms";
import { CURRENCY_SYMBOLS } from "@/constants/units";
import { formatPrice, toNumber } from "@/helpers/money";
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "@/service/api/categories";
import { getRecipes } from "@/service/api/recipes";
import { useAccountUserStore } from "@/store/accountUser";
import { Category, CategoryType, Currency } from "@/types/business";
import { ApiError } from "@/types/common";
import { Recipe } from "@/types/recipe";

const DEFAULT_TARGET_FOOD_COST = 30;

const UniSymbol = withUnistyles(SymbolView, (theme) => ({
  tintColor: theme.colors.background,
}));

const ALL_CATEGORY: IngredientCategory = { id: "all", name: "All" };

type CostStatus = "good" | "warn" | "over";

const getCostStatus = (percent: number, target: number): CostStatus => {
  if (percent <= target) return "good";
  if (percent <= target + 5) return "warn";
  return "over";
};

const buildRecipeMeta = (recipe: Recipe, symbol: string) => {
  const parts: string[] = [];
  if (recipe.servings > 1) {
    parts.push(`Yields ${recipe.servings}`);
  }
  parts.push(`${symbol}${formatPrice(recipe.pricePerServing)} each`);
  return parts.join(" · ");
};

export default function RecipesScreen() {
  const insets = useSafeAreaInsets();

  const businessId = useAccountUserStore((state) => state.businessId);
  const currency = useAccountUserStore(
    (state) => state.business?.currency ?? Currency.USD,
  );
  const targetFoodCost = useAccountUserStore((state) => {
    const target = toNumber(state.business?.targetFoodCost ?? "");
    return target > 0 ? target : DEFAULT_TARGET_FOOD_COST;
  });
  const symbol = CURRENCY_SYMBOLS[currency];

  const [query, setQuery] = useState("");
  const [categories, setCategories] = useState<IngredientCategory[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [category, setCategory] = useState(ALL_CATEGORY.name);

  const initCategories = useCallback(async (bId: string) => {
    try {
      const result = await getCategories(bId, CategoryType.RECIPE);
      setCategories(
        result.map((item: Category) => ({ id: item.id, name: item.name })),
      );
    } catch (error) {
      if (error instanceof ApiError) {
        console.error(error.message);
      } else {
        console.error(error);
      }
    }
  }, []);

  const initRecipes = useCallback(async (bId: string) => {
    try {
      const result = await getRecipes(bId);
      setRecipes(result);
    } catch (error) {
      if (error instanceof ApiError) {
        console.error(error.message);
      } else {
        console.error(error);
      }
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (!businessId) return;
      void initCategories(businessId);
      void initRecipes(businessId);
    }, [businessId, initCategories, initRecipes]),
  );

  const selectedCategory = useMemo(
    () =>
      category === ALL_CATEGORY.name
        ? ALL_CATEGORY
        : (categories.find((item) => item.name === category) ?? ALL_CATEGORY),
    [categories, category],
  );

  const categoryNameById = useMemo(
    () => new Map(categories.map((item) => [item.id, item.name])),
    [categories],
  );

  const filteredRecipes = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return recipes.filter((recipe) => {
      const categoryName = categoryNameById.get(recipe.categoryId) ?? "";
      const matchesCategory =
        selectedCategory.id === ALL_CATEGORY.id ||
        recipe.categoryId === selectedCategory.id;
      const matchesQuery =
        !normalizedQuery ||
        recipe.name.toLowerCase().includes(normalizedQuery) ||
        categoryName.toLowerCase().includes(normalizedQuery);

      return matchesCategory && matchesQuery;
    });
  }, [categoryNameById, recipes, query, selectedCategory]);

  const { avgFoodCost, overTargetCount } = useMemo(() => {
    if (recipes.length === 0) {
      return { avgFoodCost: 0, overTargetCount: 0 };
    }

    const totalFoodCost = recipes.reduce(
      (sum, recipe) => sum + recipe.recipeCost,
      0,
    );
    return {
      avgFoodCost: totalFoodCost / recipes.length,
      overTargetCount: recipes.filter(
        (recipe) => recipe.recipeCost > targetFoodCost,
      ).length,
    };
  }, [recipes, targetFoodCost]);

  const handleCreateCategory = async (name: string) => {
    try {
      const created = await createCategory({
        name,
        type: CategoryType.RECIPE,
        businessId: businessId!,
      });
      setCategories((prev) => [
        ...prev,
        { id: created.id, name: created.name },
      ]);
      showToast("Category created successfully", { variant: "default" });
    } catch (error) {
      if (error instanceof ApiError) {
        showToast(error.message, { variant: "error" });
      } else {
        showToast("An unknown error occurred", { variant: "error" });
      }
    }
  };

  const handleRenameCategory = async (from: string, to: string, id: string) => {
    try {
      await updateCategory(id, { name: to });
      setCategories((prev) =>
        prev.map((item) => (item.name === from ? { ...item, name: to } : item)),
      );
      if (category === from) {
        setCategory(to);
      }
      showToast("Category renamed successfully", { variant: "default" });
    } catch (error) {
      if (error instanceof ApiError) {
        showToast(error.message, { variant: "error" });
      } else {
        showToast("An unknown error occurred", { variant: "error" });
      }
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await deleteCategory(id);
      showToast("Category deleted successfully", { variant: "default" });
    } catch (error) {
      if (error instanceof ApiError) {
        showToast(error.message, { variant: "error" });
      } else {
        showToast("An unknown error occurred", { variant: "error" });
      }
    }
    setCategories((prev) => prev.filter((item) => item.id !== id));
    if (selectedCategory.id === id) {
      setCategory(ALL_CATEGORY.name);
    }
  };

  return (
    <View
      style={[
        styles.screen,
        {
          paddingTop: insets.top + 8,
        },
      ]}
    >
      <ScrollView
        contentContainerStyle={styles.content(insets.bottom + 16)}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        onScrollBeginDrag={Keyboard.dismiss}
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
          <Text color="textSecondary" variant="label">
            {recipes.length} recipes · avg food cost {avgFoodCost.toFixed(1)}% ·{" "}
            {overTargetCount} over target
          </Text>
        </View>

        <View style={styles.search}>
          <SearchInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search recipes"
          />
        </View>

        <Categories
          categories={categories}
          selected={selectedCategory}
          onSelect={setCategory}
          onCreate={handleCreateCategory}
          onRename={handleRenameCategory}
          onDelete={handleDeleteCategory}
        />

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
                {recipes.length === 0
                  ? "No recipes yet."
                  : "No recipes match your search."}
              </Text>
            ) : (
              filteredRecipes.map((recipe, index) => {
                const status = getCostStatus(recipe.recipeCost, targetFoodCost);

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
                        <Text variant="label" color="textSecondary">
                          {buildRecipeMeta(recipe, symbol)}
                        </Text>
                      </View>
                      <View style={styles.rowRight}>
                        <Text style={styles.cost}>
                          {symbol}
                          {formatPrice(recipe.costPerServing)}
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
                            {recipe.recipeCost.toFixed(2)}%
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
  },
  content: (paddingBottom: number) => ({
    gap: theme.gap(2.5),
    paddingBottom,
  }),
  header: {
    gap: theme.gap(1),
    paddingHorizontal: theme.gap(3),
  },
  search: {
    paddingHorizontal: theme.gap(3),
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
  listSection: {
    gap: theme.gap(1.5),
    paddingHorizontal: theme.gap(3),
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
    fontSize: theme.fontSize.sm,
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
