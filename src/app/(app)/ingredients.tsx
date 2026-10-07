import { SymbolView } from "expo-symbols";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Keyboard, Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet, withUnistyles } from "react-native-unistyles";

import { Card, Text } from "@/components/atoms";
import { SearchInput } from "@/components/molecules";
import { Categories } from "@/components/organisms";
import { getCategories } from "../../../service/api/categories";
import { useAccountUserStore } from "../../../store/accountUser";
import { CategoryType } from "../../../types/business";
import { ApiError } from "../../../types/common";

const UniSymbol = withUnistyles(SymbolView, (theme) => ({
  tintColor: theme.colors.background,
}));

type Ingredient = {
  id: string;
  name: string;
  category: string;
  packSize: number;
  unit: string;
  supplier: string;
  unitCost: number;
  packPrice: number;
};

const INGREDIENTS: Ingredient[] = [
  {
    id: "1",
    name: "00 pizza flour",
    category: "Dry goods",
    packSize: 25,
    unit: "kg",
    supplier: "Caputo Direct",
    unitCost: 1.54,
    packPrice: 38.5,
  },
  {
    id: "2",
    name: "Unsalted butter",
    category: "Dairy",
    packSize: 1,
    unit: "kg",
    supplier: "Valley Creamery",
    unitCost: 11.8,
    packPrice: 11.8,
  },
  {
    id: "3",
    name: "Whole milk",
    category: "Dairy",
    packSize: 4,
    unit: "L",
    supplier: "Valley Creamery",
    unitCost: 1.3,
    packPrice: 5.2,
  },
  {
    id: "4",
    name: "Free-range eggs",
    category: "Dairy",
    packSize: 30,
    unit: "each",
    supplier: "Hilltop Farm",
    unitCost: 0.33,
    packPrice: 9.9,
  },
  {
    id: "5",
    name: "Caster sugar",
    category: "Dry goods",
    packSize: 5,
    unit: "kg",
    supplier: "Metro Wholesale",
    unitCost: 1.48,
    packPrice: 7.4,
  },
  {
    id: "6",
    name: "San Marzano tomatoes",
    category: "Produce",
    packSize: 2.5,
    unit: "kg",
    supplier: "Caputo Direct",
    unitCost: 3.56,
    packPrice: 8.9,
  },
  {
    id: "7",
    name: "Fior di latte",
    category: "Dairy",
    packSize: 1,
    unit: "kg",
    supplier: "Latteria Rossi",
    unitCost: 14.6,
    packPrice: 14.6,
  },
  {
    id: "8",
    name: "Extra virgin olive oil",
    category: "Oils",
    packSize: 5,
    unit: "L",
    supplier: "Metro Wholesale",
    unitCost: 8.4,
    packPrice: 42,
  },
  {
    id: "9",
    name: "Canola oil",
    category: "Oils",
    packSize: 10,
    unit: "L",
    supplier: "Metro Wholesale",
    unitCost: 2.15,
    packPrice: 21.5,
  },
  {
    id: "10",
    name: "Fresh basil",
    category: "Produce",
    packSize: 0.1,
    unit: "kg",
    supplier: "Hilltop Farm",
    unitCost: 28,
    packPrice: 2.8,
  },
  {
    id: "11",
    name: "Yellow onion",
    category: "Produce",
    packSize: 5,
    unit: "kg",
    supplier: "Hilltop Farm",
    unitCost: 1.2,
    packPrice: 6,
  },
  {
    id: "12",
    name: "Instant dry yeast",
    category: "Dry goods",
    packSize: 0.5,
    unit: "kg",
    supplier: "Metro Wholesale",
    unitCost: 9.6,
    packPrice: 4.8,
  },
  {
    id: "13",
    name: "Sea salt",
    category: "Dry goods",
    packSize: 1,
    unit: "kg",
    supplier: "Metro Wholesale",
    unitCost: 1.1,
    packPrice: 1.1,
  },
];

const formatMoney = (value: number) => `$${value.toFixed(2)}`;

const formatPackSize = (ingredient: Ingredient) => {
  const size =
    ingredient.packSize % 1 === 0
      ? ingredient.packSize.toString()
      : ingredient.packSize.toFixed(1);
  return `${size} ${ingredient.unit}`;
};

const formatUnitCost = (ingredient: Ingredient) =>
  `${formatMoney(ingredient.unitCost)}/${ingredient.unit}`;

export default function IngredientsScreen() {
  const insets = useSafeAreaInsets();

  const businessId = useAccountUserStore((state) => state.businessId);

  const [query, setQuery] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [category, setCategory] = useState("All");

  const initCategories = useCallback(async (bId: string) => {
    try {
      const categories = await getCategories(bId, CategoryType.INGREDIENT);
      const ingredientCategories = categories.map((category) => category.name);
      setCategories(ingredientCategories);
    } catch (error) {
      if (error instanceof ApiError) {
        console.error(error.message);
      } else {
        console.error(error);
      }
    }
  }, []);

  useEffect(() => {
    if (businessId) {
      initCategories(businessId);
    }
  }, [initCategories]);

  const filteredIngredients = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return INGREDIENTS.filter((ingredient) => {
      const matchesCategory =
        category === "All" || ingredient.category === category;
      const matchesQuery =
        !normalizedQuery ||
        ingredient.name.toLowerCase().includes(normalizedQuery) ||
        ingredient.supplier.toLowerCase().includes(normalizedQuery) ||
        ingredient.category.toLowerCase().includes(normalizedQuery);

      return matchesCategory && matchesQuery;
    });
  }, [category, query]);

  const handleCreateCategory = (name: string) => {
    setCategories((prev) => [...prev, name]);
  };

  const handleRenameCategory = (from: string, to: string) => {
    setCategories((prev) => prev.map((item) => (item === from ? to : item)));
    if (category === from) {
      setCategory(to);
    }
  };

  const handleDeleteCategory = (name: string) => {
    setCategories((prev) => prev.filter((item) => item !== name));
    if (category === name) {
      setCategory("All");
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
              onPress={() => {
                // TODO: create ingredient
              }}
            >
              <UniSymbol
                name={{ ios: "plus", android: "add", web: "add" }}
                size={14}
              />
              <Text style={styles.newButtonLabel}>New</Text>
            </Pressable>
          </View>
          <Text color="textSecondary">
            {INGREDIENTS.length} items · prices in USD
          </Text>
        </View>

        <SearchInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search ingredients or suppliers"
        />

        <Categories
          categories={categories}
          selected={category}
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
                No ingredients match your search.
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
                        {formatPackSize(ingredient)} · {ingredient.supplier}
                      </Text>
                    </View>
                    <View style={styles.rowRight}>
                      <Text style={styles.unitCost}>
                        {formatUnitCost(ingredient)}
                      </Text>
                      <Text variant="caption" color="textSecondary">
                        {formatMoney(ingredient.packPrice)} / pack
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
