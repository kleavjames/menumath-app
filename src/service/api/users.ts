import { ApiError, ApiErrorPayload, TeamMember, User } from "@/types";
import client from "./client";

export interface UpdateUserPayload {
  fullName?: string;
  username?: string;
}

export const updateMyAccount = async (payload: UpdateUserPayload) => {
  const response = await client.patch<User | ApiErrorPayload>(
    "/users?mine=true",
    payload,
  );

  if (!response.ok) {
    const payload = response.data as ApiErrorPayload;
    throw new ApiError(payload);
  }

  return response.data as User;
};

export const getTeamMembers = async (businessId: string) => {
  const response = await client.get<TeamMember[] | ApiErrorPayload>(
    `/users?businessId=${businessId}`,
  );

  if (!response.ok) {
    const payload = response.data as ApiErrorPayload;
    throw new ApiError(payload);
  }

  return response.data as TeamMember[];
};
