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
