import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db, storage } from "../firebase";
import { ref, getDownloadURL } from "firebase/storage";
import useStore from "@/lib/useStore";
import useAuthStore from "@/lib/store";
import { Promotion } from "../types";

const Shop = () => {
  const store = useStore(useAuthStore, (state) => state);
  const [promotions, setPromotions] = useState<Promotion[]>([]);

  useEffect(() => {
    if (store?.wallet) {
      const q = query(
        collection(db, "promotions"),
        where("minted", "==", true),
        where("supply", ">=", 1)
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

  return (
    <div className="mx-auto max-w-7xl overflow-hidden sm:px-6 lg:px-8">
      <div className="mx-auto overflow-hidden px-4 lg:px-8">
        <h2 className="sr-only">Products</h2>
        {/* NFT Sales */}
        <div className="-mx-px grid grid-cols-2 border-l border-gray-200 sm:mx-0 md:grid-cols-3 lg:grid-cols-4">
          {promotions.map((product) => (
            <div
              key={product.id}
              className="group relative border-b border-r border-gray-200 p-4 sm:p-6"
            >
              <div className="pb-4 pt-10 text-center space-y-4">
                <h3 className="text-2xl font-bold text-gray-900">
                  {product.reward} NFT
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  earn ${(1 / product.totalSupply).toFixed(8)} LYLT per tx.
                </p>
                <p className="mt-4 text-base font-medium text-gray-900">
                  {product.supply} / {product.totalSupply} remaining
                </p>
                <button className="rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600">
                  Buy {product.price} LYLT
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Shop;
