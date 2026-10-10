import { UNIT_OPTIONS } from "@/constants/units";
import { formatAmount, formatPrice, toNumber } from "@/helpers/money";
import { MetricUnit } from "@/types/business";
import { Ingredient } from "@/types/ingredient";

export const unitLabel = (unit: MetricUnit | string) =>
  UNIT_OPTIONS.find((option) => option.value === unit)?.label ?? unit;

const costUnitLabel = (unit: MetricUnit) => {
  const option = UNIT_OPTIONS.find((item) => item.value === unit);
  if (option?.subUnit) return unitLabel(option.subUnit.label);
  return option?.label ?? unit;
};

export const formatPackSize = (ingredient: Ingredient) =>
  `${formatAmount(toNumber(ingredient.itemSize))} ${unitLabel(ingredient.itemSizeUnit)}`;

export const formatUnitCost = (ingredient: Ingredient, symbol: string) =>
  `${symbol}${formatAmount(toNumber(ingredient.usableCostPerItem))}/${costUnitLabel(ingredient.itemSizeUnit)}`;

export const formatPackPrice = (ingredient: Ingredient, symbol: string) =>
  `${symbol}${formatPrice(toNumber(ingredient.itemPrice))}`;
