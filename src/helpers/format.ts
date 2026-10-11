import { MembershipRole } from "@/types/user";

export const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

export const formatRole = (role?: MembershipRole | null) => {
  if (!role) return "—";
  return `${role.charAt(0)}${role.slice(1).toLowerCase()}`;
};

export const formatCapitalized = (value: string) => {
  const lower = value.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
};
