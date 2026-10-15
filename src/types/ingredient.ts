import { MetricUnit } from "./business";

export interface Ingredient {
  id: string;
  businessId: string;
  categoryId: string;
  name: string;
  calculationSupplierId: string;
  suppliers: Supplier[];
  createdAt: string;
  updatedAt: string;
}

export interface Supplier {
  id: string;
  ingredientId: string;
  name: string;
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
