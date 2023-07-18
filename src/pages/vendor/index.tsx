import { useEffect, useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { doc, getDoc } from "firebase/firestore";
import { storage, db } from "../../firebase";
import { ref, getDownloadURL } from "firebase/storage";
import Link from "next/link";
import useStore from "@/lib/useStore";
import useAuthStore from "@/lib/store";
import { Vendor } from "../../types";

const Index = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const store = useStore(useAuthStore, (state) => state);
  const [open, setOpen] = useState(false);

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
    qRUrl: "",
  });

  useEffect(() => {
    const getData = async () => {
      try {
        setLoading(true);
        if (!store?.wallet) {
          return;
        }
        const docRef = doc(db, "wallets", store?.wallet);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as any;
          const qRUrl = data.qRUrl;
          const url = await getDownloadURL(ref(storage, qRUrl));
          setVendor({ ...data, qRUrl: url });
        } else {
          console.log("No such vendor!");
        }
        setLoading(false);
      } catch (e) {
        console.log(e);
      }
    };
    getData();
  }, [store?.wallet]);

  return (
    <div className="mx-auto max-w-7xl p-16">
      {loading && <p>Loading</p>}
      {store?.wallet && !loading && (
        <div className="flex justify-center items-center">
          <div className="rounded-3xl flex flex-col justify-between items-center">
            <div className="mb-6">
              <h2 className="font-bold text-center text-6xl">
                {vendor.businessName}
              </h2>
              <p className="text-lg font-semibold text-center">
                {vendor.businessStreetAddress} {vendor.businessCity}{" "}
                {vendor.businessCountry} {vendor.businessPostalCode}
              </p>
              <div className="w-128 flex flex-col justify-center items-center">
                <img
                  style={{ height: "256", width: "256" }}
                  src={vendor.qRUrl}
                  alt="qr code"
                />
              </div>
              <Link href={`qr/v/${vendor.businessWallet}`}>
                <p className="mt-8 border px-4 py-2 border-black">
                  SIMULATE SCAN
                </p>
              </Link>
            </div>
            <button
              className="rounded px-4 py-2 bg-green-700 text-white"
              onClick={() => setOpen(true)}
            >
              present mode
            </button>
          </div>
        </div>
      )}
      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={setOpen}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-green-600 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center sm:items-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="bg-green-600 relative transform overflow-hidden rounded-lg px-4 pb-4 pt-5 text-left transition-all sm:my-8 sm:w-full sm:max-w-sm sm:p-6">
                  <div className="flex flex-col justify-center items-center">
                    <h2 className="font-bold text-white text-center text-6xl m-2">
                      {vendor.businessName}
                    </h2>
                    <p className="text-lg font-semibold text-white text-center m-2">
                      {vendor.businessStreetAddress} {vendor.businessCity}{" "}
                      {vendor.businessCountry} {vendor.businessPostalCode}
                    </p>
                    <div className="w-128 flex flex-col justify-center items-center">
                      <img
                        style={{ height: "256", width: "256" }}
                        src={vendor.qRUrl}
                        alt="qr code"
                      />
                    </div>
                    <Link href={`qr/v/${vendor.businessWallet}`}>
                      <p className="mt-8 border px-4 py-2 border-black">
                        SIMULATE SCAN
                      </p>
                    </Link>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </div>
  );
};

export default Index;
