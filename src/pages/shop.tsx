import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db, storage } from "../firebase";
import { ref, getDownloadURL } from "firebase/storage";
import Link from "next/link";
import useStore from "@/lib/useStore";
import useAuthStore from "@/lib/store";
import { Vendor, Promotion } from "../types";
import { StarIcon } from "@heroicons/react/20/solid";

const products = [
  {
    id: 1,
    name: "Bacon Bacon",
    price: "$20",
    rating: 5,
    reviewCount: 38,
    imageSrc: "/bacon.jpeg",
    imageAlt: "TODO",
    href: "#",
  },
  {
    id: 2,
    name: "Bacon Club Hat",
    price: "$30",
    rating: 5,
    reviewCount: 18,
    imageSrc: "/baconclubhat.jpeg",
    imageAlt: "TODO",
    href: "#",
  },
  {
    id: 3,
    name: "Bacon Club Iron",
    price: "$150",
    rating: 5,
    reviewCount: 14,
    imageSrc: "/baconclubiron.jpeg",
    imageAlt: "TODO",
    href: "#",
  },
  {
    id: 4,
    name: "Bacon Club Mug",
    price: "$15",
    rating: 5,
    reviewCount: 14,
    imageSrc: "/baconclubmug.jpeg",
    imageAlt: "TODO",
    href: "#",
  },
];

function classNames(...classes: any) {
  return classes.filter(Boolean).join(" ");
}

const Shop = () => {
  const store = useStore(useAuthStore, (state) => state);
  const [promotions, setPromotions] = useState<Promotion[]>([]);

  useEffect(() => {
    if (store?.wallet) {
      const q = query(
        collection(db, "promotions"),
        where("businessWallet", "==", store?.wallet),
        where("minted", "==", true)
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
        {/* Physical Product Sales */}
        <div className="-mx-px grid grid-cols-2 border-l border-t border-gray-200 sm:mx-0 md:grid-cols-3 lg:grid-cols-4 mb-16">
          {products.map((product) => (
            <div
              key={product.id}
              className="group relative border-b border-r border-gray-200 p-4 sm:p-6"
            >
              <div className="aspect-h-1 aspect-w-1 overflow-hidden rounded-lg bg-gray-200 group-hover:opacity-75">
                <img
                  src={product.imageSrc}
                  alt={product.imageAlt}
                  className="h-full w-full object-cover object-center"
                />
              </div>
              <div className="pb-4 pt-10 text-center">
                <h3 className="text-sm font-medium text-gray-900">
                  <a href={product.href}>
                    <span aria-hidden="true" className="absolute inset-0" />
                    {product.name}
                  </a>
                </h3>
                <div className="mt-3 flex flex-col items-center">
                  <p className="sr-only">{product.rating} out of 5 stars</p>
                  <div className="flex items-center">
                    {[0, 1, 2, 3, 4].map((rating) => (
                      <StarIcon
                        key={rating}
                        className={classNames(
                          product.rating > rating
                            ? "text-yellow-400"
                            : "text-gray-200",
                          "h-5 w-5 flex-shrink-0"
                        )}
                        aria-hidden="true"
                      />
                    ))}
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    {product.reviewCount} reviews
                  </p>
                </div>
                <p className="mt-4 text-base font-medium text-gray-900">
                  {product.price} LYLT
                </p>
              </div>
            </div>
          ))}
        </div>
        {/* NFT Sales */}
        <div className="-mx-px grid grid-cols-2 border-l border-t border-gray-200 sm:mx-0 md:grid-cols-3 lg:grid-cols-4">
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
