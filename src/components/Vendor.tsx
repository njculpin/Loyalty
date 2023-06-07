import { useEffect, Fragment, useState } from "react";
import { createVendorCard, getVendorCard, storage } from "../firebase";
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import QRCode from "qrcode";
import { v4 as uuidv4 } from "uuid";

type VendorCard = {
  vendor: "";
  name: "";
  reward: "";
  points: 0;
  pointCap: 0;
  qr: "";
  qrUrl: "";
  key: "";
};

export default function Vendor() {
  const [loading, setLoading] = useState<boolean>(false);

  const [createOpen, setCreateOpen] = useState<boolean>(false);

  const actions = useStore((state: any) => state.actions);
  const smartAccount = useStore((state: any) => state.smartAccount);
  const vendorCards = useStore((state: any) => state.vendorCards);

  useEffect(() => {
    getCard();
  }, [smartAccount]);

  const getCard = async () => {
    setLoading(true);
    if (smartAccount) {
      const result = await getVendorCard(smartAccount.address);
      const card = result as unknown as VendorCard;
      if (card && card.qr) {
        const qr = card.qr;
        const url = await getDownloadURL(ref(storage, qr));
        await actions.setVendorCard({ ...card, qrUrl: url });
      }
    }
    // set loading changes to false, faster than setVendor completes causing a flicker
    setLoading(false);
  };

  const [state, setState] = useState({
    name: "",
    points: "5",
    reward: "",
  });

  return (
    <div className="p-16">
      <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
        {smartAccount && (
          <div className="relative isolate overflow-hidden px-6 py-12 text-center sm:rounded-3xl sm:px-16">
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              Create
            </button>
            <div className="mt-10 grid grid-cols-2 gap-8 justify-center gap-x-6">
              {vendorCards && vendorCards.length > 0 ? (
                vendorCards.map(function (vendor: VendorCard) {
                  return <VendorCard {...vendor} key={vendor.key} />;
                })
              ) : (
                <></>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function VendorCard(vendor: VendorCard) {
  return (
    <div className="px-6 py-12 text-center sm:rounded-3xl sm:px-16 grid grid-cols-1 gap-8">
      <h1 className="mt-4 text-4xl tracking-tight font-extrabold text-black sm:mt-5 sm:text-6xl lg:mt-6 xl:text-8xl">
        <span className="">Earn a </span>
        <span className=" text-green-400">{vendor.reward}</span>
        <span> for </span>
        <span className=" text-yellow-400">{vendor.pointCap}</span>
        <span> points </span>
        <span>from </span>
        <span className=" text-red-400">{vendor.name}</span>
        <span> scan that shit now</span>
      </h1>
      <div className="w-full flex flex-col justify-center items-center p-8">
        <img
          style={{ height: "256", width: "256" }}
          src={vendor.qrUrl}
          alt="qr code"
        />
      </div>
      <a href={`qr/${vendor.vendor}/${vendor.key}`}>
        <p className="border px-4 py-2 border-black">SIMULATE SCAN</p>
      </a>
    </div>
  );
}
