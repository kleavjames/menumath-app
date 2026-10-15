import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
  type BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import { SymbolView } from "expo-symbols";
import { useCallback, useEffect, useMemo, useState, type Ref } from "react";
import {
  Pressable,
  ScrollView,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet, withUnistyles } from "react-native-unistyles";

import { Card, Pill, Text } from "@/components/atoms";
import { METRIC_OPTIONS } from "@/constants";
import {
  costUnitLabel,
  formatAmount,
  formatPrice,
  getCalculationSupplier,
  toNumber,
  unitLabel,
} from "@/helpers";
import { Ingredient, Supplier } from "@/types";

const UniSymbol = withUnistyles(SymbolView, (theme) => ({
  tintColor: theme.colors.text,
}));

const UniDangerSymbol = withUnistyles(SymbolView, (theme) => ({
  tintColor: theme.colors.error,
}));

type IngredientViewProps = {
  ref?: Ref<BottomSheetModal>;
  ingredient: Ingredient | null;
  categoryName?: string;
  symbol: string;
  onEdit: (ingredient: Ingredient) => void;
  onDelete: (ingredient: Ingredient) => void;
  onDismiss?: () => void;
  hideButtons?: boolean;
};

type DetailRowProps = {
  label: string;
  value: string;
  withDivider?: boolean;
};

const DetailRow = ({ label, value, withDivider }: DetailRowProps) => (
  <View>
    {withDivider ? <View style={styles.divider} /> : null}
    <View style={styles.detailRow}>
      <Text color="textSecondary">{label}</Text>
      <Text style={styles.detailValue} numberOfLines={2}>
        {value}
      </Text>
    </View>
  </View>
);

const supplierDisplayName = (supplier: Supplier, index: number) =>
  supplier.name.trim() || `Supplier ${index + 1}`;

const formatSupplierPackSize = (supplier: Supplier) =>
  `${formatAmount(toNumber(supplier.itemSize))} ${unitLabel(supplier.itemSizeUnit)}`;

/** Mirrors create-ingredient usable cost breakdown for a single supplier. */
const formatSupplierUsableCost = (supplier: Supplier, symbol: string) => {
  const option = METRIC_OPTIONS.find((o) => o.value === supplier.itemSizeUnit);
  const stored = toNumber(supplier.usableCostPerItem);
  const subUnit = option?.subUnit;
  const perUnit = subUnit ? stored * subUnit.perUnit : stored;

  const primary = `${symbol}${formatPrice(perUnit)} per ${unitLabel(supplier.itemSizeUnit)}`;
  if (!subUnit) return primary;

  return `${primary} · ${symbol}${formatAmount(stored)} per ${unitLabel(subUnit.label)}`;
};

