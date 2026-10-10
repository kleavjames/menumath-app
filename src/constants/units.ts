import { Currency, MetricUnit, UnitOption } from "@/types/business";

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

export const UNIT_OPTIONS: UnitOption[] = [
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
  { label: "mL", value: MetricUnit.ML },
  {
    label: "lb",
    value: MetricUnit.LB,
    subUnit: { label: MetricUnit.OZ, perUnit: 16 },
  },
  { label: "oz", value: MetricUnit.OZ },
  { label: "each", value: MetricUnit.EACH },
];
