import useStore from "@/lib/useStore";
import useAuthStore from "@/lib/store";
import { db } from "../firebase";
import { doc, collection, query, where, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";

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
  points: number;
};

export default function Account() {
  const store = useStore(useAuthStore, (state) => state);
  const [patronCount, setPatronCount] = useState<number>(0);
  const [promotionsCount, setPromotionsCount] = useState<number>(0);
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
    points: 0,
  });

  useEffect(() => {
    if (store?.wallet) {
      const q = doc(db, "vendors", `${store?.wallet}`);
      const unsubscribe = onSnapshot(q, (doc) => {
        const data = doc.data() as Vendor;
        console.log(data);
        setVendor(data);
      });
      return unsubscribe;
    }
  }, [store?.wallet]);

  useEffect(() => {
    if (store?.wallet) {
      const q = query(
        collection(db, "patrons"),
        where("businessWallet", "==", store?.wallet)
      );
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const count = querySnapshot.docs.length;
        setPatronCount(count);
      });
      return unsubscribe;
    }
  }, [store?.wallet]);

  useEffect(() => {
    if (store?.wallet) {
      const q = query(
        collection(db, "promotions"),
        where("businessWallet", "==", store?.wallet)
      );
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const count = querySnapshot.docs.length;
        setPromotionsCount(count);
      });
      return unsubscribe;
    }
  }, [store?.wallet]);

  return (
    <div className="mx-auto max-w-7xl p-16">
      <div>
        <h3 className="text-base font-semibold leading-6 text-gray-900">
          Account Balance
        </h3>
        <div className="border-b pb-8 mb-8">
          <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-4">
            <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
              <dt className="truncate text-sm font-medium text-gray-500">
                Points
              </dt>
              <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
                {vendor.points}
              </dd>
            </div>
            <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
              <dt className="truncate text-sm font-medium text-gray-500">
                LYLT
              </dt>
              <dd className="mt-1 text-3xl font-semibold tracking-tight text-green-600">
                0
              </dd>
            </div>
            <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
              <dt className="truncate text-sm font-medium text-gray-500">
                Customers
              </dt>
              <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
                {patronCount}
              </dd>
            </div>
            <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
              <dt className="truncate text-sm font-medium text-gray-500">
                Promotions
              </dt>
              <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
                {promotionsCount}
              </dd>
            </div>
          </dl>
        </div>
        <h3 className="text-base font-semibold leading-6 text-gray-900">
          NFTs
        </h3>
      </div>
    </div>
  );
}
