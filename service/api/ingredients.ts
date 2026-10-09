import { CategoryType, MetricUnit } from "../../types/business";
import { ApiError, ApiErrorPayload } from "../../types/common";
import { Ingredient } from "../../types/ingredient";
import client from "./client";

export interface CreateIngredientPayload {
  name: string;
  businessId: string;
  categoryId: string;
  supplier: string;
  itemSize: number;
  itemSizeUnit: MetricUnit;
  itemPrice: number;
  usableCostPerItem: number;
}

export const createIngredient = async (payload: CreateIngredientPayload) => {
  const response = await client.post<Ingredient | ApiErrorPayload>(
    "/ingredients",
    payload,
  );

  if (!response.ok) {
    const payload = response.data as ApiErrorPayload;
    throw new ApiError(payload);
  }

  return response.data as Ingredient;
};

export type UpdateIngredientPayload = Partial<
  Omit<CreateIngredientPayload, "businessId">
>;

export const updateIngredient = async (
  id: string,
  payload: UpdateIngredientPayload,
) => {
  const response = await client.patch<Ingredient | ApiErrorPayload>(
    `/ingredients/${id}`,
    payload,
  );

  if (!response.ok) {
    const payload = response.data as ApiErrorPayload;
    throw new ApiError(payload);
  }

  return response.data as Ingredient;
};

export const deleteIngredient = async (id: string) => {
  const response = await client.delete<Ingredient | ApiErrorPayload>(
    `/ingredients/${id}`,
  );

  if (!response.ok) {
    const payload = response.data as ApiErrorPayload;
    throw new ApiError(payload);
  }
};

export const getIngredients = async (
  businessId: string,
  type: CategoryType,
) => {
  const response = await client.get<Ingredient[] | ApiErrorPayload>(
    `/ingredients?businessId=${businessId}&type=${type}`,
  );

  if (!response.ok) {
    const payload = response.data as ApiErrorPayload;
    throw new ApiError(payload);
  }

  return response.data as Ingredient[];
};
