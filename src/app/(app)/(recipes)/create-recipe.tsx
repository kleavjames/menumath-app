import { router, Stack } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useEffect, useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet, withUnistyles } from "react-native-unistyles";

import {
  Card,
  InputWithPrefix,
  Pill,
  StepperInput,
  Text,
} from "@/components/atoms";
import { PrefixInput, SearchInput, TextInput } from "@/components/molecules";

import { CURRENCY_SYMBOLS } from "@/constants/units";
import { formatAmount, formatPrice, toNumber } from "@/helpers/money";
import { costUnitLabel } from "@/helpers/unit";
import { getCategories } from "@/service/api/categories";
import { getIngredients } from "@/service/api/ingredients";
import { useAccountUserStore } from "@/store/accountUser";
import { CategoryType, Currency } from "@/types/business";
import { Ingredient } from "@/types/ingredient";

const DEFAULT_TARGET_FOOD_COST = 30;

type FieldErrors = {
  name?: string;
  price?: string;
  ingredients?: string;
};

type RecipeLine = {
  ingredient: Ingredient;
  quantity: string;
};

type CostStatus = "good" | "warn" | "over";

const getCostStatus = (percent: number, target: number): CostStatus => {
  if (percent <= target) return "good";
  if (percent <= target + 5) return "warn";
  return "over";
};

const UniSymbol = withUnistyles(SymbolView, (theme) => ({
  tintColor: theme.colors.text,
}));

const UniSymbolMuted = withUnistyles(SymbolView, (theme) => ({
  tintColor: theme.colors.textSecondary,
}));

