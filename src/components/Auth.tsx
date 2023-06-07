import { useState, useEffect, useRef } from "react";
import SocialLogin from "@biconomy/web3-auth";
import { ChainId } from "@biconomy/core-types";
import SmartAccount from "@biconomy/smart-account";
import { ethers } from "ethers";

import useStore from "../lib/useStore";
import useAuthStore from "../lib/store";

import { loginFirebase, logoutFirebase } from "../firebase";

export default function Auth() {
  const [interval, enableInterval] = useState<boolean>(false);
  const sdkRef = useRef<SocialLogin | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const store = useStore(useAuthStore, (state) => state);

  useEffect(() => {
    // @ts-ignore
    let configureLogin;
    if (interval) {
      configureLogin = setInterval(async () => {
        if (!!sdkRef.current?.provider) {
          await setupSmartAccount();
          // @ts-ignore
          clearInterval(configureLogin);
        }
      }, 1000);
    }
  }, [interval]);

  const Login = async () => {
    if (!sdkRef.current) {
      const socialLoginSDK = new SocialLogin();
      // @ts-ignore
      await socialLoginSDK.init(ethers.utils.hexValue(ChainId.POLYGON_MUMBAI));
      sdkRef.current = socialLoginSDK;
    }
    if (!sdkRef.current.provider) {
      sdkRef.current.showWallet();
      enableInterval(true);
    } else {
      setupSmartAccount();
    }
  };

  const setupSmartAccount = async () => {
    setLoading(true);
    if (!sdkRef?.current?.provider) {
      return;
    }
    sdkRef.current.hideWallet();

    const web3Provider = new ethers.providers.Web3Provider(
      sdkRef.current.provider
    );
    try {
      const smartAccount = new SmartAccount(web3Provider, {
        activeNetworkId: ChainId.POLYGON_MUMBAI,
        supportedNetworksIds: [ChainId.POLYGON_MUMBAI, ChainId.POLYGON_MAINNET],
        networkConfig: [
          {
            chainId: ChainId.POLYGON_MUMBAI,
            dappAPIKey: process.env.BICONOMY_TEST,
            providerUrl: process.env.ALCHEMY_TEST,
          },
          {
            chainId: ChainId.POLYGON_MAINNET,
            dappAPIKey: process.env.BICONOMY_MAIN,
            providerUrl: process.env.ALCHEMY_MAIN,
          },
        ],
      });
      await smartAccount.init();
      store?.login(smartAccount?.address);
      await loginFirebase(smartAccount?.address);
      setLoading(false);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      {!loading ? (
        <>
          {!store?.wallet ? (
            <button onClick={Login}>
              <p className="text-sm font-semibold leading-6 text-gray-900">
                Log in <span aria-hidden="true">&rarr;</span>
              </p>
            </button>
          ) : (
            <p className="w-32 text-sm font-semibold leading-6 text-gray-900 truncate">
              {store?.wallet}
            </p>
          )}
        </>
      ) : (
        <>
          <p>Loading</p>
        </>
      )}
    </>
  );
}
