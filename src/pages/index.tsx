import dynamic from "next/dynamic";
import { Suspense } from "react";
import { useAuth } from "../context/Auth";
import Mint from "../components/Mint";

const Index = () => {
  const auth = useAuth();
  console.log("auth", auth);
  if (!auth) {
    return <></>;
  }
  const SocialLoginDynamic = dynamic(
    () => import("../components/Auth").then((res) => res.default),
    {
      ssr: false,
    }
  );
  return (
    <div>
      <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="relative isolate overflow-hidden px-6 py-24 text-center shadow-2xl sm:rounded-3xl sm:px-16">
          {!auth.smartAccount && (
            <>
              <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
                LOYALTY
              </h2>
            </>
          )}
          {auth.smartAccount && (
            <>
              <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
                GET A CARD
              </h2>
              <Mint />
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
