import { useState, useEffect, useRef } from "react";
import { ChainId } from "@biconomy/core-types";
import { ethers } from "ethers";
import useStore from "../store";
import { loyaltyManagerAddress } from "../../config";

export default function Mint() {
  const smartAccount = useStore((state: any) => state.smartAccount);

  const mint = async () => {
    if (!smartAccount) return;
    console.log("smartAccount: ", smartAccount);

    const tokenURI = "1.json";

    const mintVendorCard = new ethers.utils.Interface([
      "function mintVendorCard(string memory _tokenURI)",
    ]);

    const encodedData = mintVendorCard.encodeFunctionData("mintVendorCard", [
      tokenURI,
    ]);

    const tx = {
      to: loyaltyManagerAddress,
      data: encodedData,
    };

    smartAccount.on("txHashGenerated", (response: any) => {
      console.log("txHashGenerated event received via emitter", response);
    });
    smartAccount.on("onHashChanged", (response: any) => {
      console.log("onHashChanged event received via emitter", response);
    });
    smartAccount.on("txMined", (response: any) => {
      console.log("txMined event received via emitter", response);
    });
    smartAccount.on("error", (response: any) => {
      console.log("error event received via emitter", response);
    });

    const txResponse = await smartAccount.sendTransaction({
      transaction: tx,
    });
    console.log("userOp hash", txResponse);

    const txReciept = await txResponse.wait();
    console.log("Tx hash", txReciept.transactionHash);
  };

  return (
    <div className="space-y-12">
      <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="relative isolate overflow-hidden bg-gray-900 px-6 py-24 text-center shadow-2xl sm:rounded-3xl sm:px-16">
          <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Earn Loyalty
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-300">
            LYLT is a two way incentive system specifically designed for small
            business and their customers. Choose your card flavor below to get
            started. Its completely free and anonymous. If you are a business
            owner looking for an incentive program for your customers, choose
            the vendor card. If you are a customer, choose the loyalty card.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <a
              onClick={mint}
              className="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Get a Loyalty Card
            </a>
            <a
              onClick={mint}
              className="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Get a Vendor Card
            </a>
          </div>
          <svg
            viewBox="0 0 1024 1024"
            className="absolute left-1/2 top-1/2 -z-10 h-[64rem] w-[64rem] -translate-x-1/2 [mask-image:radial-gradient(closest-side,white,transparent)]"
            aria-hidden="true"
          >
            <circle
              cx={512}
              cy={512}
              r={512}
              fill="url(#827591b1-ce8c-4110-b064-7cb85a0b1217)"
              fillOpacity="0.7"
            />
            <defs>
              <radialGradient id="827591b1-ce8c-4110-b064-7cb85a0b1217">
                <stop stopColor="#7775D6" />
                <stop offset={1} stopColor="#E935C1" />
              </radialGradient>
            </defs>
          </svg>
        </div>
      </div>
    </div>
  );
}
