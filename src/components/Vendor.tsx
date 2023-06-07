import { useEffect, Fragment, useState } from "react";
import useStore from "../store";
import { createVendorCard, getVendorCard, storage } from "../firebase";
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import QRCode from "qrcode";
import { v4 as uuidv4 } from "uuid";
import { Dialog, Transition } from "@headlessui/react";

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

  const handleChange = (event: any) => {
    setState({
      ...state,
      [event.target.id]: event.target.value,
    });
  };
  const createCard = async () => {
    if (smartAccount) {
      const key = uuidv4();
      const qr = await QRCode.toDataURL(
        `loyalty-iota.vercel.app/qr/${smartAccount.address}/${key}`
      );
      const storageRef = ref(storage, `qr/${smartAccount.address}.png`);
      const uploadTask = await uploadString(storageRef, qr, "data_url");
      const QRURL = uploadTask.metadata.fullPath;
      await createVendorCard(
        smartAccount.address,
        state.name,
        state.reward,
        Number(state.points),
        QRURL,
        key
      );
    }
    setCreateOpen(false);
  };

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

function NewVendorForm() {
  const [state, setState] = useState({
    name: "",
    points: "5",
    reward: "",
  });

  const smartAccount = useStore((state: any) => state.smartAccount);
  const handleChange = (event: any) => {
    setState({
      ...state,
      [event.target.id]: event.target.value,
    });
  };
  const createCard = async () => {
    if (smartAccount) {
      const key = uuidv4();
      const qr = await QRCode.toDataURL(
        `loyalty-iota.vercel.app/qr/${smartAccount.address}/${key}`
      );
      const storageRef = ref(storage, `qr/${smartAccount.address}.png`);
      const uploadTask = await uploadString(storageRef, qr, "data_url");
      const QRURL = uploadTask.metadata.fullPath;
      await createVendorCard(
        smartAccount.address,
        state.name,
        state.reward,
        Number(state.points),
        QRURL,
        key
      );
    }
  };
  return (
    <div className="px-6 py-12 text-center sm:rounded-3xl sm:px-16 grid grid-cols-1 gap-4">
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium leading-6 text-black"
        >
          What is your company name?
        </label>
        <div className="mt-2">
          <input
            onChange={handleChange}
            id="name"
            name="name"
            type="text"
            required
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          />
        </div>
      </div>
      <div>
        <label
          htmlFor="reward"
          className="block text-sm font-medium leading-6 text-black"
        >
          What is the reward your customers will earn?
        </label>
        <div className="mt-2">
          <input
            onChange={handleChange}
            id="reward"
            name="reward"
            type="text"
            required
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          />
        </div>
      </div>
      <div>
        <label
          htmlFor="points"
          className="block text-sm font-medium leading-6 text-black"
        >
          How many points does a customer require to earn the reward?
        </label>
        <select
          onChange={handleChange}
          id="points"
          name="points"
          className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
          defaultValue="5"
        >
          <option>5</option>
          <option>10</option>
          <option>15</option>
        </select>
      </div>
      <button
        onClick={() => createCard()}
        className="border px-4 py-2 border-black mt-8"
      >
        Get a Vendor Loyalty Card
      </button>
    </div>
  );
}
