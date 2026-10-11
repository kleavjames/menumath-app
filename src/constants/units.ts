import { Currency, MetricUnit, UnitOption } from "@/types";

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
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

export const METRIC_OPTIONS: UnitOption[] = [
  {
    label: "kg",
    value: MetricUnit.KG,
    subUnit: { label: MetricUnit.G, perUnit: 1000 },
  },
  { label: "g", value: MetricUnit.G },
  {
    label: "L",
    value: MetricUnit.L,
    subUnit: { label: MetricUnit.ML, perUnit: 1000 },
  },
  { label: "tsp", value: MetricUnit.TSP },
  { label: "tbsp", value: MetricUnit.TBSP },
  { label: "dozen", value: MetricUnit.DOZEN },
  { label: "each", value: MetricUnit.EACH },
];

export const IMPERIAL_OPTIONS: UnitOption[] = [
  {
    label: "oz",
    value: MetricUnit.OZ,
    subUnit: { label: MetricUnit.LB, perUnit: 16 },
  },
  {
    label: "gal",
    value: MetricUnit.GAL,
    subUnit: { label: MetricUnit.OZ, perUnit: 128 },
  },
  { label: "cup", value: MetricUnit.CUP },
  {
    label: "lb",
    value: MetricUnit.LB,
    subUnit: { label: MetricUnit.OZ, perUnit: 16 },
  },
  { label: "each", value: MetricUnit.EACH },
  { label: "dozen", value: MetricUnit.DOZEN },
];
