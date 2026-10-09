import { router, useFocusEffect } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useCallback, useMemo, useState } from "react";
import { Keyboard, Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet, withUnistyles } from "react-native-unistyles";

import { Card, showToast, Text } from "@/components/atoms";
import { SearchInput } from "@/components/molecules";
import { Categories } from "@/components/organisms";
import { CURRENCY_SYMBOLS, UNIT_OPTIONS } from "@/constants/units";
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "../../../../service/api/categories";
import { getIngredients } from "../../../../service/api/ingredients";
import {
  formatAmount,
  formatPrice,
  toNumber,
} from "../../../../service/helpers/money";
import { useAccountUserStore } from "../../../../store/accountUser";
import {
  Category,
  CategoryType,
  Currency,
  MetricUnit,
} from "../../../../types/business";
import { ApiError } from "../../../../types/common";
import { Ingredient } from "../../../../types/ingredient";

const UniSymbol = withUnistyles(SymbolView, (theme) => ({
  tintColor: theme.colors.background,
}));

export type IngredientCategory = Omit<
  Category,
  "type" | "businessId" | "createdAt" | "updatedAt"
>;

const ALL_CATEGORY: IngredientCategory = { id: "all", name: "All" };

const unitLabel = (unit: MetricUnit | string) =>
  UNIT_OPTIONS.find((option) => option.value === unit)?.label ?? unit;

const costUnitLabel = (unit: MetricUnit) => {
  const option = UNIT_OPTIONS.find((item) => item.value === unit);
  if (option?.subUnit) return unitLabel(option.subUnit.label);
  return option?.label ?? unit;
};

const formatPackSize = (ingredient: Ingredient) =>
  `${formatAmount(toNumber(ingredient.itemSize))} ${unitLabel(ingredient.itemSizeUnit)}`;

const formatUnitCost = (ingredient: Ingredient, symbol: string) =>
  `${symbol}${formatAmount(toNumber(ingredient.usableCostPerItem))}/${costUnitLabel(ingredient.itemSizeUnit)}`;

const formatPackPrice = (ingredient: Ingredient, symbol: string) =>
  `${symbol}${formatPrice(toNumber(ingredient.itemPrice))} / pack`;

export default function IngredientsScreen() {
  const insets = useSafeAreaInsets();

  const businessId = useAccountUserStore((state) => state.businessId);
  const currency = useAccountUserStore(
    (state) => state.business?.currency ?? Currency.USD,
  );
  const symbol = CURRENCY_SYMBOLS[currency];

  const [query, setQuery] = useState("");
  const [categories, setCategories] = useState<IngredientCategory[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [category, setCategory] = useState("All");

  const initCategories = useCallback(async (bId: string) => {
    try {
      const categories = await getCategories(bId, CategoryType.INGREDIENT);
      const ingredientCategories = categories.map((category) => ({
        id: category.id,
        name: category.name,
      }));
      setCategories(ingredientCategories);
    } catch (error) {
      if (error instanceof ApiError) {
        console.error(error.message);
      } else {
        console.error(error);
      }
    }
  }, []);

  const initIngredients = useCallback(async (bId: string) => {
    try {
      const result = await getIngredients(bId, CategoryType.INGREDIENT);
      setIngredients(result);
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
      initCategories(businessId);
      initIngredients(businessId);
    }, [businessId, initCategories, initIngredients]),
  );

  const selectedCategory = useMemo(
    () =>
      category === ALL_CATEGORY.name
        ? ALL_CATEGORY
        : (categories.find((c) => c.name === category) ?? ALL_CATEGORY),
    [categories, category],
  );

  const categoryNameById = useMemo(
    () => new Map(categories.map((item) => [item.id, item.name])),
    [categories],
  );

  const filteredIngredients = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return ingredients.filter((ingredient) => {
      const categoryName = categoryNameById.get(ingredient.categoryId) ?? "";
      const matchesCategory =
        selectedCategory.id === ALL_CATEGORY.id ||
        ingredient.categoryId === selectedCategory.id;
      const matchesQuery =
        !normalizedQuery ||
        ingredient.name.toLowerCase().includes(normalizedQuery) ||
        ingredient.supplier.toLowerCase().includes(normalizedQuery) ||
        categoryName.toLowerCase().includes(normalizedQuery);

      return matchesCategory && matchesQuery;
    });
  }, [categoryNameById, ingredients, query, selectedCategory]);

  const handleCreateCategory = async (name: string) => {
    try {
      const category = await createCategory({
        name,
        type: CategoryType.INGREDIENT,
        businessId: businessId!,
      });
      setCategories((prev) => [
        ...prev,
        { id: category.id, name: category.name },
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
          paddingBottom: insets.bottom,
        },
      ]}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        onScrollBeginDrag={Keyboard.dismiss}
      >
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text variant="hero" style={styles.headline}>
              Ingredients
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="New ingredient"
              style={({ pressed }) => [
                styles.newButton,
                pressed && styles.newButtonPressed,
              ]}
              onPress={() => router.push("/create-ingredient")}
            >
              <UniSymbol
                name={{ ios: "plus", android: "add", web: "add" }}
                size={14}
              />
              <Text style={styles.newButtonLabel}>New</Text>
            </Pressable>
          </View>
          <Text color="textSecondary">
            {ingredients.length} items · prices in {currency}
          </Text>
        </View>

        <SearchInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search ingredients or suppliers"
        />

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
              Ingredient
            </Text>
            <Text
              variant="caption"
              color="textSecondary"
              style={styles.columnLabel}
            >
              Unit cost
            </Text>
          </View>

          <Card style={styles.listCard}>
            {filteredIngredients.length === 0 ? (
              <Text color="textSecondary" style={styles.empty}>
                {ingredients.length === 0
                  ? "No ingredients yet."
                  : "No ingredients match your search."}
              </Text>
            ) : (
              filteredIngredients.map((ingredient, index) => (
                <View key={ingredient.id}>
                  {index > 0 ? <View style={styles.divider} /> : null}
                  <Pressable
                    accessibilityRole="button"
                    style={({ pressed }) => [
                      styles.row,
                      pressed && styles.rowPressed,
                    ]}
                    onPress={() => {
                      // TODO: open ingredient
                    }}
                  >
                    <View style={styles.rowLeft}>
                      <Text style={styles.itemName}>{ingredient.name}</Text>
                      <Text variant="caption" color="textSecondary">
                        {formatPackSize(ingredient)}
                        {ingredient.supplier ? ` · ${ingredient.supplier}` : ""}
                      </Text>
                    </View>
                    <View style={styles.rowRight}>
                      <Text style={styles.unitCost}>
                        {formatPackPrice(ingredient, symbol)}
                      </Text>
                      <Text variant="caption" color="textSecondary">
                        {formatUnitCost(ingredient, symbol)}
                      </Text>
                    </View>
                  </Pressable>
                </View>
              ))
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
  itemName: {
    fontSize: theme.fontSize.md,
    fontFamily: theme.fontFamily.semiBold,
    color: theme.colors.text,
  },
  rowRight: {
    alignItems: "flex-end",
    gap: theme.gap(0.5),
  },
  unitCost: {
    fontSize: theme.fontSize.md,
    fontFamily: theme.fontFamily.medium,
    color: theme.colors.text,
  },
}));
