import useStore from "@/lib/useStore";
import useAuthStore from "@/lib/store";
import { useRouter } from "next/router";
import { db } from "../../firebase";
import {
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

type Vendor = {
  businessCity: string;
  businessEmail: string;
  businessName: string;
  businessPhone: string;
  businessPostalCode: string;
  businessRegion: string;
  businessStreetAddress: string;
  businessCountry: string;
  businessWallet: string;
  points: number;
};

type Promotion = {
  id: string;
  active: boolean;
  businessCity: string;
  businessEmail: string;
  businessName: string;
  businessPhone: string;
  businessPostalCode: string;
  businessRegion: string;
  businessStreetAddress: string;
  businessCountry: string;
  businessWallet: string;
  points: number;
  pointsRequired: number;
  reward: string;
  qr: string;
  qRUrl: string;
  key: string;
};

function classNames(...classes: any) {
  return classes.filter(Boolean).join(" ");
}

export default function Account() {
  const router = useRouter();
  const store = useStore(useAuthStore, (state) => state);
  const [openModal, setOpenModal] = useState<boolean>(false);
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
    points: 0,
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
        setOpenModal(true);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const claimLylt = async (promotionId: string, amount: number) => {
    if (amount <= 0) {
      return;
    }
    const currentTime = new Date().getTime();
    const vendorRef = doc(db, "wallets", `${store?.wallet}`);
    await runTransaction(db, async (transaction) => {
      const doc = await transaction.get(vendorRef);
      if (!doc.exists()) {
        throw "Document does not exist!";
      }
      let last = doc.data() as Vendor;
      let lastPoint = last.points;
      transaction.update(vendorRef, {
        points: lastPoint + amount,
        updatedAt: currentTime,
      });
    })
      .then(async () => {
        const promotionRef = doc(db, "promotions", `${promotionId}`);
        await runTransaction(db, async (transaction) => {
          const doc = await transaction.get(promotionRef);
          if (!doc.exists()) {
            throw "Document does not exist!";
          }
          transaction.update(promotionRef, {
            points: 0,
            updatedAt: currentTime,
          });
        })
          .then(() => {
            setOpenModal(true);
          })
          .catch((e) => {
            console.log(e);
          });
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const mintNFT = async (id: string) => {};

  const closeModal = () => {
    setOpenModal(false);
    return router.push(`/account`);
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

        <div className="mt-8 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <table className="min-w-full divide-y divide-gray-300">
                <thead>
                  <tr>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"
                    >
                      Promotion
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Requirement
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      LYLT Required
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      LYLT Earned
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Claim LYLT
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Mint NFT
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Active
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {promotions.map(function (promotion: Promotion) {
                    return (
                      <tr key={promotion.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                          {promotion.reward}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {promotion.pointsRequired}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {promotion.pointsRequired}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {promotion.points}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <button
                            onClick={() =>
                              claimLylt(promotion.id, promotion.points)
                            }
                            type="button"
                            className="rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                          >
                            Claim
                          </button>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <button
                            onClick={() => mintNFT(promotion.id)}
                            type="button"
                            className="rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                          >
                            Mint
                          </button>
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-left text-sm font-medium sm:pr-0">
                          <Switch
                            checked={promotion.active}
                            onChange={() =>
                              updateActivePromotion(
                                promotion.id,
                                !promotion.active
                              )
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
                                promotion.active
                                  ? "bg-green-600"
                                  : "bg-gray-200",
                                "pointer-events-none absolute mx-auto h-4 w-9 rounded-full transition-colors duration-200 ease-in-out"
                              )}
                            />
                            <span
                              aria-hidden="true"
                              className={classNames(
                                promotion.active
                                  ? "translate-x-5"
                                  : "translate-x-0",
                                "pointer-events-none absolute left-0 inline-block h-5 w-5 transform rounded-full border border-gray-200 bg-white shadow ring-0 transition-transform duration-200 ease-in-out"
                              )}
                            />
                          </Switch>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

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
