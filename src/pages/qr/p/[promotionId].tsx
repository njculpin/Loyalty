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

  const [message, setMessage] = useState<string>("loading");

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
      if (diffTime <= 300000) {
        return setMessage(
          `try again in ${Math.floor(diffTime / 60000)} minutes`
        );
      }
      if (points < promotion.pointsRequired) {
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
    </div>
  );
};

export default Qr;
