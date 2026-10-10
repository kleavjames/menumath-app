import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
  type BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import { SymbolView } from "expo-symbols";
import { useCallback, useMemo, type Ref } from "react";
import { Pressable, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet, withUnistyles } from "react-native-unistyles";

import { Card, Text } from "@/components/atoms";
import { BigInfoCard } from "@/components/templates/BigInfoCard";
import { UNIT_OPTIONS } from "@/constants/units";
import { formatAmount, formatPrice, toNumber } from "@/helpers/money";
import { formatPackSize, unitLabel } from "@/helpers/unit";
import { Ingredient } from "@/types/ingredient";

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
      <Text style={styles.detailValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  </View>
);

export const IngredientView = ({
  ref,
  ingredient,
  categoryName,
  symbol,
  onEdit,
  onDelete,
  onDismiss,
}: IngredientViewProps) => {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();

  // Dynamic sizing adds a content-height snap (index 0); 90% is the expanded snap.
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

  // `usableCostPerItem` is stored per sub unit (e.g. g) when the unit has one,
  // otherwise per unit — mirror the breakdown shown on the create screen.
  const renderCost = (item: Ingredient) => {
    const option = UNIT_OPTIONS.find((o) => o.value === item.itemSizeUnit);
    const stored = toNumber(item.usableCostPerItem);
    const subUnit = option?.subUnit;

    const perUnit = subUnit ? stored * subUnit.perUnit : stored;

    return {
      label: `Usable cost per ${unitLabel(item.itemSizeUnit)}`,
      value: `${symbol}${formatPrice(perUnit)}`,
      subValue: subUnit
        ? `${symbol}${formatAmount(stored)} per ${unitLabel(subUnit.label)}`
        : undefined,
    };
  };

  const cost = ingredient ? renderCost(ingredient) : null;

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
        {ingredient && cost ? (
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
            </View>

            <BigInfoCard
              label={cost.label}
              value={cost.value}
              subValue={cost.subValue}
            />

            <Card style={styles.detailsCard}>
              <DetailRow label="Supplier" value={ingredient.supplier || "—"} />
              <DetailRow
                label="Pack size"
                value={formatPackSize(ingredient)}
                withDivider
              />
              <DetailRow
                label="Pack price"
                value={`${symbol}${formatPrice(toNumber(ingredient.itemPrice))}`}
                withDivider
              />
            </Card>
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
    fontFamily: theme.fontFamily.medium,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
  },
}));
