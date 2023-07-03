import { useEffect, Fragment, useState } from "react";
import { useRouter } from "next/router";
import { storage, db } from "../../firebase";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { ref, uploadString } from "firebase/storage";
import { Dialog, Transition } from "@headlessui/react";
import { CheckIcon } from "@heroicons/react/24/outline";
import QRCode from "qrcode";
import Select from "react-select";
import { v4 as uuidv4 } from "uuid";
import useAuthStore from "@/lib/store";
import useStore from "@/lib/useStore";
import { Vendor } from "../../types";

const options = [
  { value: "points", label: "Points" },
  { value: "coins", label: "LYLT Coin" },
];

const Create = () => {
  const router = useRouter();
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [selected, setSelected] = useState("");
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
  });
  const [promotion, setPromotion] = useState({
    pointsRequired: 0,
    coinsRequired: 0,
    coins: 0,
    points: 0,
    reward: "",
    key: "",
    qRUrl: "",
  });
  const store = useStore(useAuthStore, (state) => state);

  useEffect(() => {
    if (store?.wallet) {
      const q = doc(db, "vendors", store?.wallet);
      const unsubscribe = onSnapshot(q, (doc) => {
        if (!doc.exists) {
          return;
        }
        const data = doc.data() as Vendor;
        if (data) {
          console.log(data);
          setVendor(data);
        }
      });
      return unsubscribe;
    }
  }, [store?.wallet]);

  const handleChange = (event: any) => {
    setPromotion({
      ...promotion,
      [event.target.id]: event.target.value,
    });
  };

  const createCard = async () => {
    try {
      if (store?.wallet) {
        const docRef = uuidv4();
        const key = uuidv4();
        const qr = await QRCode.toDataURL(
          `loyalty-iota.vercel.app/qr/${docRef}/${key}`
        );
        const storageRef = ref(storage, `qr/${docRef}.png`);
        const uploadTask = await uploadString(storageRef, qr, "data_url");
        const QRURL = uploadTask.metadata.fullPath;
        const promoDetails = {
          active: true,
          businessWallet: store.wallet,
          businessCity: vendor.businessCity,
          businessEmail: vendor.businessEmail,
          businessName: vendor.businessName,
          businessPhone: vendor.businessPhone,
          businessPostalCode: vendor.businessPostalCode,
          businessRegion: vendor.businessRegion,
          businessStreetAddress: vendor.businessStreetAddress,
          businessCountry: vendor.businessCountry,
          pointsRequired: Number(promotion.pointsRequired),
          coinsRequired: Number(promotion.coinsRequired),
          coins: 0,
          points: 0,
          reward: promotion.reward,
          key: key,
          qr: QRURL,
          minted: false,
          price: 0,
        };
        await setDoc(doc(db, "promotions", docRef), {
          ...promoDetails,
          createdAt: new Date().getTime(),
          updatedAt: new Date().getTime(),
        })
          .then(() => {
            // TODO: Firebase - Record Event
            setOpenModal(true);
          })
          .catch((e) => {
            console.log(e);
          });
      }
    } catch (e) {
      console.log(e);
    }
  };

  const handleSelectChange = (e: any) => {
    setSelected(e.value);
    console.log("e", e);
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
                className="block text-sm font-medium leading-6 text-black"
              >
                What type of asset is required to earn the reward?
              </label>
              <div className="mt-2">
                <Select options={options} onChange={handleSelectChange} />
              </div>
            </div>
            {selected === "points" && (
              <div className="sm:col-span-4">
                <label
                  htmlFor="pointsRequired"
                  className="block text-sm font-medium leading-6 text-black"
                >
                  How many points does a customer require to earn the reward?
                </label>
                <div className="mt-2">
                  <input
                    onChange={handleChange}
                    id="pointsRequired"
                    name="pointsRequired"
                    type="number"
                    pattern="[0-9]*"
                    required
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>
            )}
            {selected === "coins" && (
              <div className="sm:col-span-4">
                <label
                  htmlFor="pointsRequired"
                  className="block text-sm font-medium leading-6 text-black"
                >
                  How much LYLT does a customer require to earn the reward?
                </label>
                <div className="mt-2">
                  <input
                    onChange={handleChange}
                    id="coinsRequired"
                    name="coinsRequired"
                    type="number"
                    pattern="[0-9]*"
                    required
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>
            )}
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
