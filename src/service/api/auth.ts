import { Business, BusinessType, Currency } from "@/types/business";
import { ApiError, ApiErrorPayload } from "@/types/common";
import { Membership, User } from "@/types/user";
import client from "./client";

interface SignInResponse {
  accessToken: string;
  user: User;
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

interface SignUpResponse {
  accessToken: string;
  user: User;
  business: Business;
  memberships: Membership;
}

export const signIn = async (username: string, password: string) => {
  const response = await client.post<SignInResponse | ApiErrorPayload>(
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

  return response.data as SignInResponse;
};

export const signUp = async (payload: SignUpPayload) => {
  const response = await client.post<SignUpResponse | ApiErrorPayload>(
    "/auth/sign-up",
    payload,
  );

  if (!response.ok) {
    const payload = response.data as ApiErrorPayload;
    throw new ApiError(payload);
  }

  return response.data as SignUpResponse;
};

export const signOut = async () => {
  const response = await client.post("/auth/logout");

  if (!response.ok) {
    const payload = response.data as ApiErrorPayload;
    throw new ApiError(payload);
  }
};
