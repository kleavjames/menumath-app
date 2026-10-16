import { SymbolView } from "expo-symbols";
import { useEffect, useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, View } from "react-native";
import { StyleSheet, withUnistyles } from "react-native-unistyles";

import { Card, InputWithPrefix, Text } from "@/components/atoms";
import { SearchInput } from "@/components/molecules";

import { METRIC_OPTIONS } from "@/constants";
import {
  costUnitLabel,
  formatAmount,
  formatPrice,
  getCalculationSupplier,
  toNumber,
  unitLabel,
} from "@/helpers";
import { getIngredients } from "@/service/api";
import {
  CategoryType,
  Ingredient,
  MetricUnit,
  RecipeIngredientPayload,
} from "@/types";

const UniSymbol = withUnistyles(SymbolView, (theme) => ({
  tintColor: theme.colors.text,
}));

const UniSymbolMuted = withUnistyles(SymbolView, (theme) => ({
  tintColor: theme.colors.textSecondary,
}));

const getCostSupplier = (ingredient: Ingredient) =>
  ingredient.calculationSupplier ?? getCalculationSupplier(ingredient);

/** Unit that `usableCostPerItem` is priced in (e.g. kg → g, L → mL). */
const getIngredientUseUnit = (ingredient: Ingredient): MetricUnit => {
  const supplier = getCostSupplier(ingredient);
  if (!supplier) return MetricUnit.EACH;

  const option = METRIC_OPTIONS.find(
    (item) => item.value === supplier.itemSizeUnit,
  );
  return (
    (option?.subUnit?.label as MetricUnit | undefined) ?? supplier.itemSizeUnit
  );
};

const getUnitRate = (ingredient: Ingredient) =>
  toNumber(getCostSupplier(ingredient)?.usableCostPerItem);

const formatIngredientRate = (ingredient: Ingredient, symbol: string) => {
  const supplier = getCostSupplier(ingredient);
  if (!supplier) return "—";

  return `${symbol}${formatAmount(toNumber(supplier.usableCostPerItem))} / ${costUnitLabel(supplier.itemSizeUnit)}`;
};

const getIngredientUsePrice = (quantity: string, ingredient: Ingredient) =>
  toNumber(quantity) * getUnitRate(ingredient);

export type RecipeIngredientProps = {
  businessId: string | null | undefined;
  symbol: string;
  ingredients: RecipeIngredientPayload[];
  onChange: (ingredients: RecipeIngredientPayload[]) => void;
  error?: string;
};

export const RecipeIngredient = ({
  businessId,
  symbol,
  ingredients,
  onChange,
  error,
}: RecipeIngredientProps) => {
  const [availableIngredients, setAvailableIngredients] = useState<
    Ingredient[]
  >([]);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  useEffect(() => {
    if (!businessId) return;

    getIngredients(businessId, CategoryType.INGREDIENT)
      .then(setAvailableIngredients)
      .catch((err) => console.error(err));
  }, [businessId]);

  const ingredientById = useMemo(
    () => new Map(availableIngredients.map((item) => [item.id, item])),
    [availableIngredients],
  );

  const batchCost = useMemo(
    () => ingredients.reduce((sum, line) => sum + line.pricePerUnit, 0),
    [ingredients],
  );

  const addIngredient = (ingredient: Ingredient) => {
    const unit = getIngredientUseUnit(ingredient);

    onChange([
      ...ingredients,
      {
        ingredientId: ingredient.id,
        quantity: "",
        unit,
        pricePerUnit: 0,
      },
    ]);
    setIsPickerOpen(false);
  };

  const updateIngredient = (
    ingredientId: string,
    changes: Partial<
      Pick<RecipeIngredientPayload, "quantity" | "unit" | "pricePerUnit">
    >,
  ) => {
    onChange(
      ingredients.map((line) => {
        if (line.ingredientId !== ingredientId) return line;

        const next = { ...line, ...changes };

        if (changes.quantity !== undefined) {
          const source = ingredientById.get(ingredientId);
          if (source) {
            next.pricePerUnit = getIngredientUsePrice(next.quantity, source);
          }
        }

        return next;
      }),
    );
  };

  const removeRecipeIngredient = (ingredientId: string) => {
    onChange(ingredients.filter((line) => line.ingredientId !== ingredientId));
  };

  return (
    <>
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Ingredients</Text>
        </View>

        {ingredients.length === 0 ? (
          <View
            style={[styles.emptyCard, error ? styles.emptyCardError : null]}
          >
            <Text color="textSecondary" style={styles.emptyText}>
              Add ingredients and quantities to calculate the cost of this
              recipe.
            </Text>
          </View>
        ) : (
          <Card style={styles.linesCard}>
            {ingredients.map((line, index) => {
              const ingredient = ingredientById.get(line.ingredientId);
              if (!ingredient) return null;

              const unitLabelText = unitLabel(line.unit);

              return (
                <View key={line.ingredientId}>
                  {index > 0 ? <View style={styles.divider} /> : null}
                  <View style={styles.line}>
                    <View style={styles.lineInfo}>
                      <Text style={styles.lineName} numberOfLines={1}>
                        {ingredient.name}
                      </Text>
                      <Text variant="caption" color="textSecondary">
                        {formatIngredientRate(ingredient, symbol)}
                      </Text>
                    </View>

                    <View style={styles.lineQuantity}>
                      <InputWithPrefix
                        value={line.quantity}
                        onChangeText={(value) =>
                          updateIngredient(line.ingredientId, {
                            quantity: value,
                          })
                        }
                        placeholder="0"
                        suffix={unitLabelText}
                      />
                    </View>

                    <Text style={styles.lineCost}>
                      {symbol}
                      {formatPrice(line.pricePerUnit)}
                    </Text>

                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Remove ${ingredient.name}`}
                      hitSlop={8}
                      onPress={() => removeRecipeIngredient(line.ingredientId)}
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

        {error ? (
          <Text variant="caption" color="error">
            {error}
          </Text>
        ) : null}

        <Pressable
          accessibilityRole="button"
          style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}
          onPress={() => setIsPickerOpen(true)}
        >
          <UniSymbol
            name={{ ios: "plus", android: "add", web: "add" }}
            size={14}
          />
          <Text style={styles.addButtonLabel}>Add ingredient</Text>
        </Pressable>
      </View>

      <IngredientPicker
        visible={isPickerOpen}
        symbol={symbol}
        ingredients={availableIngredients}
        selectedIds={ingredients.map(({ ingredientId }) => ingredientId)}
        onSelect={addIngredient}
        onClose={() => setIsPickerOpen(false)}
      />
    </>
  );
};

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
                        {formatIngredientRate(ingredient, symbol)}
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
