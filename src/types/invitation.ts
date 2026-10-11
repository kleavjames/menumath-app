export interface Invitation {
  id: string;
  code: string;
  businessId: string;
  role: string;
  createdByUserId: string;
  expiresAt: string;
  revokedAt: string | null;
  createdAt: string;
}
