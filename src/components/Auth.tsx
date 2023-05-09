import { useState, useEffect, useRef } from "react";
import SocialLogin from "@biconomy/web3-auth";
import { ChainId } from "@biconomy/core-types";
import SmartAccount from "@biconomy/smart-account";
import { ethers } from "ethers";
import useStore from "../store";

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
      configureLogin = setInterval(() => {
        if (!!sdkRef.current?.provider) {
          setupSmartAccount();
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
      await socialLoginSDK.init(ethers.utils.hexValue(ChainId.POLYGON_MAINNET));
      sdkRef.current = socialLoginSDK;
    }
    if (!sdkRef.current.provider) {
      sdkRef.current.showWallet();
      // enableInterval(true);
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
        supportedNetworksIds: [ChainId.POLYGON_MUMBAI],
      });
      await smartAccount.init();
      actions.setSmartAccount(smartAccount);
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
    enableInterval(false);
  };

  return (
    <div className="w-full">
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        {!smartAccount && !loading && (
          <div>
            <button
              onClick={Login}
              className="w-32 rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Login
            </button>
          </div>
        )}
        {loading && <p>Loading</p>}
        {smartAccount && (
          <div>
            <h3>Smart Account:</h3>
            <p>{smartAccount?.address}</p>
            <button
              onClick={Logout}
              className="w-32 rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white mt-4"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
