export enum BusinessType {
  CAFE = "CAFE",
  RESTAURANT = "RESTAURANT",
  BAKERY = "BAKERY",
  FOOD_TRUCK = "FOOD_TRUCK",
  CATERING = "CATERING",
  BAR = "BAR",
}

export enum UnitSystem {
  METRIC = "METRIC",
  IMPERIAL = "IMPERIAL",
  BOTH = "BOTH",
}

export enum CategoryType {
  INGREDIENT = "INGREDIENT",
  RECIPE = "RECIPE",
}

export enum Currency {
  USD = "USD",
  PHP = "PHP",
  EUR = "EUR",
  GBP = "GBP",
  CAD = "CAD",
  AUD = "AUD",
  NZD = "NZD",
  JPY = "JPY",
  SGD = "SGD",
  INR = "INR",
  MXN = "MXN",
}

export enum MetricUnit {
  KG = "KG",
  G = "G",
  L = "L",
  ML = "ML",
  LB = "LB",
  OZ = "OZ",
  EACH = "EACH",
}

export type UnitOption = {
  label: string;
  value: string;
  /** Smaller unit used for the secondary cost line, e.g. kg -> g. */
  subUnit?: { label: string; perUnit: number };
};

export interface Business {
  id: string;
  name: string;
  type: BusinessType;
  currency: Currency;
  targetFoodCost: string;
  unitSystem?: UnitSystem;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  businessId: string;
  createdAt: string;
  updatedAt: string;
}
