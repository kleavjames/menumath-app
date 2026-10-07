import { ApiError, ApiErrorPayload } from "../../types/common";
import { User } from "../../types/user";
import client from "./client";

interface SignInResponse {
  accessToken: string;
  user: User;
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

export const signOut = async () => {
  const response = await client.post("/auth/logout");

  if (!response.ok) {
    const payload = response.data as ApiErrorPayload;
    throw new ApiError(payload);
  }
};
