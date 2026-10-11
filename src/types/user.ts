import { Business } from "./business";

export enum MembershipRole {
  OWNER = "OWNER",
  MANAGER = "MANAGER",
  STAFF = "STAFF",
}

export interface User {
  id: string;
  fullName: string;
  username: string;
  createdAt: string;
  updatedAt: string;
}

export interface Membership {
  id: string;
  businessId: string;
  userId: string;
  role: MembershipRole;
  createdAt: string;
  updatedAt: string;
  business: Business;
}

export interface TeamMemberShort extends Omit<Membership, "business"> {}

export interface TeamMember extends User {
  membership: TeamMemberShort;
}
