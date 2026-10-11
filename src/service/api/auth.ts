import {
  ApiError,
  ApiErrorPayload,
  Business,
  BusinessType,
  Currency,
  Membership,
  User,
} from "@/types";
import client from "./client";

export interface AuthResponse {
  accessToken: string;
  user: User;
  membership: Membership;
  business: Business;
}

interface SignUpPayload {
  fullName: string;
  username: string;
  password: string;
  business: {
    name: string;
    type: BusinessType;
    currency: Currency;
    targetFoodCost: number;
  };
}

export const signIn = async (username: string, password: string) => {
  const response = await client.post<AuthResponse | ApiErrorPayload>(
    "/auth/sign-in",
    {
      username,
      password,
    },
  );

  if (!response.ok) {
    const payload = response.data as ApiErrorPayload;
    throw new ApiError(payload);
  }

  return response.data as AuthResponse;
};

export const signUp = async (payload: SignUpPayload) => {
  const response = await client.post<AuthResponse | ApiErrorPayload>(
    "/auth/sign-up",
    payload,
  );

  if (!response.ok) {
    const payload = response.data as ApiErrorPayload;
    throw new ApiError(payload);
  }

  return response.data as AuthResponse;
};

export const signOut = async () => {
  const response = await client.post("/auth/logout");

  if (!response.ok) {
    const payload = response.data as ApiErrorPayload;
    throw new ApiError(payload);
  }
};