export const IngredientView = ({
  ref,
  ingredient,
  categoryName,
  symbol,
  onEdit,
  onDelete,
  hideButtons = false,
  onDismiss,
}: IngredientViewProps) => {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (!ingredient) {
      setSelectedSupplierId(null);
      return;
    }

    const defaultSupplier = getCalculationSupplier(ingredient);
    setSelectedSupplierId(defaultSupplier?.id ?? null);
  }, [ingredient?.id, ingredient?.calculationSupplierId]);

  const selectedSupplier = useMemo(() => {
    if (!ingredient) return undefined;
    return (
      ingredient.suppliers.find(
        (supplier) => supplier.id === selectedSupplierId,
      ) ?? getCalculationSupplier(ingredient)
    );
  }, [ingredient, selectedSupplierId]);

  const snapPoints = useMemo(() => ["90%"], []);
  const maxDynamicContentSize = useMemo(
    () => windowHeight * 0.9,
    [windowHeight],
  );

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior="close"
      />
    ),
    [],
  );

  return (
    <BottomSheetModal
      ref={ref}
      index={0}
      enableDynamicSizing
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      snapPoints={snapPoints}
      maxDynamicContentSize={maxDynamicContentSize}
      onDismiss={onDismiss}
    >
      <BottomSheetView
        style={[styles.content, { paddingBottom: insets.bottom + 16 }]}
      >
        {ingredient ? (
          <>
            <View style={styles.header}>
              <View style={styles.headerCopy}>
                <Text variant="title" numberOfLines={2}>
                  {ingredient.name}
                </Text>
                {categoryName ? (
                  <Text variant="caption" color="textSecondary">
                    {categoryName}
                  </Text>
                ) : null}
              </View>

              {!hideButtons ? (
                <View style={styles.actions}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Edit ${ingredient.name}`}
                    style={({ pressed }) => [
                      styles.actionButton,
                      pressed && styles.actionButtonPressed,
                    ]}
                    onPress={() => onEdit(ingredient)}
                  >
                    <UniSymbol
                      name={{ ios: "pencil", android: "edit", web: "edit" }}
                      size={16}
                    />
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Delete ${ingredient.name}`}
                    style={({ pressed }) => [
                      styles.actionButton,
                      pressed && styles.actionButtonPressed,
                    ]}
                    onPress={() => onDelete(ingredient)}
                  >
                    <UniDangerSymbol
                      name={{ ios: "trash", android: "delete", web: "delete" }}
                      size={16}
                    />
                  </Pressable>
                </View>
              ) : null}
            </View>

            {ingredient.suppliers.length > 0 ? (
              <>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyboardShouldPersistTaps="always"
                  contentContainerStyle={styles.supplierPills}
                >
                  {ingredient.suppliers.map((supplier, index) => (
                    <Pill
                      key={supplier.id}
                      selected={selectedSupplierId === supplier.id}
                      onPress={() => setSelectedSupplierId(supplier.id)}
                    >
                      {supplierDisplayName(supplier, index)}
                    </Pill>
                  ))}
                </ScrollView>

                {selectedSupplier ? (
                  <Card style={styles.detailsCard}>
                    <DetailRow
                      label="Supplier"
                      value={supplierDisplayName(
                        selectedSupplier,
                        Math.max(
                          0,
                          ingredient.suppliers.findIndex(
                            (item) => item.id === selectedSupplier.id,
                          ),
                        ),
                      )}
                    />
                    <DetailRow
                      label="Pack size"
                      value={formatSupplierPackSize(selectedSupplier)}
                      withDivider
                    />
                    <DetailRow
                      label="Pack price"
                      value={`${symbol}${formatPrice(toNumber(selectedSupplier.itemPrice))}`}
                      withDivider
                    />
                    <DetailRow
                      label={`Usable cost per ${costUnitLabel(selectedSupplier.itemSizeUnit)}`}
                      value={formatSupplierUsableCost(selectedSupplier, symbol)}
                      withDivider
                    />
                  </Card>
                ) : null}
              </>
            ) : (
              <Text variant="caption" color="textSecondary">
                No suppliers for this ingredient.
              </Text>
            )}
          </>
        ) : null}
      </BottomSheetView>
    </BottomSheetModal>
  );
};

const styles = StyleSheet.create((theme) => ({
  content: {
    gap: theme.gap(2),
    paddingHorizontal: theme.gap(3),
    paddingTop: theme.gap(1),
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: theme.gap(2),
  },
  headerCopy: {
    flex: 1,
    gap: theme.gap(0.5),
  },
  actions: {
    flexDirection: "row",
    gap: theme.gap(1),
  },
  actionButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  actionButtonPressed: {
    opacity: 0.7,
  },
  supplierPills: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.gap(1),
  },
  detailsCard: {
    padding: 0,
    gap: 0,
    overflow: "hidden",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.gap(2),
    paddingVertical: theme.gap(2),
    paddingHorizontal: theme.gap(2.5),
  },
  detailValue: {
    flexShrink: 1,
    textAlign: "right",
    fontFamily: theme.fontFamily.medium,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
  },
}));