export default function CreateRecipeScreen() {
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

  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState<string | undefined>();
  const [categoryOptions, setCategoryOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [yieldCount, setYieldCount] = useState(1);
  const [price, setPrice] = useState("");
  const [lines, setLines] = useState<RecipeLine[]>([]);
  const [availableIngredients, setAvailableIngredients] = useState<
    Ingredient[]
  >([]);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  useEffect(() => {
    if (!businessId) return;

    getCategories(businessId, CategoryType.RECIPE)
      .then((categories) =>
        setCategoryOptions(
          categories.map(({ id, name: label }) => ({ label, value: id })),
        ),
      )
      .catch((error) => console.error(error));

    getIngredients(businessId, CategoryType.INGREDIENT)
      .then(setAvailableIngredients)
      .catch((error) => console.error(error));
  }, [businessId]);

  const clearError = (field: keyof FieldErrors) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const batchCost = useMemo(
    () =>
      lines.reduce(
        (sum, { ingredient, quantity }) =>
          sum + toNumber(quantity) * toNumber(ingredient.usableCostPerItem),
        0,
      ),
    [lines],
  );

  const servingPrice = toNumber(price);
  const costPerServing = batchCost / Math.max(yieldCount, 1);
  const hasPrice = servingPrice > 0;
  const foodCostPercent = hasPrice ? (costPerServing / servingPrice) * 100 : 0;
  const profitPerServing = servingPrice - costPerServing;
  const status = getCostStatus(foodCostPercent, targetFoodCost);

  const addIngredient = (ingredient: Ingredient) => {
    setLines((prev) => [...prev, { ingredient, quantity: "" }]);
    clearError("ingredients");
    setIsPickerOpen(false);
  };

  const updateQuantity = (ingredientId: string, quantity: string) => {
    setLines((prev) =>
      prev.map((line) =>
        line.ingredient.id === ingredientId ? { ...line, quantity } : line,
      ),
    );
  };

  const removeIngredient = (ingredientId: string) => {
    setLines((prev) =>
      prev.filter((line) => line.ingredient.id !== ingredientId),
    );
  };

  const validate = (): boolean => {
    const next: FieldErrors = {};

    if (!name.trim()) {
      next.name = "Recipe name is required";
    }
    if (!hasPrice) {
      next.price = "Enter a price";
    }
    if (lines.length === 0) {
      next.ingredients = "Add at least one ingredient";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    // TODO: persist the recipe once the recipes API is available.
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerTransparent: true,
          title: "New recipe",
          headerLeft: () => (
            <Pressable onPressIn={router.back} style={styles.headerButton}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
          ),
          headerRight: () => (
            <Pressable onPressIn={handleSave} style={styles.headerButton}>
              <Text style={styles.saveButtonText}>Save</Text>
            </Pressable>
          ),
        }}
      />

      <View
        style={[
          styles.screen,
          { paddingTop: insets.top * 2, paddingBottom: insets.bottom },
        ]}
      >
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            style={styles.flex}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <TextInput
              variant="ghost"
              value={name}
              onChangeText={(value) => {
                setName(value);
                clearError("name");
              }}
              placeholder="Recipe name"
              autoCapitalize="words"
              error={errors.name}
            />

            {categoryOptions.length === 0 ? (
              <Text variant="caption" color="textSecondary">
                No categories yet. Add one from the recipes list.
              </Text>
            ) : (
              <View style={styles.chips}>
                {categoryOptions.map(({ value, label }) => (
                  <Pill
                    key={value}
                    selected={categoryId === value}
                    onPress={() =>
                      setCategoryId((prev) =>
                        prev === value ? undefined : value,
                      )
                    }
                  >
                    {label}
                  </Pill>
                ))}
              </View>
            )}

            <View style={styles.row}>
              <View style={styles.rowItem}>
                <Text variant="label" color="textSecondary">
                  Yield
                </Text>
                <StepperInput
                  value={yieldCount}
                  onChange={setYieldCount}
                  min={1}
                  suffix={yieldCount === 1 ? " serving" : " servings"}
                  style={styles.yieldStepper}
                />
              </View>
              <View style={styles.rowItem}>
                <PrefixInput
                  label="Price per serving"
                  prefix={symbol}
                  value={price}
                  onChangeText={(value) => {
                    setPrice(value);
                    clearError("price");
                  }}
                  placeholder="0.00"
                  error={errors.price}
                />
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Ingredients</Text>
                <Text variant="label" color="textSecondary">
                  Batch{" "}
                  <Text style={styles.batchValue}>
                    {symbol}
                    {formatPrice(batchCost)}
                  </Text>
                </Text>
              </View>

              {lines.length === 0 ? (
                <View
                  style={[
                    styles.emptyCard,
                    errors.ingredients ? styles.emptyCardError : null,
                  ]}
                >
                  <Text color="textSecondary" style={styles.emptyText}>
                    Add ingredients and quantities to calculate the cost of this
                    recipe.
                  </Text>
                </View>
              ) : (
                <Card style={styles.linesCard}>
                  {lines.map(({ ingredient, quantity }, index) => {
                    const unitCost = toNumber(ingredient.usableCostPerItem);
                    const unit = costUnitLabel(ingredient.itemSizeUnit);
                    const lineCost = toNumber(quantity) * unitCost;

                    return (
                      <View key={ingredient.id}>
                        {index > 0 ? <View style={styles.divider} /> : null}
                        <View style={styles.line}>
                          <View style={styles.lineInfo}>
                            <Text style={styles.lineName} numberOfLines={1}>
                              {ingredient.name}
                            </Text>
                            <Text variant="caption" color="textSecondary">
                              {symbol}
                              {formatAmount(unitCost)} / {unit}
                            </Text>
                          </View>

                          <View style={styles.lineQuantity}>
                            <InputWithPrefix
                              value={quantity}
                              onChangeText={(value) =>
                                updateQuantity(ingredient.id, value)
                              }
                              placeholder="0"
                              suffix={unit}
                            />
                          </View>

                          <Text style={styles.lineCost}>
                            {symbol}
                            {formatPrice(lineCost)}
                          </Text>

                          <Pressable
                            accessibilityRole="button"
                            accessibilityLabel={`Remove ${ingredient.name}`}
                            hitSlop={8}
                            onPress={() => removeIngredient(ingredient.id)}
                          >
                            <UniSymbolMuted
                              name={{
                                ios: "xmark.circle.fill",
                                android: "cancel",
                                web: "cancel",
                              }}
                              size={18}
                            />
                          </Pressable>
                        </View>
                      </View>
                    );
                  })}
                </Card>
              )}

              {errors.ingredients ? (
                <Text variant="caption" color="error">
                  {errors.ingredients}
                </Text>
              ) : null}

              <Pressable
                accessibilityRole="button"
                style={({ pressed }) => [
                  styles.addButton,
                  pressed && styles.pressed,
                ]}
                onPress={() => setIsPickerOpen(true)}
              >
                <UniSymbol
                  name={{ ios: "plus", android: "add", web: "add" }}
                  size={14}
                />
                <Text style={styles.addButtonLabel}>Add ingredient</Text>
              </Pressable>
            </View>
          </ScrollView>

          <View style={styles.summary}>
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
                  {hasPrice ? `${foodCostPercent.toFixed(1)}%` : "—"}
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
                  { width: `${Math.min(foodCostPercent, 100)}%` },
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
        </KeyboardAvoidingView>
      </View>

      <IngredientPicker
        visible={isPickerOpen}
        symbol={symbol}
        ingredients={availableIngredients}
        selectedIds={lines.map(({ ingredient }) => ingredient.id)}
        onSelect={addIngredient}
        onClose={() => setIsPickerOpen(false)}
      />
    </>
  );
}

interface IngredientPickerProps {
  visible: boolean;
  symbol: string;
  ingredients: Ingredient[];
  selectedIds: string[];
  onSelect: (ingredient: Ingredient) => void;
  onClose: () => void;
}

