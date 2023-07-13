import { useEffect, useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { doc, getDoc } from "firebase/firestore";
import { storage, db } from "../firebase";
import { ref, getDownloadURL } from "firebase/storage";
import Link from "next/link";
import useStore from "@/lib/useStore";
import useAuthStore from "@/lib/store";
import { Vendor } from "../types";
import {
  ArrowPathIcon,
  CloudArrowUpIcon,
  Cog6ToothIcon,
  FingerPrintIcon,
  LockClosedIcon,
  ServerIcon,
} from "@heroicons/react/20/solid";
import NewsSignup from "@/components/NewsSignup";

const features = [
  {
    name: "LYLT Coin",
    description: "Uses the industry contract standards, proven and secure.",
    icon: CloudArrowUpIcon,
  },
  {
    name: "Loyalty NFTs",
    description: "Create customized transferrable rewards",
    icon: Cog6ToothIcon,
  },
  {
    name: "Regulatory Compliance",
    description: "Regulatory Compliance by Everest.org",
    icon: LockClosedIcon,
  },
  {
    name: "Cross-vendor Marketplace",
    description: "Cross-vendor Marketplace",
    icon: ArrowPathIcon,
  },
  {
    name: "Oracles",
    description:
      "Chainlink provides an oracle to continuously maintain and verify the value of promotions",
    icon: FingerPrintIcon,
  },

  {
    name: "Production Sourcing and Fulfillment",
    description: "Production Sourcing and Fulfillment",
    icon: ServerIcon,
  },
];

const caseStudies = [
  {
    name: "Bacon Club",
    description:
      "Drop ship based e-commerce looking to promote and retain monthly subscription customers.",
    href: "/cases/bacon-club",
    icon: "/bacon.png",
  },
  {
    name: "Roaming Travelers",
    description:
      "Retail brick & mortar store looking to improve customer retention from initial in-person tourism driven foot traffic.",
    href: "/cases/roaming",
    icon: "/roamingtravelers.png",
  },
  {
    name: "Food Alliance",
    description:
      "Bridging customers to a web3 experience within a traditional comfort zone of usability while rewarding interactions.",
    href: "/cases/food-alliance",
    icon: "/nffa.png",
  },
];

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
      <div className="flex justify-center items-center my-8">
        <p className="italic text-center bg-gray-50 max-w-2xl rounded-xl p-8 mb-8">
          By default a user will be able to view all promotion rewards available
          to them by every store that they have been a customer of here. This
          will show their individual point balances and rewards which maybe
          added to their cart and presented to the shop owner.
        </p>
      </div>
      {loading && <p>Loading</p>}
      {store?.wallet && !loading && (
        <div className="flex justify-center items-center">
          <div className="rounded-3xl flex flex-col justify-between items-center">
            <div className="mb-6">
              <h2 className="font-bold text-center text-6xl">
                Shop for Rewards
              </h2>
              <p className="text-lg font-semibold text-center">
                These products are available to you to redeem from their
                respective stores.
              </p>
            </div>
            <div className="bg-gray-100">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-2xl py-16 sm:py-24 lg:max-w-none lg:py-32">
                  <h2 className="text-2xl font-bold text-gray-900">Stores</h2>
                  {/* <div className="mt-6 space-y-12 lg:grid lg:grid-cols-3 lg:gap-x-6 lg:space-y-0">
                    {myCards.map((card) => (
                      <div key={callout.name} className="group relative">
                        <div className="relative h-80 w-full overflow-hidden rounded-lg bg-white sm:aspect-h-1 sm:aspect-w-2 lg:aspect-h-1 lg:aspect-w-1 group-hover:opacity-75 sm:h-64">
                          <img
                            src={callout.imageSrc}
                            alt={callout.imageAlt}
                            className="h-full w-full object-cover object-center"
                          />
                        </div>
                        <h3 className="mt-6 text-sm text-gray-500">
                          <a href={callout.href}>
                            <span className="absolute inset-0" />
                            {callout.name}
                          </a>
                        </h3>
                        <p className="text-base font-semibold text-gray-900">
                          {callout.description}
                        </p>
                      </div>
                    ))}
                  </div> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {!store?.wallet && !loading && (
        <div>
          <div>
            <svg
              className="absolute inset-0 -z-10 hidden h-full w-full stroke-gray-200 [mask-image:radial-gradient(64rem_64rem_at_top,white,transparent)] sm:block"
              aria-hidden="true"
            >
              <defs>
                <pattern
                  id="55d3d46d-692e-45f2-becd-d8bdc9344f45"
                  width={200}
                  height={200}
                  x="50%"
                  y={0}
                  patternUnits="userSpaceOnUse"
                >
                  <path d="M.5 200V.5H200" fill="none" />
                </pattern>
              </defs>
              <svg x="50%" y={0} className="overflow-visible fill-gray-50">
                <path
                  d="M-200.5 0h201v201h-201Z M599.5 0h201v201h-201Z M399.5 400h201v201h-201Z M-400.5 600h201v201h-201Z"
                  strokeWidth={0}
                />
              </svg>
              <rect
                width="100%"
                height="100%"
                strokeWidth={0}
                fill="url(#55d3d46d-692e-45f2-becd-d8bdc9344f45)"
              />
            </svg>
          </div>
          <div className="relative isolate px-6 lg:px-8">
            <div className="mx-auto max-w-2xl">
              <div className="text-center">
                <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                  A loyalty program for small business
                </h1>
                <div className="mt-10 flex items-center justify-center gap-x-6">
                  <a
                    href="#"
                    className="rounded-md bg-green-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
                  >
                    Get started
                  </a>
                  <Link href={`/about`}>
                    <p className="text-sm font-semibold leading-6 text-gray-900">
                      Learn more <span aria-hidden="true">→</span>
                    </p>
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <h2 className="text-center text-lg font-semibold leading-8 text-gray-900">
                We've partnered with some pretty cool brands
              </h2>
              <div className="mx-auto mt-10 grid max-w-lg grid-cols-4 items-center gap-x-8 gap-y-10 sm:max-w-xl sm:grid-cols-6 sm:gap-x-10 lg:mx-0 lg:max-w-none lg:grid-cols-6">
                <img
                  className="col-span-2 max-h-16 w-full object-contain lg:col-span-1"
                  src="/nffa.png"
                  alt="Food Alliance"
                  width={158}
                  height={48}
                />
                <img
                  className="col-span-2 max-h-16 w-full object-contain lg:col-span-1"
                  src="/daydream.jpg"
                  alt="Hi Desert Daydream"
                  width={158}
                  height={48}
                />
                <img
                  className="col-span-2 max-h-16 w-full object-contain lg:col-span-1"
                  src="/bacon.png"
                  alt="Bacon Club"
                  width={158}
                  height={48}
                />
                <img
                  className="col-span-2 max-h-16 w-full object-contain lg:col-span-1"
                  src="/palms.png"
                  alt="Palms"
                  width={158}
                  height={48}
                />
                <img
                  className="col-span-2 max-h-16 w-full object-contain lg:col-span-1"
                  src="/roamingtravelers.png"
                  alt="Roaming Travelers"
                  width={158}
                  height={48}
                />
                <img
                  className="col-span-2 max-h-16 w-full object-contain lg:col-span-1"
                  src="/jttp.png"
                  alt="JTTP"
                  width={158}
                  height={48}
                />
              </div>
            </div>
          </div>
          <div className="bg-white ">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mx-auto max-w-2xl sm:text-center">
                <h2 className="text-base font-semibold leading-7 text-green-600">
                  a unique approach
                </h2>
                <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                  How does it work?
                </p>
                <p className="mt-6 text-lg leading-8 text-gray-600">
                  LYLT is a dynamic ecosystem that connects businesses and their
                  customers to a reward based marketplace. Every transaction
                  seamlessly issues LYLT points to the customer which are
                  returned to the business as the web3 LYLT Coin. LYLT Coins can
                  be used to purchase goods and services from any participating
                  business in the marketplace, enhance their promotions, or sell
                  on the free market. While the points program will rely on a
                  web2 system that's familiar to the average consumer the web3
                  LYLT Coin will operate in the background for businesses.
                </p>
              </div>
            </div>
            <div className="mx-auto mt-16 max-w-7xl px-6 sm:mt-20 md:mt-24 lg:px-8">
              <dl className="mx-auto grid max-w-2xl grid-cols-1 gap-x-6 gap-y-10 text-base leading-7 text-gray-600 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-x-8 lg:gap-y-16">
                {features.map((feature) => (
                  <div key={feature.name} className="relative pl-9">
                    <dt className="inline font-semibold text-gray-900">
                      <feature.icon
                        className="absolute left-1 top-1 h-5 w-5 text-green-600"
                        aria-hidden="true"
                      />
                      {feature.name}
                    </dt>{" "}
                    <dd className="inline">{feature.description}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
          <div className="bg-white py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mx-auto max-w-2xl lg:text-center">
                <h2 className="text-base font-semibold leading-7 text-green-600">
                  Case Studies
                </h2>
                <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                  See it in real world
                </p>
                <p className="mt-6 text-lg leading-8 text-gray-600">
                  Here are some use cases that have been deployed to effectively
                  make use of the LYLT system. If any of these resonate with
                  you, feel free to reach out so we can help you model a perfect
                  solution for you and your business.
                </p>
              </div>
              <div className="mx-auto max-w-2xl lg:text-center my-6">
                <a
                  href={"/cases"}
                  className="text-sm font-semibold leading-6 text-green-600"
                >
                  View All <span aria-hidden="true">→</span>
                </a>
              </div>
              <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
                <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
                  {caseStudies.map((feature) => (
                    <div key={feature.name} className="flex flex-col">
                      <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                        <img
                          className="h-5 w-5 flex-none"
                          aria-hidden="true"
                          src={feature.icon}
                          alt={feature.name}
                        />
                        {feature.name}
                      </dt>
                      <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                        <p className="flex-auto">{feature.description}</p>
                        <p className="mt-6">
                          <a
                            href={feature.href}
                            className="text-sm font-semibold leading-6 text-green-600"
                          >
                            Learn more <span aria-hidden="true">→</span>
                          </a>
                        </p>
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </div>
          <NewsSignup />
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
