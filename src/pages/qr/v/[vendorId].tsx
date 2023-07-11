import { useEffect, useState, Fragment } from "react";
import { useRouter } from "next/router";
import useStore from "@/lib/useStore";
import useAuthStore from "@/lib/store";
import { db } from "../../../firebase";
import {
  doc,
  setDoc,
  getDoc,
  runTransaction,
  onSnapshot,
} from "firebase/firestore";
import { Vendor, Card } from "../../../types";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon, FaceFrownIcon } from "@heroicons/react/20/solid";

const Qr = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [showError, setShowError] = useState<boolean>(false);
  const router = useRouter();
  const { vendorId } = router.query;

  const store = useStore(useAuthStore, (state) => state);
  const [patronCard, setPatronCard] = useState<Card>();
  const [vendor, setVendor] = useState<Vendor>();

  useEffect(() => {
    if (store?.wallet && vendorId) {
      const q = doc(db, "cards", `${store?.wallet}_${vendorId}`);
      const unsubscribe = onSnapshot(q, (doc) => {
        const data = doc.data() as Card;
        setPatronCard(data);
      });
      return unsubscribe;
    }
  }, [store?.wallet, vendor]);

  useEffect(() => {
    const getData = async () => {
      try {
        if (!vendorId) {
          return;
        }
        const docRef = doc(db, "wallets", `${vendorId}`);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as Vendor;
          setVendor(data);
        } else {
          console.log("No such vendor!");
        }
      } catch (e) {
        console.log(e);
      }
    };
    getData();
  }, [vendorId]);

  useEffect(() => {
    const issuePoints = async () => {
      try {
        setLoading(true);
        if (!vendor) {
          return console.log("no vendor");
        }
        if (!vendorId) {
          return console.log("no vendor id");
        }
        const currentTime = new Date().getTime();
        const patronRef = doc(db, "cards", `${store?.wallet}_${vendorId}`);
        const docSnap = await getDoc(patronRef);
        if (!docSnap.exists()) {
          await setDoc(doc(db, "cards", `${store?.wallet}_${vendorId}`), {
            businessCity: vendor.businessCity,
            businessEmail: vendor.businessEmail,
            businessName: vendor.businessName,
            businessPhone: vendor.businessPhone,
            businessPostalCode: vendor.businessPostalCode,
            businessRegion: vendor.businessRegion,
            businessStreetAddress: vendor.businessStreetAddress,
            businessCountry: vendor.businessCountry,
            businessWallet: vendor.businessWallet,
            patronWallet: store?.wallet,
            points: 1,
            createdAt: new Date().getTime(),
            updatedAt: new Date().getTime(),
          }).then(() => {
            setLoading(false);
          });
          return 1;
        } else {
          return await runTransaction(db, async (transaction) => {
            const document = await transaction.get(patronRef);
            const oldData = document.data();
            if (!document.exists) {
              return;
            }
            const oldPoint = oldData?.points;
            const updatedAt = oldData?.updatedAt;
            const currentTime = new Date().getTime();
            const difference = currentTime - updatedAt;
            if (difference < 300000) {
              setShowError(true);
              return oldPoint;
            }
            let newPoint = oldPoint + 1;
            transaction.update(patronRef, {
              points: newPoint,
              updatedAt: currentTime,
            });
            return newPoint;
          }).then(() => {
            setLoading(false);
          });
        }
      } catch (e) {
        console.log("Transaction failed: ", e);
      }
    };
    if (vendorId && vendor) {
      issuePoints();
    }
  }, [store?.wallet, vendorId, vendor]);

  return (
    <div className="w-full p-16">
      <div className="mx-auto max-w-7xl p-6">
        <div className="w-full flex justify-center items-center">
          <div className="grid grid-cols-1 text-center">
            {patronCard && !loading && (
              <div>
                <h1 className="mt-4 text-6xl tracking-tight font-extrabold text-black sm:mt-5 sm:text-6xl lg:mt-6 xl:text-8xl">
                  <span className=" text-green-400">
                    {patronCard.points} collected
                  </span>
                </h1>
              </div>
            )}
            {loading && (
              <div>
                <h1 className="mt-4 text-6xl tracking-tight font-extrabold text-black sm:mt-5 sm:text-6xl lg:mt-6 xl:text-8xl">
                  <span className=" text-green-400">LOADING</span>
                </h1>
              </div>
            )}
          </div>
        </div>
      </div>
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
                      Please wait 5 minutes before scanning again
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

export default Qr;
