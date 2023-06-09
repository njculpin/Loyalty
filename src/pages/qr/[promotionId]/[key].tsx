import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import useStore from "@/lib/useStore";
import useAuthStore from "@/lib/store";
import { storage, db } from "../../../firebase";
import { doc, setDoc, runTransaction, onSnapshot } from "firebase/firestore";
import QRCode from "qrcode";
import { v4 as uuidv4 } from "uuid";
import { ref, uploadString } from "firebase/storage";

type Promotion = {
  id: string;
  businessCity: string;
  businessEmail: string;
  businessName: string;
  businessPhone: string;
  businessPostalCode: string;
  businessRegion: string;
  businessStreetAddress: string;
  businessCountry: string;
  businessWallet: string;
  pointCap: number;
  reward: string;
  key: string;
};

type PatronCard = {
  id: string;
  businessCity: string;
  businessEmail: string;
  businessName: string;
  businessPhone: string;
  businessPostalCode: string;
  businessRegion: string;
  businessStreetAddress: string;
  businessCountry: string;
  businessWallet: string;
  pointCap: number;
  reward: string;
  patronWallet: string;
  key: string;
  points: number;
  createdAt: number;
  updatedAt: number;
};

const Qr = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const { promotionId, key } = router.query;

  const store = useStore(useAuthStore, (state) => state);
  const [patronCard, setPatronCard] = useState<PatronCard>();
  const [promotion, setPromotion] = useState<Promotion>();

  useEffect(() => {
    if (store?.wallet && promotionId && key) {
      const q = doc(db, "patrons", `${store?.wallet}-${promotionId}`);
      const unsubscribe = onSnapshot(q, (doc) => {
        const data = doc.data() as PatronCard;
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
        // update patron
        const patronRef = doc(db, "patrons", `${store?.wallet}-${promotionId}`);
        await runTransaction(db, async (transaction) => {
          const document = await transaction.get(patronRef);
          if (!document.exists()) {
            // create document because its missing - first time scan
            await setDoc(
              doc(db, "patrons", `${store?.wallet}-${promotionId}`),
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
                pointCap: promotion.pointCap,
                reward: promotion.reward,
                patronWallet: store?.wallet,
                points: 1,
                createdAt: new Date().getTime(),
                updatedAt: new Date().getTime(),
                promotionId: promotionId,
              }
            );
            return;
          }
          const oldData = document.data();
          const oldPoint = oldData.points;
          const pointCap = oldData.pointCap;
          let newPoint = oldPoint + 1;
          if (newPoint <= pointCap) {
            transaction.update(patronRef, {
              points: newPoint,
              lastUpdate: currentTime,
            });
          } else {
            transaction.update(patronRef, {
              lastUpdate: currentTime,
              points: 1,
            });
          }
        });
        // update promotion
        if (!promotionId && !promotion) {
          return console.log("missing promotion");
        }
        const newKey = uuidv4();
        const qr = await QRCode.toDataURL(
          `loyalty-iota.vercel.app/qr/${newKey}`
        );
        const storageRef = ref(storage, `qr/${promotionId}/${newKey}.png`);
        const uploadTask = await uploadString(storageRef, qr, "data_url");
        const QRURL = uploadTask.metadata.fullPath;

        const promotionRef = doc(db, "promotions", `${promotionId}`);
        await runTransaction(db, async (transaction) => {
          const doc = await transaction.get(promotionRef);
          if (!doc.exists()) {
            throw "Document does not exist!";
          }
          const oldData = doc.data().points;
          const newPoints = oldData + promotion.pointCap;
          transaction.update(promotionRef, {
            points: newPoints,
            lastUpdate: currentTime,
            key: newKey,
            qr: QRURL,
          });
        });
        console.log("Transaction successfully committed!");
      } catch (e) {
        console.log("Transaction failed: ", e);
      }
    };
    issuePoints();
  }, [promotion, store?.wallet, promotionId, key]);

  return (
    <div className="w-full p-16">
      <div className="mx-auto max-w-7xl p-6">
        <div className="w-full flex justify-center items-center">
          <div className="grid grid-cols-1 text-center">
            {patronCard && patronCard.businessName !== "" && !loading && (
              <div>
                <h1 className="mt-4 text-6xl tracking-tight font-extrabold text-black sm:mt-5 sm:text-6xl lg:mt-6 xl:text-8xl">
                  <span className=" text-green-400">{patronCard.points} </span>
                  <span>out of </span>
                  <span className=" text-yellow-400">
                    {patronCard.pointCap}{" "}
                  </span>
                  <span>points for a </span>
                  <span className=" text-red-400">{patronCard.reward} </span>
                  <span>from </span>
                  <span className=" text-blue-400">
                    {patronCard.businessName}
                  </span>
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
