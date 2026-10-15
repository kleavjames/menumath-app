import { router, Stack, useLocalSearchParams } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet, withUnistyles } from "react-native-unistyles";

import { Card, Loader, Pill, showToast, Text } from "@/components/atoms";
import {
  PrefixInput,
  SelectWithInput,
  TextInput,
} from "@/components/molecules";
import { CURRENCY_SYMBOLS, METRIC_OPTIONS } from "@/constants";
import { formatAmount, formatPrice, toNumber } from "@/helpers";
import {
  createIngredient,
  getCategories,
  updateIngredient,
} from "@/service/api";
import type { SupplierPayload } from "@/service/api/ingredients";
import { useAccountUserStore } from "@/store";
import { ApiError, CategoryType, Currency, MetricUnit } from "@/types";

const UniSymbol = withUnistyles(SymbolView, (theme) => ({
  tintColor: theme.colors.text,
}));

const UniDangerSymbol = withUnistyles(SymbolView, (theme) => ({
  tintColor: theme.colors.error,
}));

type SupplierRow = {
  id: string;
  name: string;
  packSize: string;
  unit: MetricUnit;
  packPrice: string;
};

type SupplierFieldErrors = {
  packSize?: string;
  packPrice?: string;
};

type FieldErrors = {
  name?: string;
  suppliers?: Record<string, SupplierFieldErrors>;
};

type EditParams = {
  id?: string;
  name?: string;
  categoryId?: string;
  supplier?: string;
  itemSize?: string;
  itemSizeUnit?: string;
  itemPrice?: string;
  calculationSupplierId?: string;
};

const readRouteParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

/** Normalizes API decimals (e.g. "25.0000") into a plain editable number string. */
const toInputValue = (value: string | undefined, fallback: string) =>
  value === undefined ? fallback : String(toNumber(value));

let supplierRowCounter = 0;

const createSupplierRow = (
  overrides?: Partial<Omit<SupplierRow, "id">>,
): SupplierRow => ({
  id: `supplier-${supplierRowCounter++}`,
  name: "",
  packSize: "1",
  unit: MetricUnit.KG,
  packPrice: "",
  ...overrides,
});

const buildInitialSuppliers = (params: EditParams): SupplierRow[] => [
  createSupplierRow({
    name: params.supplier ?? "",
    packSize: toInputValue(params.itemSize, "1"),
    unit: (params.itemSizeUnit as MetricUnit | undefined) ?? MetricUnit.KG,
    packPrice: toInputValue(params.itemPrice, ""),
  }),
];

const computeUsableCost = (
  packSize: string,
  packPrice: string,
  unit: MetricUnit,
) => {
  const size = toNumber(packSize);
  const price = toNumber(packPrice);
  const unitOption = METRIC_OPTIONS.find((option) => option.value === unit);

  if (size <= 0 || price <= 0) {
    return { perUnit: 0, perSubUnit: null as number | null, unitOption };
  }

  const perUnit = price / size;
  const subUnit = unitOption?.subUnit;

  return {
    perUnit,
    perSubUnit: subUnit ? perUnit / subUnit.perUnit : null,
    unitOption,
  };
};

