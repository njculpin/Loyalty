import { create } from "zustand";
import SmartAccount from "@biconomy/smart-account";

const useStore = create((set, get) => {
  return {
    provider: null,
    smartAccount: null,
    vendorCard: null,
    patronCard: null,
    actions: {
      setProvider: (provider: any) => {
        set({ provider: provider });
      },
      setSmartAccount: (smartAccount: SmartAccount) => {
        set({ smartAccount: smartAccount });
      },
      setVendorCard: (vendor: any) => {
        set({ vendorCard: vendor });
      },
      setPatronCard: (patron: any) => {
        set({ patronCard: patron });
      },
    },
  };
});

export default useStore;
