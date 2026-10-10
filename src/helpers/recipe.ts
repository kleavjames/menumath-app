import { roundTo2, toNumber } from "@/helpers/money";
import { Recipe } from "@/types/recipe";

const hasApiNumber = (value: unknown): value is string | number =>
  value !== undefined && value !== null && value !== "";

const parseApiNumber = (value: unknown): number => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    return toNumber(value);
  }
  return 0;
};

/** Normalizes API decimals (strings) and fills food cost % when absent. */
export const parseRecipe = (raw: Recipe): Recipe => {
  const pricePerServing = parseApiNumber(raw.pricePerServing);
  const costPerServing = parseApiNumber(raw.costPerServing);
  let recipeCost = parseApiNumber(raw.recipeCost);

  if (recipeCost <= 0 && pricePerServing > 0) {
    recipeCost = roundTo2((costPerServing / pricePerServing) * 100);
  }

  let profit = parseApiNumber(raw.profit);
  if (!hasApiNumber(raw.profit) && pricePerServing > 0) {
    profit = roundTo2(pricePerServing - costPerServing);
  }

  let margin = parseApiNumber(raw.margin);
  if (!hasApiNumber(raw.margin) && pricePerServing > 0) {
    margin = roundTo2((profit / pricePerServing) * 100);
  }

  return {
    ...raw,
    servings: parseApiNumber(raw.servings) || 1,
    pricePerServing,
    costPerServing,
    recipeCost,
    profit,
    margin,
  };
};
