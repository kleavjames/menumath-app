import { Business, Membership, MembershipRole, User } from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface UserBusinessState {
  user: User | null;
  membership: Membership | null;
  teamMembers: Membership[];
  business: Business | null;
  businessId: string | null;
  role: MembershipRole | null;
}

interface AccountUserState extends UserBusinessState {
  setAccountUser: (user: User) => void;
  clearAccountUser: () => void;
}

const initialState: UserBusinessState = {
  user: null,
  teamMembers: [],
  membership: null,
  business: null,
  businessId: null,
  role: null,
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
          teamMembers: memberships,
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
