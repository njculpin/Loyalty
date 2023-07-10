import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import useStore from "@/lib/useStore";
import useAuthStore from "@/lib/store";
import { storage, db } from "../../../firebase";
import { getFunctions, httpsCallable } from "firebase/functions";
import {
  doc,
  setDoc,
  getDoc,
  runTransaction,
  onSnapshot,
} from "firebase/firestore";
import QRCode from "qrcode";
import { v4 as uuidv4 } from "uuid";
import { ref, uploadString } from "firebase/storage";
import { Promotion, Card, Wallet } from "../../../types";

const Qr = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const { promotionId, key } = router.query;

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
    if (store?.wallet && promotionId && key) {
      const q = doc(db, "cards", `${store?.wallet}_${promotionId}`);
      const unsubscribe = onSnapshot(q, (doc) => {
        const data = doc.data() as Card;
        setPatronCard(data);
      });
      return unsubscribe;
    }
  }, [store?.wallet, promotionId, key]);

  useEffect(() => {
    if (store?.wallet && promotionId && key) {
      const q = doc(db, "promotions", `${promotionId}`);
      const unsubscribe = onSnapshot(q, (doc) => {
        const data = doc.data() as Promotion;
        setPromotion(data);
      });
      return unsubscribe;
    }
  }, [store?.wallet, promotionId, key]);

  useEffect(() => {
    const issuePoints = async () => {
      try {
        if (!promotion) {
          throw "missing promotion";
        }
        if (key !== promotion?.key) {
          throw "key does not match";
        }
        const currentTime = new Date().getTime();

        const cardPoints = await updateCard(promotion, currentTime);
        console.log("cardPoints", cardPoints);

        const promotionPoints = await updatePromotion(promotion, currentTime);
        console.log("promotionPoints", promotionPoints);

        const functions = getFunctions();
        const updateNFTs = httpsCallable(
          functions,
          "addPointTransactionToQueue"
        );

        console.log("to update", {
          key: "points",
          promotionId: promotionId,
          value: promotionPoints,
        });

        const updateNfts = await updateNFTs({
          key: "points",
          promotionId: promotionId,
          value: promotionPoints,
        });
        console.log("updateNfts", updateNfts);

        const vendorPoints = await updateVendor(promotion, currentTime);
        console.log("vendorPoints", vendorPoints);
      } catch (e) {
        console.log("Transaction failed: ", e);
      }
    };
    if (promotion) {
      issuePoints();
    }
  }, [promotion, store?.wallet, promotionId, key, wallet]);

  const updateCard = async (promotion: Promotion, currentTime: number) => {
    try {
      const patronRef = doc(db, "cards", `${store?.wallet}_${promotionId}`);
      const docSnap = await getDoc(patronRef);
      if (!docSnap.exists()) {
        await setDoc(doc(db, "cards", `${store?.wallet}_${promotionId}`), {
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
          reward: promotion.reward,
          patronWallet: store?.wallet,
          points: promotion.pointsRequired > 0 ? 1 : 0,
          coins: promotion.coinsRequired > 0 ? 1 : 0,
          createdAt: new Date().getTime(),
          updatedAt: new Date().getTime(),
          promotionId: promotionId,
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
          const pointsRequired = oldData?.pointsRequired;
          let newPoint = oldPoint + 1;
          if (newPoint <= pointsRequired) {
            transaction.update(patronRef, {
              points: newPoint,
              updatedAt: currentTime,
            });
            return newPoint;
          } else {
            transaction.update(patronRef, {
              updatedAt: currentTime,
              points: 1,
            });
            return 1;
          }
        });
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
        return console.log("missing promotion");
      }
      const newKey = uuidv4();
      const qr = await QRCode.toDataURL(`loyalty-iota.vercel.app/qr/${newKey}`);
      const storageRef = ref(storage, `qr/${promotionId}.png`);
      const uploadTask = await uploadString(storageRef, qr, "data_url");
      const QRURL = uploadTask.metadata.fullPath;
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
          qr: QRURL,
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
                  <span className=" text-green-400">{patronCard.points} </span>
                  <span>out of </span>
                  <span className=" text-yellow-400">
                    {patronCard.pointsRequired}{" "}
                  </span>
                  <span>points for a </span>
                  <span className=" text-red-400">{patronCard.reward} </span>
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
