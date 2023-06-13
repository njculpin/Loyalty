import { useEffect, Fragment, useState } from "react";
import { useRouter } from "next/router";
import { storage, db } from "../../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ref, uploadString } from "firebase/storage";
import { Dialog, Transition } from "@headlessui/react";
import { CheckIcon } from "@heroicons/react/24/outline";
import QRCode from "qrcode";
import Select from "react-select";
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
  businessWallet: string;
  pointCap: number;
  coinCap: number;
  valueCap: number;
  reward: string;
};

const options = [
  { value: "points", label: "Points" },
  { value: "lylt", label: "LYLT Coin" },
  { value: "lyltb", label: "LYLT NFT" },
];

const Create = () => {
  const router = useRouter();
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
    businessWallet: "",
    pointCap: 0,
    coinCap: 0,
    valueCap: 0,
    reward: "",
  });
  const store = useStore(useAuthStore, (state) => state);

  useEffect(() => {
    const getData = async () => {
      const docRef = doc(db, "vendors", `${store?.wallet}`);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        console.log("Document data:", docSnap.data());
        const data = docSnap.data() as VendorCard;
        setState(data);
      } else {
        console.log("No such document!");
      }
    };
    getData();
  }, [store?.wallet]);

  const handleChange = (event: any) => {
    setState({
      ...state,
      [event.target.id]: event.target.value,
    });
  };

  const createCard = async () => {
    if (store?.wallet) {
      const docRef = uuidv4();
      const key = uuidv4();
      const qr = await QRCode.toDataURL(
        `loyalty-iota.vercel.app/qr/${docRef}/${key}`
      );
      const storageRef = ref(storage, `qr/${docRef}.png`);
      const uploadTask = await uploadString(storageRef, qr, "data_url");
      const QRURL = uploadTask.metadata.fullPath;
      const cardDetails = {
        active: true,
        businessCity: state.businessCity,
        businessEmail: state.businessEmail,
        businessName: state.businessName,
        businessPhone: state.businessPhone,
        businessPostalCode: state.businessPostalCode,
        businessRegion: state.businessRegion,
        businessStreetAddress: state.businessStreetAddress,
        businessCountry: state.businessCountry,
        businessWallet: store.wallet,
        points: 0,
        pointCap: Number(state.pointCap),
        coinCap: Number(state.coinCap),
        valueCap: Number(state.valueCap),
        reward: state.reward,
        qr: QRURL,
        key: key,
      };
      await setDoc(doc(db, "promotions", docRef), {
        ...cardDetails,
        updatedAt: new Date().getTime(),
      })
        .then(() => {
          setOpenModal(true);
        })
        .catch((e) => {
          console.log(e);
        });
    }
  };

  const returnHome = () => {
    setOpenModal(false);
    return router.push(`/`);
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
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>
            <div className="sm:col-span-4">
              <label
                htmlFor="reward"
                className="block text-sm font-medium leading-6 text-black mt-8"
              >
                What type of asset is required to earn the reward?
              </label>
              <div className="mt-2">
                <Select options={options} isMulti />
              </div>
            </div>
            <div className="sm:col-span-4">
              <label
                htmlFor="pointCap"
                className="block text-sm font-medium leading-6 text-black"
              >
                How many points does a customer require to earn the reward?
              </label>
              <div className="mt-2">
                <input
                  onChange={handleChange}
                  id="pointCap"
                  name="pointCap"
                  type="number"
                  pattern="[0-9]*"
                  required
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>
            <div className="sm:col-span-4">
              <label
                htmlFor="pointCap"
                className="block text-sm font-medium leading-6 text-black"
              >
                How much LYLT does a customer require to earn the reward?
              </label>
              <div className="mt-2">
                <input
                  onChange={handleChange}
                  id="coinCap"
                  name="coinCap"
                  type="number"
                  pattern="[0-9]*"
                  required
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>
            <div className="sm:col-span-4">
              <label
                htmlFor="pointCap"
                className="block text-sm font-medium leading-6 text-black"
              >
                What is the point value of the NFT that the customer requires to
                earn the reward?
              </label>
              <div className="mt-2">
                <input
                  onChange={handleChange}
                  id="valueCap"
                  name="valueCap"
                  type="number"
                  pattern="[0-9]*"
                  required
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-x-6">
        <button
          type="submit"
          onClick={() => createCard()}
          className="rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
        >
          Submit
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
                      className="inline-flex w-full justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
                      onClick={() => returnHome()}
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
