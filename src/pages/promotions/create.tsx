import { useEffect, Fragment, useState } from "react";
import { useRouter } from "next/router";
import { storage, db } from "../../firebase";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { ref, uploadString } from "firebase/storage";
import { Dialog, Transition } from "@headlessui/react";
import { CheckIcon } from "@heroicons/react/24/outline";
import { XMarkIcon, FaceFrownIcon } from "@heroicons/react/20/solid";
import QRCode from "qrcode";
import { v4 as uuidv4 } from "uuid";
import useAuthStore from "@/lib/store";
import useStore from "@/lib/useStore";
import { Promotion, Vendor } from "../../types";
import Link from "next/link";

const Create = () => {
  const router = useRouter();
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [showError, setShowError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [promotion, setPromotion] = useState<Promotion | null>(null);
  const store = useStore(useAuthStore, (state) => state);

  useEffect(() => {
    if (store?.wallet) {
      const q = doc(db, "wallets", store?.wallet);
      const unsubscribe = onSnapshot(q, (doc) => {
        if (!doc.exists) {
          return;
        }
        const data = doc.data() as Vendor;
        if (data) {
          setVendor(data);
        }
      });
      return unsubscribe;
    }
  }, [store?.wallet]);

  const createCard = async () => {
    try {
      const valid = await validateFields();
      if (!valid) {
        return;
      }
      const docRef = uuidv4();
      const qr = await QRCode.toDataURL(
        `loyalty-iota.vercel.app/qr/p/${docRef}`
      );
      const storageRef = ref(storage, `qr/p/${docRef}.png`);
      const uploadTask = await uploadString(storageRef, qr, "data_url");
      const QRURL = uploadTask.metadata.fullPath;
      const promoDetails = {
        active: true,
        businessWallet: store?.wallet,
        businessCity: vendor?.businessCity,
        businessEmail: vendor?.businessEmail,
        businessName: vendor?.businessName,
        businessPhone: vendor?.businessPhone,
        businessPostalCode: vendor?.businessPostalCode,
        businessRegion: vendor?.businessRegion,
        businessStreetAddress: vendor?.businessStreetAddress,
        businessCountry: vendor?.businessCountry,
        pointsRequired: Number(promotion.pointsRequired),
        coinsRequired: Number(promotion.coinsRequired),
        coins: 0,
        points: 0,
        reward: promotion.reward,
        qr: QRURL,
        minted: false,
        price: 0,
      };
      setDoc(doc(db, "promotions", docRef), {
        ...promoDetails,
        createdAt: new Date().getTime(),
        updatedAt: new Date().getTime(),
      })
        .then(() => {
          setShowSuccess(true);
        })
        .catch((e) => {
          console.log(e);
          setShowError(true);
        });
    } catch (e) {
      setErrorMessage(
        "something went wrong, please check your business details"
      );
      setShowError(true);
      console.log(e);
    }
  };

  const returnHome = () => {
    setShowError(false);
    setShowSuccess(false);
    return router.push(`/promotions`);
  };

  const validateFields = () => {
    if (!store?.wallet) {
      setErrorMessage("missing wallet");
      setShowError(true);
    } else if (!vendor?.businessCity) {
      setErrorMessage("missing bussiness city");
      setShowError(true);
    } else if (!vendor?.businessEmail) {
      setErrorMessage("missing bussiness email");
      setShowError(true);
    } else if (!vendor?.businessName) {
      setErrorMessage("missing bussiness name");
      setShowError(true);
    } else if (!vendor?.businessPhone) {
      setErrorMessage("missing bussiness phone");
      setShowError(true);
    } else if (!vendor?.businessPostalCode) {
      setErrorMessage("missing bussiness postal code");
      setShowError(true);
    } else if (!vendor?.businessRegion) {
      setErrorMessage("missing bussiness region");
      setShowError(true);
    } else if (!vendor?.businessStreetAddress) {
      setErrorMessage("missing bussiness address");
      setShowError(true);
    } else if (!vendor?.businessCountry) {
      setErrorMessage("missing bussiness country");
      setShowError(true);
    } else if (!promotion?.pointsRequired) {
      setErrorMessage("missing points required");
      setShowError(true);
    } else if (!promotion?.reward) {
      setErrorMessage("missing reward");
      setShowError(true);
    } else {
      return true;
    }
  };

  return (
    <div className="mx-auto max-w-7xl p-16">
      <div className="space-y-12">
        {vendor && vendor.businessName ? (
          <>
            <div className="border-b border-gray-900/10 pb-12">
              <h2 className="text-base font-semibold leading-7 text-gray-900">
                Promotion Information
              </h2>
              <p className="mt-1 text-sm leading-6 text-gray-600">
                Use this form to create a new promotion. Describe how many
                points are required, and what your customers will earn.
              </p>
              <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                <div className="sm:col-span-4">
                  <label
                    htmlFor="reward"
                    className="block text-sm font-medium leading-6 text-black mt-8"
                  >
                    What is the reward your customers will earn?
                  </label>
                  <div className="mt-2">
                    <input
                      onChange={(e) =>
                        setPromotion({
                          [event.target.id]: event.target.value,
                        })
                      }
                      id="reward"
                      name="reward"
                      type="text"
                      required
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>
                <div className="sm:col-span-4">
                  <label
                    htmlFor="pointsRequired"
                    className="block text-sm font-medium leading-6 text-black"
                  >
                    How many points does a customer require to earn the reward?
                  </label>
                  <div className="mt-2">
                    <input
                      onChange={(e) =>
                        setPromotion({
                          [event.target.id]: event.target.value,
                        })
                      }
                      id="pointsRequired"
                      name="pointsRequired"
                      type="number"
                      pattern="[0-9]*"
                      required
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 flex items-center justify-end gap-x-6">
              <button
                type="submit"
                onClick={() => createCard()}
                className="rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
              >
                Submit
              </button>
            </div>
          </>
        ) : (
          <>
            <Link href={"/settings"}>
              <p className="underline font-bold">
                Click here to set up your business information
              </p>
            </Link>
          </>
        )}
      </div>

      <Transition.Root show={showSuccess} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={setShowSuccess}>
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
                    <p className="mt-1 text-sm text-gray-500">{errorMessage}</p>
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

export default Create;
