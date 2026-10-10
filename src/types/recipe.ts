import { MetricUnit } from "./business";
import { Ingredient } from "./ingredient";

export interface Recipe {
  id: string;
  businessId: string;
  categoryId: string;
  name: string;
  servings: number;
  pricePerServing: number;
  costPerServing: number;
  recipeCost: number;
  profit: number;
  margin: number;
  steps: RecipeStep[];
  createdAt: string;
  updatedAt: string;
  ingredients: RecipeIngredient[];
}

export interface RecipeIngredient {
  id: string;
  recipeId: string;
  ingredientId: string;
  quantity: string;
  pricePerUnit: number;
  unit: MetricUnit;
  ingredient: Ingredient;
}

/** Method step sent when creating or updating a recipe. */
export interface RecipeStep {
  order: number;
  text: string;
}
