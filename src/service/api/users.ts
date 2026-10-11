import { ApiError, ApiErrorPayload, TeamMember } from "@/types";
import client from "./client";

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
