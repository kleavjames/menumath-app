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
  tokenVersion: number;
  createdAt: string;
  updatedAt: string;
  memberships: Membership[];
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
