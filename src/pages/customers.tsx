import useStore from "@/lib/useStore";
import useAuthStore from "@/lib/store";
import { useRouter } from "next/router";
import { db } from "../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { PatronToPromotion } from "../types";

export default function Customers() {
  const store = useStore(useAuthStore, (state) => state);
  const [patrons, setPatrons] = useState<PatronToPromotion[]>([]);

  useEffect(() => {
    if (store?.wallet) {
      const q = query(
        collection(db, "patronToPromotions"),
        where("businessWallet", "==", store?.wallet)
      );
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const mapped = querySnapshot.docs.map(async function (doc) {
          const data = doc.data();
          return { ...data, id: doc.id } as unknown as PatronToPromotion;
        });
        Promise.all(mapped).then((result) => {
          setPatrons(result);
        });
      });
      return unsubscribe;
    }
  }, [store?.wallet]);

  return (
    <div className="mx-auto max-w-7xl p-16">
      <div className="mt-16">
        <div className="mt-8 sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-base font-semibold leading-6 text-gray-900">
              Customers
            </h1>
            <p className="mt-2 text-sm text-gray-700">
              A list of customers with promotion claim history
            </p>
          </div>
        </div>

        <div className="mt-8 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <table className="min-w-full divide-y divide-gray-300">
                <thead>
                  <tr>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"
                    >
                      Created
                    </th>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"
                    >
                      Last Update
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Wallet
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Promotion ID
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Promotion Reward
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Points
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {patrons.map(function (patron: PatronToPromotion) {
                    return (
                      <tr key={patron.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                          {patron.createdAt}
                        </td>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                          {patron.updatedAt}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {patron.patronWallet}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {patron.promotionId}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {patron.reward}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {patron.points}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
