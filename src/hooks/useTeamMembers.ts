import { showToast } from "@/components/atoms/Toast";
import { getTeamMembers } from "@/service/api";
import { useAccountUserStore } from "@/store";
import { ApiError, TeamMember } from "@/types";
import { useCallback, useEffect, useState } from "react";

export const useTeamMembers = () => {
  const businessId = useAccountUserStore((state) => state.businessId);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  const fetchTeamMembers = useCallback(async (bId: string) => {
    try {
      const members = await getTeamMembers(bId);
      setTeamMembers(members);
    } catch (error) {
      if (error instanceof ApiError) {
        showToast(error.message, { variant: "error" });
      } else {
        showToast("An unexpected error occurred", { variant: "error" });
      }
    }
  }, []);

  useEffect(() => {
    if (businessId) {
      fetchTeamMembers(businessId);
    }
  }, [businessId, fetchTeamMembers]);

  return { teamMembers, teamMembersCount: teamMembers.length };
};
