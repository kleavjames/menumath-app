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

import { Loader, Pill, showToast, Text } from "@/components/atoms";
import {
  PrefixInput,
  SelectWithInput,
  TextInput,
} from "@/components/molecules";
import { BigInfoCard } from "@/components/templates/BigInfoCard";

import { CURRENCY_SYMBOLS, UNIT_OPTIONS } from "@/constants/units";
import { formatAmount, formatPrice, toNumber } from "@/helpers/money";
import { getCategories } from "@/service/api/categories";
import { createIngredient, updateIngredient } from "@/service/api/ingredients";
import { useAccountUserStore } from "@/store/accountUser";
import { CategoryType, Currency, MetricUnit } from "@/types/business";
import { ApiError } from "@/types/common";

type FieldErrors = {
  name?: string;
  packSize?: string;
  packPrice?: string;
};

type EditParams = {
  id?: string;
  name?: string;
  categoryId?: string;
  supplier?: string;
  itemSize?: string;
  itemSizeUnit?: string;
  itemPrice?: string;
};

/** Normalizes API decimals (e.g. "25.0000") into a plain editable number string. */
const toInputValue = (value: string | undefined, fallback: string) =>
  value === undefined ? fallback : String(toNumber(value));

export default function CreateIngredientScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<EditParams>();
  const ingredientId = params.id;
  const isEditing = Boolean(ingredientId);

  const businessId = useAccountUserStore((state) => state.businessId);
  const currency = useAccountUserStore(
    (state) => state.business?.currency ?? Currency.USD,
  );

  const symbol = CURRENCY_SYMBOLS[currency];

  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState(params.name ?? "");
  const [categoryId, setCategoryId] = useState<string | undefined>(
    params.categoryId,
  );
  const [categoryOptions, setCategoryOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [supplier, setSupplier] = useState(params.supplier ?? "");
  const [packSize, setPackSize] = useState(toInputValue(params.itemSize, "1"));
  const [unit, setUnit] = useState(
    (params.itemSizeUnit as MetricUnit | undefined) ?? MetricUnit.KG,
  );
  const [packPrice, setPackPrice] = useState(
    toInputValue(params.itemPrice, ""),
  );
  const [errors, setErrors] = useState<FieldErrors>({});

  useEffect(() => {
    if (!businessId) return;

    getCategories(businessId, CategoryType.INGREDIENT)
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

  const unitOption = UNIT_OPTIONS.find((option) => option.value === unit);

  const usableCost = useMemo(() => {
    const size = toNumber(packSize);
    const price = toNumber(packPrice);

    if (size <= 0 || price <= 0) {
      return { perUnit: 0, perSubUnit: null as number | null };
    }

    const perUnit = price / size;
    const subUnit = unitOption?.subUnit;

    return {
      perUnit,
      perSubUnit: subUnit ? perUnit / subUnit.perUnit : null,
    };
  }, [packSize, packPrice, unitOption]);

  const validate = (): boolean => {
    const next: FieldErrors = {};

    if (!name.trim()) {
      next.name = "Ingredient name is required";
    }
    if (toNumber(packSize) <= 0) {
      next.packSize = "Enter a pack size greater than 0";
    }
    if (toNumber(packPrice) <= 0) {
      next.packPrice = "Enter the pack price";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setIsLoading(true);

    try {
      const values = {
        name,
        categoryId: categoryId!,
        supplier,
        itemSize: toNumber(packSize),
        itemSizeUnit: unit,
        itemPrice: toNumber(packPrice),
        usableCostPerItem: usableCost.perSubUnit ?? usableCost.perUnit,
      };

      if (ingredientId) {
        await updateIngredient(ingredientId, values);
      } else {
        await createIngredient({ businessId: businessId!, ...values });
      }

      showToast(
        isEditing
          ? "Ingredient updated successfully"
          : "Ingredient created successfully",
        { variant: "default" },
      );
      router.back();
    } catch (error) {
      if (error instanceof ApiError) {
        showToast(error.message, { variant: "error" });
      } else {
        showToast("An unknown error occurred", { variant: "error" });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerTransparent: true,
          title: isEditing ? "Edit Ingredient" : "New Ingredient",
          headerLeft: () => (
            <Pressable onPressIn={router.back} style={styles.cancelButton}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
          ),
          headerRight: () => (
            <Pressable onPressIn={handleSave} style={styles.saveButton}>
              <Text style={styles.saveButtonText}>Save</Text>
            </Pressable>
          ),
        }}
      />
      <Loader
        visible={isLoading}
        text={isEditing ? "Updating ingredient..." : "Creating ingredient..."}
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
              placeholder="Ingredient name"
              autoCapitalize="words"
              error={errors.name}
            />

            <View style={styles.form}>
              <View style={styles.field}>
                {categoryOptions.length === 0 ? (
                  <Text variant="caption" color="textSecondary">
                    No categories yet. Add one from the ingredients list.
                  </Text>
                ) : (
                  <View style={styles.chips}>
                    {categoryOptions.map(({ value, label }) => (
                      <Pill
                        key={value}
                        selected={categoryId === value}
                        onPress={() => setCategoryId(value)}
                      >
                        {label}
                      </Pill>
                    ))}
                  </View>
                )}
              </View>

              <TextInput
                label="Supplier"
                value={supplier}
                onChangeText={setSupplier}
                placeholder="Optional"
                autoCapitalize="words"
              />

              <View style={styles.purchaseFields}>
                <View style={styles.purchaseField}>
                  <SelectWithInput
                    label="Pack size"
                    value={packSize}
                    onChangeText={(value) => {
                      setPackSize(value);
                      clearError("packSize");
                    }}
                    options={UNIT_OPTIONS}
                    selected={unit}
                    onSelect={(value) => setUnit(value as MetricUnit)}
                    selectPlaceholder="Unit"
                    error={errors.packSize}
                  />
                </View>

                <View style={styles.purchaseField}>
                  <PrefixInput
                    label="Pack price"
                    prefix={symbol}
                    value={packPrice}
                    onChangeText={(value) => {
                      setPackPrice(value);
                      clearError("packPrice");
                    }}
                    placeholder="0.00"
                    error={errors.packPrice}
                  />
                </View>
              </View>
            </View>

            <BigInfoCard
              label={`Usable cost per ${unit}`}
              value={`${symbol}${formatPrice(usableCost.perUnit)}`}
              subValue={
                usableCost.perSubUnit !== null && unitOption?.subUnit
                  ? `${symbol}${formatAmount(usableCost.perSubUnit)} per ${unitOption.subUnit.label}`
                  : undefined
              }
            />
            <Text variant="label" color="textSecondary">
              Cost updates across every recipe that uses this ingredient.
            </Text>
          </ScrollView>
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
    paddingHorizontal: theme.gap(3),
    paddingTop: theme.gap(2),
  },
  content: {
    flexGrow: 1,
    gap: theme.gap(2),
    paddingBottom: theme.gap(3),
  },
  form: {
    gap: theme.gap(2.5),
  },
  field: {
    gap: theme.gap(1),
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.gap(1),
  },
  // actions: {
  //   marginTop: "auto",
  // },
  purchaseFields: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: theme.gap(2),
  },
  purchaseField: {
    flex: 1,
  },
  saveButton: {
    paddingHorizontal: theme.gap(2),
    paddingVertical: theme.gap(1),
  },
  saveButtonText: {
    color: theme.colors.primary,
  },
  cancelButton: {
    paddingHorizontal: theme.gap(2),
    paddingVertical: theme.gap(1),
  },
  cancelButtonText: {
    color: theme.colors.text,
  },
}));
