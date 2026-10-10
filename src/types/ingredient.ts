import { MetricUnit } from "./business";

export interface Ingredient {
  id: string;
  businessId: string;
  categoryId: string;
  name: string;
  supplier: string;
  itemSize: string;
  itemSizeUnit: MetricUnit;
  itemPrice: string;
  usableCostPerItem: string;
  createdAt: string;
  updatedAt: string;
}

export interface RecipeIngredientPayload {
  ingredientId: string;
  quantity: string;
  unit: MetricUnit;
  pricePerUnit: number;
}
