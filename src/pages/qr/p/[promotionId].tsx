import { useEffect, useState, Fragment } from "react";
import { useRouter } from "next/router";
import useStore from "@/lib/useStore";
import useAuthStore from "@/lib/store";
import { db } from "../../../firebase";
import { getFunctions, httpsCallable } from "firebase/functions";
import { doc, getDoc } from "firebase/firestore";
import { Transition } from "@headlessui/react";
import { XMarkIcon, FaceFrownIcon } from "@heroicons/react/20/solid";
import { Promotion, Card } from "../../../types";

const Qr = () => {
  const router = useRouter();
  const { promotionId } = router.query;
  const [showError, setShowError] = useState<boolean>(false);
  const store = useStore(useAuthStore, (state) => state);
  const [message, setMessage] = useState<string>("loading");

  useEffect(() => {
    const query = async () => {
      const promoRef = doc(db, "promotions", `${promotionId}`);
      const promoSnap = await getDoc(promoRef);
      if (!promoSnap.exists()) {
        return;
      }
      const promotion = promoSnap.data() as Promotion;
      const cardRef = doc(
        db,
        "cards",
        `${store?.wallet}_${promotion.businessWallet}`
      );
      const cardSnap = await getDoc(cardRef);
      if (!cardSnap.exists()) {
        return;
      }
      const cardData = cardSnap.data() as Card;
      const updatedAt = cardData.updatedAt;
      const points = cardData.points;
      const currentTime = new Date().getTime();
      const diffTime = currentTime - updatedAt;
      // TODO: replaced, removed for demo
      // if (diffTime <= 300000) {
      //   setShowError(true);
      //   return setMessage(`try again in 5 minutes`);
      // }
      if (points < promotion.pointsRequired) {
        setShowError(true);
        return setMessage("not enough points");
      }
      if (!promoSnap.exists() || !cardSnap.exists()) {
        console.log("document exists");
        return;
      }
      if (!store?.wallet) {
        return;
      }
      await issuePoints(store?.wallet, promotion);
    };
    if (store?.wallet && promotionId) {
      query();
    }
  }, [store?.wallet, promotionId]);

  const issuePoints = async (wallet: string, promotion: Promotion) => {
    try {
      const functions = getFunctions();
      const redeemPromotion = httpsCallable(
        functions,
        "addPointTransactionToQueue"
      );
      const redeem = await redeemPromotion({
        promotionId: promotionId,
        vendorId: promotion.businessWallet,
        cardId: `${wallet}_${promotion.businessWallet}`,
        value: promotion.pointsRequired,
      });
      const redeemRes = redeem.data as unknown as any;
      const message = redeemRes.message;
      setMessage(message);
      return console.log(redeem);
    } catch (e) {
      console.log("Transaction failed: ", e);
    }
  };

  return (
    <div className="w-full p-16">
      <div className="mx-auto max-w-7xl p-6">
        <div className="w-full flex justify-center items-center">
          <div className="grid grid-cols-1 text-center">
            <div>
              <h1 className="mt-4 text-6xl tracking-tight font-extrabold text-black sm:mt-5 sm:text-6xl lg:mt-6 xl:text-8xl">
                <span className="text-green-400">{message}</span>
              </h1>
            </div>
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
