import { METRIC_OPTIONS } from "@/constants";
import { Ingredient, MetricUnit, Supplier } from "@/types";
import { formatAmount, formatPrice, toNumber } from "./money";

/** Supplier used for recipe cost calculations and list display. */
export const getCalculationSupplier = (
  ingredient: Ingredient,
): Supplier | undefined => {
  const matched = ingredient.suppliers.find(
    (supplier) => supplier.id === ingredient.calculationSupplierId,
  );
  return matched ?? ingredient.suppliers[0];
};

export const unitLabel = (unit: MetricUnit | string) =>
  METRIC_OPTIONS.find((option) => option.value === unit)?.label ?? unit;

/** Unit that `usableCostPerItem` is expressed in, e.g. kg -> g. */
export const costUnitLabel = (unit: MetricUnit) => {
  const option = METRIC_OPTIONS.find((item) => item.value === unit);
  if (option?.subUnit) return unitLabel(option.subUnit.label);
  return option?.label ?? unit;
};

export const formatPackSize = (ingredient: Ingredient) => {
  const supplier = getCalculationSupplier(ingredient);
  if (!supplier) return "—";
  return `${formatAmount(toNumber(supplier.itemSize))} ${unitLabel(supplier.itemSizeUnit)}`;
};

export const formatUnitCost = (ingredient: Ingredient, symbol: string) => {
  const supplier = getCalculationSupplier(ingredient);
  if (!supplier) return "—";
  return `${symbol}${formatAmount(toNumber(supplier.usableCostPerItem))}/${costUnitLabel(supplier.itemSizeUnit)}`;
};

export const formatPackPrice = (ingredient: Ingredient, symbol: string) => {
  const supplier = getCalculationSupplier(ingredient);
  if (!supplier) return "—";
  return `${symbol}${formatPrice(toNumber(supplier.itemPrice))}`;
};
