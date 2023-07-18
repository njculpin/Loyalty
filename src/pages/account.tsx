import useStore from "@/lib/useStore";
import useAuthStore from "@/lib/store";
import { db } from "../firebase";
import {
  getDoc,
  doc,
  collection,
  query,
  where,
  runTransaction,
  updateDoc,
  onSnapshot,
} from "firebase/firestore";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useEffect, useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { Wallet, NFT, Vendor } from "../types";

export default function Account() {
  const store = useStore(useAuthStore, (state) => state);
  const [patronCount, setPatronCount] = useState<number>(0);
  const [promotionsCount, setPromotionsCount] = useState<number>(0);
  const [selectedNft, setSelectedNft] = useState<NFT>({
    id: "",
    promotionId: "",
    businessCity: "",
    businessEmail: "",
    businessName: "",
    businessPhone: "",
    businessPostalCode: "",
    businessRegion: "",
    businessStreetAddress: "",
    businessCountry: "",
    businessWallet: "",
    points: 0,
    coins: 0,
    reward: "",
    price: 0,
    owner: "",
    totalSupply: 0,
    createdAt: 0,
    forSale: false,
  });
  const [nfts, setNFTS] = useState<NFT[]>([]);
  const [listedNfts, setListedNFTS] = useState<NFT[]>([]);
  const [wallet, setWallet] = useState<Wallet>({
    address: "",
    coins: 0,
    points: 0,
  });
  const [sellNFTModal, setSellNFTModal] = useState<boolean>(false);
  const [vendor, setVendor] = useState<Vendor>({
    businessCity: "",
    businessEmail: "",
    businessName: "",
    businessPhone: "",
    businessPostalCode: "",
    businessRegion: "",
    businessStreetAddress: "",
    businessCountry: "",
    businessWallet: "",
    qRUrl: "",
  });

  useEffect(() => {
    const getData = async () => {
      try {
        if (!store?.wallet) {
          return;
        }
        const docRef = doc(db, "wallets", store?.wallet);
        const docSnap = await getDoc(docRef);
        const vendorData = docSnap.data() as Vendor;
        setVendor(vendorData);
      } catch (e) {
        console.log(e);
      }
    };
    getData();
  }, [store?.wallet]);

  useEffect(() => {
    if (store?.wallet) {
      const q = query(
        collection(db, "nfts"),
        where("forSale", "==", false),
        where("owner", "==", store?.wallet)
      );
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

  useEffect(() => {
    if (store?.wallet) {
      const q = query(
        collection(db, "nfts"),
        where("forSale", "==", true),
        where("owner", "==", store?.wallet)
      );
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const mapped = querySnapshot.docs.map(async function (doc) {
          const data = doc.data();
          return { ...data, id: doc.id } as unknown as NFT;
        });
        Promise.all(mapped).then((result) => {
          setListedNFTS(result);
        });
      });
      return unsubscribe;
    }
  }, [store?.wallet]);

  useEffect(() => {
    if (store?.wallet) {
      const q = query(
        collection(db, "cards"),
        where("businessWallet", "==", store?.wallet)
      );
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const count = querySnapshot.docs.length;
        setPatronCount(count);
      });
      return unsubscribe;
    }
  }, [store?.wallet]);

  useEffect(() => {
    if (store?.wallet) {
      const q = query(
        collection(db, "promotions"),
        where("businessWallet", "==", store?.wallet)
      );
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const count = querySnapshot.docs.length;
        setPromotionsCount(count);
      });
      return unsubscribe;
    }
  }, [store?.wallet]);

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
    queryBalance();
  }, [store?.wallet]);

  const convertToLoyalty = async () => {
    try {
      if (!store?.wallet) {
        return;
      }
      const currentTime = new Date().getTime();
      const walletRef = doc(db, "wallets", store?.wallet);
      await runTransaction(db, async (transaction) => {
        const document = await transaction.get(walletRef);
        if (!document.exists()) {
          return;
        }
        const oldData = document.data();
        const oldPoint = oldData.points ? oldData.points : 0;
        const oldCoins = oldData.coins ? oldData.coins : 0;
        let newCoin = oldCoins + oldPoint;
        transaction.update(walletRef, {
          address: store?.wallet,
          points: 0,
          coins: newCoin,
          createdAt: currentTime,
          updatedAt: new Date().getTime(),
        });
      });
    } catch (e) {}
  };

  const showAddressInformation = () => {};

  const handleChange = (event: any) => {
    setSelectedNft({
      ...selectedNft,
      [event.target.id]: event.target.value,
    });
  };

  const showSelectedNft = (nft: NFT) => {
    setSellNFTModal(true);
    setSelectedNft(nft);
  };

  const delistNft = async (nftId: string) => {
    await updateDoc(doc(db, "nfts", `${nftId}`), {
      forSale: false,
      updatedAt: new Date().getTime(),
    })
      .then(() => {
        console.log("complete");
        setSellNFTModal(false);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const sellNFT = async (nftId: string, price: number) => {
    await updateDoc(doc(db, "nfts", `${nftId}`), {
      price: Number(price),
      forSale: true,
      updatedAt: new Date().getTime(),
    })
      .then(() => {
        console.log("complete");
        setSellNFTModal(false);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  return (
    <div className="mx-auto max-w-7xl p-16">
      <div className="mb-8">
        <h3 className="text-base font-semibold leading-6 text-gray-900">
          Business Details
        </h3>
        <h2>{vendor.businessName}</h2>
        <p>{vendor.businessStreetAddress}</p>
        <p>{vendor.businessCity}</p>
        <p>{vendor.businessCountry}</p>
        <p>{vendor.businessPostalCode}</p>
        <Link href={"/settings"}>
          <p className="px-4 py-2 mt-8 underline border w-32 text-center rounded-full">
            Edit
          </p>
        </Link>
      </div>
      <div>
        <h3 className="text-base font-semibold leading-6 text-gray-900">
          Account Balance
        </h3>
        <div className="flex flex-row space-x-2 text-gray-600">
          <p>{store?.wallet}</p>
          <button onClick={() => showAddressInformation()}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
              />
            </svg>
          </button>
        </div>
        <div className="border-b pb-8 my-8">
          <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-4">
            <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
              <dt className="truncate text-sm font-medium text-gray-500">
                Points
              </dt>
              <dd className="mt-1">
                <div className="flex justify-between items-center">
                  <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
                    {wallet.points.toFixed(2)}
                  </h1>
                  <button
                    type="button"
                    onClick={() => convertToLoyalty()}
                    className="rounded bg-green-600 px-2 py-1 text-xs font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
                  >
                    Convert to LYLT
                  </button>
                </div>
              </dd>
            </div>
            <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
              <dt className="truncate text-sm font-medium text-gray-500">
                LYLT
              </dt>
              <dd className="mt-1">
                <div className="flex justify-between items-center">
                  <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
                    {wallet.coins.toFixed(2)}
                  </h1>
                  <button
                    type="button"
                    className="disabled rounded bg-gray-600 px-2 py-1 text-xs font-semibold text-white shadow-sm hover:bg-gray-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
                  >
                    Send
                  </button>
                </div>
              </dd>
            </div>
            <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
              <dt className="truncate text-sm font-medium text-gray-500">
                Customers
              </dt>
              <dd className="mt-1">
                <div className="flex justify-between items-center">
                  <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
                    {patronCount}
                  </h1>
                  <Link
                    href={"/customers"}
                    className="rounded bg-green-600 px-2 py-1 text-xs font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
                  >
                    View
                  </Link>
                </div>
              </dd>
            </div>
            <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
              <dt className="truncate text-sm font-medium text-gray-500">
                Promotions
              </dt>
              <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
                <div className="flex justify-between items-center">
                  <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
                    {promotionsCount}
                  </h1>
                  <Link
                    href={"/promotions"}
                    className="rounded bg-green-600 px-2 py-1 text-xs font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
                  >
                    View
                  </Link>
                </div>
              </dd>
            </div>
          </dl>
        </div>
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-base font-semibold leading-6 text-gray-900">
              Your shares
            </h1>
            <p className="mt-2 text-sm text-gray-700">
              These are shares of promotions owned by your account
            </p>
          </div>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-y-12 sm:grid-cols-3 sm:gap-x-6 xl:gap-x-8">
          {nfts.map((nft) => (
            <div
              className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6"
              key={nft.id}
            >
              <div className="m-2 text-center space-y-2">
                <p>{nft.id}</p>
                <h3 className="text-2xl font-bold text-gray-900">
                  {nft.reward} NFT
                </h3>
                <p>{nft.points} points earned</p>
                <button
                  onClick={() => showSelectedNft(nft)}
                  className="rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
                >
                  Sell
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="sm:flex sm:items-center mt-8">
          <div className="sm:flex-auto">
            <h1 className="text-base font-semibold leading-6 text-gray-900">
              Listed Shares
            </h1>
            <p className="mt-2 text-sm text-gray-700">
              These are shares of promotions owned by your account and are for
              sale
            </p>
          </div>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-y-12 sm:grid-cols-3 sm:gap-x-6 xl:gap-x-8">
          {listedNfts.map((nft) => (
            <div
              className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6"
              key={nft.id}
            >
              <div className="m-2 text-center space-y-2">
                <p>{nft.id}</p>
                <h3 className="text-2xl font-bold text-gray-900">
                  {nft.reward} NFT
                </h3>
                <p>{nft.points} points earned</p>
                <button
                  onClick={() => delistNft(nft.id)}
                  className="rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
                >
                  Delist
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Transition.Root show={sellNFTModal} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={setSellNFTModal}>
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
                  <div className="relative flex w-full items-center overflow-hidden px-4 pb-8 pt-14 sm:px-6 sm:pt-8 md:p-6 lg:p-8">
                    <button
                      type="button"
                      className="absolute right-4 top-4 text-gray-400 hover:text-gray-500 sm:right-6 sm:top-8 md:right-6 md:top-6 lg:right-8 lg:top-8"
                      onClick={() => setSellNFTModal(false)}
                    >
                      <span className="sr-only">Close</span>
                      <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                    </button>

                    <div className="grid w-full grid-cols-1 items-start gap-x-6 gap-y-8 lg:items-center lg:gap-x-8">
                      <div className="sm:col-span-8 lg:col-span-7">
                        <h2 className="text-xl font-medium text-gray-900 sm:pr-12">
                          {selectedNft.reward} NFT
                        </h2>
                        <section
                          aria-labelledby="information-heading"
                          className="mt-1"
                        >
                          <h3 id="information-heading" className="sr-only">
                            Product information
                          </h3>
                        </section>
                        <section
                          aria-labelledby="options-heading"
                          className="mt-8"
                        >
                          <h3 id="options-heading" className="sr-only">
                            Product options
                          </h3>
                          <label
                            htmlFor="price"
                            className="block text-sm font-medium leading-6 text-black mt-4"
                          >
                            LYLT Price
                          </label>
                          <div className="mt-2">
                            <input
                              onChange={handleChange}
                              id="price"
                              name="price"
                              type="number"
                              pattern="[0-9]*"
                              required
                              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6"
                              value={selectedNft.price}
                            />
                          </div>
                          <button
                            onClick={() =>
                              sellNFT(selectedNft.id, selectedNft.price)
                            }
                            className="mt-8 flex w-full items-center justify-center rounded-md border border-transparent bg-green-600 px-8 py-3 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                          >
                            Sell
                          </button>
                        </section>
                      </div>
                    </div>
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
