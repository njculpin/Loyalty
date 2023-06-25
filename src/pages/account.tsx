import useStore from "@/lib/useStore";
import useAuthStore from "@/lib/store";
import { db } from "../firebase";
import {
  doc,
  collection,
  query,
  where,
  runTransaction,
  setDoc,
  onSnapshot,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Wallet } from "../types";

export default function Account() {
  const store = useStore(useAuthStore, (state) => state);
  const [patronCount, setPatronCount] = useState<number>(0);
  const [promotionsCount, setPromotionsCount] = useState<number>(0);
  const [wallet, setWallet] = useState<Wallet>({
    address: "",
    coins: 0,
    points: 0,
  });

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
      const q = doc(db, "wallets", `${store?.wallet}`);
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
      const currentTime = new Date().getTime();
      const walletRef = doc(db, "wallets", `${store?.wallet}`);
      await runTransaction(db, async (transaction) => {
        const document = await transaction.get(walletRef);
        if (!document.exists()) {
          return;
        }
        const oldData = document.data();
        const oldPoint = oldData.points;
        const oldCoins = oldData.coins;
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

  return (
    <div className="mx-auto max-w-7xl p-16">
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
                    {wallet.points}
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
                    {wallet.coins}
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
        <h3 className="text-base font-semibold leading-6 text-gray-900">
          NFTs
        </h3>
      </div>
    </div>
  );
}
