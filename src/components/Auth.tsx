import { useState, useEffect, useRef } from "react";
import SocialLogin from "@biconomy/web3-auth";
import { ChainId } from "@biconomy/core-types";
import SmartAccount from "@biconomy/smart-account";
import { ethers } from "ethers";
import useStore from "../store";
import { loginFirebase, logoutFirebase } from "../firebase";

export default function Auth() {
  const [loading, setLoading] = useState<boolean>(false);
  const [interval, enableInterval] = useState<boolean>(false);
  const sdkRef = useRef<SocialLogin | null>(null);

  const smartAccount = useStore((state: any) => state.smartAccount);
  const actions = useStore((state: any) => state.actions);

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

      actions.setProvider(web3Provider);
      actions.setSmartAccount(smartAccount);
      await loginFirebase(smartAccount?.address);
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
    actions.setSmartAccount(null);
    await logoutFirebase();
    enableInterval(false);
  };

  return (
    <div className="w-full flex justify-center items-center">
      {!smartAccount && !loading && (
        <button
          onClick={Login}
          className="w-32 rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          Login
        </button>
      )}
      {loading && <p>Loading</p>}
      {/* {smartAccount && (
        <div className="w-full flex flex-col justify-center items-center mt-8">
          <button
            onClick={Logout}
            className="w-32 rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white mt-4"
          >
            Logout
          </button>
        </div>
      )} */}
    </div>
  );
}
