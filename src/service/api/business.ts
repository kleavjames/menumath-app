import {
  ApiError,
  ApiErrorPayload,
  Business,
  BusinessType,
  Currency,
  UnitSystem,
} from "@/types";
import client from "./client";

export interface UpdateBusinessPayload {
  name?: string;
  type?: BusinessType;
  currency?: Currency;
  targetFoodCost?: number;
  unitSystem?: UnitSystem;
}

export const updateBusiness = async (
  businessId: string,
  payload: UpdateBusinessPayload,
) => {
  const response = await client.patch<Business | ApiErrorPayload>(
    `/business/${businessId}`,
    payload,
  );

  if (!response.ok) {
    const payload = response.data as ApiErrorPayload;
    throw new ApiError(payload);
  }

  return response.data as Business;
};
