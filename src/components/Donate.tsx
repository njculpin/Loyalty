import { useState, useEffect, useRef } from "react";
import { ethers } from "ethers";
import useStore from "../store";
import { loyaltyManagerAddress } from "../../config";

export default function Mint() {
  const smartAccount = useStore((state: any) => state.smartAccount);
  const donate = async () => {};

  return (
    <div className="space-y-12">
      <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="relative isolate overflow-hidden bg-gray-900 px-6 py-12 text-center shadow-2xl sm:rounded-3xl sm:px-16">
          <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Donate
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-300">
            LYLT requires funds to stay alive so donations are welcome, they go
            straight into a smart contract to pay for gas and that contract has
            no owner. The current contract balance is 0 ETH. You can view it
            here: 0x1234...
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <button
              onClick={donate}
              className="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Donate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
