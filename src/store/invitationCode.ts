import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface InvitationCodeState {
  invitationCode: string;
  expiresAt: Date | null;
  setInvitationCode: (invitationCode: string) => void;
  setExpiresAt: (expiresAt: Date) => void;
}

export const useInvitationCodeStore = create<InvitationCodeState>()(
  persist(
    (set) => ({
      invitationCode: "",
      expiresAt: null,
      setInvitationCode: (invitationCode) => set({ invitationCode }),
      setExpiresAt: (expiresAt) => set({ expiresAt }),
    }),
    {
      name: "invitation-code-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
