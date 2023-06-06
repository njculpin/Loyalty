import { create } from "zustand";
import SmartAccount from "@biconomy/smart-account";

const useStore = create((set, get) => {
  return {
    provider: null,
    smartAccount: null,
    vendorCard: null,
    patronCard: null,
    testNetwork: false,
    auth: null,
    actions: {
      setProvider: (provider: any) => {
        set({ provider: provider });
      },
      seTesttNetwork: (testNetwork: boolean) => {
        set({ testNetwork: testNetwork });
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
      setAuth: (auth: any) => {
        set({ auth: auth });
      },
    },
  };
});

export default useStore;
