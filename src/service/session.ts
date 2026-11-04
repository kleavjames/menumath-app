import { router } from "expo-router";

import {
  useAccountUserStore,
  useAuthStore,
  useInvitationCodeStore,
} from "@/store";

const PUBLIC_AUTH_ROUTES = ["/auth/sign-in", "/auth/sign-up"];

export const clearSession = () => {
  useAuthStore.getState().setToken(null);
  useAccountUserStore.getState().clearAccountUser();
  useInvitationCodeStore.getState().clearInvitationCode();
};

export const forceLogout = () => {
  clearSession();
  router.replace("/signin");
};

export const shouldForceLogoutForUnauthorized = (
  status: number | undefined,
  requestUrl: string | undefined,
): boolean => {
  if (status !== 401) {
    return false;
  }

  const url = requestUrl ?? "";
  if (PUBLIC_AUTH_ROUTES.some((route) => url.includes(route))) {
    return false;
  }

  return Boolean(useAuthStore.getState().token);
};
