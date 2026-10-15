import { router, Stack, useLocalSearchParams } from "expo-router";
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

import { Loader, Pill, showToast, StepperInput, Text } from "@/components/atoms";
import { Checkbox, PrefixInput, TextInput } from "@/components/molecules";
import { RecipeSummary } from "@/components/organisms";
import { RecipeIngredient } from "@/components/templates/RecipeIngredient";
import {
  MethodStep,
  RecipeMethods,
} from "@/components/templates/RecipeMethods";

import { CURRENCY_SYMBOLS } from "@/constants";
import { roundTo2, toNumber } from "@/helpers";
import {
  createIngredient,
  createRecipe,
  getCategories,
  getRecipeById,
  updateRecipe,
} from "@/service/api";
import { useAccountUserStore } from "@/store";
import {
  ApiError,
  CategoryType,
  Currency,
  MetricUnit,
  RecipeIngredientPayload,
  RecipeStep,
} from "@/types";

const DEFAULT_TARGET_FOOD_COST = 30;

type FieldErrors = {
  name?: string;
  price?: string;
  ingredients?: string;
};

const readRouteParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

const toRecipeStepsPayload = (steps: MethodStep[]): RecipeStep[] =>
  steps
    .map((step, index) => ({
      order: index + 1,
      text: step.text.trim(),
    }))
    .filter((step) => step.text.length > 0);

export default function CreateRecipeScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const recipeId = readRouteParam(id);
  const isEditing = Boolean(recipeId);

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
  const [addToIngredient, setAddToIngredient] = useState(false);
  const [isMethodFocused, setIsMethodFocused] = useState(false);
  const [isFetching, setIsFetching] = useState(isEditing);
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

  useEffect(() => {
    if (!recipeId) return;

    let cancelled = false;
    setIsFetching(true);

    getRecipeById(recipeId)
      .then((recipe) => {
        if (cancelled) return;

        setName(recipe.name);
        setCategoryId(recipe.categoryId);
        setServings(recipe.servings);
        setPrice(recipe.pricePerServing);
        setIngredients(
          recipe.ingredients.map((line) => ({
            ingredientId: line.ingredientId,
            quantity: String(line.quantity),
            unit: line.unit,
            pricePerUnit: toNumber(line.pricePerUnit),
          })),
        );
        setMethodSteps(
          [...recipe.steps]
            .sort((a, b) => a.order - b.order)
            .map((step, index) => ({ id: index + 1, text: step.text })),
        );
      })
      .catch((error) => {
        if (cancelled) return;
        if (error instanceof ApiError) {
          showToast(error.message, { variant: "error" });
        } else {
          showToast("Could not load recipe", { variant: "error" });
        }
        router.back();
      })
      .finally(() => {
        if (!cancelled) setIsFetching(false);
      });

    return () => {
      cancelled = true;
    };
  }, [recipeId]);

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

  const saveIngredientFromRecipe = async () => {
    try {
      const ingredientCategories = await getCategories(
        businessId!,
        CategoryType.INGREDIENT,
      );
      const ingredientCategoryId = ingredientCategories[0]?.id;

      if (!ingredientCategoryId) {
        throw new ApiError({
          message: "Add an ingredient category before saving to ingredients",
          error: "missing_ingredient_category",
          statusCode: 400,
        });
      }

      await createIngredient({
        businessId: businessId!,
        name: name,
        categoryId: ingredientCategoryId,
        suppliers: [
          {
            name: "",
            itemSize: 1,
            itemSizeUnit: MetricUnit.EACH,
            itemPrice: costPerServing,
            usableCostPerItem: costPerServing,
          },
        ],
      });
    } catch (error) {
      if (error instanceof ApiError) {
        showToast(error.message, { variant: "error" });
      } else {
        showToast("An unexpected error occurred", { variant: "error" });
      }
      return false;
    }
  };

  const handleSave = async () => {
    if (!validate()) return;

    const steps = toRecipeStepsPayload(methodSteps);

    try {
      const payload = {
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
      };

      if (recipeId) {
        await updateRecipe(recipeId, payload);
        showToast("Recipe updated successfully", { variant: "default" });
      } else {
        await createRecipe({
          businessId: businessId!,
          ...payload,
        });

        if (addToIngredient) {
          try {
            await saveIngredientFromRecipe();
          } catch (ingredientError) {
            if (ingredientError instanceof ApiError) {
              showToast(`Recipe saved. ${ingredientError.message}`, {
                variant: "error",
              });
            } else {
              showToast("Recipe saved, but could not add ingredient", {
                variant: "error",
              });
            }
            router.push("/(app)/(recipes)");
            return;
          }
        }

        showToast("Recipe created successfully", { variant: "default" });
      }
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
          title: isEditing ? "Edit recipe" : "New recipe",
          headerLeft: () => (
            <Pressable onPressIn={router.back} style={styles.headerButton}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
          ),
          headerRight: () => (
            <Pressable
              onPressIn={handleSave}
              style={styles.headerButton}
              disabled={isFetching}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </Pressable>
          ),
        }}
      />
      <Loader visible={isFetching} text="Loading recipe..." />

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

            {!isEditing ? (
              <Checkbox
                label="Add to ingredient"
                value={addToIngredient}
                onValueChange={setAddToIngredient}
              />
            ) : null}

            <RecipeIngredient
              businessId={businessId}
              symbol={symbol}
              ingredients={ingredients}
              onChange={handleIngredientsChange}
              error={errors.ingredients}
            />

            <RecipeMethods
              steps={methodSteps}
              onChange={setMethodSteps}
              onEditingFocusChange={setIsMethodFocused}
            />
          </ScrollView>

          {!isMethodFocused ? (
            <RecipeSummary
              symbol={symbol}
              costPerServing={costPerServing}
              recipeCost={recipeCost}
              profitPerServing={profitPerServing}
              hasPrice={hasPrice}
              targetFoodCost={targetFoodCost}
              bottomInset={insets.bottom + 16}
            />
          ) : null}
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
}));
