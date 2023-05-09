import { create } from "zustand";
import SmartAccount from "@biconomy/smart-account";

const useStore = create((set, get) => {
  return {
    smartAccount: null,
    actions: {
      setSmartAccount: (smartAccount: SmartAccount) =>
        set({ smartAccount: smartAccount }),
    },
  };
});

export default useStore;
