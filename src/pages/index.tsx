import dynamic from "next/dynamic";
import { Suspense } from "react";
import useStore from "../store";
import VendorCard from "../components/VendorCard";

const Index = () => {
  const SocialLoginDynamic = dynamic(
    () => import("../components/Auth").then((res) => res.default),
    {
      ssr: false,
    }
  );
  return (
    <div className="w-full">
      <div className="mx-auto max-w-7xl">
        <Suspense fallback={<div>Loading...</div>}>
          <VendorCard />
          <SocialLoginDynamic />
        </Suspense>
      </div>
    </div>
  );
};

export default Index;
