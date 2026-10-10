import { create } from "zustand";

import { BusinessType, Currency } from "@/types/business";

interface AccountState {
  fullName: string;
  username: string;
  password: string;
}

interface BusinessAccountState {
  businessName: string;
  businessType: BusinessType;
  businessCurrency: Currency;
  businessTargetFoodCost: string;
}

interface CreateAccountState extends AccountState, BusinessAccountState {
  setAccount: (account: AccountState) => void;
  setBusiness: (business: BusinessAccountState) => void;
}

export const useCreateAccountStore = create<CreateAccountState>()((set) => ({
  fullName: "",
  username: "",
  password: "",
  businessName: "",
  businessType: BusinessType.CAFE,
  businessCurrency: Currency.USD,
  businessTargetFoodCost: "",
  setAccount: (account) => set({ ...account }),
  setBusiness: (business) => set({ ...business }),
}));
