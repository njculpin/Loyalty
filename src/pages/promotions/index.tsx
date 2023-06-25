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
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Switch } from "@headlessui/react";
import { Wallet, Vendor, Promotion } from "../../types";

function classNames(...classes: any) {
  return classes.filter(Boolean).join(" ");
}

export default function Account() {
  const router = useRouter();
  const store = useStore(useAuthStore, (state) => state);
  const [openStatusModal, setOpenStatusModal] = useState<boolean>(false);
  const [sellPromotionModal, setSellPromotionModal] = useState<boolean>(false);
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion>({
    id: "",
    active: false,
    businessCity: "",
    businessEmail: "",
    businessName: "",
    businessPhone: "",
    businessPostalCode: "",
    businessRegion: "",
    businessStreetAddress: "",
    businessCountry: "",
    businessWallet: "",
    pointsRequired: 0,
    coinsRequired: 0,
    coins: 0,
    points: 0,
    reward: "",
    key: "",
    qRUrl: "",
    minted: false,
    supply: 1,
    price: 0,
  });
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

  const sellPromotionNft = async (promotion: Promotion) => {
    setSellPromotionModal(true);
    setSelectedPromotion(promotion);
  };

  const handleChange = (event: any) => {
    setSelectedPromotion({
      ...selectedPromotion,
      [event.target.id]: event.target.value,
    });
  };

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
                  <button
                    onClick={() => sellPromotionNft(promotion)}
                    className="relative flex items-center justify-center rounded-md border border-transparent bg-gray-100 px-8 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200"
                  >
                    Sell
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* SELL PROMOTION */}
      <Transition.Root show={sellPromotionModal} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={setSellPromotionModal}
        >
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
                      onClick={() => setSellPromotionModal(false)}
                    >
                      <span className="sr-only">Close</span>
                      <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                    </button>

                    <div className="grid w-full grid-cols-1 items-start gap-x-6 gap-y-8 lg:items-center lg:gap-x-8">
                      <div className="sm:col-span-8 lg:col-span-7">
                        <h2 className="text-xl font-medium text-gray-900 sm:pr-12">
                          {selectedPromotion.reward} NFT
                        </h2>
                        <section
                          aria-labelledby="information-heading"
                          className="mt-1"
                        >
                          <h3 id="information-heading" className="sr-only">
                            Product information
                          </h3>
                          <p className="font-xs italic text-gray-900 mt-2">
                            Estimated earning is $
                            {(1 / selectedPromotion.supply).toFixed(8)} LYLT per
                            registered scan per holder
                          </p>
                        </section>
                        <section
                          aria-labelledby="options-heading"
                          className="mt-8"
                        >
                          <h3 id="options-heading" className="sr-only">
                            Product options
                          </h3>
                          <label
                            htmlFor="supply"
                            className="block text-sm font-medium leading-6 text-black"
                          >
                            Supply
                          </label>
                          <div className="mt-2">
                            <input
                              onChange={handleChange}
                              id="supply"
                              name="supply"
                              type="number"
                              pattern="[0-9]*"
                              required
                              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6"
                              value={selectedPromotion.supply}
                            />
                          </div>
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
                              value={selectedPromotion.price}
                            />
                          </div>
                          <form>
                            <button
                              type="submit"
                              className="mt-8 flex w-full items-center justify-center rounded-md border border-transparent bg-green-600 px-8 py-3 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                            >
                              Mint for $10 USD
                            </button>
                          </form>
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
      {/*  UPDATE PROMOTION */}
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
