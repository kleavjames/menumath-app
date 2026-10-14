import { AuthResponse } from "@/service/api";
import { Business, Membership, MembershipRole, User } from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface UserBusinessState {
  user: User | null;
  membership: Membership | null;
  business: Business | null;
  businessId: string | null;
  role: MembershipRole | null;
}

interface AccountUserState extends UserBusinessState {
  setAccountUser: (user: AuthResponse) => void;
  setUpdatedBusiness: (business: Business) => void;
  setUpdatedUser: (user: User) => void;
  clearAccountUser: () => void;
}

const initialState: UserBusinessState = {
  user: null,
  membership: null,
  business: null,
  businessId: null,
  role: null,
};

export const useAccountUserStore = create<AccountUserState>()(
  persist(
    (set) => ({
      ...initialState,
      setUpdatedUser: (user) => set({ user }),
      setUpdatedBusiness: (business) => set({ business }),
      setAccountUser: (account) => {
        const { membership, business, user } = account;

        set({
          user,
          membership,
          business,
          businessId: business.id,
          role: membership.role,
        });
      },
      clearAccountUser: () =>
        set({
          ...initialState,
        }),
    }),
    {
      name: "account-user-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
