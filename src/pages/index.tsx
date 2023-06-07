import { Fragment, useEffect, useState } from "react";
import { getVendorCardsByOwner, storage } from "../firebase";
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import useStore from "@/lib/useStore";
import useAuthStore from "@/lib/store";

type VendorCard = {
  businessCity: string;
  businessEmail: string;
  businessName: string;
  businessPhone: string;
  businessPostalCode: string;
  businessRegion: string;
  businessStreetAddress: string;
  businessCountry: string;
  wallet: string;
  name: string;
  pointCap: string;
  reward: string;
  qr: string;
  key: string;
};

const Index = () => {
  const store = useStore(useAuthStore, (state) => state);
  const [promotions, setPromotions] = useState<VendorCard[]>([]);
  useEffect(() => {
    const getData = async () => {
      if (store?.wallet) {
        return (await getVendorCardsByOwner(store?.wallet)) as VendorCard[];
      }
    };
    getData()
      .then(async (res: any) => {
        if (res) {
          const remap = await Promise.all(
            res.map(async function (promo: VendorCard) {
              const qr = promo.qr;
              const url = await getDownloadURL(ref(storage, qr));
              const data = { ...promo, qRUrl: url };
              return data;
            })
          );
          setPromotions(remap);
        }
      })
      .catch((e) => {
        console.log(e);
      });
  }, [store?.wallet]);

  return (
    <div className="bg-white">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {promotions &&
          promotions.map(function (promotion: VendorCard, index) {
            return (
              <div className="border m-5" key={index}>
                <div className="px-6 py-12 text-center sm:rounded-3xl sm:px-16 grid grid-cols-1 gap-8">
                  <h1 className="mt-4 text-4xl tracking-tight font-extrabold text-black sm:mt-5 sm:text-6xl lg:mt-6 xl:text-8xl">
                    <span className="">Earn a </span>
                    <span className=" text-green-400">{promotion.reward}</span>
                    <span> for </span>
                    <span className=" text-yellow-400">
                      {promotion.pointCap}
                    </span>
                    <span> points </span>
                    <span>from </span>
                    <span className=" text-red-400">
                      {promotion.businessName}
                    </span>
                    <span> scan that shit now</span>
                  </h1>
                  <div className="w-full flex flex-col justify-center items-center p-8">
                    <img
                      style={{ height: "256", width: "256" }}
                      src={promotion.qRUrl}
                      alt="qr code"
                    />
                  </div>
                  <a href={`qr/${promotion.wallet}/${promotion.key}`}>
                    <p className="border px-4 py-2 border-black">
                      SIMULATE SCAN
                    </p>
                  </a>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default Index;
