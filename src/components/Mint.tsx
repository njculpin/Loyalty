import { useState, useEffect, useRef, Fragment } from "react";
import { ChainId } from "@biconomy/core-types";
import { ethers } from "ethers";
import useStore from "../store";
import { loyaltyManagerAddress } from "../../config";
import { Dialog, Transition } from "@headlessui/react";
import { CheckIcon } from "@heroicons/react/24/outline";
import LoyaltyManager from "../../artifacts/contracts/LoyaltyManager.sol/LoyaltyManager.json";
import axios from "axios";

export default function Mint() {
  const [open, setOpen] = useState(false);
  const [transactionHash, setTransactionHash] = useState("");
  const [tokenId, setTokenId] = useState(0);

  const provider = useStore((state: any) => state.provider);
  const smartAccount = useStore((state: any) => state.smartAccount);

  const getImage = async (type: string) => {
    if (!smartAccount) return;

    let seed = smartAccount.address;
    seed += `-${type}`;

    const contract = new ethers.Contract(
      loyaltyManagerAddress,
      LoyaltyManager.abi,
      provider
    );

    let balance = 0;
    // balance = await contract.getPatronBalance(tokenId);
    // console.log("patron balance", balance);
    seed += `-${balance}`;

    console.log("seed", seed);

    // console.log("seed", seed);
    // return axios
    //   .get(`/api/argen/${seed}`)
    //   .then((res) => res)
    //   .catch((e) => console.log(e));
  };

  const mint = async (type: string) => {
    if (!smartAccount) return;
    console.log("smartAccount: ", smartAccount);

    const image = await getImage(type);
    console.log("image", image);

    // let tx = {};

    // if (type === "patron") {
    //   let tokenURI = "patron.json";
    //   let card = new ethers.utils.Interface([
    //     "function mintPatronCard(string memory _tokenURI)",
    //   ]);
    //   let encodedData = card.encodeFunctionData("mintPatronCard", [tokenURI]);
    //   tx = {
    //     to: loyaltyManagerAddress,
    //     data: encodedData,
    //   };
    // }
    // if (type === "vendor") {
    //   let tokenURI = "vendor.json";
    //   let card = new ethers.utils.Interface([
    //     "function mintVendorCard(string memory _tokenURI)",
    //   ]);
    //   let encodedData = card.encodeFunctionData("mintVendorCard", [tokenURI]);
    //   tx = {
    //     to: loyaltyManagerAddress,
    //     data: encodedData,
    //   };
    // }

    // console.log(tx);

    // smartAccount.on("txHashGenerated", (response: any) => {
    //   console.log("txHashGenerated event received via emitter", response);
    // });
    // smartAccount.on("onHashChanged", (response: any) => {
    //   console.log("onHashChanged event received via emitter", response);
    // });
    // smartAccount.on("txMined", (response: any) => {
    //   console.log("txMined event received via emitter", response);
    // });
    // smartAccount.on("error", (response: any) => {
    //   console.log("error event received via emitter", response);
    // });

    // const txResponse = await smartAccount.sendTransaction({
    //   transaction: tx,
    // });
    // console.log("userOp hash", txResponse);

    // const txReciept = await txResponse.wait();
    // console.log("Tx hash", txReciept.transactionHash);
    // if (txReciept.transactionHash) {
    //   setOpen(true);
    //   setTransactionHash(`tx/${txReciept.transactionHash}`);
    // }
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
            <button
              onClick={() => mint("loyalty")}
              className="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Get a Loyalty Card
            </button>
            <button
              onClick={() => mint("vendor")}
              className="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Get a Vendor Card
            </button>
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
      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={setOpen}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm sm:p-6">
                  <div>
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                      <CheckIcon
                        className="h-6 w-6 text-green-600"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="mt-3 text-center sm:mt-5">
                      <Dialog.Title
                        as="h3"
                        className="text-base font-semibold leading-6 text-gray-900"
                      >
                        Request Successful
                      </Dialog.Title>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          It will take a few minutes for this request to
                          confirm, please check back again shortly.
                        </p>
                        <a href={`https://polygonscan.com/${transactionHash}`}>
                          <p className="text-sm text-purple-600 underline pt-6">
                            View transaction on Polyscan
                          </p>
                        </a>
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-6">
                    <button
                      type="button"
                      className="inline-flex w-full justify-center rounded-md bg-gray-900 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
                      onClick={() => setOpen(false)}
                    >
                      Go back to your wallet
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </div>
  );
}
