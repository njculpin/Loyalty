import { useEffect, Fragment, useState } from "react";
import { createVendorCard, getVendor, storage } from "../firebase";
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import { Dialog, Transition } from "@headlessui/react";
import { CheckIcon } from "@heroicons/react/24/outline";
import QRCode from "qrcode";
import { v4 as uuidv4 } from "uuid";
import useAuthStore from "@/lib/store";
import useStore from "@/lib/useStore";

type VendorCard = {
  businessCity: string;
  businessEmail: string;
  businessName: string;
  businessPhone: string;
  businessPostalCode: string;
  businessRegion: string;
  businessStreetAddress: string;
  businessCountry: string;
  wallet: string;
  name: string;
  pointCap: string;
  reward: string;
};

const Create = () => {
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [state, setState] = useState({
    businessCity: "",
    businessEmail: "",
    businessName: "",
    businessPhone: "",
    businessPostalCode: "",
    businessRegion: "",
    businessStreetAddress: "",
    businessCountry: "",
    wallet: "",
    name: "",
    pointCap: "",
    reward: "",
  });
  const store = useStore(useAuthStore, (state) => state);

  // todo: get vendor details, bind to vendor card
  useEffect(() => {
    const getData = async () => {
      if (store?.wallet) {
        return (await getVendor(store?.wallet)) as VendorCard;
      }
    };
    getData()
      .then((res: any) => {
        if (res) {
          const vendor = JSON.parse(res);
          setState({ ...vendor });
        }
      })
      .catch((e) => {
        console.log(e);
      });
  }, [store?.wallet]);

  const handleChange = (event: any) => {
    console.log("event", event.target.id, event.target.value);
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
      const cardDetails = {
        businessCity: state.businessCity,
        businessEmail: state.businessEmail,
        businessName: state.businessName,
        businessPhone: state.businessPhone,
        businessPostalCode: state.businessPostalCode,
        businessRegion: state.businessRegion,
        businessStreetAddress: state.businessStreetAddress,
        businessCountry: state.businessCountry,
        wallet: store.wallet,
        points: 0,
        pointCap: Number(state.pointCap),
        reward: state.reward,
        qr: QRURL,
        key: key,
      };
      console.log("cardDetails", cardDetails);
      await createVendorCard(cardDetails);
      setOpenModal(true);
    }
  };

  return (
    <div className="mx-auto max-w-7xl p-16">
      <div className="space-y-12">
        <div className="border-b border-gray-900/10 pb-12">
          <h2 className="text-base font-semibold leading-7 text-gray-900">
            Promotion Information
          </h2>
          <p className="mt-1 text-sm leading-6 text-gray-600">
            Use this form to create a new promotion. Describe how many points
            are required, and what your customers will earn.
          </p>
          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="sm:col-span-4">
              <label
                htmlFor="reward"
                className="block text-sm font-medium leading-6 text-black mt-8"
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
            <div className="sm:col-span-4">
              <label
                htmlFor="pointCap"
                className="block text-sm font-medium leading-6 text-black"
              >
                How many points does a customer require to earn the reward?
              </label>
              <select
                onChange={handleChange}
                id="pointCap"
                name="pointCap"
                className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                defaultValue="5"
              >
                <option>5</option>
                <option>10</option>
                <option>15</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-x-6">
        <button
          type="submit"
          onClick={() => createCard()}
          className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Save
        </button>
      </div>
      <Transition.Root show={openModal} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={setOpenModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm sm:p-6">
                  <div>
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                      <CheckIcon
                        className="h-6 w-6 text-green-600"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="mt-3 text-center sm:mt-5">
                      <Dialog.Title
                        as="h3"
                        className="text-base font-semibold leading-6 text-gray-900"
                      >
                        Details Saved
                      </Dialog.Title>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Your business details have been saved.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-6">
                    <button
                      type="button"
                      className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                      onClick={() => setOpenModal(false)}
                    >
                      Go back to dashboard
                    </button>
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

export default Create;
