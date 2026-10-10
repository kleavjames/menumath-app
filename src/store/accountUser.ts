import { Business } from "@/types/business";
import { Membership, User } from "@/types/user";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface UserBusinessState {
  user: User | null;
  membership: Membership | null;
  business: Business | null;
  businessId: string | null;
}

interface AccountUserState extends UserBusinessState {
  setAccountUser: (user: User) => void;
  clearAccountUser: () => void;
}

const initialState: UserBusinessState = {
  user: null,
  membership: null,
  business: null,
  businessId: null,
};

export const useAccountUserStore = create<AccountUserState>()(
  persist(
    (set) => ({
      ...initialState,
      setAccountUser: (user) => {
        const { memberships } = user;
        const membership = memberships[0];
        const business = membership.business;

        set({
          user,
          membership,
          business,
          businessId: business.id,
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
