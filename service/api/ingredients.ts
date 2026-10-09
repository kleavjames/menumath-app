import { MetricUnit } from "../../types/business";
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
