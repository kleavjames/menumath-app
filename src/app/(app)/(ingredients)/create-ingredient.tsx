import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";

import { Button, Pill, Text } from "@/components/atoms";
import {
  BackButton,
  PrefixInput,
  SelectWithInput,
  TextInput,
} from "@/components/molecules";
import { BigInfoCard } from "@/components/templates/BigInfoCard";

import { getCategories } from "../../../../service/api/categories";
import { useAccountUserStore } from "../../../../store/accountUser";
import { CategoryType, Currency } from "../../../../types/business";

type FieldErrors = {
  name?: string;
  packSize?: string;
  packPrice?: string;
  yieldPercent?: string;
};

type UnitOption = {
  label: string;
  value: string;
  /** Smaller unit used for the secondary cost line, e.g. kg -> g. */
  subUnit?: { label: string; perUnit: number };
};

const UNIT_OPTIONS: UnitOption[] = [
  { label: "kg", value: "kg", subUnit: { label: "g", perUnit: 1000 } },
  { label: "g", value: "g" },
  { label: "L", value: "L", subUnit: { label: "mL", perUnit: 1000 } },
  { label: "mL", value: "mL" },
  { label: "lb", value: "lb", subUnit: { label: "oz", perUnit: 16 } },
  { label: "oz", value: "oz" },
  { label: "each", value: "each" },
];

const CURRENCY_SYMBOLS: Record<Currency, string> = {
  [Currency.USD]: "$",
  [Currency.PHP]: "₱",
  [Currency.EUR]: "€",
  [Currency.GBP]: "£",
  [Currency.CAD]: "$",
  [Currency.AUD]: "$",
  [Currency.NZD]: "$",
  [Currency.JPY]: "¥",
  [Currency.SGD]: "$",
  [Currency.INR]: "₹",
  [Currency.MXN]: "$",
};

const toNumber = (value: string) => {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export default function CreateIngredientScreen() {
  const insets = useSafeAreaInsets();

  const businessId = useAccountUserStore((state) => state.businessId);
  const currency = useAccountUserStore(
    (state) => state.business?.currency ?? Currency.USD,
  );
  const symbol = CURRENCY_SYMBOLS[currency];

  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState<string | undefined>();
  const [categoryOptions, setCategoryOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [supplier, setSupplier] = useState("");
  const [packSize, setPackSize] = useState("1");
  const [unit, setUnit] = useState("kg");
  const [packPrice, setPackPrice] = useState("");
  const [yieldPercent, setYieldPercent] = useState("100");
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
    const yieldRatio = toNumber(yieldPercent) / 100;
    const usableQuantity = size * yieldRatio;

    if (usableQuantity <= 0 || price <= 0) {
      return { perUnit: 0, perSubUnit: null as number | null };
    }

    const perUnit = price / usableQuantity;
    const subUnit = unitOption?.subUnit;

    return {
      perUnit,
      perSubUnit: subUnit ? perUnit / subUnit.perUnit : null,
    };
  }, [packSize, packPrice, yieldPercent, unitOption]);

  const validate = (): boolean => {
    const next: FieldErrors = {};
    const yieldValue = toNumber(yieldPercent);

    if (!name.trim()) {
      next.name = "Ingredient name is required";
    }
    if (toNumber(packSize) <= 0) {
      next.packSize = "Enter a pack size greater than 0";
    }
    if (toNumber(packPrice) <= 0) {
      next.packPrice = "Enter the pack price";
    }
    if (yieldValue <= 0 || yieldValue > 100) {
      next.yieldPercent = "Yield must be between 1 and 100";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    // TODO: persist the ingredient once the ingredients API is available.
    router.back();
  };

  return (
    <View
      style={[
        styles.screen,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
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
          <BackButton />

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
                  onSelect={setUnit}
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

            <View style={styles.yieldFields}>
              <View style={styles.yieldTextField}>
                <Text variant="label">Usable Yield</Text>
                <Text variant="caption" color="textSecondary">
                  Portion left after trimming and waste
                </Text>
              </View>
              <View style={styles.purchaseField}>
                <PrefixInput
                  suffix="%"
                  value={yieldPercent}
                  onChangeText={(value) => {
                    setYieldPercent(value);
                    clearError("yieldPercent");
                  }}
                  placeholder="100"
                  error={errors.yieldPercent}
                />
              </View>
            </View>
          </View>

          <BigInfoCard
            style={styles.bigInfoCard}
            label={`Usable cost per ${unit}`}
            value={`${symbol}${usableCost.perUnit.toFixed(2)}`}
            subValue={
              usableCost.perSubUnit !== null && unitOption?.subUnit
                ? `${symbol}${usableCost.perSubUnit.toFixed(4)} per ${unitOption.subUnit.label}`
                : undefined
            }
          />
          <Text variant="label" color="textSecondary">
            Cost updates across every recipe that uses this ingredient.
          </Text>

          <View style={styles.actions}>
            <Button onPress={handleSave}>Save ingredient</Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
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
  },
  content: {
    flexGrow: 1,
    gap: theme.gap(3),
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
  actions: {
    marginTop: "auto",
  },
  purchaseFields: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: theme.gap(2),
  },
  yieldFields: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.gap(2),
  },
  yieldTextField: {
    flex: 2,
  },
  purchaseField: {
    flex: 1,
  },
  bigInfoCard: {
    position: "relative",
    bottom: -15,
  },
}));
