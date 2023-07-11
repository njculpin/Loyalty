import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import useStore from "@/lib/useStore";
import useAuthStore from "@/lib/store";
import { db } from "../../../firebase";
import { getFunctions, httpsCallable } from "firebase/functions";
import {
  doc,
  setDoc,
  getDoc,
  runTransaction,
  onSnapshot,
} from "firebase/firestore";

import { v4 as uuidv4 } from "uuid";
import { Promotion, Card, Wallet } from "../../../types";

const Qr = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const { promotionId } = router.query;

  const store = useStore(useAuthStore, (state) => state);
  const [patronCard, setPatronCard] = useState<Card>();
  const [promotion, setPromotion] = useState<Promotion>();
  const [wallet, setWallet] = useState<Wallet>();

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

  useEffect(() => {
    if (store?.wallet && promotionId) {
      const q = doc(db, "cards", `${store?.wallet}_${promotionId}`);
      const unsubscribe = onSnapshot(q, (doc) => {
        const data = doc.data() as Card;
        setPatronCard(data);
      });
      return unsubscribe;
    }
  }, [store?.wallet, promotionId]);

  useEffect(() => {
    if (store?.wallet && promotionId) {
      const q = doc(db, "promotions", `${promotionId}`);
      const unsubscribe = onSnapshot(q, (doc) => {
        const data = doc.data() as Promotion;
        setPromotion(data);
      });
      return unsubscribe;
    }
  }, [store?.wallet, promotionId]);

  useEffect(() => {
    const issuePoints = async () => {
      try {
        if (!promotion) {
          throw "missing promotion";
        }
        const currentTime = new Date().getTime();
        const cardPoints = await updateCard(promotion, currentTime);
        // console.log("cardPoints", cardPoints);
        // const promotionPoints = await updatePromotion(promotion, currentTime);
        // console.log("promotionPoints", promotionPoints);
        // const functions = getFunctions();
        // const updateNFTs = httpsCallable(
        //   functions,
        //   "addPointTransactionToQueue"
        // );
        // await updateNFTs({
        //   key: "points",
        //   promotionId: promotionId,
        //   value: promotionPoints,
        // });
        // const vendorPoints = await updateVendor(promotion, currentTime);
        // console.log("vendorPoints", vendorPoints);
      } catch (e) {
        console.log("Transaction failed: ", e);
      }
    };
    if (promotion) {
      issuePoints();
    }
  }, [promotion]);

  const updateCard = async (promotion: Promotion, currentTime: number) => {
    try {
      const patronRef = doc(
        db,
        "cards",
        `${store?.wallet}_${promotion.businessWallet}`
      );
      const docSnap = await getDoc(patronRef);
      if (!docSnap.exists()) {
        await setDoc(
          doc(db, "cards", `${store?.wallet}_${promotion.businessWallet}`),
          {
            businessCity: promotion.businessCity,
            businessEmail: promotion.businessEmail,
            businessName: promotion.businessName,
            businessPhone: promotion.businessPhone,
            businessPostalCode: promotion.businessPostalCode,
            businessRegion: promotion.businessRegion,
            businessStreetAddress: promotion.businessStreetAddress,
            businessCountry: promotion.businessCountry,
            businessWallet: promotion.businessWallet,
            pointsRequired: promotion.pointsRequired,
            coinsRequired: promotion.coinsRequired,
            patronWallet: store?.wallet,
            points: promotion.pointsRequired > 0 ? 1 : 0,
            coins: promotion.coinsRequired > 0 ? 1 : 0,
            createdAt: new Date().getTime(),
            updatedAt: new Date().getTime(),
          }
        );
        return 1;
      } else {
        if (wallet && wallet?.points < promotion.pointsRequired) {
          return console.log("not enough points");
        }
        const cardRef = doc(
          db,
          "cards",
          `${store?.wallet}_${promotion.businessWallet}`
        );
        const points = await runTransaction(db, async (transaction) => {
          const doc = await transaction.get(cardRef);
          if (!doc.exists()) {
            throw "Document does not exist!";
          }
          const oldData = doc.data() as unknown as Wallet;
          const oldPoints = oldData.points;
          const newPoints = oldPoints - promotion.pointsRequired;
          transaction.update(cardRef, {
            points: newPoints,
            updatedAt: currentTime,
          });
        });
        return points;
      }
    } catch (e) {
      console.log(e);
      return -1;
    }
  };

  const updateVendor = async (promotion: Promotion, currentTime: number) => {
    try {
      let businessWallet = promotion.businessWallet;
      console.log("businessWallet ln 160", businessWallet);
      const bWalletRef = doc(db, "wallets", `${businessWallet}`);
      const points = await runTransaction(db, async (transaction) => {
        const doc = await transaction.get(bWalletRef);
        if (!doc.exists()) {
          throw "Document does not exist!";
        }
        const oldData = doc.data() as unknown as Wallet;
        const oldPoints = oldData.points;
        const newPoints = oldPoints + 1;
        transaction.update(bWalletRef, {
          points: newPoints,
          updatedAt: currentTime,
        });
        return newPoints;
      });
      return points;
    } catch (e) {
      console.log(e);
      return -1;
    }
  };

  const updatePromotion = async (promotion: Promotion, currentTime: number) => {
    try {
      if (!promotionId && !promotion) {
        return console.log("missing vendor");
      }
      const newKey = uuidv4();
      const promotionRef = doc(db, "promotions", `${promotionId}`);
      return await runTransaction(db, async (transaction) => {
        const doc = await transaction.get(promotionRef);
        if (!doc.exists()) {
          throw "Document does not exist!";
        }
        const oldData = doc.data().points;
        const newPoints = oldData + 1;
        transaction.update(promotionRef, {
          points: newPoints,
          updatedAt: currentTime,
          key: newKey,
        });
        return newPoints;
      });
    } catch (e) {
      console.log(e);
      return -1;
    }
  };

  return (
    <div className="w-full p-16">
      <div className="mx-auto max-w-7xl p-6">
        <div className="w-full flex justify-center items-center">
          <div className="grid grid-cols-1 text-center">
            {patronCard && !loading && (
              <div>
                <h1 className="mt-4 text-6xl tracking-tight font-extrabold text-black sm:mt-5 sm:text-6xl lg:mt-6 xl:text-8xl">
                  <span className="text-green-400">{promotion?.reward}!</span>
                </h1>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Qr;