const toSupplierPayload = (row: SupplierRow): SupplierPayload => {
  const { perUnit, perSubUnit } = computeUsableCost(
    row.packSize,
    row.packPrice,
    row.unit,
  );

  return {
    name: row.name.trim(),
    itemSize: toNumber(row.packSize),
    itemSizeUnit: row.unit,
    itemPrice: toNumber(row.packPrice),
    usableCostPerItem: perSubUnit ?? perUnit,
  };
};

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
  const [suppliers, setSuppliers] = useState<SupplierRow[]>(() =>
    buildInitialSuppliers(params),
  );
  const calculationSupplierId = readRouteParam(params.calculationSupplierId);
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

  const clearSupplierError = (
    supplierId: string,
    field: keyof SupplierFieldErrors,
  ) => {
    setErrors((prev) => {
      const rowErrors = prev.suppliers?.[supplierId];
      if (!rowErrors?.[field]) return prev;

      const nextRowErrors = { ...rowErrors };
      delete nextRowErrors[field];

      const nextSuppliers = { ...prev.suppliers };
      if (Object.keys(nextRowErrors).length === 0) {
        delete nextSuppliers[supplierId];
      } else {
        nextSuppliers[supplierId] = nextRowErrors;
      }

      const next = { ...prev };
      if (Object.keys(nextSuppliers).length === 0) {
        delete next.suppliers;
      } else {
        next.suppliers = nextSuppliers;
      }
      return next;
    });
  };

  const validate = (): boolean => {
    const next: FieldErrors = {};

    if (!name.trim()) {
      next.name = "Ingredient name is required";
    }

    const supplierErrors: Record<string, SupplierFieldErrors> = {};
    for (const row of suppliers) {
      const rowErrors: SupplierFieldErrors = {};
      if (toNumber(row.packSize) <= 0) {
        rowErrors.packSize = "Enter a pack size greater than 0";
      }
      if (toNumber(row.packPrice) <= 0) {
        rowErrors.packPrice = "Enter the pack price";
      }
      if (Object.keys(rowErrors).length > 0) {
        supplierErrors[row.id] = rowErrors;
      }
    }
    if (Object.keys(supplierErrors).length > 0) {
      next.suppliers = supplierErrors;
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const updateSupplier = (
    id: string,
    patch: Partial<Omit<SupplierRow, "id">>,
  ) => {
    setSuppliers((prev) =>
      prev.map((row) => (row.id === id ? { ...row, ...patch } : row)),
    );
  };

  const addSupplier = () => {
    setSuppliers((prev) => [...prev, createSupplierRow()]);
  };

  const removeSupplier = (id: string) => {
    setSuppliers((prev) =>
      prev.length <= 1 ? prev : prev.filter((row) => row.id !== id),
    );
    setErrors((prev) => {
      if (!prev.suppliers?.[id]) return prev;
      const nextSuppliers = { ...prev.suppliers };
      delete nextSuppliers[id];
      const next = { ...prev };
      if (Object.keys(nextSuppliers).length === 0) {
        delete next.suppliers;
      } else {
        next.suppliers = nextSuppliers;
      }
      return next;
    });
  };

  const handleSave = async () => {
    if (!validate()) return;
    setIsLoading(true);

    try {
      const supplierPayloads = suppliers.map(toSupplierPayload);
      const values = {
        name,
        categoryId: categoryId!,
        suppliers: supplierPayloads,
      };

      if (ingredientId) {
        await updateIngredient(ingredientId, {
          ...values,
          ...(calculationSupplierId
            ? { calculationSupplierId }
            : {}),
        });
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

              <View style={styles.suppliersSection}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Suppliers</Text>
                  <Text style={styles.sectionCount}>{suppliers.length}</Text>
                </View>

                {suppliers.map((row, index) => {
                  const rowErrors = errors.suppliers?.[row.id];
                  const cost = computeUsableCost(
                    row.packSize,
                    row.packPrice,
                    row.unit,
                  );

                  return (
                    <Card key={row.id} style={styles.supplierCard}>
                      <View style={styles.supplierCardHeader}>
                        <Text variant="label" color="textSecondary">
                          Supplier {index + 1}
                        </Text>
                        {suppliers.length > 1 ? (
                          <Pressable
                            accessibilityRole="button"
                            accessibilityLabel={`Remove supplier ${index + 1}`}
                            hitSlop={8}
                            onPress={() => removeSupplier(row.id)}
                          >
                            <UniDangerSymbol
                              name={{
                                ios: "trash",
                                android: "delete",
                                web: "delete",
                              }}
                              size={18}
                            />
                          </Pressable>
                        ) : null}
                      </View>

                      <TextInput
                        label="Name"
                        value={row.name}
                        onChangeText={(value) =>
                          updateSupplier(row.id, { name: value })
                        }
                        placeholder="Optional"
                        autoCapitalize="words"
                      />

                      <View style={styles.purchaseFields}>
                        <View style={styles.purchaseField}>
                          <SelectWithInput
                            label="Pack size"
                            value={row.packSize}
                            onChangeText={(value) => {
                              updateSupplier(row.id, { packSize: value });
                              clearSupplierError(row.id, "packSize");
                            }}
                            options={METRIC_OPTIONS}
                            selected={row.unit}
                            onSelect={(value) =>
                              updateSupplier(row.id, {
                                unit: value as MetricUnit,
                              })
                            }
                            selectPlaceholder="Unit"
                            error={rowErrors?.packSize}
                          />
                        </View>

                        <View style={styles.purchaseField}>
                          <PrefixInput
                            label="Pack price"
                            prefix={symbol}
                            value={row.packPrice}
                            onChangeText={(value) => {
                              updateSupplier(row.id, { packPrice: value });
                              clearSupplierError(row.id, "packPrice");
                            }}
                            placeholder="0.00"
                            error={rowErrors?.packPrice}
                          />
                        </View>
                      </View>

                      <Text variant="label" color="textSecondary">
                        Usable cost per {row.unit}: {symbol}
                        {formatPrice(cost.perUnit)}
                        {cost.perSubUnit !== null && cost.unitOption?.subUnit
                          ? ` · ${symbol}${formatAmount(cost.perSubUnit)} per ${cost.unitOption.subUnit.label}`
                          : ""}
                      </Text>
                    </Card>
                  );
                })}

                <Pressable
                  accessibilityRole="button"
                  style={({ pressed }) => [
                    styles.addButton,
                    pressed && styles.addButtonPressed,
                  ]}
                  onPress={addSupplier}
                >
                  <UniSymbol
                    name={{ ios: "plus", android: "add", web: "add" }}
                    size={14}
                  />
                  <Text style={styles.addButtonLabel}>Add supplier</Text>
                </Pressable>
              </View>
            </View>

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
  suppliersSection: {
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
  sectionCount: {
    fontSize: theme.fontSize.md,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.textSecondary,
  },
  supplierCard: {
    gap: theme.gap(2),
  },
  supplierCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  purchaseFields: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: theme.gap(2),
  },
  purchaseField: {
    flex: 1,
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
  addButtonPressed: {
    opacity: 0.7,
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
