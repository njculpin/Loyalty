import { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { db, storage } from "../firebase";
import { ref, getDownloadURL } from "firebase/storage";
import Link from "next/link";
import useStore from "@/lib/useStore";
import useAuthStore from "@/lib/store";
import { Vendor, Promotion } from "../types";
import { CheckIcon } from "@heroicons/react/20/solid";

const features = [
  {
    name: "Bacon Club",
    description: "Premium Bacon Delivered To Your Door.",
    href: "/cases/bacon-club",
    icon: "/bacon.png",
  },
  {
    name: "Roaming Traveler",
    description: "A brick and mortor clothing store.",
    href: "/cases/roaming",
    icon: "/roamingtravelers.png",
  },
  {
    name: "Food Alliance",
    description:
      "The NFFA aims to help Web2 and Web3 brands build gamified ecosystems that reward the complete customer journey.",
    href: "/cases/food-alliance",
    icon: "/nffa.png",
  },
];

const includedFeatures = [
  "Food Alliance Membership",
  "Unlimited Promotions",
  "Promotion Analytics",
  "Earn Rewards",
];

const Index = () => {
  const store = useStore(useAuthStore, (state) => state);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
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

  useEffect(() => {
    if (store?.wallet) {
      const q = query(
        collection(db, "promotions"),
        where("businessWallet", "==", store?.wallet),
        where("active", "==", true)
      );
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const mapped = querySnapshot.docs.map(async function (doc) {
          const data = doc.data();
          const qr = data.qr;
          return getDownloadURL(ref(storage, qr)).then((url) => {
            return { ...data, qRUrl: url, id: doc.id } as unknown as Promotion;
          });
        });
        Promise.all(mapped).then((result) => {
          setPromotions(result);
        });
      });
      return unsubscribe;
    }
  }, [store?.wallet]);

  useEffect(() => {
    const getData = async () => {
      try {
        const docRef = doc(db, "vendors", `${store?.wallet}`);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as Vendor;
          setVendor(data);
        } else {
          console.log("No such document!");
        }
      } catch (e) {
        console.log(e);
      }
    };
    getData();
  }, [store?.wallet]);

  return (
    <div className="mx-auto max-w-7xl p-16">
      <div className="space-y-12">
        <div className="grid grid-cols-1 gap-4 justify-between items-center">
          <h2 className="font-bold text-gray-900 text-center text-6xl">
            {vendor.businessName}
          </h2>
          <p className="text-lg font-semibold text-gray-600 text-center">
            {vendor.businessStreetAddress} {vendor.businessCity}{" "}
            {vendor.businessCountry} {vendor.businessPostalCode}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3">
          {promotions &&
            promotions.map(function (promotion: Promotion, index) {
              return (
                <div className="m-5 shadow-xl rounded-xl" key={index}>
                  <div className="h-full p-8 text-center sm:rounded-3xl grid grid-cols-1 justify-between">
                    <div className="w-full flex flex-col justify-center items-center">
                      <img
                        style={{ height: "256", width: "256" }}
                        src={promotion.qRUrl}
                        alt="qr code"
                      />
                    </div>
                    <h1 className="text-3xl tracking-tight text-left font-extrabold text-red-500">
                      {promotion.reward}
                    </h1>
                    {promotion.pointsRequired > 0 && (
                      <h1 className="text-xl tracking-tight text-left font-extrabold w-full text-blue-500">
                        {promotion.pointsRequired} Points required
                      </h1>
                    )}
                    {promotion.coinsRequired > 0 && (
                      <h1 className="text-xl tracking-tight text-left font-extrabold w-full text-blue-500">
                        {promotion.coinsRequired} LYLT required
                      </h1>
                    )}
                    <Link href={`qr/${promotion.id}/${promotion.key}`}>
                      <p className="mt-8 border px-4 py-2 border-black">
                        SIMULATE SCAN
                      </p>
                    </Link>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
      {/* MARK: HERO */}
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
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              A tokenized loyalty program for small business
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
      {/* MARK: PARTNERS */}
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
              src="/daydream.png"
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
      {/* MARK: USE CASE */}
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
              make use of the LYLT system. If any of these resonate with you,
              feel free to reach out so we can help you model a perfect solution
              for you and your business.
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
              {features.map((feature) => (
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

      {/* MARK: PAYMENTS */}
      <div className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl sm:text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Simple no-tricks pricing
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              We simply have a monthly subscription, cancel any time.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl rounded-3xl ring-1 ring-gray-200 sm:mt-20 lg:mx-0 lg:flex lg:max-w-none shadow-lg">
            <div className="p-8 sm:p-10 lg:flex-auto">
              <h3 className="text-2xl font-bold tracking-tight text-gray-900">
                Monthly membership
              </h3>
              <p className="mt-6 text-base leading-7 text-gray-600">
                Our membership program gets you access to a lot of perks unseen
                in other loyalty program services. Gain insight into your
                customers and reward engagement in creative ways.
              </p>
              <div className="mt-10 flex items-center gap-x-4">
                <h4 className="flex-none text-sm font-semibold leading-6 text-green-600">
                  What’s included
                </h4>
                <div className="h-px flex-auto bg-gray-100" />
              </div>
              <ul
                role="list"
                className="mt-8 grid grid-cols-1 gap-4 text-sm leading-6 text-gray-600 sm:grid-cols-2 sm:gap-6"
              >
                {includedFeatures.map((feature) => (
                  <li key={feature} className="flex gap-x-3">
                    <CheckIcon
                      className="h-6 w-5 flex-none text-green-600"
                      aria-hidden="true"
                    />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            <div className="-mt-2 p-2 lg:mt-0 lg:w-full lg:max-w-md lg:flex-shrink-0">
              <div className="rounded-2xl bg-gray-50 py-10 text-center ring-1 ring-inset ring-gray-900/5 lg:flex lg:flex-col lg:justify-center lg:py-16">
                <div className="mx-auto max-w-xs px-8">
                  <p className="text-base font-semibold text-gray-600">
                    Paid Monthly
                  </p>
                  <p className="mt-6 flex items-baseline justify-center gap-x-2">
                    <span className="text-5xl font-bold tracking-tight text-gray-900">
                      $00
                    </span>
                    <span className="text-sm font-semibold leading-6 tracking-wide text-gray-600">
                      USD
                    </span>
                  </p>
                  <a
                    href="#"
                    className="mt-10 block w-full rounded-md bg-green-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
                  >
                    Get access
                  </a>
                  <p className="mt-6 text-xs leading-5 text-gray-600">
                    Invoices and receipts available for easy company
                    reimbursement
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
