import { useAuthStore } from "@/store/auth";
import React, { createContext, PropsWithChildren, useContext } from "react";

export const AuthContext = createContext<{
  login: (token: string) => void;
  logout: () => void;
  token?: string | null;
  loading: boolean;
}>({
  login: () => null,
  logout: () => null,
  token: null,
  loading: false,
});

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth must be wrapped in a <AuthProvider />");
  }

  return value;
}

export function AuthProvider({ children }: PropsWithChildren) {
  const { token, loading, setToken } = useAuthStore();

  return (
    <AuthContext.Provider
      value={{
        login: (token: string) => {
          setToken(token);
        },
        logout: () => {
          setToken(null);
        },
        token,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
