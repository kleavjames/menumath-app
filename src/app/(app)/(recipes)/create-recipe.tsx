import { router, Stack } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";

import { Pill, showToast, StepperInput, Text } from "@/components/atoms";
import { PrefixInput, TextInput } from "@/components/molecules";
import { RecipeIngredient } from "@/components/templates/RecipeIngredient";
import {
  MethodStep,
  RecipeMethods,
} from "@/components/templates/RecipeMethods";

import { CURRENCY_SYMBOLS } from "@/constants/units";
import { formatAmount, formatPrice, roundTo2, toNumber } from "@/helpers/money";
import { getCategories } from "@/service/api/categories";
import { createRecipe } from "@/service/api/recipes";
import { useAccountUserStore } from "@/store/accountUser";
import { CategoryType, Currency } from "@/types/business";
import { ApiError } from "@/types/common";
import { RecipeIngredientPayload } from "@/types/ingredient";
import { RecipeStep } from "@/types/recipe";

const DEFAULT_TARGET_FOOD_COST = 30;

type FieldErrors = {
  name?: string;
  price?: string;
  ingredients?: string;
};

type CostStatus = "good" | "warn" | "over";

const getCostStatus = (percent: number, target: number): CostStatus => {
  if (percent <= target) return "good";
  if (percent <= target + 5) return "warn";
  return "over";
};

const toRecipeStepsPayload = (steps: MethodStep[]): RecipeStep[] =>
  steps
    .map((step, index) => ({
      order: index + 1,
      text: step.text.trim(),
    }))
    .filter((step) => step.text.length > 0);

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
  const [servings, setServings] = useState(1);
  const [price, setPrice] = useState(0);
  const [ingredients, setIngredients] = useState<RecipeIngredientPayload[]>([]);
  const [methodSteps, setMethodSteps] = useState<MethodStep[]>([]);
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
    () => ingredients.reduce((sum, line) => sum + line.pricePerUnit, 0),
    [ingredients],
  );

  const {
    costPerServing,
    recipeCost,
    profitPerServing,
    marginProfit,
    hasPrice,
  } = useMemo(() => {
    const pricePerServing = price;
    const hasPrice = pricePerServing > 0;
    const costPerServing = roundTo2(batchCost / Math.max(servings, 1));
    const recipeCost = hasPrice
      ? roundTo2((costPerServing / pricePerServing) * 100)
      : 0;
    const profitPerServing = roundTo2(pricePerServing - costPerServing);
    const marginProfit = hasPrice
      ? roundTo2((profitPerServing / pricePerServing) * 100)
      : 0;

    return {
      costPerServing,
      recipeCost,
      profitPerServing,
      marginProfit,
      hasPrice,
    };
  }, [batchCost, servings, price]);

  const status = getCostStatus(recipeCost, targetFoodCost);

  const handleIngredientsChange = (next: RecipeIngredientPayload[]) => {
    setIngredients(next);
    if (next.length > 0) {
      clearError("ingredients");
    }
  };

  const validate = (): boolean => {
    const next: FieldErrors = {};

    if (!name.trim()) {
      next.name = "Recipe name is required";
    }
    if (!hasPrice) {
      next.price = "Enter a price";
    }
    if (ingredients.length === 0) {
      next.ingredients = "Add at least one ingredient";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    const steps = toRecipeStepsPayload(methodSteps);

    try {
      await createRecipe({
        businessId: businessId!,
        categoryId: categoryId!,
        name,
        servings,
        pricePerServing: price,
        costPerServing,
        recipeCost,
        profit: profitPerServing,
        margin: marginProfit,
        ingredients,
        steps,
      });
      showToast("Recipe created successfully", { variant: "default" });
      router.push("/(app)/(recipes)");
    } catch (error) {
      if (error instanceof ApiError) {
        showToast(error.message, { variant: "error" });
      } else {
        showToast("An unexpected error occurred", { variant: "error" });
      }
    }
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

      <View style={[styles.screen, { paddingTop: insets.top * 2 }]}>
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
                  value={servings}
                  onChange={setServings}
                  min={1}
                  suffix={servings === 1 ? " serving" : " servings"}
                  style={styles.yieldStepper}
                />
              </View>
              <View style={styles.rowItem}>
                <PrefixInput
                  label="Price per serving"
                  prefix={symbol}
                  value={price === 0 ? "" : String(price)}
                  onChangeText={(value) => {
                    setPrice(roundTo2(toNumber(value)));
                    clearError("price");
                  }}
                  placeholder="0.00"
                  error={errors.price}
                />
              </View>
            </View>

            <RecipeIngredient
              businessId={businessId}
              symbol={symbol}
              ingredients={ingredients}
              onChange={handleIngredientsChange}
              error={errors.ingredients}
            />

            <RecipeMethods steps={methodSteps} onChange={setMethodSteps} />
          </ScrollView>

          <View style={styles.summary(insets.bottom + 16)}>
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
        </KeyboardAvoidingView>
      </View>
    </>
  );
}

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
