import "@biconomy/web3-auth/dist/src/style.css";

import dynamic from "next/dynamic";
import { Suspense, useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import Link from "next/link";
import useStore from "@/lib/useStore";
import useAuthStore from "@/lib/store";

import { db } from "../firebase";
import { doc, onSnapshot, getDoc } from "firebase/firestore";

import { Wallet, Vendor } from "@/types";

const loggedInNav = [
  { name: "Shop", href: "/shop" },
  { name: "Account", href: "/account" },
  { name: "Promotions", href: "/promotions" },
  { name: "About Us", href: "/about" },
  { name: "Settings", href: "/settings" },
];

const landingNav = [
  { name: "Shop", href: "/shop" },
  { name: "Prices", href: "/prices" },
  { name: "Case Studies", href: "/cases" },
  { name: "About Us", href: "/about" },
];

export default function Nav() {
  const store = useStore(useAuthStore, (state) => state);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const [wallet, setWallet] = useState<Wallet>({
    address: "",
    coins: 0,
    points: 0,
  });

  const SocialLoginDynamic = dynamic(
    () => import("../components/Auth").then((res) => res.default),
    {
      ssr: false,
    }
  );

  useEffect(() => {
    const queryBalance = async () => {
      if (!store?.wallet) {
        return;
      }
      const q = doc(db, "wallets", store?.wallet);
      const unsubscribe = onSnapshot(q, async (document) => {
        if (document.exists()) {
          const data = document.data() as Wallet;
          setWallet({
            coins: data.coins ? data.coins : 0,
            points: data.points ? data.points : 0,
            address: data.address ? data.address : "",
          });
        }
      });
      return unsubscribe;
    };
    if (store?.wallet) {
      queryBalance();
    }
  }, [store?.wallet]);

  return (
    <header className=" border-b">
      <nav
        className="flex items-center justify-between p-6 lg:px-8"
        aria-label="Global"
      >
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5">
            <h1 className="font-bold text-4xl">LYLT</h1>
          </Link>
        </div>
        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">Open main menu</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          </button>
        </div>
        <div className="hidden lg:flex lg:gap-x-12">
          {store?.wallet ? (
            <>
              {loggedInNav.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-sm font-semibold leading-6 text-gray-900"
                >
                  {item.name}
                </Link>
              ))}
            </>
          ) : (
            <>
              {landingNav.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-sm font-semibold leading-6 text-gray-900"
                >
                  {item.name}
                </Link>
              ))}
            </>
          )}
        </div>
        <div className="hidden lg:flex lg:flex-1 lg:justify-end">
          {store?.wallet && (
            <div className="flex justify-between space-x-2 mr-8">
              <div className="px-2 py-1 rounded-full bg-gray-100 flex flex-row justify-between items-center space-x-2">
                <p>{wallet.points.toFixed(2)} Points </p>
              </div>
              <div className="px-2 py-1 rounded-full bg-black text-white">
                <p>{wallet.coins.toFixed(2)} LYLT</p>
              </div>
            </div>
          )}
          <Suspense fallback={<div>Loading...</div>}>
            <SocialLoginDynamic />
          </Suspense>
        </div>
      </nav>
      <Dialog
        as="div"
        className="lg:hidden"
        open={mobileMenuOpen}
        onClose={setMobileMenuOpen}
      >
        <div className="fixed inset-0 z-50" />
        <Dialog.Panel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
          <div className="flex items-center justify-between">
            <Link href="/" className="-m-1.5 p-1.5">
              <h1 className="font-bold text-4xl">LYLT</h1>
            </Link>
            <button
              type="button"
              className="-m-2.5 rounded-md p-2.5 text-gray-700"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="sr-only">Close menu</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-gray-500/10">
              <div className="space-y-2 py-6">
                {store?.wallet ? (
                  <>
                    {loggedInNav.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </>
                ) : (
                  <>
                    {landingNav.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </>
                )}
              </div>
              <div className="py-6">
                <Suspense fallback={<div>Loading...</div>}>
                  <SocialLoginDynamic />
                </Suspense>
              </div>
            </div>
          </div>
        </Dialog.Panel>
      </Dialog>
    </header>
  );
}
