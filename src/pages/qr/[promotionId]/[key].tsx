import dynamic from "next/dynamic";
import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/router";
import useStore from "@/lib/useStore";
import useAuthStore from "@/lib/store";
import {
  createPatronCard,
  getPromotionById,
  updatePatronCardPoints,
  updatePromotionKey,
  getPatronCardByPromotion,
  storage,
} from "../../../firebase";

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
  const [message, setMessage] = useState("");

  const SocialLoginDynamic = dynamic(
    () => import("../../../components/Auth").then((res) => res.default),
    {
      ssr: false,
    }
  );

  useEffect(() => {
    const query = async () => {
      const found = (await getPromotionById(promotionId)) as Promotion;
      if (!found) {
        return console.log("missing promotion");
      }
      setPromotion(found);
    };
    query();
  }, [promotionId]);

  useEffect(() => {
    if (promotion && promotion.key !== key) {
      return console.log("key mismisatch");
    }
    const queryPatron = async () => {
      const patrons = await getPatronCardByPromotion(
        store?.wallet,
        promotionId
      );
      console.log("patrons", patrons);
    };
    queryPatron();
  }, [promotion, store?.wallet, promotionId, key]);

  /*
  useEffect(() => {
    if (store?.wallet && key) {
      const update = async () => {
        setLoading(true);

        if (key && found.length <= 0) {
          return setMessage(
            "Sorry, this is an invalid promotion key, please try again"
          );
        }
        const promotion = found[0];
        if (!promotion) {
          return;
        }
        if (!store?.wallet) {
          return;
        }
        if (!patronCard && promotion) {
          let card = {
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
            points: 0,
            createdAt: new Date().getTime(),
            updatedAt: new Date().getTime(),
            promotionId: promotionId,
          };
          await createPatronCard({ ...card });
          setLoading(false);
          return;
        } else {
          const updated = await updatePatronCardPoints(
            store?.wallet,
            promotionId,
            key
          );
          if (updated === "-1") {
            return setMessage("Sorry, you have already checked in today!");
          }
        }
        const newKey = uuidv4();
        const qr = await QRCode.toDataURL(
          `loyalty-iota.vercel.app/qr/${newKey}`
        );
        const storageRef = ref(storage, `qr/${newKey}.png`);
        const uploadTask = await uploadString(storageRef, qr, "data_url");
        const QRURL = uploadTask.metadata.fullPath;
        await updatePromotionKey(promotion.id, QRURL, newKey);
        setLoading(false);
      };

      update();
    }
  }, [key, store?.wallet, patronCard]);
  */

  return (
    <div className="w-full p-16">
      <div className="mx-auto max-w-7xl p-6">
        <div className="flex justify-center items-center">
          <Suspense fallback={<div>Loading...</div>}>
            <SocialLoginDynamic />
          </Suspense>
        </div>
        <div className="w-full flex justify-center items-center">
          <div className="grid grid-cols-1 text-center">
            <p className="text-red-500 font-bold text-lg">{message}</p>
            {patronCard && patronCard.businessName !== "" && !loading && (
              <div>
                <h1 className="mt-4 text-6xl tracking-tight font-extrabold text-black sm:mt-5 sm:text-6xl lg:mt-6 xl:text-8xl">
                  <span className="">You have earned </span>
                  <span className=" text-green-400">{patronCard.points} </span>
                  <span>out of </span>
                  <span className=" text-yellow-400">
                    {patronCard.pointCap}{" "}
                  </span>
                  <span>points for a </span>
                  <span className=" text-red-400">{patronCard.reward} </span>
                  <span>from</span>
                  <span className=" text-blue-400">
                    {patronCard.businessName}
                  </span>
                </h1>
                <p className="italic my-4">you can close this window</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Qr;
