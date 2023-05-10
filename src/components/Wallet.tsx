import { useState, useEffect, useRef } from "react";
import { ethers } from "ethers";
import useStore from "../store";
import SmartAccount from "@biconomy/smart-account";
import { ChainId } from "@biconomy/core-types";
import { IBalances } from "@biconomy/node-client";
import { Network, Alchemy } from "alchemy-sdk";
import {
  vendorCardAddress,
  patronCardAddress,
  loyaltyPointAddress,
} from "../../config";

export default function Mint() {
  const smartAccount = useStore((state: any) => state.smartAccount);
  const vendorCard = useStore((state: any) => state.vendorCard);
  const patronCard = useStore((state: any) => state.patronCard);
  const actions = useStore((state: any) => state.actions);

  const settings = {
    apiKey: process.env.ALCHEMY_TEST, // Replace with your Alchemy API Key.
    network: Network.MATIC_MUMBAI, // Replace with your network.
  };

  const alchemy = new Alchemy(settings);

  async function getBalance() {
    const vendorRes = await alchemy.nft.getNftsForOwner(smartAccount.address);
    const vendor = vendorRes.ownedNfts.find(
      (x) => x.contract.address == vendorCardAddress.toLowerCase()
    );
    actions.setVendorCard(vendor);
  }

  useEffect(() => {
    if (smartAccount) {
      getBalance();
    }
  }, []);

  console.log("vendorCard", vendorCard);

  return (
    <div className="space-y-12">
      <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="relative isolate overflow-hidden px-6 py-12 text-center shadow-2xl sm:rounded-3xl sm:px-16">
          <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Wallet
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-300">
            Here are the Loyalty Assets in your Wallet:
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6 grid-cols-2">
            {patronCard && (
              <div className="bg-gray-900 px-6 py-12 text-center shadow-2xl sm:rounded-3xl sm:px-16">
                <p className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  {patronCard.contract.name}
                </p>
                <p className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  {patronCard.contract.symbol}
                </p>
                <p>{patronCard.contract.tokenType}</p>
                <p>{patronCard.contract.deployedBlockNumber}</p>
                <p>{patronCard.contract.address}</p>
              </div>
            )}
            {vendorCard && (
              <div className="bg-gray-900 px-6 py-12 text-center shadow-2xl sm:rounded-3xl sm:px-16">
                <p className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  {vendorCard.contract.name}
                </p>
                <p className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  {vendorCard.contract.symbol}
                </p>
                <p>{vendorCard.contract.tokenType}</p>
                <p>{vendorCard.contract.deployedBlockNumber}</p>
                <p>{vendorCard.contract.address}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
