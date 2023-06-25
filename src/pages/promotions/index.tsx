import useStore from "@/lib/useStore";
import useAuthStore from "@/lib/store";
import { useRouter } from "next/router";
import { db } from "../../firebase";
import {
  addDoc,
  doc,
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  runTransaction,
} from "firebase/firestore";
import Link from "next/link";
import { Fragment, useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { CheckIcon } from "@heroicons/react/24/outline";
import { Switch } from "@headlessui/react";
import { Wallet, Vendor, Promotion } from "../../types";

function classNames(...classes: any) {
  return classes.filter(Boolean).join(" ");
}

export default function Account() {
  const router = useRouter();
  const store = useStore(useAuthStore, (state) => state);
  const [openStatusModal, setOpenStatusModal] = useState<boolean>(false);
  const [promotions, setPromotions] = useState<Promotion[]>([]);

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
  });

  useEffect(() => {
    if (store?.wallet) {
      const q = doc(db, "vendors", `${store?.wallet}`);
      const unsubscribe = onSnapshot(q, (doc) => {
        const data = doc.data() as Vendor;
        setVendor(data);
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
        const mapped = querySnapshot.docs.map(async function (doc) {
          const data = doc.data();
          return { ...data, id: doc.id } as unknown as Promotion;
        });
        Promise.all(mapped).then((result) => {
          setPromotions(result);
        });
      });
      return unsubscribe;
    }
  }, [store?.wallet]);

  const updateActivePromotion = async (id: string, active: boolean) => {
    await updateDoc(doc(db, "promotions", `${id}`), {
      active: active,
      updatedAt: new Date().getTime(),
    })
      .then(() => {
        setOpenStatusModal(true);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const claimCoins = async () => {
    const currentTime = new Date().getTime();
    const vendorRef = doc(db, "wallets", `${store?.wallet}`);
    await runTransaction(db, async (transaction) => {
      const doc = await transaction.get(vendorRef);
      if (!doc.exists()) {
        throw "Document does not exist!";
      }
      let last = doc.data() as Wallet;
      let lastPoint = last.points;
      let lastCoin = last.coins;
      transaction.update(vendorRef, {
        points: 0,
        coins: lastCoin + lastPoint,
        updatedAt: currentTime,
      });
    })
      .then(async (res) => {
        console.log(res);
        // TODO: Firebase - Record Event
        return console.log("coin claim complete");
      })
      .catch((e) => {
        console.log("coin claim error", e);
      });
  };

  const mintNFT = async (id: string) => {};

  const closeModal = () => {
    setOpenStatusModal(false);
    return router.push(`/promotions`);
  };

  return (
    <div className="mx-auto max-w-7xl p-16">
      <div className="mt-16">
        <div className="mt-8 sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-base font-semibold leading-6 text-gray-900">
              Promotions
            </h1>
            <p className="mt-2 text-sm text-gray-700">
              A list of promotions running on your account and the points earned
              for that promotion. You may claim LYLT on each promotion, then
              mint them into transferable LYLT tokens.
            </p>
          </div>
          <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
            <Link
              href="/promotions/create"
              className="rounded-md bg-green-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
            >
              Create
            </Link>
          </div>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-y-12 sm:grid-cols-3 sm:gap-x-6 xl:gap-x-8">
          {promotions.map((promotion) => (
            <div className="rounded-lg border p-4" key={promotion.id}>
              <div className="m-2 space-y-2">
                <div className="flex justify-between items-center">
                  <div>
                    <h1 className="w-full text-left font-bold text-lg">
                      {promotion.reward}
                    </h1>
                    {promotion.pointsRequired > 0 && (
                      <p className="text-gray-600">
                        {promotion.pointsRequired} Points Required
                      </p>
                    )}
                    {promotion.coinsRequired > 0 && (
                      <p className="text-gray-600">
                        {promotion.coinsRequired} LYLT Required
                      </p>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-xs mr-4">
                      {promotion.active ? "Active" : "Inactive"}
                    </p>
                    <Switch
                      checked={promotion.active}
                      onChange={() =>
                        updateActivePromotion(promotion.id, !promotion.active)
                      }
                      className="group relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2"
                    >
                      <span className="sr-only">Active</span>
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute h-full w-full rounded-md bg-white"
                      />
                      <span
                        aria-hidden="true"
                        className={classNames(
                          promotion.active ? "bg-green-600" : "bg-gray-200",
                          "pointer-events-none absolute mx-auto h-4 w-9 rounded-full transition-colors duration-200 ease-in-out"
                        )}
                      />
                      <span
                        aria-hidden="true"
                        className={classNames(
                          promotion.active ? "translate-x-5" : "translate-x-0",
                          "pointer-events-none absolute left-0 inline-block h-5 w-5 transform rounded-full border border-gray-200 bg-white shadow ring-0 transition-transform duration-200 ease-in-out"
                        )}
                      />
                    </Switch>
                  </div>
                </div>
                <div className="w-full flex justify-between items-center text-center font-bold">
                  {promotion.pointsRequired > 0 && (
                    <p className="">{promotion.points} Points Earned</p>
                  )}
                  {promotion.coinsRequired > 0 && (
                    <p className="">{promotion.coins} LYLT Earned</p>
                  )}
                  <button className="relative flex items-center justify-center rounded-md border border-transparent bg-gray-100 px-8 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200">
                    Sell
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Transition.Root show={openStatusModal} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={setOpenStatusModal}>
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
                        Details Saved
                      </Dialog.Title>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Your business details have been saved.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-6">
                    <button
                      type="button"
                      className="inline-flex w-full justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
                      onClick={() => closeModal()}
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
    </div>
  );
}
