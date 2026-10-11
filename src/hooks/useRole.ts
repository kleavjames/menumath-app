import { useAccountUserStore } from "@/store";
import { MembershipRole } from "@/types";

export const useRole = () => {
  const role = useAccountUserStore((state) => state.role);

  const isOwner = role === MembershipRole.OWNER;
  const isManager = role === MembershipRole.MANAGER;
  const isStaff = role === MembershipRole.STAFF;

  return {
    isOwner,
    isManager,
    isStaff,
  };
};