const IngredientPicker = ({
  visible,
  symbol,
  ingredients,
  selectedIds,
  onSelect,
  onClose,
}: IngredientPickerProps) => {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return ingredients.filter(
      ({ id, name }) =>
        !selectedIds.includes(id) &&
        (!normalizedQuery || name.toLowerCase().includes(normalizedQuery)),
    );
  }, [ingredients, selectedIds, query]);

  const handleClose = () => {
    setQuery("");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
      onDismiss={() => setQuery("")}
    >
      <View style={styles.pickerScreen}>
        <View style={styles.pickerHeader}>
          <Text variant="title">Add ingredient</Text>
          <Pressable onPress={handleClose} hitSlop={8}>
            <Text color="primary" style={styles.pickerClose}>
              Done
            </Text>
          </Pressable>
        </View>

        <SearchInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search ingredients"
        />

        <ScrollView
          contentContainerStyle={styles.pickerContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {results.length === 0 ? (
            <Text color="textSecondary" style={styles.pickerEmpty}>
              {ingredients.length === 0
                ? "No ingredients yet. Add some from the ingredients tab."
                : "No ingredients to add."}
            </Text>
          ) : (
            <Card style={styles.linesCard}>
              {results.map((ingredient, index) => (
                <View key={ingredient.id}>
                  {index > 0 ? <View style={styles.divider} /> : null}
                  <Pressable
                    accessibilityRole="button"
                    style={({ pressed }) => [
                      styles.pickerRow,
                      pressed && styles.pressed,
                    ]}
                    onPress={() => {
                      setQuery("");
                      onSelect(ingredient);
                    }}
                  >
                    <View style={styles.lineInfo}>
                      <Text style={styles.lineName}>{ingredient.name}</Text>
                      <Text variant="caption" color="textSecondary">
                        {symbol}
                        {formatAmount(toNumber(ingredient.usableCostPerItem))} /{" "}
                        {costUnitLabel(ingredient.itemSizeUnit)}
                      </Text>
                    </View>
                    <UniSymbol
                      name={{ ios: "plus", android: "add", web: "add" }}
                      size={16}
                    />
                  </Pressable>
                </View>
              ))}
            </Card>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create((theme) => ({
  flex: {
    flex: 1,
  },
  screen: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  content: {
    flexGrow: 1,
    gap: theme.gap(2.5),
    paddingHorizontal: theme.gap(3),
    paddingTop: theme.gap(2),
    paddingBottom: theme.gap(3),
  },
  headerButton: {
    paddingHorizontal: theme.gap(2),
    paddingVertical: theme.gap(1),
  },
  cancelButtonText: {
    color: theme.colors.text,
  },
  saveButtonText: {
    color: theme.colors.primary,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.gap(1),
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: theme.gap(2),
  },
  rowItem: {
    flex: 1,
    gap: theme.gap(1),
  },
  yieldStepper: {
    alignSelf: "stretch",
    justifyContent: "space-between",
    paddingVertical: theme.gap(1.5),
  },
  section: {
    gap: theme.gap(1.5),
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontSize: theme.fontSize.md,
    fontFamily: theme.fontFamily.semiBold,
    color: theme.colors.text,
  },
  batchValue: {
    fontSize: theme.fontSize.sm,
    fontFamily: theme.fontFamily.semiBold,
    color: theme.colors.text,
  },
  emptyCard: {
    backgroundColor: theme.colors.border,
    borderWidth: 1,
    borderColor: "transparent",
    borderRadius: theme.borderRadius.xl,
    paddingVertical: theme.gap(3),
    paddingHorizontal: theme.gap(3),
  },
  emptyCardError: {
    borderColor: theme.colors.error,
  },
  emptyText: {
    textAlign: "center",
  },
  linesCard: {
    padding: 0,
    gap: 0,
    overflow: "hidden",
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
  },
  line: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.gap(1.5),
    paddingVertical: theme.gap(1.5),
    paddingHorizontal: theme.gap(2),
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
  lineQuantity: {
    width: 104,
  },
  lineCost: {
    minWidth: theme.gap(7),
    textAlign: "right",
    fontSize: theme.fontSize.sm,
    fontFamily: theme.fontFamily.medium,
    color: theme.colors.text,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.gap(1),
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: theme.colors.textSecondary,
    borderRadius: theme.borderRadius.xl,
    paddingVertical: theme.gap(2),
  },
  addButtonLabel: {
    fontSize: theme.fontSize.md,
    fontFamily: theme.fontFamily.medium,
    color: theme.colors.text,
  },
  pressed: {
    opacity: 0.7,
  },
  summary: {
    gap: theme.gap(1),
    backgroundColor: theme.colors.background,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingHorizontal: theme.gap(3),
    paddingTop: theme.gap(2),
    paddingBottom: theme.gap(1),
  },
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
  pickerScreen: {
    flex: 1,
    gap: theme.gap(2),
    backgroundColor: theme.colors.surface,
    padding: theme.gap(3),
  },
  pickerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pickerClose: {
    fontFamily: theme.fontFamily.semiBold,
  },
  pickerContent: {
    paddingBottom: theme.gap(3),
  },
  pickerEmpty: {
    textAlign: "center",
    paddingVertical: theme.gap(4),
  },
  pickerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.gap(2),
    paddingVertical: theme.gap(2),
    paddingHorizontal: theme.gap(2.5),
  },
}));
