import dynamic from "next/dynamic";
import { Suspense } from "react";
import useStore from "../store";

const Index = () => {
  const SocialLoginDynamic = dynamic(
    () => import("../components/Auth").then((res) => res.default),
    {
      ssr: false,
    }
  );

  const smartAccount = useStore((state: any) => state.smartAccount);

  return (
    <div>
      <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="relative isolate overflow-hidden px-6 py-24 text-center shadow-2xl sm:rounded-3xl sm:px-16">
          {!smartAccount && (
            <>
              <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
                LOYALTY
              </h2>
            </>
          )}
          {smartAccount && (
            <>
              <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
                GET A CARD
              </h2>
              {/* <Mint /> */}
            </>
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
