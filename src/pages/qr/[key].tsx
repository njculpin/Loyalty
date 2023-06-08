import dynamic from "next/dynamic";
import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/router";
import useStore from "@/lib/useStore";
import useAuthStore from "@/lib/store";
import {
  createPatronCard,
  getPatronCard,
  getPromotionByKey,
  updatePatronCardPoints,
  updatePromotionKey,
  storage,
} from "../../firebase";
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
  const { key } = router.query;

  const store = useStore(useAuthStore, (state) => state);
  const [patronCard, setPatronCard] = useState<PatronCard>();
  const [message, setMessage] = useState("");

  const SocialLoginDynamic = dynamic(
    () => import("../../components/Auth").then((res) => res.default),
    {
      ssr: false,
    }
  );

  useEffect(() => {
    if (store?.wallet) {
      update();
    }
  }, [key, store?.wallet]);

  const update = async () => {
    setLoading(true);
    const found = (await getPromotionByKey(key)) as Promotion[];
    if (key && found.length <= 0) {
      return setMessage(
        "Sorry, this is an invalid promotion key, please try again"
      );
    }
    console.log("found", found);
    const promotion = found[0];
    if (!promotion) {
      return;
    }

    const pc = await getPatronCard(store?.wallet, promotion.id);
    setPatronCard(pc);
    console.log("create new");
    if (!pc && promotion) {
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
        key: key,
        points: 0,
        createdAt: new Date().getTime(),
        updatedAt: new Date().getTime(),
        promotionId: promotion.id,
      };
      await createPatronCard({ ...card });
      setLoading(false);
      return;
    } else {
      const updated = await updatePatronCardPoints(
        store?.wallet,
        promotion.id,
        key
      );
      console.log("updated", updated);
      if (updated === "-1") {
        return setMessage("Sorry, you have already checked in today!");
      }
    }
    const result = await getPatronCard(store?.wallet, promotion.id);
    setPatronCard(result);
    const newKey = uuidv4();
    const qr = await QRCode.toDataURL(`loyalty-iota.vercel.app/qr/${newKey}`);
    const storageRef = ref(storage, `qr/${newKey}.png`);
    const uploadTask = await uploadString(storageRef, qr, "data_url");
    const QRURL = uploadTask.metadata.fullPath;
    await updatePromotionKey(promotion.id, QRURL, newKey);
    setLoading(false);
  };

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
                    {" "}
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
