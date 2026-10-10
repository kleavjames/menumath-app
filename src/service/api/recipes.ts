import { parseRecipe } from "@/helpers/recipe";
import { ApiError, ApiErrorPayload } from "@/types/common";
import { RecipeIngredientPayload } from "@/types/ingredient";
import { Recipe } from "@/types/recipe";
import client from "./client";

export interface CreateRecipePayload {
  businessId: string;
  categoryId: string;
  name: string;
  servings: number;
  pricePerServing: number;
  costPerServing: number;
  recipeCost: number;
  profit: number;
  margin: number;
  ingredients: RecipeIngredientPayload[];
}

export const createRecipe = async (payload: CreateRecipePayload) => {
  const response = await client.post<Recipe | ApiErrorPayload>(
    "/recipes",
    payload,
  );

  if (!response.ok) {
    const payload = response.data as ApiErrorPayload;
    throw new ApiError(payload);
  }

  return parseRecipe(response.data as Recipe);
};

export const getRecipes = async (businessId: string) => {
  const response = await client.get<Recipe[] | ApiErrorPayload>(
    `/recipes?businessId=${businessId}`,
  );

  if (!response.ok) {
    const payload = response.data as ApiErrorPayload;
    throw new ApiError(payload);
  }

  return (response.data as Recipe[]).map(parseRecipe);
};
