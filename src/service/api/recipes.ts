import { parseRecipe } from "@/helpers";
import {
  ApiError,
  ApiErrorPayload,
  Recipe,
  RecipeIngredientPayload,
  RecipeStep,
} from "@/types";
import client from "./client";

export interface CreateRecipePayload {
  businessId: string;
  categoryId: string;
  name: string;
  servings: number;
  pricePerServing: number;
  ingredients: RecipeIngredientPayload[];
  steps: RecipeStep[];
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

export type UpdateRecipePayload = Partial<
  Omit<CreateRecipePayload, "businessId">
>;

export const getRecipe = async (id: string) => {
  const response = await client.get<Recipe | ApiErrorPayload>(`/recipes/${id}`);

  if (!response.ok) {
    const payload = response.data as ApiErrorPayload;
    throw new ApiError(payload);
  }

  return parseRecipe(response.data as Recipe);
};

export const getRecipeById = async (id: string) => {
  const response = await client.get<Recipe | ApiErrorPayload>(`/recipes/${id}`);

  if (!response.ok) {
    const payload = response.data as ApiErrorPayload;
    throw new ApiError(payload);
  }

  return parseRecipe(response.data as Recipe);
};

export const updateRecipe = async (
  id: string,
  payload: UpdateRecipePayload,
) => {
  const response = await client.patch<Recipe | ApiErrorPayload>(
    `/recipes/${id}`,
    payload,
  );

  if (!response.ok) {
    const payload = response.data as ApiErrorPayload;
    throw new ApiError(payload);
  }

  return parseRecipe(response.data as Recipe);
};

export const deleteRecipe = async (id: string) => {
  const response = await client.delete<Recipe | ApiErrorPayload>(
    `/recipes/${id}`,
  );

  if (!response.ok) {
    const payload = response.data as ApiErrorPayload;
    throw new ApiError(payload);
  }
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
