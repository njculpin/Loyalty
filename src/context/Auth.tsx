import { createContext, useContext } from "react";
import { useState, useEffect, useRef } from "react";
import SocialLogin from "@biconomy/web3-auth";
import { ChainId } from "@biconomy/core-types";
import SmartAccount from "@biconomy/smart-account";
import { ethers } from "ethers";

type AuthContextType = {
  Logout: () => void;
  Login: () => void;
  smartAccount: any;
  loading: boolean;
};

const authContext = createContext<AuthContextType | null>(null);

// @ts-ignore
export function AuthProvider({ children }) {
  const auth = useAuthProvider();
  return <authContext.Provider value={auth}>{children}</authContext.Provider>;
}

export const useAuth = () => {
  return useContext(authContext);
};

function useAuthProvider() {
  const [loading, setLoading] = useState<boolean>(false);
  const [smartAccount, setSmartAccount] = useState<SmartAccount | null>(null);
  const [interval, enableInterval] = useState<boolean>(false);
  const sdkRef = useRef<SocialLogin | null>(null);

  useEffect(() => {
    let configureLogin: any;
    if (interval) {
      configureLogin = setInterval(() => {
        if (!!sdkRef.current?.provider) {
          setupSmartAccount();
          clearInterval(configureLogin);
        }
      }, 1000);
    }
    console.log("interval", interval);
  }, [interval]);

  const Login = async () => {
    console.log("sdkRef", sdkRef);
    if (!sdkRef.current) {
      const socialLoginSDK = new SocialLogin();
      // @ts-ignore
      await socialLoginSDK.init(ethers.utils.hexValue(ChainId.POLYGON_MAINNET));
      sdkRef.current = socialLoginSDK;
    }
    if (!sdkRef.current.provider) {
      // @ts-ignore
      sdkRef.current.showWallet();
      enableInterval(true);
    } else {
      setupSmartAccount();
    }
  };

  const setupSmartAccount = async () => {
    if (!sdkRef?.current?.provider) {
      return;
    }
    setLoading(true);
    sdkRef.current.hideWallet();
    const web3Provider = new ethers.providers.Web3Provider(
      sdkRef.current.provider
    );
    try {
      const smartAccount = new SmartAccount(web3Provider, {
        activeNetworkId: ChainId.POLYGON_MAINNET,
        supportedNetworksIds: [ChainId.POLYGON_MAINNET],
      });
      await smartAccount.init();
      setSmartAccount(smartAccount);
      setLoading(false);
    } catch (err) {
      console.log(err);
    }
  };

  const Logout = async () => {
    if (!sdkRef.current) {
      console.log("Web3 Modal not initialized");
      return;
    }
    await sdkRef.current.logout();
    sdkRef.current.hideWallet();
    setSmartAccount(null);
    enableInterval(false);
  };

  return {
    Logout,
    Login,
    smartAccount,
    loading,
  };
}
