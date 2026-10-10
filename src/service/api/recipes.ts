import { ApiError, ApiErrorPayload } from "@/types/common";
import { RecipeIngredient } from "@/types/ingredient";
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
  ingredients: RecipeIngredient[];
}

export const createRecipe = async (payload: CreateRecipePayload) => {
  const response = await client.post<any | ApiErrorPayload>(
    "/recipes",
    payload,
  );

  if (!response.ok) {
    const payload = response.data as ApiErrorPayload;
    throw new ApiError(payload);
  }

  return response.data as any;
};
