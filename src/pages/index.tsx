import { useEffect, useState } from "react";
import { getPromotionsByOwner, getVendor, storage } from "../firebase";
import { ref, getDownloadURL } from "firebase/storage";
import useStore from "@/lib/useStore";
import useAuthStore from "@/lib/store";

type Vendor = {
  businessCity: string;
  businessEmail: string;
  businessName: string;
  businessPhone: string;
  businessPostalCode: string;
  businessRegion: string;
  businessStreetAddress: string;
  businessCountry: string;
  businessWallet: string;
};

type VendorCard = {
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
  pointCap: string;
  reward: string;
  qr: string;
  qRUrl: string;
  key: string;
};

const Index = () => {
  const store = useStore(useAuthStore, (state) => state);
  const [promotions, setPromotions] = useState<VendorCard[]>([]);
  const [state, setState] = useState<Vendor>({
    businessCity: "",
    businessEmail: "",
    businessName: "",
    businessPhone: "",
    businessPostalCode: "",
    businessRegion: "",
    businessStreetAddress: "",
    businessCountry: "",
    businessWallet: "",
  });

  useEffect(() => {
    const getData = async () => {
      if (store?.wallet) {
        return (await getPromotionsByOwner(store?.wallet)) as VendorCard[];
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

  useEffect(() => {
    const getData = async () => {
      if (store?.wallet) {
        return (await getVendor(store?.wallet)) as Vendor;
      }
    };
    getData()
      .then((res: any) => {
        if (res) {
          const vendor = JSON.parse(res);
          setState({ ...vendor });
        }
      })
      .catch((e) => {
        console.log(e);
      });
  }, [store?.wallet]);

  return (
    <div className="mx-auto max-w-7xl p-16">
      <div className="space-y-12">
        <div className="pb-12">
          <div className="grid grid-cols-1 gap-4 justify-between items-center mb-16">
            <h2 className="font-bold text-gray-900 text-center text-6xl">
              {state.businessName}
            </h2>
            <p className="text-lg font-semibold text-gray-600 text-center">
              {state.businessStreetAddress} {state.businessCity}{" "}
              {state.businessCountry} {state.businessPostalCode}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3">
            {promotions &&
              promotions.map(function (promotion: VendorCard, index) {
                return (
                  <div className="m-5 shadow-xl rounded-xl" key={index}>
                    <div className="h-full p-8 text-center sm:rounded-3xl grid grid-cols-1 justify-between">
                      <div className="w-full flex flex-col justify-center items-center">
                        <img
                          style={{ height: "256", width: "256" }}
                          src={promotion.qRUrl}
                          alt="qr code"
                        />
                      </div>
                      <h1 className="text-3xl tracking-tight text-left font-extrabold text-red-500">
                        {promotion.reward}
                      </h1>
                      <h1 className="text-xl tracking-tight text-left font-extrabold w-full text-blue-500">
                        {promotion.pointCap} points required
                      </h1>
                      <a href={`qr/${promotion.key}`}>
                        <p className="mt-8 border px-4 py-2 border-black">
                          SIMULATE SCAN
                        </p>
                      </a>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
