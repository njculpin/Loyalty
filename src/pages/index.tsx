import dynamic from "next/dynamic";
import { Suspense } from "react";
import useStore from "../store";
import Mint from "../components/Mint";

const Index = () => {
  const SocialLoginDynamic = dynamic(
    () => import("../components/Auth").then((res) => res.default),
    {
      ssr: false,
    }
  );

  const smartAccount = useStore((state: any) => state.smartAccount);

  return (
    <div className="w-full">
      <div className="mx-auto max-w-7xl p-6">
        <div className="overflow-hidden px-6 py-24 text-center sm:rounded-3xl sm:px-16">
          {!smartAccount && (
            <div className="w-full">
              <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
                LOYALTY
              </h2>
            </div>
          )}
          {smartAccount && (
            <div className="w-full">
              <Mint />
            </div>
          )}
          <div className="flex-col items-center justify-center gap-x-6">
            <Suspense fallback={<div>Loading...</div>}>
              <SocialLoginDynamic />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
