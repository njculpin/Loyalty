import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  wallet: null | string;
  login: (wallet: string) => Promise<void>;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      wallet: null,
      login: async (wallet) => {
        set({ wallet: wallet });
      },
    }),
    {
      name: "auth",
    }
  )
);

export default useAuthStore;
