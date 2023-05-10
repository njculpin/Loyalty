import { useState, useEffect, useRef } from "react";
import { ethers } from "ethers";
import useStore from "../store";
import SmartAccount from "@biconomy/smart-account";
import { ChainId } from "@biconomy/core-types";
import { IBalances } from "@biconomy/node-client";
import {
  vendorCardAddress,
  patronCardAddress,
  loyaltyPointAddress,
} from "../../config";

export default function Mint() {
  const [balances, setBalances] = useState<IBalances[]>([]);
  const [gasToken, setGasToken] = useState<IBalances | null>();

  const smartAccount = useStore((state: any) => state.smartAccount);

  async function getBalance(smartAccount: SmartAccount) {
    if (!smartAccount) return;
    const balanceParams = {
      chainId: ChainId.POLYGON_MAINNET,
      eoaAddress: smartAccount.address,
      tokenAddresses: [],
    };
    /* use getAlltokenBalances and getTotalBalanceInUsd query the smartAccount */
    const balFromSdk = await smartAccount.getAlltokenBalances(balanceParams);
    console.log(balFromSdk.data);

    setBalances(balFromSdk.data);
    setGasToken(balFromSdk.data[0]);
  }

  useEffect(() => {
    if (smartAccount) {
      getBalance(smartAccount);
    }
  }, []);

  console.log("balances", balances);

  return (
    <div className="space-y-12">
      <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="relative isolate overflow-hidden bg-gray-900 px-6 py-12 text-center shadow-2xl sm:rounded-3xl sm:px-16">
          <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Wallet
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-300">
            Here are the Loyalty Assets in your Wallet:
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6"></div>
        </div>
      </div>
    </div>
  );
}
