import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  runTransaction,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import useStore from "@/lib/useStore";
import useAuthStore from "@/lib/store";
import { NFT } from "../types";

const Shop = () => {
  const store = useStore(useAuthStore, (state) => state);
  const [nfts, setNFTS] = useState<NFT[]>([]);

  useEffect(() => {
    if (store?.wallet) {
      const q = query(collection(db, "nfts"), where("forSale", "==", true));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const mapped = querySnapshot.docs.map(async function (doc) {
          const data = doc.data();
          return { ...data, id: doc.id } as unknown as NFT;
        });
        Promise.all(mapped).then((result) => {
          setNFTS(result);
        });
      });
      return unsubscribe;
    }
  }, [store?.wallet]);

  const buyNFT = async (nftId: string, seller: string, price: number) => {
    try {
      const currentTime = new Date().getTime();
      const walletRef = doc(db, "wallets", `${store?.wallet}`);
      await runTransaction(db, async (transaction) => {
        const doc = await transaction.get(walletRef);
        if (!doc.exists()) {
          throw "Document does not exist!";
        }
        const oldData = doc.data().coins;
        const newCoins = oldData - price;
        transaction.update(walletRef, {
          coins: newCoins,
          updatedAt: currentTime,
        });
      });
      const sellerRef = doc(db, "wallets", `${seller}`);
      await runTransaction(db, async (transaction) => {
        const doc = await transaction.get(sellerRef);
        if (!doc.exists()) {
          throw "Document does not exist!";
        }
        const oldData = doc.data().coins;
        const newCoins = oldData + price;
        transaction.update(sellerRef, {
          coins: newCoins,
          updatedAt: currentTime,
        });
      });
      await updateDoc(doc(db, "nfts", `${nftId}`), {
        owner: `${store?.wallet}`,
        forSale: false,
        updatedAt: new Date().getTime(),
      })
        .then(() => {
          console.log("complete");
        })
        .catch((e) => {
          console.log(e);
        });
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div className="mx-auto max-w-7xl overflow-hidden sm:px-6 lg:px-8">
      <div className="mx-auto overflow-hidden px-4 lg:px-8">
        <h2 className="sr-only">Products</h2>
        {/* NFT Sales */}
        <div className="mt-8 grid grid-cols-1 gap-y-12 sm:grid-cols-3 sm:gap-x-6 xl:gap-x-8">
          {nfts.map((promotion) => (
            <div className="rounded-lg border p-4" key={promotion.id}>
              <div className="m-2 text-center space-y-2">
                <p className="text-xs text-gray-600 italic">{promotion.id}</p>
                <h3 className="text-2xl font-bold text-gray-900">
                  {promotion.reward} NFT
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  earn ${(1 / promotion.totalSupply).toFixed(8)} LYLT per tx.
                </p>
                <button
                  onClick={() =>
                    buyNFT(
                      promotion.id,
                      promotion.businessWallet,
                      promotion.price
                    )
                  }
                  className="rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
                >
                  Buy {promotion.price} LYLT
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
