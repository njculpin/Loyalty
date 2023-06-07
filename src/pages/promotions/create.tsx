import { useEffect, Fragment, useState } from "react";
import { createVendorCard, getVendorCard, storage } from "../../firebase";
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import QRCode from "qrcode";
import { v4 as uuidv4 } from "uuid";
import useAuthStore from "@/lib/store";
import useStore from "@/lib/useStore";

const Create = () => {
  const [state, setState] = useState({
    name: "",
    points: "5",
    reward: "",
  });
  const store = useStore(useAuthStore, (state) => state);

  const handleChange = (event: any) => {
    setState({
      ...state,
      [event.target.id]: event.target.value,
    });
  };

  const createCard = async () => {
    if (store?.wallet) {
      const key = uuidv4();
      const qr = await QRCode.toDataURL(
        `loyalty-iota.vercel.app/qr/${store.wallet}/${key}`
      );
      const storageRef = ref(storage, `qr/${store.wallet}.png`);
      const uploadTask = await uploadString(storageRef, qr, "data_url");
      const QRURL = uploadTask.metadata.fullPath;
      await createVendorCard(
        store.wallet,
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
};

export default Create;
