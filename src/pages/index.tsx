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

const includedFeatures = [
  "Food Alliance Membership",
  "Unlimited Promotions",
  "Promotion Analytics",
  "Earn Rewards",
];

const people = [
  {
    name: "Garett Martocello",
    role: "CEO",
    imageUrl: "/Garett.jpeg",
    linkedinUrl: "https://www.linkedin.com/in/garett-martocello-48211121/",
    twitterUrl: "https://twitter.com/Gar4848",
  },
  {
    name: "Andrew Evans",
    role: "COO",
    imageUrl: "/Andrew.jpeg",
    linkedinUrl: "https://www.linkedin.com/in/andrewwevans/",
    twitterUrl: "https://twitter.com/Andrew_Evs",
  },
  {
    name: "Nick Culpin",
    role: "CTO",
    imageUrl: "/Nick.jpeg",
    linkedinUrl: "https://www.linkedin.com/in/culpin/",
    twitterUrl: "https://twitter.com/njculpin",
    githubUrl: "https://github.com/njculpin/",
  },
  {
    name: "Kyon",
    role: "Developer",
    imageUrl: "/Kyon.jpeg",
  },
  {
    name: "Richie McCord",
    role: "Advisor",
    imageUrl: "/Richie.jpeg",
    linkedinUrl: "https://www.linkedin.com/in/richie-mccord/",
    twitterUrl: "https://twitter.com/richiedotexe",
  },
  {
    name: "Joe Burk",
    role: "Advisor",
    imageUrl: "/Joe.jpeg",
  },
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
              alt="Day Dream"
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
          <div className="mx-auto mt-16 max-w-2xl rounded-3xl ring-1 ring-gray-200 sm:mt-20 lg:mx-0 lg:flex lg:max-w-none">
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
      {/* MARK: MEET US */}
      <div className="bg-white py-32">
        <div className="mx-auto max-w-7xl px-6 text-center lg:px-8">
          <div className="mx-auto max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Meet our team
            </h2>
            <p className="mt-4 text-lg leading-8 text-gray-600">
              We’re a dynamic group of individuals who are passionate about what
              we do.
            </p>
          </div>
          <ul
            role="list"
            className="mx-auto mt-20 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3"
          >
            {people.map((person) => (
              <li key={person.name}>
                <img
                  className="mx-auto h-56 w-56 rounded-full"
                  src={person.imageUrl}
                  alt={person.name}
                />
                <h3 className="mt-6 text-base font-semibold leading-7 tracking-tight text-gray-900">
                  {person.name}
                </h3>
                <p className="text-sm leading-6 text-gray-600">{person.role}</p>
                <ul role="list" className="mt-6 flex justify-center gap-x-6">
                  {person.twitterUrl && (
                    <li>
                      <a
                        href={person.twitterUrl}
                        className="text-gray-400 hover:text-gray-500"
                      >
                        <span className="sr-only">Twitter</span>
                        <svg
                          className="h-5 w-5"
                          aria-hidden="true"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
                        </svg>
                      </a>
                    </li>
                  )}
                  {person.linkedinUrl && (
                    <li>
                      <a
                        href={person.linkedinUrl}
                        className="text-gray-400 hover:text-gray-500"
                      >
                        <span className="sr-only">LinkedIn</span>
                        <svg
                          className="h-5 w-5"
                          aria-hidden="true"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </a>
                    </li>
                  )}
                  {person.githubUrl && (
                    <li>
                      <a
                        href={person.githubUrl}
                        className="text-gray-400 hover:text-gray-500"
                      >
                        <span className="sr-only">Github</span>
                        <svg
                          className="h-5 w-5"
                          aria-hidden="true"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </a>
                    </li>
                  )}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Index;
