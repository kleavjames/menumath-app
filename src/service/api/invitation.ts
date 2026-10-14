import { ApiError, ApiErrorPayload, Invitation } from "@/types";
import { AuthResponse } from "./auth";
import client from "./client";

export interface CreateInvitationPayload {
  businessId: string;
  role: string;
  expiresInDays: number;
}

export interface RedeemCodePayload {
  code: string;
  fullName: string;
  username: string;
  password: string;
}

export const generateCode = async (payload: CreateInvitationPayload) => {
  const response = await client.post<Invitation | ApiErrorPayload>(
    "/invitation/generate",
    payload,
  );

  if (!response.ok) {
    const payload = response.data as ApiErrorPayload;
    throw new ApiError(payload);
  }

  return response.data as Invitation;
};

export const redeemCode = async (payload: RedeemCodePayload) => {
  const response = await client.post<AuthResponse | ApiErrorPayload>(
    "/invitation/accept",
    payload,
  );

  if (!response.ok) {
    const payload = response.data as ApiErrorPayload;
    throw new ApiError(payload);
  }

  return response.data as AuthResponse;
};
