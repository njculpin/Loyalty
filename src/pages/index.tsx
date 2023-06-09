import { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { db, storage } from "../firebase";
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
  points: string;
  pointCap: string;
  reward: string;
  qr: string;
  qRUrl: string;
  key: string;
};

const Index = () => {
  const store = useStore(useAuthStore, (state) => state);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [vendor, setVendor] = useState<Vendor>({
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
    if (store?.wallet) {
      const q = query(
        collection(db, "promotions"),
        where("businessWallet", "==", store?.wallet)
      );
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const mapped = querySnapshot.docs.map(async function (doc) {
          const data = doc.data();
          const qr = data.qr;
          return getDownloadURL(ref(storage, qr)).then((url) => {
            return { ...data, qRUrl: url, id: doc.id } as unknown as Promotion;
          });
        });
        Promise.all(mapped).then((result) => {
          setPromotions(result);
        });
      });
      return unsubscribe;
    }
  }, [store?.wallet]);

  useEffect(() => {
    const getData = async () => {
      const docRef = doc(db, "vendors", `${store?.wallet}`);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        console.log("Document data:", docSnap.data());
        const data = docSnap.data() as Vendor;
        setVendor(data);
      } else {
        console.log("No such document!");
      }
    };
    getData();
  }, [store?.wallet]);

  return (
    <div className="mx-auto max-w-7xl p-16">
      <div className="space-y-12">
        <div className="pb-12">
          <div className="grid grid-cols-1 gap-4 justify-between items-center mb-16">
            <h2 className="font-bold text-gray-900 text-center text-6xl">
              {vendor.businessName}
            </h2>
            <p className="text-lg font-semibold text-gray-600 text-center">
              {vendor.businessStreetAddress} {vendor.businessCity}{" "}
              {vendor.businessCountry} {vendor.businessPostalCode}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3">
            {promotions &&
              promotions.map(function (promotion: Promotion, index) {
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
                      <a href={`qr/${promotion.id}/${promotion.key}`}>
                        <p className="mt-8 border px-4 py-2 border-black">
                          SIMULATE SCAN
                        </p>
                      </a>
                      <p className="w-full mt-4 text-right">
                        {promotion.points}
                      </p>
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
