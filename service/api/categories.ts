import { ApiError } from "../../types/common";

import { Category, CategoryType } from "../../types/business";
import { ApiErrorPayload } from "../../types/common";
import client from "./client";

interface CreateCategoryPayload {
  name: string;
  type: CategoryType;
  businessId: string;
}

export const getCategories = async (businessId: string, type: CategoryType) => {
  const response = await client.get<Category[] | ApiErrorPayload>(
    `/categories?businessId=${businessId}&type=${type}`,
  );

  if (!response.ok) {
    const payload = response.data as ApiErrorPayload;
    throw new ApiError(payload);
  }

  return response.data as Category[];
};

export const createCategory = async (payload: CreateCategoryPayload) => {
  const response = await client.post<Category | ApiErrorPayload>(
    "/categories",
    payload,
  );

  if (!response.ok) {
    const payload = response.data as ApiErrorPayload;
    throw new ApiError(payload);
  }

  return response.data;
};
