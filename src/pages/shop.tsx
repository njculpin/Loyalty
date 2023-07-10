import { useEffect, Fragment, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  runTransaction,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import useStore from "@/lib/useStore";
import useAuthStore from "@/lib/store";
import { NFT, Wallet } from "../types";
import { useRouter } from "next/router";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon, FaceFrownIcon } from "@heroicons/react/20/solid";
import { CheckIcon } from "@heroicons/react/24/outline";

const Shop = () => {
  const router = useRouter();
  const store = useStore(useAuthStore, (state) => state);
  const [nfts, setNFTS] = useState<NFT[]>([]);
  const [wallet, setWallet] = useState<Wallet>({
    address: "",
    coins: 0,
    points: 0,
  });
  const [showError, setShowError] = useState<boolean>(false);
  const [openModal, setOpenModal] = useState<boolean>(false);

  useEffect(() => {
    const queryBalance = async () => {
      if (!store?.wallet) {
        return;
      }
      const q = doc(db, "wallets", store?.wallet);
      const unsubscribe = onSnapshot(q, async (document) => {
        if (document.exists()) {
          const data = document.data() as Wallet;
          setWallet(data);
        }
      });
      return unsubscribe;
    };
    if (store?.wallet) {
      queryBalance();
    }
  }, [store?.wallet]);

  useEffect(() => {
    if (store?.wallet) {
      const q = query(collection(db, "nfts"), where("forSale", "==", true));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const mapped = querySnapshot.docs.map(async function (doc) {
          const data = doc.data();
          return { ...data, id: doc.id } as unknown as NFT;
        });
        Promise.all(mapped).then((result) => {
          setNFTS(result);
        });
      });
      return unsubscribe;
    }
  }, [store?.wallet]);

  const buyNFT = async (nftId: string, seller: string, price: number) => {
    try {
      if (!store?.wallet) {
        return;
      }
      const lyltBalance = wallet?.coins ? wallet?.coins : 0;
      if (lyltBalance < price) {
        setShowError(true);
        throw "You dont have enough LYLT";
      }
      const currentTime = new Date().getTime();
      const walletRef = doc(db, "wallets", store?.wallet);
      // update buyer
      await runTransaction(db, async (transaction) => {
        const doc = await transaction.get(walletRef);
        if (!doc.exists()) {
          throw "Document does not exist!";
        }
        const oldData = doc.data().coins;
        if (oldData < price) {
          throw "not enough coins";
        }
        const newCoins = oldData - price;
        console.log("buyer address", store?.wallet, "coins", newCoins);
        transaction.update(walletRef, {
          coins: newCoins,
          updatedAt: currentTime,
        });
      });
      // update seller
      console.log("seller address", seller);
      const sellerRef = doc(db, "wallets", `${seller}`);
      await runTransaction(db, async (transaction) => {
        const doc = await transaction.get(sellerRef);
        if (!doc.exists()) {
          throw "Document does not exist!";
        }
        const oldData = doc.data().coins;
        if (oldData < price) {
          throw "not enough coins";
        }
        const newCoins = oldData + price;
        console.log("seller", seller, "coins", newCoins);
        transaction.update(sellerRef, {
          coins: newCoins,
          updatedAt: currentTime,
        });
      });
      // update nft owner
      console.log("nft", nftId);
      await updateDoc(doc(db, "nfts", `${nftId}`), {
        owner: store?.wallet,
        forSale: false,
        updatedAt: new Date().getTime(),
      });
      setOpenModal(true);
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  };

  const returnHome = () => {
    setOpenModal(false);
    return router.push(`/account`);
  };

  return (
    <div className="mx-auto max-w-7xl overflow-hidden sm:px-6 lg:px-8">
      <div className="mx-auto overflow-hidden px-4 lg:px-8">
        <h2 className="sr-only">Products</h2>
        {/* NFT Sales */}
        <div className="mt-8 grid grid-cols-1 gap-y-12 sm:grid-cols-3 sm:gap-x-6 xl:gap-x-8">
          {nfts.map((promotion) => (
            <div className="rounded-lg border p-4" key={promotion.id}>
              <div className="m-2 text-center space-y-2">
                <h3 className="text-2xl font-bold text-gray-900">
                  {promotion.reward} NFT
                </h3>
                <h4 className="text-xl text-gray-900">
                  from {promotion.businessName}
                </h4>
                <p>
                  Earn ${(1 / promotion.totalSupply).toFixed(8)} LYLT per tx.
                </p>
                <button
                  onClick={() =>
                    buyNFT(
                      promotion.id,
                      promotion.businessWallet,
                      promotion.price
                    )
                  }
                  className="rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
                >
                  Buy {promotion.price} LYLT
                </button>
                <p className="mt-1 text-sm text-gray-500">
                  {promotion.points} points earned.
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Success Purchase */}
      <Transition.Root show={openModal} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={setOpenModal}>
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
                        Success!
                      </Dialog.Title>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Your purchase was successful!
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-6">
                    <button
                      type="button"
                      className="inline-flex w-full justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
                      onClick={() => returnHome()}
                    >
                      Go back to dashboard
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
      <div
        aria-live="assertive"
        className="pointer-events-none fixed inset-0 flex items-end px-4 py-6 sm:items-start sm:p-6"
      >
        <div className="flex w-full flex-col items-center space-y-4 sm:items-end">
          {/* Notification panel, dynamically insert this into the live region when it needs to be displayed */}
          <Transition
            show={showError}
            as={Fragment}
            enter="transform ease-out duration-300 transition"
            enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
            enterTo="translate-y-0 opacity-100 sm:translate-x-0"
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5">
              <div className="p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <FaceFrownIcon
                      className="h-6 w-6 text-red-500"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="ml-3 w-0 flex-1 pt-0.5">
                    <p className="text-sm font-medium text-gray-900">Oops!</p>
                    <p className="mt-1 text-sm text-gray-500">
                      You dont have enough LYLT
                    </p>
                  </div>
                  <div className="ml-4 flex flex-shrink-0">
                    <button
                      type="button"
                      className="inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                      onClick={() => {
                        setShowError(false);
                      }}
                    >
                      <span className="sr-only">Close</span>
                      <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </div>
  );
};

export default Shop;
